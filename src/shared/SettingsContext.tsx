import React, { FC, ReactNode } from "react";
import { usePersistentSetting } from "./hooks";
import { AtisSource, MetarSource, TafSource } from "./lib/weather";

type SettingsContextProps = {
    metarSource: MetarSource;
    setMetarSource: (source: MetarSource) => void;
    tafSource: TafSource;
    setTafSource: (source: TafSource) => void;
    atisSource: AtisSource;
    setAtisSource: (source: AtisSource) => void;
    simbriefUsername: string;
    setSimbriefUsername: (username: string) => void;
};

const defaults: Pick<SettingsContextProps, "metarSource" | "tafSource" | "atisSource" | "simbriefUsername"> = {
    metarSource: "msfs",
    tafSource: "met",
    atisSource: "vatsim",
    simbriefUsername: "",
};

export const SettingsContext = React.createContext<SettingsContextProps>({
    ...defaults,
    setMetarSource: () => {},
    setTafSource: () => {},
    setAtisSource: () => {},
    setSimbriefUsername: () => {},
});

export const SettingsContextProvider: FC<{ children: ReactNode | ReactNode[] }> = ({ children }) => {
    const [metarSource, setMetarSource] = usePersistentSetting<MetarSource>("HYPABIT_METAR_SOURCE", defaults.metarSource);
    const [tafSource, setTafSource] = usePersistentSetting<TafSource>("HYPABIT_TAF_SOURCE", defaults.tafSource);
    const [atisSource, setAtisSource] = usePersistentSetting<AtisSource>("HYPABIT_ATIS_SOURCE", defaults.atisSource);
    const [simbriefUsername, setSimbriefUsername] = usePersistentSetting<string>("HYPABIT_SIMBRIEF_USERNAME", defaults.simbriefUsername);

    return (
        <SettingsContext.Provider
            value={{
                metarSource,
                setMetarSource,
                tafSource,
                setTafSource,
                atisSource,
                setAtisSource,
                simbriefUsername,
                setSimbriefUsername,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
