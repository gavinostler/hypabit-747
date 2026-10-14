import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import patches from "../patches/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "build", "hypabit-747");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const manifestBase = JSON.parse(fs.readFileSync(path.join(root, "manifest-base.json"), "utf8"));

const apps = [
    { internalName: "HypabitWeather", entry: "src/apps/weather/index.tsx" },
    { internalName: "HypabitGround", entry: "src/apps/ground/index.tsx" },
];

// The EFB loads the SDK once as the msfssdk global; bundling a second copy would break class identity with the OS.
const msfsSdkGlobal = {
    name: "msfs-sdk-global",
    setup(b) {
        b.onResolve({ filter: /^@microsoft\/msfs-sdk$/ }, () => ({ path: "msfs-sdk", namespace: "msfs-sdk-global" }));
        b.onLoad({ filter: /.*/, namespace: "msfs-sdk-global" }, () => ({ contents: "module.exports = window.msfssdk;", loader: "js" }));
    },
};

// App scripts can load before the EFB has created msfssdk and EFB_API, so the bundle waits for both.
const startWhenReady = {
    banner: "(function () { function hypabitStart() {",
    footer:
        "} var tries = 0; var timer = setInterval(function () { if (window.msfssdk && window.EFB_API) { clearInterval(timer); hypabitStart(); } else if (++tries > 600) { clearInterval(timer); } }, 50); })();",
};

fs.rmSync(out, { recursive: true, force: true });

const stock = path.resolve(process.env.HYPABIT_STOCK ?? path.join(root, "stock"));

function applyPatch(patch) {
    let text = fs.readFileSync(path.join(stock, patch.path), "latin1");
    for (const edit of patch.edits ?? []) {
        const expected = edit.count ?? 1;
        const found = text.split(edit.find).length - 1;
        if (found !== expected) {
            throw new Error(`${patch.path}: expected ${expected} match(es) for ${JSON.stringify(edit.find.slice(0, 80))}, found ${found}`);
        }
        text = text.split(edit.find).join(edit.replace);
    }
    if (patch.transform) {
        text = patch.transform(text);
    }
    const target = path.join(out, patch.output ?? patch.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text, "latin1");
}

if (fs.existsSync(stock)) {
    for (const patch of patches) {
        applyPatch(patch);
    }
    fs.cpSync(path.join(root, "package"), out, { recursive: true });
} else {
    console.warn(`No stock files at ${stock}; building the EFB apps only. Run scripts/extract-stock.mjs to include the aircraft fixes.`);
}

for (const app of apps) {
    await build({
        entryPoints: { [app.internalName]: path.join(root, app.entry) },
        outdir: path.join(out, "html_ui", "efb_ui", "efb_apps", app.internalName),
        bundle: true,
        format: "iife",
        target: "es2017",
        minify: true,
        keepNames: true,
        jsx: "transform",
        loader: { ".jpg": "file", ".png": "file", ".svg": "file" },
        assetNames: "assets/[name]-[hash]",
        publicPath: `coui://html_ui/efb_ui/efb_apps/${app.internalName}`,
        define: { "process.env.NODE_ENV": '"production"' },
        plugins: [msfsSdkGlobal],
        banner: { js: startWhenReady.banner },
        footer: { js: startWhenReady.footer },
        logLevel: "warning",
    });
}

function* walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const resolved = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* walk(resolved);
        } else {
            yield resolved;
        }
    }
}

const MS_FILETIME_EPOCH = 116444736000000000n;
const content = [];
let totalSize = 0;

for (const file of walk(out)) {
    const stat = fs.statSync(file, { bigint: true });
    content.push({
        path: path.relative(out, file).split(path.sep).join("/"),
        size: Number(stat.size),
        date: Number(stat.mtimeNs / 100n + MS_FILETIME_EPOCH),
    });
    totalSize += Number(stat.size);
}

fs.writeFileSync(path.join(out, "layout.json"), JSON.stringify({ content }, null, 2));
fs.writeFileSync(
    path.join(out, "manifest.json"),
    JSON.stringify(
        {
            ...manifestBase,
            package_version: pkg.version,
            total_package_size: totalSize.toString().padStart(20, "0"),
        },
        null,
        2,
    ),
);
