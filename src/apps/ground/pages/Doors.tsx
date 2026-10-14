import React, { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { usePersistentSetting } from "../../../shared/hooks";
import { CABIN_LIGHTS_KEY, DEFAULT_CABIN_LEVEL } from "../cabinLights";
import { DoorPoint, doorOpen, isDoor, scanDoorPoints, setDoorGoal } from "../doors";
import { useGround } from "../GroundContext";
import { Button, Buttons, Card, CardTitle, Column, Muted, Page, Row } from "../ui";

const CABIN_LEVELS = [0, 25, 50, 75, 100];

export const Doors: FC = () => {
    const { supported, variant } = useGround();
    const [points, setPoints] = useState<DoorPoint[]>([]);
    const [open, setOpen] = useState<Map<number, number>>(new Map());
    const [cabinLevel, setCabinLevel] = usePersistentSetting<number>(CABIN_LIGHTS_KEY, DEFAULT_CABIN_LEVEL);

    useEffect(() => {
        if (!supported) {
            return undefined;
        }
        const found = scanDoorPoints();
        setPoints(found);
        const poll = () => setOpen(new Map(found.map((point) => [point.index, doorOpen(point.index)])));
        poll();
        const timer = setInterval(poll, 500);
        return () => clearInterval(timer);
    }, [supported]);

    const doors = points.filter(isDoor);
    const services = points.filter((point) => !isDoor(point));

    const renderPoint = (point: DoorPoint) => {
        const amount = open.get(point.index) ?? 0;
        return (
            <Row key={point.index}>
                <span>
                    {point.label}
                    <Muted>
                        {" "}
                        · #{point.index}
                        {point.eicas ? ` · EICAS ${point.eicas}` : ""}
                    </Muted>
                </span>
                <DoorControl>
                    <State open={amount > 0.01}>{amount > 0.99 ? "Open" : amount > 0.01 ? `${Math.round(amount * 100)}%` : "Closed"}</State>
                    <Toggle onClick={() => setDoorGoal(point.index, amount > 0.5 ? 0 : 1)}>{amount > 0.5 ? "Close" : "Open"}</Toggle>
                </DoorControl>
            </Row>
        );
    };

    if (!supported) {
        return (
            <Page>
                <Muted style={{ fontSize: 24 }}>Only available in the 747-8.</Muted>
            </Page>
        );
    }

    return (
        <Page>
            <Column>
                <Card>
                    <CardTitle>Doors</CardTitle>
                    {doors.map(renderPoint)}
                    <Buttons style={{ marginTop: 12 }}>
                        <Button secondary onClick={() => doors.forEach((point) => setDoorGoal(point.index, 0))}>
                            Close all doors
                        </Button>
                    </Buttons>
                </Card>
            </Column>
            <Column width="520px">
                {!variant.freighter && (
                    <Card>
                        <CardTitle>Cabin lights</CardTitle>
                        <Levels>
                            {CABIN_LEVELS.map((level) => (
                                <Level key={level} selected={level === cabinLevel} onClick={() => setCabinLevel(level)}>
                                    {level === 0 ? "Off" : `${level}%`}
                                </Level>
                            ))}
                        </Levels>
                        <Muted>On whenever AC power is available.</Muted>
                    </Card>
                )}
                {services.length > 0 && (
                    <Card>
                        <CardTitle>Service points</CardTitle>
                        {services.map(renderPoint)}
                    </Card>
                )}
            </Column>
        </Page>
    );
};

const DoorControl = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`;

const State = styled.span<{ open: boolean }>`
    min-width: 80px;
    text-align: right;
    color: ${(props) => (props.open ? "#d9822b" : props.theme.text)};
`;

const Toggle = styled.div`
    min-width: 80px;
    text-align: center;
    padding: 6px 14px;
    border-radius: 10px;
    background: ${(props) => props.theme.accent};
`;

const Levels = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
`;

const Level = styled.div<{ selected: boolean }>`
    flex: 1;
    text-align: center;
    font-size: 22px;
    padding: 10px 0;
    border-radius: 10px;
    background: ${(props) => (props.selected ? props.theme.select : props.theme.accent)};
    color: ${(props) => (props.selected ? "white" : props.theme.text)};
`;
