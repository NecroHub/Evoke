/**
 * auth.js
 * Thin wrapper around Firebase Authentication. Keeps every other module
 * decoupled from the Firebase SDK's exact API surface — if the auth
 * provider ever changes, only this file needs to change.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebaseConfig.js";
import { createUserProfile } from "./database.js";

/**
 * Registers a new user with email/password and creates their public profile.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function signUp(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user.uid, {
    displayName,
    email,
    createdAt: Date.now(),
    avatarUrl: "",
    bio: "",
  });
  return credential.user;
}

/**
 * Signs in an existing user with email/password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function logIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Signs in using a Google account popup.
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function logInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

/**
 * Signs the current user out.
 * @returns {Promise<void>}
 */
export function logOut() {
  return signOut(auth);
}

/**
 * Subscribes to auth state changes (login/logout).
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {import("firebase/auth").Unsubscribe}
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Returns the currently signed-in user, or null.
 * @returns {import("firebase/auth").User | null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}
