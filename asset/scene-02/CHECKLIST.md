# Scene 2 — The House asset checklist

Source: [Scene 2 production specification](../../doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md#scene-2--the-house-040) and [prop inventory](../../doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md#props-pr). Compare with the [shared asset checklist](../CHECKLIST.md). Use the style and hand rules in [AGENTS.md](../../AGENTS.md).

Checked image items mean a static sample exists. They do not mark animation, layer integration or the whole scene complete. Present this scene through still images, camera movement, masks and procedural effects. No visible hand gesture is required.

## Scene-specific images missing from the shared list

| Script ID | Image to generate | Why it is needed | Reuse / layer plan |
| --- | --- | --- | --- |
| PR-09 | Red wooden toy horse with one broken front leg and the detached piece beside it | The focus detail shows a child's abandoned possession | One static cutout on L5. Add the landing snowflake procedurally |
| PR-11 | Dining table set for four, including one cup on its side | Establishes a family meal interrupted by the war | A static L4 group. Apply ash as a separate overlay |
| PR-11 | Child's chair with cushion | Makes the child's place at the table readable | Separate cutout so its position and overlap can match the kitchen layout |
| PR-24 | Completed rifle-and-helmet grave marker | Three markers establish the burial beside the humming GI | Generate one matching cutout and instance it three times at the distant burial site |

- [x] PR-09 wooden horse sample — [generated image](PR-09-wooden-horse-v1.png).
- [x] PR-11 table/place-settings sample — [generated image](PR-11-dining-table-v1.png).
- [x] PR-11 child-chair sample — [generated image](PR-11-child-chair-v1.png).
- [x] PR-24 grave-marker sample — [generated image](PR-24-grave-marker-v1.png).

All four samples were generated with the built-in image_gen tool and saved here. [Exact prompts](prompts.json) include the approved style and output requirements. The marker uses the [existing rifle](../m1-garand-v1.png) as a visual reference. Each PNG has an alpha channel. These samples still need scale, edge and layer checks in the kitchen composition.

The table and chair share one script ID but use separate files. Stove, dresser, wallpaper, broken crockery, roof gap and brick rubble belong to shared BG-01. They are not additional scene-only image requests.

## Shared dependencies already listed

These are required for Scene 2 but remain pending in the shared list. This batch does not generate them again as scene-only assets.

- [ ] BG-01 layered kitchen panorama, including roof gap, broken wall and distant field view.
- [ ] PR-04 crate and PR-05 upright coffee cup.
- [ ] PR-08 family photo with cracked glass, the father's face circled and the authored `1943` mark.
- [ ] PR-10 November 1944 calendar, with days 1–9 crossed out using an authored text/mark layer.
- [ ] PR-23 lace curtain aligned to the broken wall edge.
- [ ] SP-13 humming GI, held kneeling pose beside the completed markers. Animate only a small body sway.
- [ ] FX-07 distant smoke, FX-12 steam, FX-18 dust motes and FX-20 ash treatment.

## Programmatic preparation and animation

- [ ] Position the horse on L5 near panorama x = 1100, without baking floor or dust into its cutout.
- [ ] Add the horse's single landing snowflake as a procedural particle. Keep it visible during the focus hold.
- [ ] Place the table and child chair in the panorama x = 700–1500 area. Keep the four place settings readable.
- [ ] Apply ash accumulation over the table as a separate mask or particle layer.
- [ ] Instance the PR-24 marker three times at the burial site, 40 m beyond the wall gap. Place SP-13 beside one marker.
- [ ] Apply cold exterior grading to the markers and GI at composition time.
- [ ] Implement HD-08 as a still cup insert. No drinking or hand animation.
- [ ] Animate one ash flake touching the damp cup rim at 0:02. Reveal a grey mark over 8 playback frames.
- [ ] Preserve the cup-rim mark until the Scene 3 spill. No hand ash streak is required.
- [ ] Implement the scripted kitchen pan and constrained mouse drift.
- [ ] Reveal the roof gap with the 8° upward camera motion at 0:06–0:12.
- [ ] Keep a warm interior/cold exterior boundary aligned to the broken brick edge.
- [ ] Implement focus overlays for PR-08, PR-09 and PR-10: warm rim light, 130% object scale, background blur/darken and 3 s hold.
- [ ] Implement hover once per focus object, wall-gap hold and the 0:40 auto-advance.

The ash mark, focus glow, blur and snowflake are runtime effects. They do not need another generated image. The shared FX entries cover the atmosphere designs.

## Audio and authored content

- [ ] AU-02 distant artillery rumble.
- [ ] AU-05 humming that continues from Scene 1 and connects to Scene 3.
- [ ] AU-06 sergeant line at 0:18: `Hale. Finish up. We move in five.`
- [ ] AU-19 draught and faint room tone.
- [ ] Author the photo and calendar lettering/marks on separate layers.

Audio items are tracked for completeness. No audio generation is part of this image batch.

## Review and integration

- [x] Check the three-legged horse, detached front-leg piece, four table settings and child-chair cushion against the script.
- [x] Check the grave marker against the existing rifle design and the script's rifle-and-helmet arrangement.
- [ ] Check cutout edges, transparent backgrounds, scene scale and consistent matte low-poly styling.
- [ ] Keep the completed marker static. Do not add rifle planting, helmet placement or detailed hand movement.
- [ ] Check that the revised 0:40 scene presents all focus and surprise beats without requiring new animation frames.
