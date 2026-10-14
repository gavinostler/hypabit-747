import React, { FC, useContext, useState } from "react";
import { SettingsContext } from "../../../shared/SettingsContext";
import {
    MAX_PAX,
    cargoFromLoad,
    cgOf,
    emptyWeight,
    paxFromLoad,
    planFuel,
    planPayload,
    stationItems,
    tankItems,
    totalOf,
    writeStations,
} from "../aircraft";
import { CgChart } from "../components/CgChart";
import { useGround } from "../GroundContext";
import { formatWeight, fromPounds, toPounds } from "../units";
import { Button, Buttons, Card, CardTitle, Column, Muted, NumberField, Page, Row, TextField } from "../ui";

export const Payload: FC = () => {
    const { supported, variant, unit, live, plan, setPlan, importSimbrief } = useGround();
    const { simbriefUsername, setSimbriefUsername } = useContext(SettingsContext);
    const [loading, setLoading] = useState(false);

    const pax = plan.pax ?? paxFromLoad(variant, live.stations);
    const cargoLb = plan.cargoLb ?? cargoFromLoad(variant, live.stations);
    const fuelLb = plan.fuelLb ?? totalOf(live.tanks);

    const planned = planPayload(variant, { pax, cargo: cargoLb, targetZfwCg: plan.targetZfwCg }, live.stations, live.emptyArm);
    const plannedFuel = planFuel(variant, fuelLb, live.capacities);
    const zfw = emptyWeight() + totalOf(planned);
    const zfwCg = cgOf(stationItems(variant, planned), live.emptyArm);
    const grossWeight = zfw + totalOf(plannedFuel);
    const grossCg = cgOf([...stationItems(variant, planned), ...tankItems(variant, plannedFuel)], live.emptyArm);
    const { limits } = variant;

    const load = async () => {
        setLoading(true);
        await writeStations(planned);
        setLoading(false);
    };

    return (
        <Page>
            <Column width="600px">
                <Card>
                    <CardTitle>CG envelope</CardTitle>
                    <CgChart
                        limits={limits}
                        unit={unit}
                        width={556}
                        height={440}
                        points={[
                            { label: "Planned ZFW", cg: zfwCg, weightLb: zfw, color: "#333333" },
                            { label: "Planned gross", cg: grossCg, weightLb: grossWeight, color: "#4fa0fc" },
                            { label: "Current", cg: live.cg, weightLb: live.grossWeight, color: "#e8833a" },
                        ]}
                    />
                </Card>
            </Column>
            <Column>
                <Card>
                    <CardTitle>Payload</CardTitle>
                    {!variant.freighter && (
                        <NumberField label="Passengers" value={pax} suffix={`/ ${MAX_PAX}`} onChange={(value) => setPlan({ pax: value ?? 0 })} />
                    )}
                    <NumberField
                        label="Cargo"
                        value={Math.round(fromPounds(cargoLb, unit))}
                        suffix={unit}
                        onChange={(value) => setPlan({ cargoLb: toPounds(value ?? 0, unit) })}
                    />
                    <NumberField
                        label="Target ZFW CG"
                        value={plan.targetZfwCg}
                        suffix="%"
                        placeholder="Auto"
                        decimals={1}
                        onChange={(value) => setPlan({ targetZfwCg: value })}
                    />
                    {plan.targetZfwCg !== undefined && Math.abs(zfwCg - plan.targetZfwCg) > 0.05 && (
                        <Muted>Out of reach with this cargo; closest is {zfwCg.toFixed(1)}%.</Muted>
                    )}
                </Card>
                <Card>
                    <Row warn={zfw > limits.mzfw}>
                        <span>ZFW</span>
                        <span>
                            {formatWeight(zfw, unit)} <Muted>/ {formatWeight(limits.mzfw, unit)}</Muted>
                        </span>
                    </Row>
                    <Row>
                        <span>ZFW CG</span>
                        <span>{zfwCg.toFixed(1)}%</span>
                    </Row>
                    <Row warn={grossWeight > limits.mtow}>
                        <span>Gross weight with planned fuel</span>
                        <span>
                            {formatWeight(grossWeight, unit)} <Muted>/ {formatWeight(limits.mtow, unit)}</Muted>
                        </span>
                    </Row>
                    <Row>
                        <span>Gross CG</span>
                        <span>{grossCg.toFixed(1)}%</span>
                    </Row>
                    <Row>
                        <span>Current CG (sim)</span>
                        <span>{live.cg.toFixed(1)}%</span>
                    </Row>
                </Card>
                <Card>
                    <TextField label="SimBrief username" value={simbriefUsername} onChange={(value) => setSimbriefUsername(value.trim())} />
                    <Buttons style={{ marginTop: 12 }}>
                        <Button secondary onClick={importSimbrief}>
                            Import SimBrief
                        </Button>
                        <Button disabled={!supported || loading} onClick={load}>
                            {loading ? "Loading…" : "Load payload"}
                        </Button>
                    </Buttons>
                    {!supported && <Muted>Only available in the 747-8.</Muted>}
                </Card>
                <Card>
                    <CardTitle>Stations</CardTitle>
                    {variant.stations
                        .filter((station) => station.kind !== "crew")
                        .map((station) => (
                            <Row key={station.index}>
                                <span>{station.name}</span>
                                <span>
                                    {formatWeight(live.stations.get(station.index) ?? 0, unit)}
                                    <Muted> → {formatWeight(planned.get(station.index) ?? 0, unit)}</Muted>
                                </span>
                            </Row>
                        ))}
                </Card>
            </Column>
        </Page>
    );
};
