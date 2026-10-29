// Renders the theme's real stylesheet on a mock of Discourse's markup and
// screenshots it, so a change can be seen without a running Discourse.
//
//   node scripts/preview/render.mjs                  # screenshots/light.png, dark.png, palettes.png
//   node scripts/preview/render.mjs --out some/dir   # elsewhere
//
// The mock page is not Discourse: selectors that core renders differently on a
// live site (timeline, sidebar, menus) are not exercised here.
import { createRequire } from "node:module";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as sass from "sass";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const outIndex = process.argv.indexOf("--out");
const outDir = resolve(outIndex > 0 ? process.argv[outIndex + 1] : `${root}/screenshots`);
mkdirSync(outDir, { recursive: true });

const about = JSON.parse(readFileSync(`${root}/about.json`, "utf8"));
const settings = Object.fromEntries(
  readFileSync(`${root}/settings.yml`, "utf8")
    .split(/\n(?=\S)/)
    .map((block) => [block.split(":")[0], /default: true/.test(block)])
);

const asset = (name) => `"${pathToFileURL(`${root}/assets/${name}`).href}"`;
const prelude = [
  ...Object.entries(settings).map(([k, v]) => `$${k}: "${v}";`),
  `$press_start_2p: ${asset("PressStart2P-Regular.ttf")};`,
  `$vt323: ${asset("VT323-Regular.ttf")};`,
].join("\n");

const css = sass.compileString(`${prelude}\n${readFileSync(`${root}/common/common.scss`, "utf8")}`).css;
const mock = readFileSync(`${root}/scripts/preview/mock.html`, "utf8");

const paletteVars = (p) =>
  `:root{${Object.entries(p).map(([k, v]) => `--${k}:#${v}`).join(";")}}`;

const tmp = mkdtempSync(`${tmpdir()}/gb-preview-`);
const browser = await chromium.launch();

async function shoot(palette, scale = 1) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: scale,
  });
  const html = mock.replace(
    "</head>",
    `<style>${paletteVars(about.color_schemes[palette])}</style><style>${css}</style></head>`
  );
  const htmlPath = `${tmp}/mock.html`;
  writeFileSync(htmlPath, html);
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important}" });
  const png = await page.screenshot();
  await page.close();
  return png;
}

writeFileSync(`${outDir}/light.png`, await shoot("DMG-01"));
writeFileSync(`${outDir}/dark.png`, await shoot("DMG-01 Dark"));

// All palettes in a 3-column grid, each at half size.
const tiles = [];
for (const name of Object.keys(about.color_schemes)) {
  const png = await shoot(name, 0.5);
  tiles.push(`<figure><img src="data:image/png;base64,${png.toString("base64")}"><figcaption>${name}</figcaption></figure>`);
}
const rows = Math.ceil(tiles.length / 3);
const grid = await browser.newPage({ viewport: { width: 2400, height: rows * 450 } });
await grid.setContent(
  `<style>body{margin:0;display:grid;grid-template-columns:repeat(3,800px)}figure{margin:0;position:relative}img{display:block;width:800px;height:450px}figcaption{position:absolute;left:8px;bottom:8px;background:#000;color:#fff;font:bold 14px monospace;padding:3px 8px}</style>${tiles.join("")}`
);
writeFileSync(`${outDir}/palettes.png`, await grid.screenshot());
await browser.close();
console.log(`Wrote light.png, dark.png and palettes.png to ${outDir}`);
