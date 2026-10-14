import React, { FC } from "react";
import { registerReactEfbApp } from "../../shared/efb";
import { ModalProvider } from "../../shared/ModalContext";
import { SettingsContextProvider } from "../../shared/SettingsContext";
import { FlightProvider } from "../../shared/lib/FlightContext";
import { Theme } from "../../shared/lib/Theme";
import { WeatherContextProvider } from "./WeatherContext";
import { Weather } from "./Weather";
import icon from "./icon.svg";

const WeatherApp: FC = () => (
    <Theme>
        <SettingsContextProvider>
            <FlightProvider>
                <WeatherContextProvider>
                    <ModalProvider>
                        <Weather />
                    </ModalProvider>
                </WeatherContextProvider>
            </FlightProvider>
        </SettingsContextProvider>
    </Theme>
);

registerReactEfbApp({ name: "Weather", internalName: "HypabitWeather", icon, component: WeatherApp });
