/**
 * uploads.js
 * Handles file uploads via UploadThing. The database never stores file
 * bytes — only the URL and metadata UploadThing returns after upload.
 *
 * Requires an UploadThing endpoint configured server-side (e.g. in a small
 * Next.js/Express route) exposing a route named "evokeAssetUploader" with
 * two file types: "image" (max 25MB) and "audio" (max 5MB). This module
 * only handles the browser side of that flow.
 */

const UPLOADTHING_ENDPOINT = "/api/uploadthing"; // your server-side UploadThing route

const LIMITS = {
  image: { maxBytes: 25 * 1024 * 1024, mimeTypes: ["image/png", "image/jpeg", "image/webp"] },
  audio: { maxBytes: 5 * 1024 * 1024, mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg"] },
};

/**
 * Determines the asset category ("image" | "audio") from a File's MIME type.
 * @param {File} file
 * @returns {"image"|"audio"|null}
 */
export function getAssetType(file) {
  if (LIMITS.image.mimeTypes.includes(file.type)) return "image";
  if (LIMITS.audio.mimeTypes.includes(file.type)) return "audio";
  return null;
}

/**
 * Validates a file against Evoke's size/format rules before upload.
 * @param {File} file
 * @returns {{valid: boolean, error?: string, type?: "image"|"audio"}}
 */
export function validateAsset(file) {
  const type = getAssetType(file);
  if (!type) {
    return { valid: false, error: "Unsupported file format. Use PNG, JPG, WEBP, MP3, WAV, or OGG." };
  }
  const { maxBytes } = LIMITS[type];
  if (file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return { valid: false, error: `File too large. ${type === "image" ? "Images" : "Audio"} max size is ${maxMb}MB.` };
  }
  return { valid: true, type };
}

/**
 * Uploads a validated file to UploadThing and returns its hosted URL.
 * @param {File} file
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<{url: string, name: string, size: number}>}
 */
export async function uploadAsset(file, onProgress) {
  const validation = validateAsset(file);
  if (!validation.valid) throw new Error(validation.error);

  const formData = new FormData();
  formData.append("file", file);

  // UploadThing's client SDK typically handles presigned URLs + progress
  // internally; this fetch-based flow assumes a server route that proxies
  // to UploadThing and returns the final file URL.
  const response = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOADTHING_ENDPOINT);
    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });

  return {
    url: response.url,
    name: file.name,
    size: file.size,
  };
}
