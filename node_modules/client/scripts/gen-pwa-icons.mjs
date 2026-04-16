/**
 * Genera iconos PNG para manifest PWA (fondo corporativo ink-950).
 * Ejecutar: npm run pwa:icons -w client
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");

function writeIcon(size, filename) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2;
      png.data[i] = 11;
      png.data[i + 1] = 18;
      png.data[i + 2] = 32;
      png.data[i + 3] = 255;
    }
  }
  const margin = Math.floor(size * 0.22);
  for (let y = margin; y < size - margin; y++) {
    for (let x = margin; x < size - margin; x++) {
      const i = (size * y + x) << 2;
      png.data[i] = 255;
      png.data[i + 1] = 255;
      png.data[i + 2] = 255;
      png.data[i + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(pub, filename), PNG.sync.write(png));
}

writeIcon(192, "pwa-192.png");
writeIcon(512, "pwa-512.png");
console.log("PWA icons written to public/");
