import React, { FC } from "react";
import styled, { useTheme } from "styled-components";
import { Limits } from "../aircraft";
import { envelope } from "../envelope";
import { WeightUnit, fromPounds, toPounds } from "../units";

export type ChartPoint = {
    label: string;
    cg: number;
    weightLb: number;
    color: string;
};

type CgChartProps = {
    limits: Limits;
    unit: WeightUnit;
    points: ChartPoint[];
    width: number;
    height: number;
};

const CG_RANGE: [number, number] = [8, 36];
const KG_RANGE: [number, number] = [150000, 460000];
const PAD = { left: 70, right: 16, top: 16, bottom: 44 };
const LB_PER_KG = toPounds(1, "kg");

const lines = [
    { key: "mtow", label: "MTOW", color: "#4fa0fc", limit: (l: Limits) => l.mtow },
    { key: "mlw", label: "MLW", color: "#62a30f", limit: (l: Limits) => l.mlw },
    { key: "mzfw", label: "MZFW", color: "#333333", limit: (l: Limits) => l.mzfw },
] as const;

export const CgChart: FC<CgChartProps> = ({ limits, unit, points, width, height }) => {
    const theme = useTheme();
    const plotWidth = width - PAD.left - PAD.right;
    const plotHeight = height - PAD.top - PAD.bottom;

    const x = (cg: number) => PAD.left + ((cg - CG_RANGE[0]) / (CG_RANGE[1] - CG_RANGE[0])) * plotWidth;
    const y = (kg: number) => PAD.top + (1 - (kg - KG_RANGE[0]) / (KG_RANGE[1] - KG_RANGE[0])) * plotHeight;
    const clampCg = (cg: number) => Math.min(CG_RANGE[1], Math.max(CG_RANGE[0], cg));
    const clampKg = (kg: number) => Math.min(KG_RANGE[1], Math.max(KG_RANGE[0], kg));

    const cgTicks = [10, 15, 20, 25, 30, 35];
    const weightTicks = (unit === "kg" ? [150, 200, 250, 300, 350, 400, 450] : [350, 450, 550, 650, 750, 850, 950])
        .map((thousands) => ({ thousands, kg: (thousands * 1000) / (unit === "kg" ? 1 : LB_PER_KG) }))
        .filter((tick) => tick.kg >= KG_RANGE[0] && tick.kg <= KG_RANGE[1]);

    return (
        <div>
            <svg width={width} height={height}>
                {cgTicks.map((cg) => (
                    <g key={`cg-${cg}`}>
                        <line x1={x(cg)} x2={x(cg)} y1={PAD.top} y2={PAD.top + plotHeight} stroke={theme.accent} />
                        <text x={x(cg)} y={height - 14} fontSize={18} textAnchor="middle" fill={theme.text}>
                            {cg}%
                        </text>
                    </g>
                ))}
                {weightTicks.map((tick) => (
                    <g key={`w-${tick.thousands}`}>
                        <line x1={PAD.left} x2={PAD.left + plotWidth} y1={y(tick.kg)} y2={y(tick.kg)} stroke={theme.accent} />
                        <text x={PAD.left - 10} y={y(tick.kg) + 6} fontSize={18} textAnchor="end" fill={theme.text}>
                            {tick.thousands}
                        </text>
                    </g>
                ))}
                <rect x={PAD.left} y={PAD.top} width={plotWidth} height={plotHeight} fill="none" stroke={theme.border} />
                {lines.map((line) => {
                    const capKg = fromPounds(line.limit(limits), "kg");
                    const path = envelope[line.key].map(([cg, kg]) => `${x(cg)},${y(Math.min(kg, capKg))}`).join(" ");
                    return <polyline key={line.key} points={path} fill="none" stroke={line.color} strokeWidth={line.key === "mzfw" ? 2 : 3} />;
                })}
                {points.map((point) => {
                    const px = x(clampCg(point.cg));
                    const py = y(clampKg(fromPounds(point.weightLb, "kg")));
                    return (
                        <path
                            key={point.label}
                            d={`M ${px} ${py - 10} L ${px + 10} ${py} L ${px} ${py + 10} L ${px - 10} ${py} Z`}
                            fill={point.color}
                            stroke="white"
                            strokeWidth={2}
                        />
                    );
                })}
            </svg>
            <Legend>
                <Muted>× 1000 {unit}</Muted>
                {lines.map((line) => (
                    <LegendItem key={line.key}>
                        <Swatch style={{ background: line.color }} />
                        {line.label}
                    </LegendItem>
                ))}
                {points.map((point) => (
                    <LegendItem key={point.label}>
                        <Diamond style={{ background: point.color }} />
                        {point.label}
                    </LegendItem>
                ))}
            </Legend>
        </div>
    );
};

const Legend = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    font-size: 18px;
    margin-top: 6px;
`;

const Muted = styled.span`
    opacity: 0.55;
`;

const LegendItem = styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
`;

const Swatch = styled.span`
    display: inline-block;
    width: 18px;
    height: 4px;
    border-radius: 2px;
`;

const Diamond = styled.span`
    display: inline-block;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
`;
