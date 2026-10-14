import { DataStore, EventBus, KeyEventManager } from "@microsoft/msfs-sdk";
import { detectVariant, isB748 } from "./aircraft";

export const CABIN_LIGHTS_KEY = "HYPABIT_CABIN_LIGHTS";
export const DEFAULT_CABIN_LEVEL = 70;

// Must match PotentiometerIndex in the cabin lights attachment's systems.cfg.
const POTENTIOMETER = 90;
const AC_BUSES = [2, 3, 4, 5];

export const cabinLevel = (): number => DataStore.get<number>(CABIN_LIGHTS_KEY) ?? DEFAULT_CABIN_LEVEL;

const isPowered = (): boolean => AC_BUSES.some((bus) => SimVar.GetSimVarValue(`ELECTRICAL MAIN BUS VOLTAGE:${bus}`, "volts") > 50);

export const startCabinLights = (): void => {
    let keys: KeyEventManager | undefined;
    KeyEventManager.getManager(new EventBus()).then((manager) => (keys = manager));

    setInterval(() => {
        if (!keys || !isB748() || detectVariant().freighter) {
            return;
        }
        const target = isPowered() ? cabinLevel() : 0;
        const current = SimVar.GetSimVarValue(`LIGHT POTENTIOMETER:${POTENTIOMETER}`, "percent");
        if (Math.abs(current - target) > 0.5) {
            keys.triggerKey("LIGHT_POTENTIOMETER_SET", true, POTENTIOMETER, target);
        }
    }, 1000);
};
