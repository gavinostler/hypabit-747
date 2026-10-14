const presets = "simobjects/airplanes/asobo_b747_8i/presets/microsoft";
const FEET_TO_METERS = 0.3048;

const referenceEyepoint = { longitudinal: 0, lateral: -2, vertical: 11.000029 };

// Meters from the passenger eyepoint, x right, y up, z forward. Negative pitch looks down, contrary to the SDK docs.
const views = {
    Pilot: { xyz: [0.08, 0.03, -0.09], pbh: [-7, 0, 1.56] },
    ClosePilot: { xyz: [0.13, -0.02, 0.3], pbh: [-14, 0, 0] },
    LandingPilot: { xyz: [0.1, 0.13, 0.1], pbh: [-4, 0, 0] },
    CoPilot: { xyz: [1.09, 0.03, -0.09], pbh: [-7, 0, -1.56] },
};

const round = (value) => Number(value.toFixed(4)).toString();

function retuneCameras(text) {
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const lines = text.split(/\r?\n/);

    const eyepointLine = lines.find((line) => /^\s*eyepoint\s*=/i.test(line));
    if (!eyepointLine) {
        throw new Error("cameras.cfg has no eyepoint");
    }
    const [longitudinal, lateral, vertical] = eyepointLine.split("=")[1].split(";")[0].split(",").map(Number);
    const shift = [
        (referenceEyepoint.lateral - lateral) * FEET_TO_METERS,
        (referenceEyepoint.vertical - vertical) * FEET_TO_METERS,
        (referenceEyepoint.longitudinal - longitudinal) * FEET_TO_METERS,
    ];

    const found = new Set();
    let title = null;
    const output = lines.map((line) => {
        if (/^\s*\[/.test(line)) {
            title = null;
            return line;
        }
        const titleMatch = line.match(/^\s*Title\s*=\s*"([^"]*)"/);
        if (titleMatch) {
            title = titleMatch[1];
            return line;
        }
        const view = views[title];
        if (!view) {
            return line;
        }
        if (/^\s*InitialXyz\s*=/.test(line)) {
            found.add(title);
            return `InitialXyz = ${view.xyz.map((value, axis) => round(value + shift[axis])).join(", ")}`;
        }
        if (/^\s*InitialPbh\s*=/.test(line)) {
            return `InitialPbh = ${view.pbh.map(round).join(", ")}`;
        }
        return line;
    });

    const missing = Object.keys(views).filter((name) => !found.has(name));
    if (missing.length > 0) {
        throw new Error(`cameras.cfg is missing ${missing.join(", ")}`);
    }
    return output.join(eol);
}

export default [
    { path: `${presets}/a_b747_8_passenger/config/cameras.cfg`, transform: retuneCameras },
    { path: `${presets}/b_b747_8_freighter/config/cameras.cfg`, transform: retuneCameras },
];
