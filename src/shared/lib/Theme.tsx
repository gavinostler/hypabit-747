import React, { FC, ReactNode } from "react";
import { ThemeProvider } from "styled-components";

const theme = {
    bg: "#ffffff",
    primary: "#f2f1f6",
    accent: "#e9e9eb",
    text: "#000000",
    select: "#4FA0FC",
    border: "lightgray",
    selectLighter: "#CDE5F4",

    invert: {
        bg: "#f2f2f7",
        primary: "#ffffff",
    },
};

export const Theme: FC<{ children?: ReactNode | ReactNode[] }> = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;
