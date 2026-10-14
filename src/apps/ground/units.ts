import { App } from "@microsoft/msfs-efb-api";
import { useEffect, useState } from "react";

export type WeightUnit = "kg" | "lb";

const LB_PER_KG = 2.20462262;

export const fromPounds = (lb: number, unit: WeightUnit): number => (unit === "kg" ? lb / LB_PER_KG : lb);

export const toPounds = (value: number, unit: WeightUnit): number => (unit === "kg" ? value * LB_PER_KG : value);

const withThousands = (value: number): string => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatWeight = (lb: number, unit: WeightUnit): string => `${withThousands(fromPounds(lb, unit))} ${unit}`;

const simUnit = (): WeightUnit => {
    try {
        return SimVar.GetGameVarValue("GAME UNIT IS METRIC", "number") ? "kg" : "lb";
    } catch {
        return "kg";
    }
};

export const useWeightUnit = (app: App): WeightUnit => {
    const [unit, setUnit] = useState<WeightUnit>(simUnit);

    useEffect(() => {
        try {
            const subscription = app.unitsSettingsManager.getSetting("unitsWeight").sub((mode) => setUnit(mode === "KG" ? "kg" : "lb"), true);
            return () => subscription.destroy();
        } catch {
            return undefined;
        }
    }, [app]);

    return unit;
};
