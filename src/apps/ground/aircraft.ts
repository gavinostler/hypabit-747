export const PAX_WEIGHT = 175;
export const BAG_WEIGHT = 55;

export type StationKind = "crew" | "pax" | "cargo";

export type Station = {
    index: number;
    name: string;
    kind: StationKind;
    seats?: number;
    max?: number;
    arm: number;
};

export type Tank = {
    index: number;
    name: string;
    arm: number;
};

export type Limits = {
    mzfw: number;
    mlw: number;
    mtow: number;
};

export type Variant = {
    freighter: boolean;
    limits: Limits;
    stations: Station[];
    tanks: Tank[];
};

// Stations, arms and tank order match the Working Title W&B manager, so the CDU and this app agree on CG.
const passenger: Variant = {
    freighter: false,
    limits: { mzfw: 651000, mlw: 688000, mtow: 987000 },
    stations: [
        { index: 1, name: "Captain", kind: "crew", arm: 87.0359 },
        { index: 2, name: "First officer", kind: "crew", arm: 87.077 },
        { index: 3, name: "Upper deck", kind: "pax", seats: 32, arm: 54.6 },
        { index: 4, name: "First class", kind: "pax", seats: 8, arm: 90.0491 },
        { index: 5, name: "Business", kind: "pax", seats: 48, arm: 45.6167 },
        { index: 6, name: "Premium economy", kind: "pax", seats: 32, arm: -10.3628 },
        { index: 7, name: "Forward economy", kind: "pax", seats: 36, arm: 8.725 },
        { index: 8, name: "Rear economy", kind: "pax", seats: 208, arm: -58.319 },
        { index: 9, name: "Forward hold", kind: "cargo", max: 90780, arm: 61.4372 },
        { index: 10, name: "Aft hold", kind: "cargo", max: 90785, arm: -48.077 },
        { index: 11, name: "Cabin crew", kind: "crew", arm: 8.725 },
    ],
    tanks: [
        { index: 2, name: "Main 1", arm: -22 },
        { index: 3, name: "Main 2", arm: -6 },
        { index: 4, name: "Main 3", arm: -6 },
        { index: 5, name: "Main 4", arm: -22 },
        { index: 6, name: "Reserve 1", arm: -40 },
        { index: 7, name: "Reserve 4", arm: -40 },
        { index: 1, name: "Center", arm: 6.5 },
        { index: 8, name: "Stabilizer", arm: -103.5 },
    ],
};

const freighter: Variant = {
    freighter: true,
    limits: { mzfw: 727000, mlw: 763000, mtow: 987000 },
    stations: [
        { index: 1, name: "Captain", kind: "crew", arm: 98.8 },
        { index: 2, name: "First officer", kind: "crew", arm: 98.8 },
        { index: 3, name: "Main deck", kind: "cargo", max: 496257, arm: 14.06 },
        { index: 4, name: "Forward hold", kind: "cargo", max: 105000, arm: 68.93716 },
        { index: 5, name: "Aft hold", kind: "cargo", max: 75000, arm: -29.1 },
    ],
    tanks: [
        { index: 2, name: "Main 1", arm: -14.5 },
        { index: 3, name: "Main 2", arm: 1.5 },
        { index: 4, name: "Main 3", arm: 1.5 },
        { index: 5, name: "Main 4", arm: -14.5 },
        { index: 6, name: "Reserve 1", arm: -32.5 },
        { index: 7, name: "Reserve 4", arm: -32.5 },
        { index: 1, name: "Center", arm: 14 },
    ],
};

export const MAX_PAX = passenger.stations.reduce((total, station) => total + (station.seats ?? 0), 0);

export const isB748 = (): boolean => {
    const ids = ["ATC MODEL", "ATC TYPE", "TITLE"].map((name) => String(SimVar.GetSimVarValue(name, "string")).toUpperCase());
    return ids.some((id) => id.includes("B748") || id.includes("747"));
};

export const detectVariant = (): Variant => (SimVar.GetSimVarValue("PAYLOAD STATION COUNT", "number") <= freighter.stations.length ? freighter : passenger);

const FWD_LIMIT_ARM = -2.364121794;
const AFT_LIMIT_ARM = -10.43502113;

const cgLimits = (): [number, number] => {
    const fwd = SimVar.GetSimVarValue("CG FWD LIMIT", "percent");
    const aft = SimVar.GetSimVarValue("CG AFT LIMIT", "percent");
    return fwd > 0 && aft > fwd ? [fwd, aft] : [11, 33];
};

export const armToCg = (arm: number): number => {
    const [fwd, aft] = cgLimits();
    return fwd + ((aft - fwd) * (arm - FWD_LIMIT_ARM)) / (AFT_LIMIT_ARM - FWD_LIMIT_ARM);
};

export const cgToArm = (cg: number): number => {
    const [fwd, aft] = cgLimits();
    return FWD_LIMIT_ARM + ((cg - fwd) * (AFT_LIMIT_ARM - FWD_LIMIT_ARM)) / (aft - fwd);
};

export type Load = Map<number, number>;

export const emptyWeight = (): number => SimVar.GetSimVarValue("EMPTY WEIGHT", "pounds");

export const totalOf = (load: Load): number => [...load.values()].reduce((total, weight) => total + weight, 0);

type Item = { weight: number; arm: number };

const momentOf = (items: Item[]): number => items.reduce((total, item) => total + item.weight * item.arm, 0);

export const cgOf = (items: Item[], emptyArm: number): number => {
    const empty = emptyWeight();
    const weight = empty + items.reduce((total, item) => total + item.weight, 0);
    return armToCg((momentOf(items) + empty * emptyArm) / weight);
};

// The WT arms assume the empty airframe sits at arm 0. Solving its real arm from the sim's live CG keeps planned values
// consistent with what the sim will report once the aircraft is loaded.
export const calibrateEmptyArm = (items: Item[], simCg: number): number => {
    const empty = emptyWeight();
    if (!(empty > 0) || !Number.isFinite(simCg) || simCg === 0) {
        return 0;
    }
    const weight = empty + items.reduce((total, item) => total + item.weight, 0);
    return (cgToArm(simCg) * weight - momentOf(items)) / empty;
};

export const readStations = (variant: Variant): Load =>
    new Map(variant.stations.map((station) => [station.index, SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.index}`, "pounds")]));

export const readTanks = (variant: Variant): Load =>
    new Map(variant.tanks.map((tank) => [tank.index, SimVar.GetSimVarValue(`FUELSYSTEM TANK WEIGHT:${tank.index}`, "pounds")]));

export const tankCapacities = (variant: Variant): Load => {
    const poundsPerGallon = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "pounds");
    return new Map(variant.tanks.map((tank) => [tank.index, SimVar.GetSimVarValue(`FUELSYSTEM TANK CAPACITY:${tank.index}`, "gallons") * poundsPerGallon]));
};

export const stationItems = (variant: Variant, load: Load) =>
    variant.stations.map((station) => ({ weight: load.get(station.index) ?? 0, arm: station.arm }));

export const tankItems = (variant: Variant, load: Load) => variant.tanks.map((tank) => ({ weight: load.get(tank.index) ?? 0, arm: tank.arm }));

export type PayloadPlan = {
    pax: number;
    cargo: number;
    targetZfwCg?: number;
};

export const planPayload = (variant: Variant, plan: PayloadPlan, crew: Load, emptyArm: number): Load => {
    const load: Load = new Map();
    for (const station of variant.stations.filter((s) => s.kind === "crew")) {
        load.set(station.index, crew.get(station.index) ?? 0);
    }

    const paxStations = variant.stations.filter((s) => s.kind === "pax");
    const seats = paxStations.reduce((total, station) => total + (station.seats ?? 0), 0);
    const pax = Math.max(0, Math.min(Math.round(plan.pax), seats));
    let seated = 0;
    paxStations.forEach((station, i) => {
        const count = i === paxStations.length - 1 ? pax - seated : Math.round((pax * (station.seats ?? 0)) / seats);
        seated += count;
        load.set(station.index, count * PAX_WEIGHT);
    });

    const holds = variant.stations.filter((s) => s.kind === "cargo");
    const capacity = holds.reduce((total, hold) => total + (hold.max ?? 0), 0);
    const cargo = Math.max(0, Math.min(plan.cargo, capacity));

    const lower = holds.filter((hold) => hold.name !== "Main deck");
    const mainDeck = holds.find((hold) => hold.name === "Main deck");
    let remaining = cargo;
    if (mainDeck) {
        const lowerCapacity = lower.reduce((total, hold) => total + (hold.max ?? 0), 0);
        const onMainDeck = Math.max(0, remaining - lowerCapacity);
        load.set(mainDeck.index, onMainDeck);
        remaining -= onMainDeck;
    }

    const [fwd, aft] = lower;
    let fwdShare = (fwd.max ?? 0) / ((fwd.max ?? 0) + (aft.max ?? 0));
    if (plan.targetZfwCg !== undefined && remaining > 0) {
        const fixed = [...load.entries()].map(([index, weight]) => ({ weight, arm: variant.stations.find((s) => s.index === index)!.arm }));
        const zfw = emptyWeight() + totalOf(load) + remaining;
        const neededMoment = cgToArm(plan.targetZfwCg) * zfw - momentOf(fixed) - emptyWeight() * emptyArm;
        fwdShare = (neededMoment / remaining - aft.arm) / (fwd.arm - aft.arm);
    }
    const minShare = Math.max(0, 1 - (aft.max ?? 0) / Math.max(remaining, 1));
    const maxShare = Math.min(1, (fwd.max ?? 0) / Math.max(remaining, 1));
    fwdShare = Math.min(maxShare, Math.max(minShare, fwdShare));
    load.set(fwd.index, Math.round(remaining * fwdShare));
    load.set(aft.index, remaining - Math.round(remaining * fwdShare));

    return load;
};

export const paxFromLoad = (variant: Variant, load: Load): number =>
    Math.round(variant.stations.filter((s) => s.kind === "pax").reduce((total, s) => total + (load.get(s.index) ?? 0), 0) / PAX_WEIGHT);

export const cargoFromLoad = (variant: Variant, load: Load): number =>
    variant.stations.filter((s) => s.kind === "cargo").reduce((total, s) => total + (load.get(s.index) ?? 0), 0);

export const planFuel = (variant: Variant, fuel: number, capacities: Load): Load => {
    const cap = (index: number) => capacities.get(index) ?? 0;
    const load: Load = new Map(variant.tanks.map((tank) => [tank.index, 0]));
    let remaining = Math.max(0, fuel);
    const fill = (indices: number[]) => {
        const room = indices.reduce((total, index) => total + cap(index), 0);
        const share = Math.min(remaining, room);
        for (const index of indices) {
            load.set(index, (load.get(index) ?? 0) + (room > 0 ? (share * cap(index)) / room : 0));
        }
        remaining -= share;
    };

    const outerRoom = 4 * cap(2);
    if (remaining < outerRoom) {
        for (const index of [2, 3, 4, 5]) {
            load.set(index, remaining / 4);
        }
        return load;
    }
    fill([2, 5]);
    fill([3, 4]);
    fill([6, 7]);
    fill([1]);
    if (variant.tanks.some((tank) => tank.index === 8)) {
        fill([8]);
    }
    return load;
};

export const writeStations = async (load: Load): Promise<void> => {
    for (const [index, weight] of load) {
        await SimVar.SetSimVarValue(`PAYLOAD STATION WEIGHT:${index}`, "pounds", weight);
    }
};

export const writeTanks = async (load: Load): Promise<void> => {
    for (const [index, weight] of load) {
        await SimVar.SetSimVarValue(`FUELSYSTEM TANK WEIGHT:${index}`, "pounds", weight);
    }
};
