/**
 * Discover.js
 * Browsable grid of all published games, with a client-side text filter
 * wired to the global search input in the topbar.
 */

import { getFeaturedGames } from "../firebase/database.js";
import { renderGameCard } from "../components/GameCard.js";
import { debounce } from "../utils/helpers.js";

/**
 * Renders the Discover page.
 * @param {HTMLElement} outlet
 * @param {(route: string, params?: object) => void} navigate
 */
export async function renderDiscover(outlet, navigate) {
  outlet.innerHTML = `
    <div class="page-content" style="padding: var(--space-8);">
      <div class="section-header">
        <h2>Discover</h2>
      </div>
      <div class="card-grid" id="discover-grid"></div>
    </div>
  `;

  const grid = outlet.querySelector("#discover-grid");
  const games = await getFeaturedGames(60);

  function draw(list) {
    grid.innerHTML = "";
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>No games match your search</h3>
          <p>Try a different term, or clear the search box.</p>
        </div>`;
      return;
    }
    list.forEach((game) => grid.appendChild(renderGameCard(game, (gameId) => navigate("play", { gameId }))));
  }

  draw(games);

  // Wire the shared topbar search input while this page is active.
  const searchInput = document.getElementById("global-search");
  const handleSearch = debounce((value) => {
    const q = value.trim().toLowerCase();
    const filtered = q ? games.filter((g) => g.title.toLowerCase().includes(q)) : games;
    draw(filtered);
  }, 200);
  searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
}
