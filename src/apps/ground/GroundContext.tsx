import { App } from "@microsoft/msfs-efb-api";
import React, { FC, ReactNode, useContext, useEffect, useState } from "react";
import { InfoModal } from "../../shared/components/InfoModal";
import { ModalContext } from "../../shared/ModalContext";
import { SettingsContext } from "../../shared/SettingsContext";
import { fetchSimbriefOfp } from "../../shared/lib/simbrief";
import { Load, Variant, calibrateEmptyArm, detectVariant, isB748, readStations, readTanks, stationItems, tankCapacities, tankItems } from "./aircraft";
import { WeightUnit, useWeightUnit } from "./units";

export type Plan = {
    pax?: number;
    cargoLb?: number;
    targetZfwCg?: number;
    fuelLb?: number;
};

export type Live = {
    stations: Load;
    tanks: Load;
    capacities: Load;
    cg: number;
    grossWeight: number;
    emptyArm: number;
};

type GroundContextProps = {
    supported: boolean;
    variant: Variant;
    unit: WeightUnit;
    live: Live;
    plan: Plan;
    setPlan: (update: Partial<Plan>) => void;
    importSimbrief: () => Promise<void>;
};

const readLive = (variant: Variant): Live => {
    const stations = readStations(variant);
    const tanks = readTanks(variant);
    const cg = SimVar.GetSimVarValue("CG PERCENT", "percent");
    return {
        stations,
        tanks,
        capacities: tankCapacities(variant),
        cg,
        grossWeight: SimVar.GetSimVarValue("TOTAL WEIGHT", "pounds"),
        emptyArm: calibrateEmptyArm([...stationItems(variant, stations), ...tankItems(variant, tanks)], cg),
    };
};

export const GroundContext = React.createContext<GroundContextProps>(undefined as never);

export const useGround = () => useContext(GroundContext);

export const GroundProvider: FC<{ app: App; children: ReactNode }> = ({ app, children }) => {
    const unit = useWeightUnit(app);
    const { simbriefUsername } = useContext(SettingsContext);
    const { setModal } = useContext(ModalContext);
    const [supported, setSupported] = useState(isB748);
    const [variant, setVariant] = useState(detectVariant);
    const [live, setLive] = useState(() => readLive(variant));
    const [plan, setPlanState] = useState<Plan>({});

    useEffect(() => {
        const timer = setInterval(() => {
            try {
                const current = detectVariant();
                setSupported(isB748());
                setVariant(current);
                setLive(readLive(current));
            } catch (error) {
                console.error("Hypabit Ground: failed to read the aircraft", error);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const setPlan = (update: Partial<Plan>) => setPlanState((previous) => ({ ...previous, ...update }));

    const importSimbrief = async () => {
        if (!simbriefUsername) {
            setModal(<InfoModal title="SimBrief" description="Enter your SimBrief username first." />);
            return;
        }
        try {
            const { load } = await fetchSimbriefOfp(simbriefUsername);
            setPlan({ pax: variant.freighter ? 0 : load.pax, cargoLb: load.cargoLb, fuelLb: load.fuelLb });
        } catch {
            setModal(<InfoModal title="SimBrief" description="Couldn't fetch your latest SimBrief flight plan." />);
        }
    };

    return (
        <GroundContext.Provider value={{ supported, variant, unit, live, plan, setPlan, importSimbrief }}>{children}</GroundContext.Provider>
    );
};
