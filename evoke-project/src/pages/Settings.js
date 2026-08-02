/**
 * Settings.js
 * Lets the logged-in user edit their display name, bio, and avatar.
 */

import { getCurrentUser, logOut } from "../firebase/auth.js";
import { getUserProfile, updateUserProfile } from "../firebase/database.js";
import { uploadAsset, validateAsset } from "../firebase/uploads.js";
import { showToast } from "../utils/helpers.js";

/**
 * Renders the Settings page.
 * @param {HTMLElement} outlet
 * @param {(route: string, params?: object) => void} navigate
 */
export async function renderSettings(outlet, navigate) {
  const user = getCurrentUser();
  if (!user) {
    outlet.innerHTML = `<div class="empty-state" style="height:100%;"><h3>Log in to change settings</h3></div>`;
    return;
  }

  const profile = (await getUserProfile(user.uid)) || {};

  outlet.innerHTML = `
    <div class="page-content" style="padding: var(--space-8); max-width: 480px;">
      <h2 style="margin-bottom: var(--space-6);">Settings</h2>

      <div style="display:flex; align-items:center; gap: var(--space-4); margin-bottom: var(--space-8);">
        <img id="settings-avatar" class="avatar avatar-lg" src="${profile.avatarUrl || ""}" alt="" />
        <div>
          <input type="file" id="avatar-input" accept="image/png,image/jpeg,image/webp" class="hidden" />
          <button class="btn btn-ghost btn-sm" id="avatar-upload-btn">Change avatar</button>
        </div>
      </div>

      <div class="field" style="margin-bottom: var(--space-5);">
        <label>Display name</label>
        <input id="settings-name" type="text" value="${escapeAttr(profile.displayName || "")}" />
      </div>

      <div class="field" style="margin-bottom: var(--space-6);">
        <label>Bio</label>
        <textarea id="settings-bio" rows="3" style="width:100%; resize:vertical;">${escapeHtml(profile.bio || "")}</textarea>
      </div>

      <button class="btn btn-arc" id="save-settings-btn">Save changes</button>
      <button class="btn btn-ghost" id="logout-btn" style="margin-left: var(--space-3);">Log out</button>
    </div>
  `;

  const avatarInput = outlet.querySelector("#avatar-input");
  outlet.querySelector("#avatar-upload-btn").addEventListener("click", () => avatarInput.click());

  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;
    const validation = validateAsset(file);
    if (!validation.valid) {
      showToast(validation.error, "error");
      return;
    }
    try {
      const { url } = await uploadAsset(file);
      outlet.querySelector("#settings-avatar").src = url;
      await updateUserProfile(user.uid, { avatarUrl: url });
      showToast("Avatar updated", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  outlet.querySelector("#save-settings-btn").addEventListener("click", async () => {
    const displayName = outlet.querySelector("#settings-name").value.trim();
    const bio = outlet.querySelector("#settings-bio").value.trim();
    try {
      await updateUserProfile(user.uid, { displayName, bio });
      showToast("Settings saved", "success");
    } catch (err) {
      showToast("Couldn't save settings.", "error");
    }
  });

  outlet.querySelector("#logout-btn").addEventListener("click", async () => {
    await logOut();
    navigate("home");
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}
