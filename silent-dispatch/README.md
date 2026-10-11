# The Silent Dispatch

Serve the static site:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. No installation or build is needed.

The photograph opens a 14-second JavaScript animation. Page interaction is restored when its Promise completes. Reduced motion uses a five-second crossfade. The footer toggles ambient motion.

To replace the animation, edit `playScene(stage, { reducedMotion })` in `dist/scene.js`. Resolve the Promise only when the scene ends and clean up any work it starts. `dist/app.js` controls the dialog, page lock and focus restoration.

Run `node check.mjs` to check both duration modes and cleanup.

All newspaper copy is fictional. The generated photograph and exact prompt are documented in ASSETS.md.
