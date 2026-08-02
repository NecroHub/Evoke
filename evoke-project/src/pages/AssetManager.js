/**
 * AssetManager.js
 * Standalone page for browsing, uploading, and deleting a user's assets
 * (images and audio) stored via UploadThing, with metadata in Firebase.
 * Also reused inside the Studio's asset drawer in a compact mode.
 */

import { getCurrentUser } from "../firebase/auth.js";
import { getUserAssets, createAssetRecord, deleteAssetRecord } from "../firebase/database.js";
import { uploadAsset, validateAsset } from "../firebase/uploads.js";
import { formatBytes, showToast } from "../utils/helpers.js";

/**
 * Renders the full Asset Manager page.
 * @param {HTMLElement} outlet
 */
export async function renderAssetManager(outlet) {
  const user = getCurrentUser();
  if (!user) {
    outlet.innerHTML = `<div class="empty-state" style="height:100%;"><h3>Log in to manage assets</h3></div>`;
    return;
  }

  outlet.innerHTML = `
    <div class="page-content" style="padding: var(--space-8);">
      <div class="section-header">
        <h2>Assets</h2>
        <div>
          <input type="file" id="asset-file-input" class="hidden" multiple accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/wav,audio/ogg" />
          <button class="btn btn-arc btn-sm" id="upload-btn">Upload</button>
        </div>
      </div>
      <div class="card-grid" id="assets-grid" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));"></div>
    </div>
  `;

  const fileInput = outlet.querySelector("#asset-file-input");
  outlet.querySelector("#upload-btn").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    for (const file of fileInput.files) {
      await handleUpload(user.uid, file);
    }
    fileInput.value = "";
    await drawAssets();
  });

  async function drawAssets() {
    const grid = outlet.querySelector("#assets-grid");
    const assets = await getUserAssets(user.uid);
    grid.innerHTML = "";
    if (assets.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><h3>No assets yet</h3><p>Upload images or audio to use in Studio.</p></div>`;
      return;
    }
    assets.forEach((asset) => grid.appendChild(renderAssetCard(user.uid, asset, drawAssets)));
  }

  await drawAssets();
}

/**
 * Uploads a single file, validating it first, and records its metadata.
 * @param {string} uid
 * @param {File} file
 */
async function handleUpload(uid, file) {
  const validation = validateAsset(file);
  if (!validation.valid) {
    showToast(validation.error, "error");
    return;
  }
  try {
    const { url, name, size } = await uploadAsset(file);
    await createAssetRecord(uid, { name, url, type: validation.type, size });
    showToast(`${name} uploaded`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

/** Renders a single asset card with delete action. */
function renderAssetCard(uid, asset, onChange) {
  const card = document.createElement("div");
  card.className = "game-card";
  card.innerHTML = `
    <div class="thumb">
      ${asset.type === "image"
        ? `<img src="${asset.url}" alt="${asset.name}" loading="lazy" />`
        : `<div style="display:grid;place-items:center;height:100%;font-size:2rem;">♪</div>`}
    </div>
    <div class="info">
      <h4>${asset.name}</h4>
      <div class="meta">
        <span>${formatBytes(asset.size)}</span>
        <button class="btn-icon-inline" data-action="delete" title="Delete" style="margin-left:auto;color:var(--accent-danger);">✕</button>
      </div>
    </div>
  `;
  card.querySelector('[data-action="delete"]').addEventListener("click", async (e) => {
    e.stopPropagation();
    await deleteAssetRecord(uid, asset.id);
    showToast("Asset deleted", "success");
    onChange();
  });
  return card;
}
