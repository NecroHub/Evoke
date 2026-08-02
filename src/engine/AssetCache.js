/**
 * AssetCache.js
 * Caches loaded textures and sounds by URL so repeated use of the same
 * asset (e.g. the same texture applied to many parts) never re-downloads
 * or re-decodes it. Supports lazy loading — textures are only fetched the
 * first time they're actually requested, not preloaded up front.
 */

export class AssetCache {
  /** @param {BABYLON.Scene} scene */
  constructor(scene) {
    this.scene = scene;
    this._textureCache = new Map();
    this._soundCache = new Map();
  }

  /**
   * Returns a cached BABYLON.Texture for the given URL, loading it lazily
   * on first request.
   * @param {string} url
   * @returns {BABYLON.Texture}
   */
  getTexture(url) {
    if (this._textureCache.has(url)) return this._textureCache.get(url);
    const texture = new BABYLON.Texture(url, this.scene);
    this._textureCache.set(url, texture);
    return texture;
  }

  /**
   * Returns a cached BABYLON.Sound for the given URL, loading it lazily.
   * @param {string} url
   * @param {string} name
   * @returns {BABYLON.Sound}
   */
  getSound(url, name) {
    const key = `${name}:${url}`;
    if (this._soundCache.has(key)) return this._soundCache.get(key);
    const sound = new BABYLON.Sound(name, url, this.scene, null, { autoplay: false });
    this._soundCache.set(key, sound);
    return sound;
  }

  /** Releases all cached GPU/audio resources (call when leaving the Studio). */
  dispose() {
    this._textureCache.forEach((tex) => tex.dispose());
    this._soundCache.forEach((snd) => snd.dispose());
    this._textureCache.clear();
    this._soundCache.clear();
  }
}
