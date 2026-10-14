import { instrumentDir } from "./wt.mjs";

const presets = "simobjects/airplanes/asobo_b747_8i/presets/microsoft";
const interiors = "simobjects/airplanes/asobo_b747_8i/attachments/microsoft";

const cabinLights = [
    "attachment_root = SimObjects\\Airplanes\\Asobo_B747_8i\\attachments\\hypabit\\Function_Cabin_Lights",
    "attachment_file = model/cabin_lights.xml",
    "attach_to_model = interior",
    "alias = hypabit_cabin_lights",
];

function addCabinLights(text) {
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const indices = [...text.matchAll(/^\[SIM_ATTACHMENT\.(\d+)\]/gm)].map((match) => Number(match[1]));
    if (indices.length === 0) {
        throw new Error("attached_objects.cfg has no SIM_ATTACHMENT sections");
    }
    const section = [`[SIM_ATTACHMENT.${Math.max(...indices) + 1}]`, ...cabinLights].join(eol);
    return `${text.trimEnd()}${eol}${eol}${section}${eol}`;
}

const screens = [
    ["PFD", 1],
    ["MFD", 4],
    ["CDU", 2],
].map(([folder, count]) => ({
    find: `Airliners/WTB747_8iv2/${folder}/WTB748_${folder}.html`,
    replace: `${instrumentDir}/${folder}/WTB748_${folder}.html`,
    count,
}));

export default [
    { path: `${presets}/a_b747_8_passenger/config/attached_objects.cfg`, transform: addCabinLights },
    { path: `${interiors}/function_interior_passenger/panel/panel.cfg`, edits: screens },
    { path: `${interiors}/function_interior_freighter/panel/panel.cfg`, edits: screens },
];
