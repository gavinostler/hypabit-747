import { App } from "@microsoft/msfs-efb-api";
import { useEffect, useState } from "react";

export type WeightUnit = "kg" | "lb";

const LB_PER_KG = 2.20462262;

export const fromPounds = (lb: number, unit: WeightUnit): number => (unit === "kg" ? lb / LB_PER_KG : lb);

export const toPounds = (value: number, unit: WeightUnit): number => (unit === "kg" ? value * LB_PER_KG : value);

export const formatWeight = (lb: number, unit: WeightUnit): string => `${Math.round(fromPounds(lb, unit)).toLocaleString("en-US")} ${unit}`;

const simUnit = (): WeightUnit => (SimVar.GetGameVarValue("GAME UNIT IS METRIC", "boolean") ? "kg" : "lb");

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
