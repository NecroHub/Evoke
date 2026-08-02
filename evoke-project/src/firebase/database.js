/**
 * database.js
 * All Firebase Realtime Database reads/writes go through this module.
 * Schema (top-level RTDB nodes):
 *
 * users/{uid}                → { displayName, email, avatarUrl, bio, createdAt }
 * games/{gameId}              → { title, description, ownerId, thumbnailUrl,
 *                                  visibility, createdAt, updatedAt, playCount }
 * maps/{gameId}                → { parts: [ {type, position, rotation, scale,
 *                                  material, color, transparency, name}, ... ] }
 * assets/{uid}/{assetId}       → { name, url, type, size, uploadedAt }
 */

import {
  ref,
  set,
  get,
  update,
  push,
  remove,
  query,
  orderByChild,
  limitToLast,
  equalTo,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db } from "./firebaseConfig.js";

/* ---------------------------- Users ---------------------------- */

/**
 * Creates a new user's public profile document.
 * @param {string} uid
 * @param {object} profileData
 */
export function createUserProfile(uid, profileData) {
  return set(ref(db, `users/${uid}`), profileData);
}

/**
 * Fetches a user's public profile.
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getUserProfile(uid) {
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

/**
 * Updates fields on a user's profile (partial update).
 * @param {string} uid
 * @param {object} updates
 */
export function updateUserProfile(uid, updates) {
  return update(ref(db, `users/${uid}`), updates);
}

/* ---------------------------- Games ---------------------------- */

/**
 * Creates a new game record and returns its generated ID.
 * @param {string} ownerId
 * @param {{title: string, description: string, thumbnailUrl?: string}} data
 * @returns {Promise<string>} the new game's ID
 */
export async function createGame(ownerId, data) {
  const gamesRef = ref(db, "games");
  const newRef = push(gamesRef);
  const now = Date.now();
  await set(newRef, {
    title: data.title || "Untitled Game",
    description: data.description || "",
    ownerId,
    thumbnailUrl: data.thumbnailUrl || "",
    visibility: "draft", // "draft" | "published"
    createdAt: now,
    updatedAt: now,
    playCount: 0,
  });
  // Every game starts with an empty map document.
  await set(ref(db, `maps/${newRef.key}`), { parts: [] });
  return newRef.key;
}

/**
 * Fetches a single game's metadata.
 * @param {string} gameId
 * @returns {Promise<object|null>}
 */
export async function getGame(gameId) {
  const snapshot = await get(ref(db, `games/${gameId}`));
  return snapshot.exists() ? { id: gameId, ...snapshot.val() } : null;
}

/**
 * Updates a game's metadata (title, description, thumbnail, visibility, etc).
 * Always bumps updatedAt.
 * @param {string} gameId
 * @param {object} updates
 */
export function updateGame(gameId, updates) {
  return update(ref(db, `games/${gameId}`), { ...updates, updatedAt: Date.now() });
}

/**
 * Publishes a game (makes it visible on Discover/Home).
 * @param {string} gameId
 */
export function publishGame(gameId) {
  return updateGame(gameId, { visibility: "published" });
}

/**
 * Deletes a game and its associated map document.
 * @param {string} gameId
 */
export async function deleteGame(gameId) {
  await remove(ref(db, `games/${gameId}`));
  await remove(ref(db, `maps/${gameId}`));
}

/**
 * Fetches the most recently updated published games, for Home/Discover.
 * @param {number} count
 * @returns {Promise<object[]>}
 */
export async function getFeaturedGames(count = 12) {
  const gamesQuery = query(ref(db, "games"), orderByChild("updatedAt"), limitToLast(count));
  const snapshot = await get(gamesQuery);
  if (!snapshot.exists()) return [];
  const games = [];
  snapshot.forEach((child) => {
    const val = child.val();
    if (val.visibility === "published") games.push({ id: child.key, ...val });
  });
  return games.reverse(); // most recent first
}

/**
 * Fetches all games owned by a given user, for "My Games".
 * @param {string} ownerId
 * @returns {Promise<object[]>}
 */
export async function getGamesByOwner(ownerId) {
  const gamesQuery = query(ref(db, "games"), orderByChild("ownerId"), equalTo(ownerId));
  const snapshot = await get(gamesQuery);
  if (!snapshot.exists()) return [];
  const games = [];
  snapshot.forEach((child) => games.push({ id: child.key, ...child.val() }));
  return games.sort((a, b) => b.updatedAt - a.updatedAt);
}

/* ---------------------------- Maps ---------------------------- */

/**
 * Saves the full part list for a game's map. Overwrites the entire map
 * document — the Studio always sends the complete current state.
 * @param {string} gameId
 * @param {Array<object>} parts serialized primitive descriptors (see engine/serializer.js)
 */
export function saveMap(gameId, parts) {
  return set(ref(db, `maps/${gameId}`), { parts });
}

/**
 * Loads a game's map JSON so Babylon.js can reconstruct the scene.
 * @param {string} gameId
 * @returns {Promise<{parts: Array<object>}>}
 */
export async function loadMap(gameId) {
  const snapshot = await get(ref(db, `maps/${gameId}`));
  return snapshot.exists() ? snapshot.val() : { parts: [] };
}

/* ---------------------------- Assets ---------------------------- */

/**
 * Records metadata for an asset already uploaded via UploadThing.
 * The database never stores file bytes — only the URL UploadThing returns.
 * @param {string} uid
 * @param {{name: string, url: string, type: "image"|"audio", size: number}} assetData
 * @returns {Promise<string>} the new asset's ID
 */
export async function createAssetRecord(uid, assetData) {
  const assetsRef = ref(db, `assets/${uid}`);
  const newRef = push(assetsRef);
  await set(newRef, { ...assetData, uploadedAt: Date.now() });
  return newRef.key;
}

/**
 * Fetches all assets uploaded by a user, for the Asset Manager.
 * @param {string} uid
 * @returns {Promise<object[]>}
 */
export async function getUserAssets(uid) {
  const snapshot = await get(ref(db, `assets/${uid}`));
  if (!snapshot.exists()) return [];
  const assets = [];
  snapshot.forEach((child) => assets.push({ id: child.key, ...child.val() }));
  return assets.sort((a, b) => b.uploadedAt - a.uploadedAt);
}

/**
 * Deletes an asset's metadata record (does not delete the underlying
 * UploadThing file — call the UploadThing deletion API separately if needed).
 * @param {string} uid
 * @param {string} assetId
 */
export function deleteAssetRecord(uid, assetId) {
  return remove(ref(db, `assets/${uid}/${assetId}`));
}
