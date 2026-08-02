/**
 * Profile.js
 * Public-facing profile: avatar, display name, bio, and their published
 * games. If no userId param is given, shows the current logged-in user.
 */

import { getUserProfile, getGamesByOwner } from "../firebase/database.js";
import { getCurrentUser } from "../firebase/auth.js";
import { renderGameCard } from "../components/GameCard.js";

/**
 * Renders the Profile page.
 * @param {HTMLElement} outlet
 * @param {(route: string, params?: object) => void} navigate
 * @param {{userId?: string}} params
 */
export async function renderProfile(outlet, navigate, params = {}) {
  const targetUid = params.userId || getCurrentUser()?.uid;

  if (!targetUid) {
    outlet.innerHTML = `
      <div class="empty-state" style="height: 100%;">
        <h3>Log in to view your profile</h3>
      </div>`;
    return;
  }

  const [profile, games] = await Promise.all([
    getUserProfile(targetUid),
    getGamesByOwner(targetUid),
  ]);

  const published = games.filter((g) => g.visibility === "published");

  outlet.innerHTML = `
    <div class="page-content" style="padding: var(--space-8);">
      <div style="display:flex; align-items:center; gap: var(--space-5); margin-bottom: var(--space-10);">
        <img class="avatar avatar-lg" src="${profile?.avatarUrl || ""}" alt="" />
        <div>
          <h2>${escapeHtml(profile?.displayName || "Unknown Creator")}</h2>
          <p style="margin-top: var(--space-1);">${escapeHtml(profile?.bio || "No bio yet.")}</p>
          <div style="margin-top: var(--space-2); display:flex; gap: var(--space-2);">
            <span class="chip">${published.length} published</span>
            <span class="chip">${games.length} total</span>
          </div>
        </div>
      </div>

      <div class="section-header"><h3>Published games</h3></div>
      <div class="card-grid" id="profile-games-grid"></div>
    </div>
  `;

  const grid = outlet.querySelector("#profile-games-grid");
  if (published.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><h3>Nothing published yet</h3></div>`;
    return;
  }
  published.forEach((game) => grid.appendChild(renderGameCard(game, (gameId) => navigate("play", { gameId }))));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
