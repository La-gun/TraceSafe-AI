/**
 * Builds a short overview MP4 from the Truetrace strategic report themes.
 * Requires FFmpeg on PATH (e.g. winget install Gyan.FFmpeg).
 * Usage: node scripts/generate-truetrace-overview-video.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "Truetrace-NFT-Overview-Video.mp4");

const SCENES = [
  {
    t: 6,
    title: "TRUETRACE NFT",
    sub: "Secure traceability for regulated supply chains",
  },
  {
    t: 7,
    title: "THE CHALLENGE",
    sub: "Counterfeit, substandard, and diverted products erode trust and safety",
  },
  {
    t: 8,
    title: "SECURE PHYSICAL IDENTITY",
    sub: "NFC-first tags (e.g. NTAG 424 DNA) with strong cryptographic verification",
  },
  {
    t: 7,
    title: "HYBRID VERIFICATION",
    sub: "NFC tap, QR fallback, SMS and USSD for inclusive access",
  },
  {
    t: 7,
    title: "END-TO-END TRACE",
    sub: "GS1 EPCIS-style events from factory to consumer",
  },
  {
    t: 7,
    title: "DIGITAL TWIN / NFT REGISTRY",
    sub: "Catalogue, token lifecycle, metadata history, optional on-chain alignment",
  },
  {
    t: 7,
    title: "AUTHENTICATE → TRACE → ENFORCE",
    sub: "A closed loop for custody, diversion risk, recalls, and compliance",
  },
  {
    t: 7,
    title: "STAKEHOLDER VALUE",
    sub: "Brands, regulators, distributors, retailers, consumers, investors",
  },
  {
    t: 7,
    title: "MAS 2.0",
    sub: "Evolution from scratch-and-SMS to cryptography plus full trace evidence",
  },
  {
    t: 6,
    title: "STRATEGIC OVERVIEW",
    sub: "April 2026 · Based on Truetrace NFT Strategic Report",
  },
];

function resolveFfmpeg() {
  const isWin = process.platform === "win32";
  const which = isWin ? "where.exe" : "which";
  const r = spawnSync(which, ["ffmpeg"], { encoding: "utf8", shell: isWin });
  if (r.status !== 0 || !r.stdout) {
    return null;
  }
  const line = r.stdout.trim().split(/\r?\n/)[0];
  return line || null;
}

function resolveFont() {
  if (process.platform === "win32") {
    const p = "C:/Windows/Fonts/segoeuib.ttf";
    if (fs.existsSync(p)) return p;
    const p2 = "C:/Windows/Fonts/segoeui.ttf";
    if (fs.existsSync(p2)) return p2;
  }
  return "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });
  if (r.status !== 0) {
    throw new Error(`${cmd} exited ${r.status}`);
  }
}

function main() {
  const ffmpeg = resolveFfmpeg();
  if (!ffmpeg) {
    console.error("FFmpeg not found. Install with: winget install Gyan.FFmpeg");
    process.exit(1);
  }
  const font = resolveFont();
  if (!fs.existsSync(font)) {
    console.error("No suitable font found at", font);
    process.exit(1);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "truetrace-vid-"));
  const fontEsc = font.replace(/\\/g, "/").replace(/:/g, "\\:");
  const segments = [];

  try {
    SCENES.forEach((scene, i) => {
      const titleFile = path.join(tmp, `title-${i}.txt`);
      const subFile = path.join(tmp, `sub-${i}.txt`);
      fs.writeFileSync(titleFile, scene.title, "utf8");
      fs.writeFileSync(subFile, scene.sub, "utf8");
      const titlePath = titleFile.replace(/\\/g, "/").replace(/:/g, "\\:");
      const subPath = subFile.replace(/\\/g, "/").replace(/:/g, "\\:");

      const vf =
        `drawtext=fontfile='${fontEsc}':textfile='${titlePath}':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=h*0.38:borderw=3:bordercolor=black@0.45` +
        `,drawtext=fontfile='${fontEsc}':textfile='${subPath}':fontsize=32:fontcolor=0xcbd5e1:line_spacing=8:x=(w-text_w)/2:y=h*0.52:borderw=2:bordercolor=black@0.35`;

      const seg = path.join(tmp, `seg-${String(i).padStart(2, "0")}.mp4`);
      segments.push(seg);

      run(ffmpeg, [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "color=c=0x0f172a:s=1920x1080:r=30",
        "-t",
        String(scene.t),
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        String(scene.t),
        "-vf",
        vf,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-shortest",
        seg,
      ]);
    });

    const listPath = path.join(tmp, "concat.txt");
    const listBody = segments.map((s) => `file '${s.replace(/'/g, "'\\''")}'`).join("\n");
    fs.writeFileSync(listPath, listBody, "utf8");

    run(ffmpeg, ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", OUT]);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  console.log("Wrote", OUT);
}

main();
