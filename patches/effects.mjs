const effects = "simobjects/airplanes/asobo_b747_8i/common/effects";

const warmFlood = "255, 205, 155";
const warmBounce = "255, 228, 196";

const retune = (file, { from, to, intensity }) => ({
    path: `${effects}/${file}`,
    edits: [
        { find: `Color Start=${from}`, replace: `Color Start=${to}` },
        { find: `Color End=${from}`, replace: `Color End=${to}` },
        { find: `Intensity=${intensity[0]}\r\n`, replace: `Intensity=${intensity[1]}\r\n` },
    ],
});

export default [
    retune("light_asobo_cockpitspotlarge.fx", { from: "255, 220, 180", to: warmFlood, intensity: ["175", "110"] }),
    retune("light_asobo_cockpitspotwideshort.fx", { from: "255, 220, 180", to: warmFlood, intensity: ["85", "60"] }),
    retune("light_asobo_pedestal.fx", { from: "255, 220, 180", to: warmFlood, intensity: ["175", "120"] }),
    retune("light_asobo_cabinbounce.fx", { from: "255, 255, 255", to: warmBounce, intensity: ["2.0", "1.5"] }),
    retune("light_asobo_cabinbouncelarge.fx", { from: "255, 255, 255", to: warmBounce, intensity: ["4.0", "3.0"] }),
    retune("light_asobo_cabinbouncesmall.fx", { from: "255, 255, 255", to: warmBounce, intensity: ["20", "15"] }),
];
