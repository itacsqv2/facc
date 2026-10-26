// Copies the self-contained MapLibre worker next to the app static files.
// MapLibre v6 resolves its worker relative to its own module URL, which a bundler
// rewrites; the app sets this copy explicitly with setWorkerUrl(). Run by predev/prebuild.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "node_modules/maplibre-gl/package.json"), "utf8"));
const target = join(root, "public/vendor/maplibre");
mkdirSync(target, { recursive: true });
copyFileSync(join(root, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs"), join(target, "maplibre-gl-worker.mjs"));
console.log(`maplibre-gl ${pkg.version} worker copied to public/vendor/maplibre/`);
