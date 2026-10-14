import React, { FC, ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import { Input } from "../../shared/components/Input";

export const Page = styled.div`
    display: flex;
    gap: 24px;
    width: 100%;
    height: 100%;
    padding: 24px;
    box-sizing: border-box;
    overflow-y: auto;
`;

export const Column = styled.div<{ width?: string }>`
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: ${(props) => props.width ?? "auto"};
    flex: ${(props) => (props.width ? "none" : "1")};
    min-width: 0;
`;

export const Card = styled.div`
    background: ${(props) => props.theme.invert.primary};
    border-radius: 15px;
    padding: 18px 22px;
    box-shadow: 2px 2px 13.5px 7px rgba(0, 0, 0, 0.06);
`;

export const CardTitle = styled.div`
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 12px;
`;

export const Row = styled.div<{ warn?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-size: 22px;
    padding: 6px 0;
    color: ${(props) => (props.warn ? "#d62f2f" : props.theme.text)};

    & + & {
        border-top: 1px solid ${(props) => props.theme.accent};
    }
`;

export const Muted = styled.span`
    opacity: 0.55;
`;

export const Buttons = styled.div`
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
`;

export const Button = styled.div<{ secondary?: boolean; disabled?: boolean }>`
    flex: 1;
    text-align: center;
    font-size: 22px;
    font-weight: 500;
    padding: 14px 20px;
    border-radius: 12px;
    background: ${(props) => (props.secondary ? props.theme.accent : props.theme.select)};
    color: ${(props) => (props.secondary ? props.theme.text : "white")};
    opacity: ${(props) => (props.disabled ? 0.4 : 1)};
    pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
`;

export const Bar: FC<{ fraction: number }> = ({ fraction }) => (
    <BarTrack>
        <BarFill style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }} />
    </BarTrack>
);

const BarTrack = styled.div`
    width: 160px;
    height: 12px;
    border-radius: 6px;
    background: ${(props) => props.theme.accent};
    overflow: hidden;
`;

const BarFill = styled.div`
    height: 100%;
    background: ${(props) => props.theme.select};
`;

type NumberFieldProps = {
    label: ReactNode;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    suffix?: string;
    placeholder?: string;
    decimals?: number;
};

export const NumberField: FC<NumberFieldProps> = ({ label, value, onChange, suffix, placeholder = "0", decimals = 0 }) => {
    const format = (v: number | undefined) => (v === undefined ? "" : v.toFixed(decimals));
    const [text, setText] = useState(format(value));

    useEffect(() => setText(format(value)), [value]);

    return (
        <Row>
            <span>{label}</span>
            <FieldBox>
                <Input
                    placeholder={placeholder}
                    manualValue={text}
                    onFocusOut={(raw) => {
                        const parsed = parseFloat(raw.replace(/[^0-9.]/g, ""));
                        onChange(Number.isFinite(parsed) ? parsed : undefined);
                    }}
                    style={{ width: "100%", textAlign: "right", fontSize: "22px" }}
                />
                {suffix && <Muted style={{ whiteSpace: "nowrap" }}>{suffix}</Muted>}
            </FieldBox>
        </Row>
    );
};

const FieldBox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 250px;
    padding: 4px 12px;
    border-radius: 10px;
    background: ${(props) => props.theme.primary};
`;

type TextFieldProps = {
    label: ReactNode;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export const TextField: FC<TextFieldProps> = ({ label, value, onChange, placeholder = "" }) => (
    <Row>
        <span>{label}</span>
        <FieldBox>
            <Input placeholder={placeholder} manualValue={value} onFocusOut={onChange} style={{ width: "100%", fontSize: "22px" }} />
        </FieldBox>
    </Row>
);
