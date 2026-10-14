import React, { FC, useContext } from "react";
import styled from "styled-components";
import { None, Widget } from "./Widget";
import { WeatherContext } from "../WeatherContext";

export const Atis: FC<{ message: string | null }> = ({ message }) => {
    const { theme } = useContext(WeatherContext);

    return (
        <Widget title="ATIS" scrollable={!!message} gridColumn="1 / span 6">
            {message ? <RawData>{message}</RawData> : <None color={theme.accentTextColor}>ATIS not available</None>}
        </Widget>
    );
};

const RawData = styled.div`
    font-size: 26px;
    padding: 5px 10px 10px 10px;
`;
