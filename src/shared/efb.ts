import { App, AppBootMode, AppSuspendMode, AppView, Efb, TVNode } from "@microsoft/msfs-efb-api";
import { ComponentProps, DisplayComponent, FSComponent, VNode } from "@microsoft/msfs-sdk";
import React, { ComponentType } from "react";
import { createRoot, Root } from "react-dom/client";

type ReactEfbAppOptions = {
    name: string;
    internalName: string;
    icon: string;
    component: ComponentType;
};

export const registerReactEfbApp = ({ name, internalName, icon, component }: ReactEfbAppOptions): void => {
    class ReactAppView extends DisplayComponent<ComponentProps> {
        private readonly containerRef = FSComponent.createRef<HTMLDivElement>();
        private reactRoot: Root | null = null;

        public render(): VNode {
            return FSComponent.buildComponent("div", { ref: this.containerRef, class: "hypabit-app" });
        }

        public onAfterRender(node: VNode): void {
            super.onAfterRender(node);
            Object.assign(this.containerRef.instance.style, { position: "relative", width: "100%", height: "100%", overflow: "hidden" });
            this.reactRoot = createRoot(this.containerRef.instance);
            this.reactRoot.render(React.createElement(component));
        }

        public destroy(): void {
            this.reactRoot?.unmount();
            super.destroy();
        }
    }

    class ReactEfbApp extends App {
        public BootMode = AppBootMode.HOT;
        public SuspendMode = AppSuspendMode.SLEEP;

        // The EFB keys apps by internalName, which otherwise defaults to the class name shared by every app built here.
        public get internalName(): string {
            return internalName;
        }

        public get name(): string {
            return name;
        }

        public get icon(): string {
            return icon;
        }

        public render(): TVNode<AppView> {
            return FSComponent.buildComponent(ReactAppView, {}) as unknown as TVNode<AppView>;
        }
    }

    Efb.use(ReactEfbApp);
};
