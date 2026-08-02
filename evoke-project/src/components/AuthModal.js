/**
 * AuthModal.js
 * Renders the login/signup modal. Handles both modes in one component,
 * toggled via a "switch mode" link, and reports success back through a
 * callback so the caller (main.js) can update the topbar/user menu.
 */

import { signUp, logIn, logInWithGoogle } from "../firebase/auth.js";
import { showToast } from "../utils/helpers.js";

/**
 * Opens the auth modal.
 * @param {"login"|"signup"} initialMode
 * @param {() => void} onSuccess called after a successful login/signup
 */
export function openAuthModal(initialMode = "login", onSuccess = () => {}) {
  const root = document.getElementById("modal-root");
  let mode = initialMode;

  render();

  function render() {
    root.innerHTML = "";
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });

    const isSignup = mode === "signup";
    backdrop.innerHTML = `
      <div class="modal">
        <button class="modal-close" aria-label="Close">✕</button>
        <h3>${isSignup ? "Create your account" : "Welcome back"}</h3>
        <p class="modal-sub">${isSignup ? "Start building in seconds." : "Log in to keep building."}</p>
        <form id="auth-form">
          ${isSignup ? `
            <div class="field">
              <label for="auth-name">Display name</label>
              <input id="auth-name" type="text" required autocomplete="name" />
            </div>` : ""}
          <div class="field">
            <label for="auth-email">Email</label>
            <input id="auth-email" type="email" required autocomplete="email" />
          </div>
          <div class="field">
            <label for="auth-password">Password</label>
            <input id="auth-password" type="password" required minlength="6" autocomplete="${isSignup ? "new-password" : "current-password"}" />
          </div>
          <p class="error-text" id="auth-error"></p>
          <div class="modal-actions">
            <button type="submit" class="btn btn-arc" style="width:100%">${isSignup ? "Sign up" : "Log in"}</button>
          </div>
        </form>
        <div class="modal-actions">
          <button id="google-btn" class="btn btn-ghost" style="width:100%">Continue with Google</button>
        </div>
        <div class="switch-mode">
          ${isSignup ? "Already have an account?" : "New to Evoke?"}
          <button id="switch-mode-btn">${isSignup ? "Log in" : "Sign up"}</button>
        </div>
      </div>
    `;

    root.appendChild(backdrop);

    backdrop.querySelector(".modal-close").addEventListener("click", close);
    backdrop.querySelector("#switch-mode-btn").addEventListener("click", () => {
      mode = isSignup ? "login" : "signup";
      render();
    });
    backdrop.querySelector("#auth-form").addEventListener("submit", handleSubmit);
    backdrop.querySelector("#google-btn").addEventListener("click", handleGoogle);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById("auth-error");
    errorEl.textContent = "";
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    try {
      if (mode === "signup") {
        const name = document.getElementById("auth-name").value.trim();
        await signUp(email, password, name);
        showToast("Account created — welcome to Evoke!", "success");
      } else {
        await logIn(email, password);
        showToast("Logged in", "success");
      }
      close();
      onSuccess();
    } catch (err) {
      errorEl.textContent = friendlyError(err);
    }
  }

  async function handleGoogle() {
    try {
      await logInWithGoogle();
      showToast("Logged in with Google", "success");
      close();
      onSuccess();
    } catch (err) {
      document.getElementById("auth-error").textContent = friendlyError(err);
    }
  }

  function close() {
    root.innerHTML = "";
  }
}

/** Converts Firebase Auth error codes into plain-language messages. */
function friendlyError(err) {
  const code = err.code || "";
  if (code.includes("email-already-in-use")) return "That email is already registered. Try logging in instead.";
  if (code.includes("wrong-password") || code.includes("user-not-found") || code.includes("invalid-credential")) {
    return "Incorrect email or password.";
  }
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "That email address doesn't look right.";
  return "Something went wrong. Please try again.";
}
