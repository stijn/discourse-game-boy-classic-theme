// Chiptune beeps from a square-wave oscillator. No audio files are loaded.
// Sound stays off until a member switches it on with the header speaker.
const STORAGE_KEY = "gb-sound";

// [frequency in Hz, seconds] steps, played back to back.
const TUNES = {
  blip: [[880, 0.04]],
  like: [
    [988, 0.06],
    [1319, 0.14],
  ],
  post: [
    [523, 0.07],
    [659, 0.07],
    [784, 0.07],
    [1047, 0.16],
  ],
  notify: [
    [784, 0.08],
    [1047, 0.14],
  ],
  levelup: [
    [523, 0.08],
    [659, 0.08],
    [784, 0.08],
    [1047, 0.08],
    [784, 0.08],
    [1047, 0.26],
  ],
};

const VOLUME = 0.04;

let audioContext;

export function soundEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Private mode or blocked storage: the choice just lasts until reload.
  }
}

export function playSound(name) {
  if (!soundEnabled() || !TUNES[name]) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  let start = audioContext.currentTime;
  for (const [frequency, seconds] of TUNES[name]) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(VOLUME, start);
    gain.gain.setValueAtTime(0, start + seconds * 0.9);

    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds);
    start += seconds;
  }
}
