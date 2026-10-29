import { apiInitializer } from "discourse/lib/api";
import { i18n } from "discourse-i18n";
import { playSound, setSoundEnabled, soundEnabled } from "../lib/gb-sound.js";

const LIKE_SELECTOR =
  ".toggle-like, .btn-toggle-reaction-like, .discourse-reactions-reaction-button";

function buildToggle() {
  const item = document.createElement("li");
  item.className = "header-dropdown-toggle gb-sound-toggle";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon btn-flat";
  button.innerHTML = '<span class="gb-sound-icon" aria-hidden="true"></span>';

  const render = () => {
    const on = soundEnabled();
    const label = i18n(themePrefix(on ? "sound.turn_off" : "sound.turn_on"));
    button.setAttribute("aria-pressed", String(on));
    button.setAttribute("aria-label", label);
    button.title = label;
  };

  button.addEventListener("click", () => {
    setSoundEnabled(!soundEnabled());
    render();
    playSound("blip");
  });

  render();
  item.append(button);
  return item;
}

function ensureToggle() {
  const icons = document.querySelector(".d-header-icons");
  if (icons && !icons.querySelector(".gb-sound-toggle")) {
    icons.prepend(buildToggle());
  }
}

export default apiInitializer((api) => {
  if (!settings.sound_effects) {
    return;
  }

  // The header re-renders on login and on some navigation, so put the button
  // back whenever it goes missing.
  api.onPageChange(() => requestAnimationFrame(ensureToggle));
  const header = document.querySelector("header.d-header");
  if (header) {
    new MutationObserver(ensureToggle).observe(header, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element) || target.closest(".gb-sound-toggle")) {
        return;
      }

      if (target.closest(LIKE_SELECTOR)) {
        playSound("like");
      } else if (target.closest(".btn")) {
        playSound("blip");
      }
    },
    true
  );

  api.onAppEvent("composer:created-post", () => playSound("post"));

  const user = api.getCurrentUser();
  if (user) {
    const messageBus = api.container.lookup("service:message-bus");
    let lastUnread = user.unread_notifications ?? 0;

    messageBus.subscribe(`/notification/${user.id}`, (data) => {
      const unread =
        (data.unread_notifications ?? 0) +
        (data.unread_high_priority_notifications ?? 0);
      if (unread > lastUnread) {
        playSound("notify");
      }
      lastUnread = unread;
    });
  }
});
