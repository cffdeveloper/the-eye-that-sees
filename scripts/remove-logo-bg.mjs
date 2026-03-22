/**
 * Logo background cleanup (perceptual + geometric):
 * 1) Flood from edges (RGB distance — fast, connectivity)
 * 2) Global despill using ΔE76 (CIE Lab) vs sampled paper/ink ref — perceptually uniform
 * 3) Residual haze (light) + smoothstep alpha where ΔE sits in a soft band
 * 4) Fringe pass on transparency-adjacent pixels (Lab distance)
 * 5) Edge chroma bleed: subtract background contribution at semi-opaque edges (unspill)
 *
 * Run: npm run remove-logo-bg
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "..", "public");

/** sRGB 0–255 → linear 0–1 */
function srgbToLinear(u) {
  const c = u / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** D65 XYZ (relative), then CIE Lab (CIE76 ΔE uses these). */
function rgbToLab(r, g, b) {
  let R = srgbToLinear(r);
  let G = srgbToLinear(g);
  let B = srgbToLinear(b);

  let X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  let Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  let Z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;

  X /= 0.95047;
  Y /= 1.0;
  Z /= 1.08883;

  const eps = 216 / 24389;
  const k = 24389 / 27;

  const fx = X > eps ? Math.cbrt(X) : (k * X + 16) / 116;
  const fy = Y > eps ? Math.cbrt(Y) : (k * Y + 16) / 116;
  const fz = Z > eps ? Math.cbrt(Z) : (k * Z + 16) / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);
  return { L, a, b: bLab };
}

/** CIE76 color difference — single scalar “distance” in perceptual space. */
function deltaE76(L1, a1, b1, L2, a2, b2) {
  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/** Hermite smoothstep on [edge0, edge1]. */
function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function dist2(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

function saturation(r, g, b) {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  return M < 1 ? 0 : (M - m) / M;
}

function edgeBackgroundRef(data, width, height, mode) {
  let r = 0;
  let g = 0;
  let b = 0;
  let w = 0;
  const add = (x, y) => {
    const i = (y * width + x) * 4;
    const a = data[i + 3] / 255;
    if (a < 0.05) return;
    r += data[i] * a;
    g += data[i + 1] * a;
    b += data[i + 2] * a;
    w += a;
  };
  for (let x = 0; x < width; x++) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    add(0, y);
    add(width - 1, y);
  }
  if (w < 1) {
    return mode === "light" ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  }
  return { r: r / w, g: g / w, b: b / w };
}

function floodRemoveBackground(data, width, height, ref, tol2) {
  const n = width * height;
  const visited = new Uint8Array(n);
  const qx = new Int32Array(n);
  const qy = new Int32Array(n);
  let qt = 0;

  const similar = (x, y) => {
    const i = (y * width + x) * 4;
    return dist2(data[i], data[i + 1], data[i + 2], ref.r, ref.g, ref.b) <= tol2;
  };

  const push = (x, y) => {
    const id = y * width + x;
    if (visited[id]) return;
    visited[id] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  };

  let qh = 0;
  for (let x = 0; x < width; x++) {
    if (similar(x, 0)) push(x, 0);
    if (similar(x, height - 1)) push(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    if (similar(0, y)) push(0, y);
    if (similar(width - 1, y)) push(width - 1, y);
  }

  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    const i = (y * width + x) * 4;
    data[i + 3] = 0;
    const neigh = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neigh) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nid = ny * width + nx;
      if (visited[nid]) continue;
      if (!similar(nx, ny)) continue;
      push(nx, ny);
    }
  }
}

/**
 * Remove background-like pixels using ΔE76 vs reference Lab (perceptual “distance to paper/ink”).
 * Uses smoothstep for partial alpha in the transition band.
 */
function globalDespillDeltaE(data, width, height, refLab, mode) {
  const refWhiteLab = rgbToLab(255, 255, 255);

  /** Aggressive removal when ΔE is tiny (visually same as background). */
  const DE_KILL = mode === "light" ? 7.5 : 8.5;
  /** Soft band upper edge — alpha ramps from 0→1 across [DE_KILL, DE_SOFT]. */
  const DE_SOFT = mode === "light" ? 26 : 24;

  const DE_PROTECT = mode === "light" ? 5.2 : 5.0;
  const SAT_PROTECT = 0.32;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let a = data[i + 3];
      if (a === 0) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const sat = saturation(r, g, b);
      const lab = rgbToLab(r, g, b);

      let dPaper = deltaE76(lab.L, lab.a, lab.b, refLab.L, refLab.a, refLab.b);
      let dTarget = dPaper;

      if (mode === "light") {
        const dWhite = deltaE76(lab.L, lab.a, lab.b, refWhiteLab.L, refWhiteLab.a, refWhiteLab.b);
        if (dWhite < dPaper) dTarget = dWhite;
      }

      let kill = false;
      if (sat > SAT_PROTECT) {
        if (dTarget <= DE_PROTECT) kill = true;
      } else {
        if (dTarget <= DE_KILL) kill = true;
      }

      if (kill) {
        data[i + 3] = 0;
        continue;
      }

      if (dTarget < DE_SOFT && sat <= SAT_PROTECT) {
        const t = smoothstep(DE_KILL, DE_SOFT, dTarget);
        data[i + 3] = Math.max(0, Math.round(a * t));
      }
    }
  }
}

function residualPaperHazeDeltaE(data, width, height, refLab, mode) {
  if (mode !== "light") return;
  const LIM = 14;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const sat = saturation(r, g, b);
      if (sat > 0.2) continue;
      const lum = (r + g + b) / 3;
      if (lum < 198) continue;
      const lab = rgbToLab(r, g, b);
      const dPaper = deltaE76(lab.L, lab.a, lab.b, refLab.L, refLab.a, refLab.b);
      const labW = rgbToLab(255, 255, 255);
      const dWhite = deltaE76(lab.L, lab.a, lab.b, labW.L, labW.a, labW.b);
      if (dPaper < LIM || (dWhite < 9 && sat < 0.12)) {
        data[i + 3] = Math.round(data[i + 3] * 0.28);
        if (data[i + 3] < 6) data[i + 3] = 0;
      }
    }
  }
}

function featherFringeDeltaE(data, width, height, refLab, mode) {
  const tolSoft = mode === "light" ? 19 : 17;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      let nearClear = false;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (data[(ny * width + nx) * 4 + 3] === 0) {
          nearClear = true;
          break;
        }
      }
      if (!nearClear) continue;
      const lab = rgbToLab(data[i], data[i + 1], data[i + 2]);
      const d = deltaE76(lab.L, lab.a, lab.b, refLab.L, refLab.a, refLab.b);
      if (d >= tolSoft) continue;
      const u = Math.min(1, d / tolSoft);
      data[i + 3] = Math.round(data[i + 3] * Math.max(0.12, u * u));
    }
  }
}

/**
 * At pixels bordering transparency, remove background “spill” into RGB:
 * C' = C - (1 - α) · k · B  with k tuned so low-α edge pixels lose paper tint.
 */
function unspillEdges(data, width, height, ref, mode) {
  const k = mode === "light" ? 0.92 : 0.88;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a === 0 || a === 255) continue;
      let nearClear = false;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (data[(ny * width + nx) * 4 + 3] === 0) {
          nearClear = true;
          break;
        }
      }
      if (!nearClear) continue;

      const t = (255 - a) / 255;
      const f = k * t * t;
      data[i] = Math.min(255, Math.max(0, Math.round(data[i] - f * ref.r)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(data[i + 1] - f * ref.g)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(data[i + 2] - f * ref.b)));
    }
  }
}

/** Final pass: any surviving pixel still indistinguishable from ref → transparent. */
function hardNudgeTransparent(data, width, height, refLab, mode) {
  const eps = mode === "light" ? 4.2 : 4.8;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const lab = rgbToLab(data[i], data[i + 1], data[i + 2]);
      const d = deltaE76(lab.L, lab.a, lab.b, refLab.L, refLab.a, refLab.b);
      const sat = saturation(data[i], data[i + 1], data[i + 2]);
      if (d < eps && sat < 0.28) data[i + 3] = 0;
    }
  }
}

function processPng(filePath, mode) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    return;
  }
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const { width, height, data } = png;

  const ref = edgeBackgroundRef(data, width, height, mode);
  const refLab = rgbToLab(ref.r, ref.g, ref.b);
  const floodTol2 = mode === "light" ? 48 * 48 : 54 * 54;

  floodRemoveBackground(data, width, height, ref, floodTol2);
  globalDespillDeltaE(data, width, height, refLab, mode);
  residualPaperHazeDeltaE(data, width, height, refLab, mode);
  featherFringeDeltaE(data, width, height, refLab, mode);
  unspillEdges(data, width, height, ref, mode);
  hardNudgeTransparent(data, width, height, refLab, mode);

  fs.writeFileSync(filePath, PNG.sync.write(png));
  console.log(
    "OK:",
    path.basename(filePath),
    `(ref ~rgb(${ref.r | 0},${ref.g | 0},${ref.b | 0}) · Lab ΔE pipeline)`,
  );
}

const masterLight = path.join(PUBLIC, "Light Mode Logo.png");
const masterDark = path.join(PUBLIC, "Black Mode Logo.png");
const outLight = path.join(PUBLIC, "logo-light.png");
const outDark = path.join(PUBLIC, "logo-dark.png");

if (fs.existsSync(masterLight)) {
  fs.copyFileSync(masterLight, outLight);
  console.log("Copied master → logo-light.png");
}
if (fs.existsSync(masterDark)) {
  fs.copyFileSync(masterDark, outDark);
  console.log("Copied master → logo-dark.png");
}

processPng(outLight, "light");
processPng(outDark, "dark");

/** Bilinear resize RGBA — used for favicon / touch icons from cleaned `logo-dark.png`. */
function resizeBilinear(src, sw, sh, dw, dh) {
  const out = new Uint8Array(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = ((x + 0.5) * sw) / dw - 0.5;
      const sy = ((y + 0.5) * sh) / dh - 0.5;
      const x0 = Math.max(0, Math.min(Math.floor(sx), sw - 1));
      const y0 = Math.max(0, Math.min(Math.floor(sy), sh - 1));
      const x1 = Math.min(x0 + 1, sw - 1);
      const y1 = Math.min(y0 + 1, sh - 1);
      const xf = sx - Math.floor(sx);
      const yf = sy - Math.floor(sy);
      for (let c = 0; c < 4; c++) {
        const i00 = (y0 * sw + x0) * 4 + c;
        const i10 = (y0 * sw + x1) * 4 + c;
        const i01 = (y1 * sw + x0) * 4 + c;
        const i11 = (y1 * sw + x1) * 4 + c;
        const v0 = src[i00] * (1 - xf) + src[i10] * xf;
        const v1 = src[i01] * (1 - xf) + src[i11] * xf;
        out[(y * dw + x) * 4 + c] = Math.round(v0 * (1 - yf) + v1 * yf);
      }
    }
  }
  return out;
}

function writeResizedPngFrom(srcPath, destPath, dw, dh) {
  if (!fs.existsSync(srcPath)) return;
  const buf = fs.readFileSync(srcPath);
  const png = PNG.sync.read(buf);
  const { width: sw, height: sh, data } = png;
  const resized = resizeBilinear(data, sw, sh, dw, dh);
  const out = new PNG({ width: dw, height: dh });
  out.data = Buffer.from(resized);
  fs.writeFileSync(destPath, PNG.sync.write(out));
  console.log("OK:", path.basename(destPath), `(${dw}×${dh} from ${path.basename(srcPath)})`);
}

if (fs.existsSync(outDark)) {
  writeResizedPngFrom(outDark, path.join(PUBLIC, "favicon.png"), 32, 32);
  writeResizedPngFrom(outDark, path.join(PUBLIC, "apple-touch-icon.png"), 180, 180);
}
