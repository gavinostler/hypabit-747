import { DataStore } from "@microsoft/msfs-sdk";
import { useEffect, useState } from "react";

export const useSimVar = (name: string, unit: string, intervalMs = 500): number => {
    const [value, setValue] = useState<number>(() => SimVar.GetSimVarValue(name, unit));

    useEffect(() => {
        const timer = setInterval(() => setValue(SimVar.GetSimVarValue(name, unit)), intervalMs);

        return () => clearInterval(timer);
    }, [name, unit, intervalMs]);

    return value;
};

export const usePersistentSetting = <T extends string | number | boolean>(key: string, defaultValue: T): [T, (value: T) => void] => {
    const [value, setValue] = useState<T>(() => DataStore.get<T>(key) ?? defaultValue);

    const set = (newValue: T) => {
        DataStore.set(key, newValue);
        setValue(newValue);
    };

    return [value, set];
};
