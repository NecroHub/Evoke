/**
 * firebaseConfig.js
 * Initializes the Firebase app instance shared by every other firebase/*
 * module. Replace the placeholder values with your project's actual
 * Firebase config (Project Settings → General → Your apps → SDK config).
 *
 * These values are safe to expose client-side — Firebase security is
 * enforced by Realtime Database rules and Auth, not by hiding this config.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6d1YujSE3_ygMY-nQA8UscUf8_KwWZlU",
  authDomain: "eevoke-3bdd9.firebaseapp.com",
  databaseURL: "https://evoke-3bdd9-default-rtdb.firebaseio.com/",
  projectId: "evoke-3bdd9",
  storageBucket: "evoke-3bdd9.firebasestorage.app",
  messagingSenderId: "396505663011",
  appId: "1:396505663011:web:c9878639dd188d311b9396",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
