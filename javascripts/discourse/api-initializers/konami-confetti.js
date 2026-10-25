import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const BURST_MS = 3000;

function isTyping(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function readPaletteColors() {
  const style = getComputedStyle(document.documentElement);
  return ["--gb-lightest", "--gb-light", "--gb-dark", "--gb-darkest"]
    .map((name) => style.getPropertyValue(name).trim())
    .filter(Boolean);
}

async function fireConfetti() {
  await loadScript(settings.theme_uploads_local.confetti_js);

  const confetti = window.confetti;
  if (typeof confetti !== "function") {
    return;
  }

  const colors = readPaletteColors();
  const shared = {
    particleCount: 5,
    spread: 55,
    colors: colors.length ? colors : undefined,
    shapes: ["square"],
    disableForReducedMotion: true,
  };
  const end = Date.now() + BURST_MS;

  (function frame() {
    confetti({ ...shared, angle: 60, origin: { x: 0 } });
    confetti({ ...shared, angle: 120, origin: { x: 1 } });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export default apiInitializer(() => {
  if (!settings.konami_confetti) {
    return;
  }

  const recent = [];

  document.addEventListener("keydown", (event) => {
    if (isTyping(event.target)) {
      recent.length = 0;
      return;
    }

    recent.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (recent.length > KONAMI_CODE.length) {
      recent.shift();
    }

    if (KONAMI_CODE.every((key, i) => recent[i] === key)) {
      recent.length = 0;
      fireConfetti();
    }
  });
});
