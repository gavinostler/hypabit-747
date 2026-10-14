const wt = "html_ui/pages/vcockpit/instruments/airliners/wtb747_8iv2";

const colors = {
    green: "#3ad22d",
    magenta: "#e75ae7",
    cyan: "hsl(190, 80%, 55%)",
    blue: "hsl(228, 80%, 58%)",
    sky: "#1d6fcd",
};

const cssColorEdits = [
    { find: "--boeing-colors-green: #49e700;", replace: `--boeing-colors-green: ${colors.green};` },
    { find: "--boeing-colors-magenta: #ff00ff;", replace: `--boeing-colors-magenta: ${colors.magenta};` },
    { find: "--boeing-colors-cyan: hsl(192, 100%, 50%);", replace: `--boeing-colors-cyan: ${colors.cyan};` },
    { find: "--boeing-colors-blue: hsl(230, 100%, 51%);", replace: `--boeing-colors-blue: ${colors.blue};` },
];

const jsColorEdits = [
    { find: "BoeingColors.green = '#49e700';", replace: `BoeingColors.green = '${colors.green}';` },
    { find: "BoeingColors.magenta = 'magenta';", replace: `BoeingColors.magenta = '${colors.magenta}';` },
    { find: "BoeingColors.cyan = 'hsl(195, 100%, 50%)';", replace: `BoeingColors.cyan = '${colors.cyan}';` },
    { find: "BoeingColors.blue = 'hsl(230, 100%, 51%)';", replace: `BoeingColors.blue = '${colors.blue}';` },
];

const operatingEmptyWeight = {
    find: `    get operatingEmptyWeight() {
        if (this.is748F) {`,
    replace: `    get operatingEmptyWeight() {
        const simEmptyWeight = SimVar.GetSimVarValue('EMPTY WEIGHT', 'pounds');
        if (simEmptyWeight > 0) {
            return simEmptyWeight;
        }
        if (this.is748F) {`,
};

export default [
    {
        path: `${wt}/cdu/cdu.js`,
        edits: [
            operatingEmptyWeight,
            {
                find: `                [' PAX COUNT', 'PAYLOAD'],
                [this.paxCountField, this.payloadPercField],`,
                replace: `                [this.fms.payloadManager.getMaxPaxCount() > 0 ? ' PAX COUNT' : '', 'PAYLOAD'],
                [this.fms.payloadManager.getMaxPaxCount() > 0 ? this.paxCountField : '', this.payloadPercField],`,
            },
            {
                find: `        this.updateCgData();
    }
    /** @inheritDoc */
    onResume() {
        this.gameUnit.resume();
    }`,
                replace: `        this.updateCgData();
    }
    /** @inheritDoc */
    onResume() {
        this.gameUnit.resume();
        if (!this.fms.payloadManager.isProcessing.get()) {
            this.fms.payloadManager.fetchCurrentWeightsFromSim();
        }
    }`,
            },
        ],
    },
    {
        path: `${wt}/mfd/mfd.js`,
        edits: [
            operatingEmptyWeight,
            ...jsColorEdits,
            // A door that settles a hair above closed would otherwise keep its EICAS message up.
            { find: "position > 0 ? B74DoorStatus.OPEN", replace: "position > 0.01 ? B74DoorStatus.OPEN", count: 3 },
        ],
    },
    {
        path: `${wt}/pfd/pfd.js`,
        edits: [operatingEmptyWeight, ...jsColorEdits, { find: "skyColor: '#006efb'", replace: `skyColor: '${colors.sky}'` }],
    },
    { path: `${wt}/pfd/pfd.css`, edits: cssColorEdits },
    { path: `${wt}/mfd/mfd.css`, edits: cssColorEdits },
    { path: `${wt}/cdu/cdu.css`, edits: cssColorEdits },
];
