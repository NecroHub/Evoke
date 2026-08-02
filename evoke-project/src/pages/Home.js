/**
 * Home.js
 * Landing page shown at "/" once inside the app shell: featured published
 * games plus a hero CTA into Create/Studio.
 */

import { getFeaturedGames } from "../firebase/database.js";
import { renderGameCard } from "../components/GameCard.js";

/**
 * Renders the Home page into the view outlet.
 * @param {HTMLElement} outlet
 * @param {(route: string, params?: object) => void} navigate
 */
export async function renderHome(outlet, navigate) {
  outlet.innerHTML = `
    <div class="page-content" style="padding: var(--space-8);">
      <section class="hero" style="margin-bottom: var(--space-10);">
        <h1>Build worlds.<br/>Play instantly.</h1>
        <p style="margin-top: var(--space-3); max-width: 480px; font-size: var(--text-md);">
          Evoke is a browser-based game creation platform — no installs, no exports.
          Open Studio and start placing blocks.
        </p>
        <button class="btn btn-arc" style="margin-top: var(--space-6); padding: var(--space-3) var(--space-6);" id="hero-create-btn">
          Open Studio
        </button>
      </section>

      <section>
        <div class="section-header">
          <h3>Featured</h3>
          <a href="#" class="see-all" id="see-all-featured">See all</a>
        </div>
        <div class="card-grid" id="featured-grid"></div>
      </section>
    </div>
  `;

  outlet.querySelector("#hero-create-btn").addEventListener("click", () => navigate("studio", { gameId: "new" }));
  outlet.querySelector("#see-all-featured").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("discover");
  });

  const grid = outlet.querySelector("#featured-grid");
  const games = await getFeaturedGames(8);

  if (games.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No published games yet</h3>
        <p>Be the first to publish something from Studio.</p>
      </div>
    `;
    return;
  }

  games.forEach((game) => {
    grid.appendChild(renderGameCard(game, (gameId) => navigate("play", { gameId })));
  });
}
