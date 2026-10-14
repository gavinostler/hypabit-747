export type DoorPoint = {
    index: number;
    type: number;
    x: number;
    y: number;
    z: number;
    label: string;
    eicas?: string;
};

const SERVICE_NAMES: Record<number, string> = {
    3: "Fuel hose",
    4: "Ground power",
    5: "Air start",
    8: "Window",
};

// Indices the Working Title EICAS reads for each door (B748DoorPositionPublisher).
const EICAS_SLOTS: Record<number, string> = {
    10: "1L",
    11: "1R",
    4: "2L",
    5: "2R",
    6: "3L",
    7: "3R",
    8: "4L",
    9: "4R",
    0: "5L",
    1: "5R",
    2: "UL",
    3: "UR",
    12: "FWD",
    13: "AFT",
};

const MAX_POINTS = 40;

const read = (name: string, index: number, unit: string): number => SimVar.GetSimVarValue(`INTERACTIVE POINT ${name}:${index}`, unit);

export const isDoor = (point: DoorPoint): boolean => point.type === 0 || point.type === 1 || point.type === 2;

export const scanDoorPoints = (): DoorPoint[] => {
    const raw: Omit<DoorPoint, "label">[] = [];
    for (let index = 0; index < MAX_POINTS; index++) {
        const point = { index, type: read("TYPE", index, "enum"), x: read("POSX", index, "feet"), y: read("POSY", index, "feet"), z: read("POSZ", index, "feet") };
        const first = raw[0];
        // An index past the last point reads back as point 0.
        if (first && point.type === first.type && point.x === first.x && point.y === first.y && point.z === first.z) {
            break;
        }
        if (point.type === 99) {
            break;
        }
        raw.push({ ...point, eicas: EICAS_SLOTS[index] });
    }

    const exits = raw.filter((p) => p.type === 0 || p.type === 2);
    const mainDeckY = Math.min(...exits.map((p) => p.y));
    const labels = new Map<number, string>();

    for (const side of ["L", "R"] as const) {
        const onSide = exits.filter((p) => (side === "L" ? p.x < 0 : p.x >= 0));
        onSide
            .filter((p) => p.y > mainDeckY + 5)
            .forEach((p) => labels.set(p.index, `Upper deck ${side}`));
        onSide
            .filter((p) => p.y <= mainDeckY + 5)
            .sort((a, b) => b.z - a.z)
            .forEach((p, i) => labels.set(p.index, `Door ${i + 1}${side}`));
    }

    const cargo = raw.filter((p) => p.type === 1).sort((a, b) => b.z - a.z);
    cargo.forEach((p, i) => labels.set(p.index, cargo.length === 2 ? (i === 0 ? "Forward cargo" : "Aft cargo") : `Cargo door ${i + 1}`));

    const labelled = raw.map((p) => ({ ...p, label: labels.get(p.index) ?? SERVICE_NAMES[p.type] ?? `Point ${p.index}` }));
    const pairOf = (p: DoorPoint) => (isDoor(p) ? p.label.replace(/[LR]$/, "") : p.label);
    const pairZ = new Map<string, number>();
    for (const pair of new Set(labelled.map(pairOf))) {
        const members = labelled.filter((p) => pairOf(p) === pair);
        pairZ.set(pair, members.reduce((total, p) => total + p.z, 0) / members.length);
    }
    return labelled.sort((a, b) => pairZ.get(pairOf(b))! - pairZ.get(pairOf(a))! || a.x - b.x);
};

export const doorOpen = (index: number): number => read("OPEN", index, "percent over 100");

export const setDoorGoal = (index: number, goal: number): Promise<void> =>
    SimVar.SetSimVarValue(`INTERACTIVE POINT GOAL:${index}`, "percent over 100", goal) as Promise<void>;
