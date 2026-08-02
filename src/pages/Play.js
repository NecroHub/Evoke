/**
 * Play.js
 * Read-only runtime viewer for a published game: reconstructs the scene
 * from its stored map JSON (same deserializer Studio uses) and drops the
 * player into a free-look camera. Increments the play count on load.
 */

import { SceneManager } from "../engine/SceneManager.js";
import { deserializeMap } from "../engine/serializer.js";
import { getGame, loadMap, updateGame } from "../firebase/database.js";

/**
 * Renders the Play page for a given game.
 * @param {HTMLElement} outlet
 * @param {(route: string, params?: object) => void} navigate
 * @param {{gameId: string}} params
 */
export async function renderPlay(outlet, navigate, params = {}) {
  const gameId = params.gameId;
  outlet.classList.add("studio-active");
  outlet.innerHTML = `
    <div id="studio-view">
      <canvas id="studio-canvas"></canvas>
      <button class="btn btn-ghost btn-sm" id="exit-play-btn" style="position:absolute; top: var(--space-4); left: var(--space-4); z-index: 40;">← Exit</button>
      <div id="save-status" class="glass" style="left:auto; right: var(--space-4);"><span id="play-title"></span></div>
    </div>
  `;

  const game = await getGame(gameId);
  if (!game) {
    outlet.innerHTML = `<div class="empty-state" style="height:100%;"><h3>Game not found</h3></div>`;
    return;
  }
  outlet.querySelector("#play-title").textContent = game.title;
  outlet.querySelector("#exit-play-btn").addEventListener("click", () => navigate("discover"));

  const canvas = outlet.querySelector("#studio-canvas");
  const sceneManager = new SceneManager(canvas);
  // Lock the camera to orbit-only navigation for players (no gizmos, no editing).
  sceneManager.camera.lowerRadiusLimit = 4;
  sceneManager.start();

  const mapData = await loadMap(gameId);
  deserializeMap(mapData, sceneManager.scene);

  // Fire-and-forget play count increment.
  updateGame(gameId, { playCount: (game.playCount || 0) + 1 }).catch(() => {});

  return function cleanup() {
    sceneManager.dispose();
    outlet.classList.remove("studio-active");
  };
}
