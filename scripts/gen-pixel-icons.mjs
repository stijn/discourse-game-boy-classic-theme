// Draws the 8x8 pixel icons into common/common.scss, between the
// "BEGIN pixel-icons" and "END pixel-icons" markers.
// Run with `node scripts/gen-pixel-icons.mjs` after editing a bitmap.
import { readFileSync, writeFileSync } from "node:fs";

const SCSS = "common/common.scss";

// X = lit pixel. Each icon lists the Discourse icon ids (the d-icon-* class
// suffixes) it replaces.
const ICONS = [
  {
    ids: ["heart", "d-liked"],
    rows: [".XX..XX.", "XXXXXXXX", "XXXXXXXX", "XXXXXXXX", ".XXXXXX.", "..XXXX..", "...XX...", "........"],
  },
  {
    ids: ["far-heart", "d-unliked"],
    rows: [".XX..XX.", "X..XX..X", "X......X", "X......X", ".X....X.", "..X..X..", "...XX...", "........"],
  },
  {
    ids: ["reply"],
    rows: ["..X.....", ".XX.....", "XXXXXXX.", ".XX...XX", "..X....X", ".......X", "......XX", ".XXXXXX."],
  },
  {
    ids: ["bookmark", "discourse-bookmark-clock", "far-bookmark"],
    rows: [".XXXXXX.", ".XXXXXX.", ".XXXXXX.", ".XXXXXX.", ".XXXXXX.", ".XX..XX.", ".X....X.", "........"],
  },
  {
    ids: ["bell", "far-bell", "d-regular", "d-watching", "d-tracking"],
    rows: ["...XX...", "..XXXX..", ".XXXXXX.", ".XXXXXX.", ".XXXXXX.", "XXXXXXXX", "........", "...XX..."],
  },
  {
    ids: ["magnifying-glass", "search"],
    rows: [".XXXX...", "X....X..", "X....X..", "X....X..", ".XXXXX..", ".....XX.", "......XX", ".......X"],
  },
  {
    ids: ["bars"],
    rows: ["........", "XXXXXXXX", "........", "XXXXXXXX", "........", "XXXXXXXX", "........", "........"],
  },
  {
    ids: ["plus"],
    rows: ["...XX...", "...XX...", "...XX...", "XXXXXXXX", "XXXXXXXX", "...XX...", "...XX...", "...XX..."],
  },
  {
    ids: ["xmark", "times"],
    rows: ["XX....XX", "XXX..XXX", ".XXXXXX.", "..XXXX..", "..XXXX..", ".XXXXXX.", "XXX..XXX", "XX....XX"],
  },
  {
    ids: ["check"],
    rows: ["........", ".......X", "......XX", "X....XX.", "XX..XX..", ".XXXX...", "..XX....", "........"],
  },
  {
    ids: ["pencil", "pen"],
    rows: [".....XX.", "....XXXX", "...XXXX.", "..XXXX..", ".XXXX...", "XXXX....", "XXX.....", "XX......"],
  },
  {
    ids: ["trash-can", "far-trash-can", "trash"],
    rows: ["..XXXX..", "XXXXXXXX", ".XXXXXX.", ".X.XX.X.", ".X.XX.X.", ".X.XX.X.", ".XXXXXX.", "........"],
  },
  {
    ids: ["share", "link"],
    rows: ["....X...", "....XX..", "XXXXXXX.", "XXXXXXXX", "XXXXXXX.", "....XX..", "....X...", "........"],
  },
  {
    ids: ["flag", "far-flag"],
    rows: ["XXXXXX..", "XXXXXXX.", "XXXXXX..", "XXXXXXX.", "XX......", "XX......", "XX......", "XX......"],
  },
  {
    ids: ["ellipsis", "ellipsis-vertical-h"],
    rows: ["........", "........", "........", "XX.XX.XX", "XX.XX.XX", "........", "........", "........"],
  },
  {
    ids: ["chevron-down", "angle-down", "caret-down"],
    rows: ["........", "XX....XX", "XXX..XXX", ".XXXXXX.", "..XXXX..", "...XX...", "........", "........"],
  },
  {
    ids: ["chevron-up", "angle-up", "caret-up"],
    rows: ["........", "........", "...XX...", "..XXXX..", ".XXXXXX.", "XXX..XXX", "XX....XX", "........"],
  },
  {
    ids: ["chevron-left", "angle-left", "caret-left"],
    rows: ["........", "....XX..", "...XXX..", "..XXX...", ".XXX....", "..XXX...", "...XXX..", "....XX.."],
  },
  {
    ids: ["chevron-right", "angle-right", "caret-right"],
    rows: ["........", "..XX....", "..XXX...", "...XXX..", "....XXX.", "...XXX..", "..XXX...", "..XX...."],
  },
  {
    ids: ["user", "far-user", "circle-user"],
    rows: ["..XXXX..", ".XXXXXX.", ".XXXXXX.", "..XXXX..", "...XX...", ".XXXXXX.", "XXXXXXXX", "XXXXXXXX"],
  },
  {
    ids: ["gear", "cog", "wrench"],
    rows: ["...XX...", ".X.XX.X.", "..XXXX..", "XXX..XXX", "XXX..XXX", "..XXXX..", ".X.XX.X.", "...XX..."],
  },
  {
    ids: ["envelope", "far-envelope"],
    rows: ["XXXXXXXX", "XX....XX", "X.X..X.X", "X..XX..X", "X......X", "X......X", "XXXXXXXX", "........"],
  },
];

const encode = (svg) =>
  svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/"/g, "'");

function bitmapToUrl(rows) {
  let d = "";
  rows.forEach((row, y) => {
    for (const run of row.matchAll(/X+/g)) {
      d += `M${run.index} ${y}h${run[0].length}v1h-${run[0].length}z`;
    }
  });
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' shape-rendering='crispEdges'><path d='${d}'/></svg>`;
  return `url("data:image/svg+xml,${encode(svg)}")`;
}

for (const { ids, rows } of ICONS) {
  if (rows.length !== 8 || rows.some((r) => r.length !== 8)) {
    throw new Error(`Icon ${ids[0]} is not 8x8`);
  }
}

const body = ICONS.map(({ ids, rows }) => {
  const selectors = ids.map((id) => `svg.d-icon-${id}`).join(",\n");
  return `${selectors} {\n  @include gb-pixel-icon(${bitmapToUrl(rows)});\n}`;
}).join("\n\n");

const scss = readFileSync(SCSS, "utf8");
const pattern = /(\/\* BEGIN pixel-icons[^\n]*\*\/\n)[\s\S]*?(\n? *\/\* END pixel-icons \*\/)/;
if (!pattern.test(scss)) {
  throw new Error("pixel-icons markers not found in " + SCSS);
}
writeFileSync(SCSS, scss.replace(pattern, (_, begin, end) => `${begin}${body}\n${end}`));
console.log(`Wrote ${ICONS.length} pixel icons to ${SCSS}`);
