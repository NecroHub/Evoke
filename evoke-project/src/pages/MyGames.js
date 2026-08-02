/**
 * MyGames.js
 * Lists every game owned by the current user, draft or published, with
 * quick actions to open in Studio, publish, or delete.
 */

import { getGamesByOwner, createGame, deleteGame } from "../firebase/database.js";
import { renderGameCard } from "../components/GameCard.js";
import { getCurrentUser } from "../firebase/auth.js";
import { showToast } from "../utils/helpers.js";

/**
 * Renders the My Games page.
 * @param {HTMLElement} outlet
 * @param {(route: string, params?: object) => void} navigate
 */
export async function renderMyGames(outlet, navigate) {
  const user = getCurrentUser();

  if (!user) {
    outlet.innerHTML = `
      <div class="empty-state" style="height: 100%;">
        <h3>Log in to see your games</h3>
        <p>Your drafts and published games live here.</p>
      </div>`;
    return;
  }

  outlet.innerHTML = `
    <div class="page-content" style="padding: var(--space-8);">
      <div class="section-header">
        <h2>My Games</h2>
        <button class="btn btn-arc btn-sm" id="new-game-btn">+ New game</button>
      </div>
      <div class="card-grid" id="my-games-grid"></div>
    </div>
  `;

  outlet.querySelector("#new-game-btn").addEventListener("click", async () => {
    const gameId = await createGame(user.uid, { title: "Untitled Game" });
    navigate("studio", { gameId });
  });

  const grid = outlet.querySelector("#my-games-grid");
  const games = await getGamesByOwner(user.uid);

  if (games.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Nothing here yet</h3>
        <p>Create your first game to get started in Studio.</p>
      </div>`;
    return;
  }

  games.forEach((game) => {
    const card = renderGameCard(game, (gameId) => navigate("studio", { gameId }));
    grid.appendChild(card);
  });
}
