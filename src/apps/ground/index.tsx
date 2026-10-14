import { App } from "@microsoft/msfs-efb-api";
import React, { FC } from "react";
import { registerReactEfbApp } from "../../shared/efb";
import { ModalProvider } from "../../shared/ModalContext";
import { SettingsContextProvider } from "../../shared/SettingsContext";
import { Theme } from "../../shared/lib/Theme";
import { startCabinLights } from "./cabinLights";
import { Ground } from "./Ground";
import { GroundProvider } from "./GroundContext";
import icon from "./icon.svg";

const GroundApp: FC<{ app: App }> = ({ app }) => (
    <Theme>
        <SettingsContextProvider>
            <ModalProvider>
                <GroundProvider app={app}>
                    <Ground />
                </GroundProvider>
            </ModalProvider>
        </SettingsContextProvider>
    </Theme>
);

registerReactEfbApp({ name: "Ground", internalName: "HypabitGround", icon, component: GroundApp });
startCabinLights();
