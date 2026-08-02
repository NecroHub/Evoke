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
  apiKey: "YOUR_API_KEY",
  authDomain: "evoke-app.firebaseapp.com",
  databaseURL: "https://evoke-app-default-rtdb.firebaseio.com",
  projectId: "evoke-app",
  storageBucket: "evoke-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
