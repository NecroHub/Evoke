/**
 * helpers.js
 * Small, dependency-free utility functions shared across the app.
 */

/**
 * Returns a debounced version of fn that only fires after `delay` ms of
 * inactivity. Used for autosave and search input.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Shows a transient toast notification.
 * @param {string} message
 * @param {"default"|"success"|"error"} [variant]
 */
export function showToast(message, variant = "default") {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${variant}`;
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/**
 * Formats a millisecond timestamp as a short relative time string.
 * @param {number} timestamp
 * @returns {string}
 */
export function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const intervals = [
    ["y", 31536000], ["mo", 2592000], ["d", 86400], ["h", 3600], ["m", 60],
  ];
  for (const [label, secs] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count}${label} ago`;
  }
  return "just now";
}

/**
 * Formats a byte count as a human-readable size string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Shorthand for document.createElement with optional className. */
export function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
