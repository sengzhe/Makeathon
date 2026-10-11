# Image asset generation

## Approved style prompt

Use this prompt for image asset generation throughout the animation. Preserve its visual direction when adding asset-specific instructions.

> **Non-realistic 2.5D wartime illustration with a simplified low-poly appearance.** Use broad angular planes, clean polygonal silhouettes, restrained human proportions and economical facial features. Apply muted olive, khaki, grey-green, earth brown and subdued warm skin tones. Materials are matte, with sparse texture and two or three broad shading tones. Keep outlines subtle and helmet shadows simple. Build depth through overlapping, separately layered foreground, middle-ground and background artwork. Preserve each character’s silhouette, costume and proportions across poses. Keep the mood quiet, human and sombre.

## Story presentation and hand visibility

Present the story through generated still images and programmatic 2.5D animation. Use the production script as the source for staging and timing.

> Hands appear only when their presence communicates a story beat. Frame routine handling below the image or conceal it with a motivated cut. Prefer held poses and simple whole-object movement. Reserve visible hand contact for the bandage reveal, pocket touch and final reach.

- Animate reusable images with translation, scale, rotation, opacity, parallax, limited mesh deformation, particles, lighting and masks.
- Use held image states and concealed cuts for large pose changes. Keep foreground fingers fixed within each state.
- Keep gripping hands outside the crop during running and aiming. Reuse the pocket-contact state for the final reach.
- Use framing and sound for routine handling. Do not add detailed catching, folding, tucking or equipment-pickup gestures.
- Reuse existing image pixels through crops, masks and separated parts before requesting another image state.
- Request a new static state only when a required viewpoint or silhouette cannot come from the existing art.
- Treat script frame counts as playback timing, not the number of images to generate. Generated video is not required.
- Keep scene checklists aligned with this staging. Remove superseded gesture requirements rather than marking them completed.

## How to use the prompt

- Generate only the assets and variants requested by the user. Do not generate the complete inventory without authorization.
- Read the relevant asset specification in [Home by Christmas — 2.5D Production Script](doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md). Keep the script's asset IDs, costume, equipment and continuity marks.
- Append the subject, script ID, camera view, pose/state, required parts and output requirements to the approved style prompt.
- Use existing character or prop artwork as a visual reference when generating further poses. Preserve proportions, colour assignments and recognizable details.
- Keep surface texture sparse. Avoid photorealism, glossy materials, dense small facets, heavy outlines and exaggerated cartoon proportions.
- For isolated characters and props, request a transparent background and preserve alpha. Keep unrelated objects and scenery out of the image.
- For production masters, keep hands, sleeves, weapons, held props and environment depth layers independently addressable. A flattened preview is not a completed layered animation asset.
- Apply scene lighting and colour grades separately where possible. Do not bake a scene-specific grade into the only reusable master.
- Preserve the letter's crayon drawing and yellow star across its states. Add exact story text as a separate authored layer for production.
- Save generated project assets under `asset/`. Use clear asset IDs or names and versioned filenames. Do not overwrite a selected asset unless requested.
- Show generated samples for review before expanding a trial into the full pose or state library.
- When asked to commit selected changes only, stage explicit file paths and verify the staged file list before committing.

## Current selected style trials

- [Tommy's hands and sleeves](asset/tommy-hands-sleeves-v1.png)
- [M1 Garand](asset/m1-garand-v1.png)
- [Annie's letter and yellow star](asset/annies-letter-v1.png)

Treat these as static style trials. Confirm handedness, equipment details and paper states against the script before preparing the required inserts.

## Animation kit rules

- The film is first person. Hands appear only when they carry a story beat: the bandage reveal, the pocket touch and the final reach. Frame routine handling below the image edge or hide it with a motivated cut.
- Prefer held poses and whole-object movement (translate, rotate, bob, jitter in the engine) over drawn hand or limb animation.
- First-person rifle work uses two hand-free sprites: the rifle entering from the lower-right edge (carry, raise, lower) and the sight picture (aim, fire with FX overlays).
- Characters that move are split into rig parts (for example body and head, pivot at the neck base). Static characters such as bodies, falls and prone poses stay single sprites.
- Assets the updated script no longer needs (drawn page turns, unfold frames, hand-handling poses, duplicate states) are kept in `asset/production/superseded/`. The runner treats them as done. Corrections from the script audit are saved as `_v2` beside their `_v1`; prefer the highest version.
- Generation tooling and the job inventory live in `asset/production/tools/`.
