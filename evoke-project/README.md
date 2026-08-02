# Evoke

A browser-based game creation platform. Build 3D worlds in a Babylon.js-powered
Studio, save them as lightweight JSON, and publish for others to play — all
inside the browser.

## Stack

- **Frontend**: vanilla HTML / CSS / JavaScript (ES modules, no build step required)
- **3D engine**: [Babylon.js](https://www.babylonjs.com/) (loaded via CDN)
- **Auth + Database**: Firebase Authentication + Realtime Database
- **File uploads**: UploadThing (images ≤25MB, audio ≤5MB)

## Project structure

```
evoke/
├── index.html                 # app shell (nav rail, topbar, view outlet)
├── src/
│   ├── main.js                 # entry point: boots router, nav, auth listener
│   ├── components/             # reusable UI: NavRail, GameCard, AuthModal
│   ├── pages/                  # one module per route (Home, Discover, Studio, …)
│   ├── engine/                 # Babylon.js layer: SceneManager, PartFactory,
│   │                           #   GizmoController, HistoryStack, serializer, AssetCache
│   ├── firebase/                # firebaseConfig, auth.js, database.js, uploads.js
│   ├── ui/                     # tokens.css, base.css, layout.css, components.css,
│   │                           #   studio.css, transitions.css
│   └── utils/                  # router.js, helpers.js
└── src/firebase/database.rules.json   # recommended RTDB security rules
```

## Setup

### 1. Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** → Email/Password and Google sign-in providers.
3. Enable **Realtime Database**, and publish the rules in
   `src/firebase/database.rules.json`.
4. Copy your web app config into `src/firebase/firebaseConfig.js`.

### 2. UploadThing

1. Create an app at [uploadthing.com](https://uploadthing.com).
2. Set up a server route (Next.js API route, Express endpoint, etc.) named
   `evokeAssetUploader` with two file types:
   - `image` — max size 25MB, formats: PNG, JPG, WEBP
   - `audio` — max size 5MB, formats: MP3, WAV, OGG
3. Point `UPLOADTHING_ENDPOINT` in `src/firebase/uploads.js` at that route.

### 3. Run locally

This is a static ES-module app — no bundler required. Serve the project root
with any static file server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:PORT`.

## Data model (Firebase Realtime Database)

```
users/{uid}          → { displayName, email, avatarUrl, bio, createdAt }
games/{gameId}        → { title, description, ownerId, thumbnailUrl,
                           visibility: "draft"|"published", createdAt, updatedAt, playCount }
maps/{gameId}          → { parts: [ { type, position, rotation, scale,
                           material, color, transparency, name }, ... ] }
assets/{uid}/{assetId} → { name, url, type: "image"|"audio", size, uploadedAt }
```

Maps are **never** stored as rendered meshes — only this plain JSON. The
Studio and the Play viewer both reconstruct the Babylon.js scene from it via
`src/engine/serializer.js`.

## Studio controls

- **Toolbar** (top center): Move / Rotate / Scale, Undo / Redo, grid-snap toggle.
- **Explorer** (left panel): flat list of every part in the scene; click to select.
- **Properties** (right panel): name, position/rotation/scale (per-axis), color,
  transparency.
- **Asset drawer** (bottom): click a primitive icon to add it to the scene at
  the origin.
- **Keyboard**: `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` (or `Ctrl+Y`) redo,
  `Delete`/`Backspace` removes the selected part.
- Changes autosave (debounced) and can also be saved manually via **Save**,
  or **Publish** to make the game visible on Discover/Home.

## Performance notes

- Frustum culling is on by default in Babylon.js; the scene also builds a
  selection octree (`createOrUpdateSelectionOctree`) for faster picking on
  larger maps.
- `engine/AssetCache.js` lazily loads and caches textures/sounds by URL so
  repeated asset use never re-fetches or re-decodes.
- Page navigation disposes the previous route's Babylon engine/scene
  (see `Router._render` cleanup handling) to avoid leaking GPU resources
  when leaving Studio or Play.
