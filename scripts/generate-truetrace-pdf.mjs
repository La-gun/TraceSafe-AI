/**
 * Renders docs/Truetrace-NFT-Strategic-Report.md to PDF with Mermaid diagrams.
 * Usage: node scripts/generate-truetrace-pdf.mjs
 * Requires: npm install --no-save puppeteer marked
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MD_PATH = path.join(ROOT, "docs", "Truetrace-NFT-Strategic-Report.md");
const OUT_PDF = path.join(ROOT, "docs", "Truetrace-NFT-Strategic-Report.pdf");

function splitMermaid(md) {
  const parts = [];
  const re = /```mermaid\n([\s\S]*?)```/g;
  let last = 0;
  let m;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) {
      parts.push({ type: "md", text: md.slice(last, m.index) });
    }
    parts.push({ type: "mermaid", text: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < md.length) {
    parts.push({ type: "md", text: md.slice(last) });
  }
  return parts;
}

function buildHtml(bodyInner) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.3/dist/mermaid.min.js"></script>
  <style>
    :root { color-scheme: light; }
    body {
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #1a1a1a;
      max-width: 720px;
      margin: 0 auto;
      padding: 24px 16px 48px;
    }
    h1 { font-size: 22pt; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 0; }
    h2 { font-size: 15pt; margin-top: 1.4em; page-break-after: avoid; }
    h3 { font-size: 12pt; margin-top: 1.1em; page-break-after: avoid; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.5pt; page-break-inside: avoid; }
    th, td { border: 1px solid #bbb; padding: 6px 8px; vertical-align: top; }
    th { background: #f4f4f4; text-align: left; }
    code, pre { font-family: ui-monospace, Consolas, monospace; font-size: 9pt; }
    pre {
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      padding: 10px 12px;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    a { color: #0969da; }
    hr { border: none; border-top: 1px solid #ddd; margin: 28px 0; }
    .mermaid {
      margin: 16px 0;
      padding: 12px;
      background: #fafafa;
      border: 1px solid #e8e8e8;
      text-align: center;
      page-break-inside: avoid;
    }
    @media print {
      body { padding: 0; max-width: none; }
      .mermaid { break-inside: avoid; }
    }
  </style>
</head>
<body>
${bodyInner}
  <script>
    mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });
  </script>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(MD_PATH)) {
    console.error("Missing:", MD_PATH);
    process.exit(1);
  }

  const md = fs.readFileSync(MD_PATH, "utf8");
  const chunks = splitMermaid(md);
  let body = "";

  for (const part of chunks) {
    if (part.type === "md") {
      body += await marked.parse(part.text);
    } else {
      // Escape only what can break HTML; browser decodes entities for mermaid textContent.
      const escaped = part.text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      body += `<div class="mermaid">${escaped}</div>\n`;
    }
  }

  const html = buildHtml(body);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });

    await page.evaluate(async () => {
      await window.mermaid.run({ querySelector: ".mermaid" });
    });

    await new Promise((r) => setTimeout(r, 500));

    await page.pdf({
      path: OUT_PDF,
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "14mm", bottom: "18mm", left: "14mm" },
    });
  } finally {
    await browser.close();
  }

  console.log("Wrote", OUT_PDF);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
