import React, { FC, useContext } from "react";
import styled, { useTheme } from "styled-components";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../../../shared/SettingsContext";
import { Input } from "../../../shared/components/Input";
import { AtisSource, MetarSource, TafSource } from "../../../shared/lib/weather";

const metarSources: [MetarSource, string][] = [
    ["msfs", "Simulator"],
    ["vatsim", "VATSIM"],
    ["ivao", "IVAO"],
    ["pilotedge", "PilotEdge"],
    ["aviationweather", "AviationWeather"],
];

const tafSources: [TafSource, string][] = [
    ["met", "MET Norway"],
    ["aviationweather", "AviationWeather"],
    ["faa", "FAA"],
];

const atisSources: [AtisSource, string][] = [
    ["vatsim", "VATSIM"],
    ["ivao", "IVAO"],
    ["pilotedge", "PilotEdge"],
    ["faa", "FAA"],
];

type ChoiceProps<T extends string> = {
    label: string;
    options: [T, string][];
    value: T;
    onChange: (value: T) => void;
};

const Choice = <T extends string>({ label, options, value, onChange }: ChoiceProps<T>) => (
    <Section>
        <Label>{label}</Label>
        <Options>
            {options.map(([option, name]) => (
                <Option key={option} selected={option === value} onClick={() => onChange(option)}>
                    {name}
                </Option>
            ))}
        </Options>
    </Section>
);

export const SettingsPanel: FC<{ onClose: () => void }> = ({ onClose }) => {
    const { metarSource, setMetarSource, tafSource, setTafSource, atisSource, setAtisSource, simbriefUsername, setSimbriefUsername } =
        useContext(SettingsContext);
    const theme = useTheme();
    const aircraftIds = ["ATC MODEL", "ATC TYPE", "TITLE"].map((name) => `${name}: ${SimVar.GetSimVarValue(name, "string")}`);

    return (
        <StyledSettingsPanel>
            <Header>
                <div>Settings</div>
                <IoClose size={36} onClick={onClose} />
            </Header>
            <Choice label="METAR source" options={metarSources} value={metarSource} onChange={setMetarSource} />
            <Choice label="TAF source" options={tafSources} value={tafSource} onChange={setTafSource} />
            <Choice label="ATIS source" options={atisSources} value={atisSource} onChange={setAtisSource} />
            <Section>
                <Label>SimBrief username</Label>
                <Input
                    placeholder="Username"
                    manualValue={simbriefUsername}
                    onFocusOut={(value) => setSimbriefUsername(value.trim())}
                    style={{ width: "100%", border: `1px solid ${theme.border}`, color: theme.text }}
                />
            </Section>
            <AircraftIds>{aircraftIds.join(" · ")}</AircraftIds>
        </StyledSettingsPanel>
    );
};

const StyledSettingsPanel = styled.div`
    position: absolute;
    top: 70px;
    right: 30px;
    width: 640px;
    padding: 20px 25px;
    border-radius: 15px;
    background: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.text};
    box-shadow: 2px 2px 10px ${(props) => props.theme.border};
    z-index: 999;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 32px;
    font-weight: 500;
    margin-bottom: 10px;
`;

const AircraftIds = styled.div`
    font-size: 16px;
    opacity: 0.6;
`;

const Section = styled.div`
    margin: 15px 0;
`;

const Label = styled.div`
    font-size: 22px;
    margin-bottom: 8px;
`;

const Options = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const Option = styled.div<{ selected: boolean }>`
    font-size: 22px;
    padding: 8px 16px;
    margin: 0 10px 10px 0;
    border-radius: 10px;
    background: ${(props) => (props.selected ? props.theme.select : props.theme.invert.primary)};
    color: ${(props) => (props.selected ? "white" : props.theme.text)};
`;
