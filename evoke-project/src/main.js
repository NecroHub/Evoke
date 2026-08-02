/**
 * main.js
 * App entry point. Boots the router, nav rail, topbar auth controls, and
 * subscribes to Firebase auth state to keep the UI in sync across the app.
 */

import { Router } from "./utils/router.js";
import { mountNavRail } from "./components/NavRail.js";
import { openAuthModal } from "./components/AuthModal.js";
import { onAuthChange, logOut, getCurrentUser } from "./firebase/auth.js";
import { getUserProfile } from "./firebase/database.js";

import { renderHome } from "./pages/Home.js";
import { renderDiscover } from "./pages/Discover.js";
import { renderMyGames } from "./pages/MyGames.js";
import { renderProfile } from "./pages/Profile.js";
import { renderSettings } from "./pages/Settings.js";
import { renderStudio } from "./pages/Studio.js";
import { renderPlay } from "./pages/Play.js";
import { renderAssetManager } from "./pages/AssetManager.js";

const outlet = document.getElementById("view-outlet");

const routes = {
  home: renderHome,
  discover: renderDiscover,
  "my-games": renderMyGames,
  profile: renderProfile,
  settings: renderSettings,
  studio: renderStudio,
  play: renderPlay,
  assets: renderAssetManager,
};

const router = new Router(outlet, routes, (route) => setActiveNav(route));
const setActiveNav = mountNavRail((route, params) => router.navigate(route, params));

router.start();

// ---------------- Auth-aware topbar ----------------
const authBtn = document.getElementById("auth-btn");
const userMenu = document.getElementById("user-menu");
const userAvatar = document.getElementById("user-avatar");

authBtn.addEventListener("click", () => {
  openAuthModal("login", () => { /* onAuthChange below handles UI refresh */ });
});

userMenu.addEventListener("click", async () => {
  const confirmed = confirm("Log out of Evoke?");
  if (confirmed) await logOut();
});

document.getElementById("nav-create-btn").addEventListener("click", () => {
  const user = getCurrentUser();
  if (!user) {
    openAuthModal("signup", () => router.navigate("my-games"));
    return;
  }
  router.navigate("my-games");
});

onAuthChange(async (user) => {
  if (user) {
    authBtn.classList.add("hidden");
    userMenu.classList.remove("hidden");
    const profile = await getUserProfile(user.uid);
    userAvatar.src = profile?.avatarUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.uid}`;
    userAvatar.alt = profile?.displayName || "Your avatar";
  } else {
    authBtn.classList.remove("hidden");
    userMenu.classList.add("hidden");
  }
});
