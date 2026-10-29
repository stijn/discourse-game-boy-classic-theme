// Fails when any colour palette in about.json has an unreadable text pair.
// Text pairs need WCAG AA (4.5:1). Run with `pnpm lint:contrast`.
import { readFileSync } from "node:fs";

const MIN_RATIO = 4.5;

// [foreground, background, what it is used for]
const PAIRS = [
  ["primary", "secondary", "body text on the page"],
  ["primary", "quaternary", "text on panels, rows and tags"],
  ["tertiary", "secondary", "links on the page"],
  ["tertiary", "quaternary", "links on panels"],
  ["secondary", "primary", "inverted text: pressed buttons, mentions, code"],
  ["header_primary", "header_background", "header text"],
  ["danger", "secondary", "errors on the page"],
  ["danger", "quaternary", "errors on panels"],
  ["success", "secondary", "success text on the page"],
  ["success", "quaternary", "success text on panels"],
];

function luminance(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const about = JSON.parse(readFileSync("about.json", "utf8"));
let failures = 0;

for (const [name, palette] of Object.entries(about.color_schemes)) {
  for (const [fg, bg, use] of PAIRS) {
    const ratio = contrast(palette[fg], palette[bg]);
    if (ratio < MIN_RATIO) {
      failures += 1;
      console.error(
        `${name}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1 (${use}), needs ${MIN_RATIO}:1`
      );
    }
  }
}

if (failures) {
  process.exit(1);
}
console.log(
  `Contrast OK: ${Object.keys(about.color_schemes).length} palettes, ${PAIRS.length} pairs each.`
);
