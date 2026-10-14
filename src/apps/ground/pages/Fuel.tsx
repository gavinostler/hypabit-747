import React, { FC, useState } from "react";
import { planFuel, totalOf, writeTanks } from "../aircraft";
import { useGround } from "../GroundContext";
import { formatWeight, fromPounds, toPounds } from "../units";
import { Bar, Button, Buttons, Card, CardTitle, Column, Muted, NumberField, Page, Row } from "../ui";

export const Fuel: FC = () => {
    const { supported, variant, unit, live, plan, setPlan, importSimbrief } = useGround();
    const [loading, setLoading] = useState(false);

    const current = totalOf(live.tanks);
    const capacity = totalOf(live.capacities);
    const fuelLb = Math.min(plan.fuelLb ?? current, capacity);
    const planned = planFuel(variant, fuelLb, live.capacities);

    const load = async () => {
        setLoading(true);
        await writeTanks(planned);
        setLoading(false);
    };

    return (
        <Page>
            <Column width="560px">
                <Card>
                    <CardTitle>Fuel</CardTitle>
                    <NumberField
                        label="Block fuel"
                        value={Math.round(fromPounds(fuelLb, unit))}
                        suffix={unit}
                        onChange={(value) => setPlan({ fuelLb: toPounds(value ?? 0, unit) })}
                    />
                    <Row>
                        <span>On board</span>
                        <span>{formatWeight(current, unit)}</span>
                    </Row>
                    <Row>
                        <span>Capacity</span>
                        <span>{formatWeight(capacity, unit)}</span>
                    </Row>
                    <Buttons style={{ marginTop: 12 }}>
                        <Button secondary onClick={importSimbrief}>
                            Import SimBrief
                        </Button>
                        <Button disabled={!supported || loading} onClick={load}>
                            {loading ? "Loading…" : "Load fuel"}
                        </Button>
                    </Buttons>
                    {!supported && <Muted>Only available in the 747-8.</Muted>}
                </Card>
            </Column>
            <Column>
                <Card>
                    <CardTitle>Tanks</CardTitle>
                    {variant.tanks.map((tank) => {
                        const weight = live.tanks.get(tank.index) ?? 0;
                        const tankCapacity = live.capacities.get(tank.index) ?? 0;
                        return (
                            <Row key={tank.index}>
                                <span style={{ width: 150 }}>{tank.name}</span>
                                <Bar fraction={tankCapacity > 0 ? weight / tankCapacity : 0} />
                                <span style={{ flex: 1, textAlign: "right" }}>
                                    {formatWeight(weight, unit)}
                                    <Muted> → {formatWeight(planned.get(tank.index) ?? 0, unit)}</Muted>
                                </span>
                            </Row>
                        );
                    })}
                </Card>
            </Column>
        </Page>
    );
};
