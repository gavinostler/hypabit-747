import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [packageDir, outDir = path.join(root, "stock")] = process.argv.slice(2);

if (!packageDir) {
    console.error("Usage: node scripts/extract-stock.mjs <path to the asobo-aircraft-b7478i package> [output folder]");
    process.exit(1);
}

function* findArchives(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const resolved = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* findArchives(resolved);
        } else if (entry.name.endsWith(".fsarchive")) {
            yield resolved;
        }
    }
}

let extracted = 0;

for (const archive of findArchives(packageDir)) {
    const data = fs.readFileSync(archive);
    if (data.toString("latin1", 0, 4) !== "RASA") {
        continue;
    }
    const headerLength = data.readUInt32LE(12);
    const headerText = data.toString("utf8", 0x20, 0x20 + headerLength);
    let header;
    try {
        header = JSON.parse(headerText.slice(0, headerText.lastIndexOf("}") + 1));
    } catch {
        continue;
    }
    if (header.encryptionSetup?.scheme !== "notEncrypted") {
        continue;
    }

    // Archive paths are relative to the folder the archive sits in, e.g. html_ui/html_ui.fsarchive holds pages/...
    const mount = path.relative(packageDir, path.dirname(archive));
    const base = 0x20 + headerLength;

    for (const file of header.fileInfoList) {
        let relative = path.join(mount, ...file.path.split("\\")).toLowerCase();
        if (path.isAbsolute(relative) || relative.split(path.sep).includes("..")) {
            continue;
        }
        let contents = data.subarray(base + file.byteOffset, base + file.byteOffset + file.byteSize);
        if (relative.endsWith(".fsc")) {
            contents = zlib.inflateSync(contents);
            relative = relative.slice(0, -4);
        }
        const target = path.join(outDir, relative);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, contents);
        extracted++;
    }
}

console.log(`Extracted ${extracted} files to ${outDir}`);
