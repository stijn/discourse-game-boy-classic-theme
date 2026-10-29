import { apiInitializer } from "discourse/lib/api";
import { i18n } from "discourse-i18n";
import { playSound } from "../lib/gb-sound.js";

// Core's notification type id for "granted a badge".
const GRANTED_BADGE = 12;
const TOAST_MS = 4500;

function showToast(badgeName) {
  const toast = document.createElement("div");
  toast.className = "gb-toast";
  toast.setAttribute("role", "status");

  const title = document.createElement("strong");
  title.textContent = i18n(themePrefix("level_up.title"));
  toast.append(title, badgeName || "");

  document.body.append(toast);
  playSound("levelup");
  setTimeout(() => toast.remove(), TOAST_MS);
}

export default apiInitializer((api) => {
  if (!settings.game_ui) {
    return;
  }

  const user = api.getCurrentUser();
  if (!user) {
    return;
  }

  const messageBus = api.container.lookup("service:message-bus");
  messageBus.subscribe(`/notification-alert/${user.id}`, (data) => {
    if (data.notification_type === GRANTED_BADGE) {
      showToast(data.excerpt || data.topic_title);
    }
  });
});
