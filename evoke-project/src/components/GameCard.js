/**
 * GameCard.js
 * Renders a single game tile (thumbnail, title, play count, updated time)
 * used across Home, Discover, and My Games. Clicking a published card
 * launches the player; clicking a draft card (on My Games) opens the Studio.
 */

import { timeAgo } from "../utils/helpers.js";

/**
 * Builds a game card DOM element.
 * @param {object} game game record from Firebase (games/{id})
 * @param {(gameId: string) => void} onOpen called when the card is clicked
 * @returns {HTMLElement}
 */
export function renderGameCard(game, onOpen) {
  const card = document.createElement("div");
  card.className = "game-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");

  const isDraft = game.visibility === "draft";

  card.innerHTML = `
    <div class="thumb">
      ${game.thumbnailUrl ? `<img src="${game.thumbnailUrl}" alt="${escapeHtml(game.title)} thumbnail" loading="lazy" />` : ""}
      <span class="badge">${isDraft ? "Draft" : `▶ ${game.playCount || 0}`}</span>
    </div>
    <div class="info">
      <h4>${escapeHtml(game.title)}</h4>
      <div class="meta">
        <span>Updated ${timeAgo(game.updatedAt)}</span>
      </div>
    </div>
  `;

  const activate = () => onOpen(game.id);
  card.addEventListener("click", activate);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") activate();
  });

  return card;
}

/** Escapes HTML special characters to prevent injection via user-entered titles. */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
