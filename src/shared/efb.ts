import { App, AppBootMode, AppSuspendMode, AppView, Efb, TVNode } from "@microsoft/msfs-efb-api";
import { ComponentProps, DisplayComponent, FSComponent, VNode } from "@microsoft/msfs-sdk";
import React, { ComponentType, ReactNode } from "react";
import { render, unmountComponentAtNode } from "react-dom";

type ReactEfbAppOptions = {
    name: string;
    internalName: string;
    icon: string;
    component: ComponentType<{ app: App }>;
};

type ReactAppViewProps = ComponentProps & { app: App };

const describe = (appName: string, error: unknown): string =>
    `${appName} hit an error. Please report this message:\n\n${error instanceof Error ? `${error.message}\n\n${error.stack ?? ""}` : String(error)}`;

const errorStyle = { margin: 0, padding: 24, color: "#b00020", background: "#fff", font: "18px monospace", whiteSpace: "pre-wrap", height: "100%", overflow: "auto" };

class ErrorBoundary extends React.Component<{ appName: string; children: ReactNode }, { error: unknown }> {
    public state = { error: null as unknown };

    public static getDerivedStateFromError(error: unknown) {
        return { error };
    }

    public render() {
        return this.state.error ? React.createElement("pre", { style: errorStyle }, describe(this.props.appName, this.state.error)) : this.props.children;
    }
}

export const registerReactEfbApp = ({ name, internalName, icon, component }: ReactEfbAppOptions): void => {
    class ReactAppView extends DisplayComponent<ReactAppViewProps> {
        private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

        public render(): VNode {
            return FSComponent.buildComponent("div", { ref: this.containerRef, class: "hypabit-app" })!;
        }

        public onAfterRender(node: VNode): void {
            super.onAfterRender(node);
            const container = this.containerRef.instance;
            Object.assign(container.style, { position: "absolute", top: "0", left: "0", width: "100%", height: "100%", overflow: "hidden" });
            // Legacy render mounts synchronously; createRoot's scheduler never ran in the sim's EFB, leaving a blank app.
            try {
                render(React.createElement(ErrorBoundary, { appName: name, children: React.createElement(component, { app: this.props.app }) }), container);
            } catch (error) {
                container.textContent = describe(name, error);
            }
        }

        public destroy(): void {
            unmountComponentAtNode(this.containerRef.instance);
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
            return FSComponent.buildComponent<typeof ReactAppView, ReactAppViewProps>(ReactAppView, { app: this }) as unknown as TVNode<AppView>;
        }
    }

    Efb.use(ReactEfbApp);
};
