# Image asset generation

## Approved style prompt

Use this prompt for image asset generation throughout the animation. Preserve its visual direction when adding asset-specific instructions.

> **Non-realistic 2.5D wartime illustration with a simplified low-poly appearance.** Use broad angular planes, clean polygonal silhouettes, restrained human proportions and economical facial features. Apply muted olive, khaki, grey-green, earth brown and subdued warm skin tones. Materials are matte, with sparse texture and two or three broad shading tones. Keep outlines subtle and helmet shadows simple. Build depth through overlapping, separately layered foreground, middle-ground and background artwork. Preserve each character’s silhouette, costume and proportions across poses. Keep the mood quiet, human and sombre.

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

Treat these as static style trials. Confirm handedness, equipment details and paper-fold geometry against the script before preparing final animation poses.
