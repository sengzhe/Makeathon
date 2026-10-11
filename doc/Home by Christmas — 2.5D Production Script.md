# Home by Christmas — 2.5D Production Script

Oct 11, 2026 · @Jason

## Overview

This production script presents *Home by Christmas* through generated still images and programmatic 2.5D animation. Each beat identifies its layers, image states, motion and asset IDs. The story retains its first-person viewpoint, colour arc and ending. Framing, sound and motivated cuts replace detailed handling gestures.

Generate reusable image assets in the style recorded in `AGENTS.md`. Prepare cutouts, depth layers and masks from those images. Animate them through code: translation, scale, rotation, limited mesh deformation, opacity, particles, lighting and colour reveals. New image states are for changes in viewpoint or silhouette that existing art cannot support. Generated video and individually drawn animation frames are not production requirements.

### What changed from the original

| Original staging | 2.5D staging | Why |
| --- | --- | --- |
| 120° mouse look in the kitchen | ±18° drift over a wide painted panorama | Larger rotation makes flat layers visibly separate |
| One continuous take across the field | Three field sets (A, B, C) swapped behind full-frame smoke or muzzle flash | Keeps art volume manageable; viewer still reads one take |
| Forward running everywhere | Forward motion only on the ground plane; sprites scale by distance; forward speed drops to 0 during aiming | Scaling sprites is cheap; the freeze also sells the slow motion |
| Looking down at Karl mid-jump | Karl lies on the near crater edge, seen as Tommy approaches; photo in bottom foreground | Downward camera tilt breaks flat layers |
| Continuous hands and detailed object handling | Show hands at selected story beats. Conceal routine handling below frame or behind a cut | Preserves emotional gestures with fewer image states |
| Visible letter unfolding and pocket insertion | Cut from folded to open letter, then to the letter already inside the pocket | Sound and matched framing connect the actions |
| Drawn animation cycles | Programmatic movement of generated images, masks and separated parts | Reuses approved art across the sequence |

### Runtime

| Scene | Content | Length | Field sets / backgrounds | Advances when |
| --- | --- | --- | --- | --- |
| 0 | Content card | 0:03 | Black | Click or timer |
| 1 | Breakfast and letter | 0:45 | BG-01 Kitchen (close) | Pocket hold complete, then click at 0:42 or timer |
| 2 | The house | 0:40 | BG-01 Kitchen (panorama) | Look at wall gap / click / timer |
| 3 | Mortar and run-out | 0:20 | BG-01 → BG-02 Yard | Automatic |
| 4 | Field, 3 shots | 1:45 | BG-03 Field A, BG-04 Field B, BG-05 Field C | Each shot (click or auto at 6 s) |
| 5 | The grenade | 0:30 | BG-05 → BG-06 Ground | Automatic, clicks ignored |
| 6 | Black ending | 0:45 | Black | Card timers (click after 3 s each) |
|  | **Total** | **4:48** |  |  |

### ID conventions

Every element has one ID, used in the beat sheets and the asset list.

- **BG-** background set (generated images arranged in depth layers)
- **HD-** camera-layer staging cue, using a held image state or a programmatic transition
- **SP-** character sprite (other people)
- **PR-** prop
- **FX-** visual effect
- **TX-** on-screen text
- **AU-** audio (sound effect, voice line, ambience)

Times inside a scene's beat sheet are local to that scene, starting at 0:00.

## Surprise and Art Direction Map

Every scene turns on one story surprise and one visual surprise. The visual surprises follow a single colour arc: newsprint black-and-white → warm colour released from a child's drawing → colour drained by war, leaving only orange fire and red blood → soft natural colour as Tommy dies → black.

| Scene | Story surprise | Visual surprise | Technique and assets |
| --- | --- | --- | --- |
| 1 Breakfast | Tommy's left palm is already bandaged with a dried stain. The war has touched him before the film starts | The film opens in black-and-white halftone, like the newspaper. The first colour is Annie's yellow crayon star; colour then seeps out of the drawing as liquid, over his fingers, and floods the room | FX-17 halftone grade, FX-19 liquid colour bleed, FX-18 dust-mote cluster in a light beam |
| 2 House | The cosy kitchen is half destroyed. The "window light" was sky through the missing roof. The humming outside is a soldier marking a friend's grave | What looked like snow is ash: a flake lands on the damp cup rim and leaves a grey mark | Warm interior vs. blue-grey exterior split along the brick edge; FX-20 ash |
| 3 Mortar | The house does not just shake: it collapses behind him as he runs | Time freezes for 10 frames at impact: coffee hangs as a liquid crown, plaster and glass hang as a particle cluster. Then the colour drains out of the world toward the blast | FX-21 frozen cluster, FX-22 colour drain, FX-28 dust surge |
| 4 Field | Each target turns out to be a person: an old man, a young father. After Shot 2, Tommy is hit in the arm | The field is near-monochrome; the only colours are flare orange and blood red. Blood blooms through his sleeve like ink dropped in water. Crows lift as a black cluster at the first burst | FX-23 ink bloom, FX-24 crow cluster, FX-25 ember cluster, FX-29 liquid-light tracers |
| 5 Grenade | No warning. The thrower is a frightened boy | On the ground, soft natural colour returns: the world as it looks at peace. Melting snow makes the crayon colours run out of the letter into the mud, the reverse of Scene 1 | FX-26 crayon run, FX-15 iris |
| 6 Black | The boy lived | In the black, a yellow crayon star draws itself stroke by stroke, then its colour drains and it is gone | FX-27 star draw |

### Shared techniques

- **FX-17 Halftone grade.** Whole frame (L0–L7) rendered as black ink dots on off-white newsprint, with paper fibre texture and slight ink bleed at edges. Dot size 6 px in shadows, 2 px in highlights.
- **FX-19 Liquid colour bleed.** Colour spreads as fluid tendrils (ink-in-water look), not as a fade. Source shape → tendrils follow edges and creases (paper folds, knuckle creases, wood grain) → full layer. Halftone dots dissolve where colour arrives. Each layer floods 0.5 s after the one in front of it.
- **FX-22 Colour drain.** The reverse: colour pulls away as fluid toward a point (the blast), leaving grey behind.
- **Particle clusters** (dust motes, ash, frozen debris, crows, embers): instance 40–300 particles from a small sprite library or procedural shapes. Animate group movement and individual jitter through code. Use a few separated wing shapes for crows, with procedural flap rotation.
- **Selective colour (Scene 4).** Grade everything to 10% saturation, then allow back only two hues: orange 20–40° (fire, flare) and red 350–10° (blood). Nothing else carries colour.

## Global Systems

These rules apply in every scene; the beat sheets only state where they change.

### Hand visibility rule

> Hands appear only when their presence communicates a story beat. Frame routine handling below the image or conceal it with a motivated cut. Prefer held poses and simple whole-object movement. Reserve visible hand contact for the bandage reveal, pocket touch and final reach.

Keep routine gripping, pinching, catching, folding and equipment pickup outside the frame. Use the same held contact shape for the pocket touch and final reach. Background character hands can remain part of static silhouettes. Do not add finger articulation or close-up handling to those characters.

### Generated-image animation rule

- Generate static masters for backgrounds, characters and props. Preserve their identity and style between scenes.
- Separate images into the layers that the shot actually needs. Keep existing pixels and colour assignments consistent.
- Animate camera framing, parallax, whole-object movement, masked reveals, limited part rotation and lighting through code.
- Use held states and concealed state changes for large pose changes. Conceal changes behind a prop, smoke, flash or framing cut.
- Keep foreground fingers fixed within each held state. Do not simulate detailed grasping, page pinching or finger closure.
- Use the same paper artwork for folded, open and pocket states through crops, masks and simple paper planes.
- Use procedural particles for steam, dust and snow. Use animated masks for halftone dissolution, colour spread and stains.
- Keep exact text on a separate authored layer. Keep sound cues synchronized with actions that occur outside the frame.
- Budget visual detail for the headline, bandage, letter, colour reveal and final reach. Use quiet holds between those beats.

Frame counts below specify programmatic playback timing. They are not counts of new images to generate. A pose change needs another static state only when a cut, crop or simple transform cannot present it clearly.

### Canvas

Use a 1920 × 1080 px output at 24 fps. Prepare background images at 2× output resolution, or 3840 × 2160 per frame width. Logical panorama widths are 3200 px for the kitchen and 2600 px for field sets. Their source widths are 6400 px and 5200 px respectively. Allow extra image margins for camera drift and the ground-level rotation in Scene 5.

### Layer stack

Every scene is composed from the same ten layers, back to front.

| Layer | Content | Parallax factor | Notes |
| --- | --- | --- | --- |
| L0 | Sky | 0.05 | Overcast gradient; flare light tints it |
| L1 | Horizon | 0.15 | Treeline, distant smoke columns |
| L2 | Far | 0.30 | Village silhouettes, far buildings |
| L3 | Mid | 0.55 | Barn, walls, burned vehicle when not approached |
| L4 | Ground-plane sprites | by distance | People, bodies, craters, anything the run approaches |
| L5 | Near foreground | 1.20 | Fence posts, crater lip, debris that passes the camera edges |
| L6 | World FX | matches host layer | Smoke, fire, snow, tracers, mud splash |
| L7 | Optional foreground props, rifle, sleeve and brief hand inserts (HD) | locked to camera | Empty when unnecessary. Visible elements receive bob or recoil, never parallax |
| L8 | Screen FX | none | Flash, vignette, desaturation, blur, iris |
| L9 | Text | none | Subtitles, cards |

### Mouse drift (Scenes 1–2 only)

Mouse position moves the view up to ±18° horizontally and ±6° vertically. At parallax factor 1.0 that is ±200 px horizontally and ±60 px vertically. Each layer's offset is the drift multiplied by its parallax factor. Drift eases with a 0.3 s lag so it reads as head movement. In Scenes 3–5 drift is off; the camera belongs to the run.

### Ground-plane scaling (Scenes 3–5)

Anything on L4 has a world distance from the camera and is placed by these rules:

```latex
s = \frac{z_0}{z}, \qquad y = y_h + (y_0 - y_h)\,\frac{z_0}{z}, \qquad x = x_c + X\,\frac{z_0}{z}
```

Here z is the sprite's distance from the camera in metres; z₀ = 5 m is the reference distance at which a sprite is drawn at 100% scale; s is the sprite's scale; y\_h = 430 px is the horizon line's screen height; y₀ = 1010 px is the screen height of a sprite's feet at z₀; x\_c = 960 px is the frame centre; X is the sprite's sideways offset from the running line, in px at z₀. During a run every sprite's z decreases by the run speed v × elapsed time, with v = 6 m/s at full run. When z drops below 1.5 m the sprite hands over to L5 and exits past the frame edge.

Prepare each L4 sprite once at 100% scale (its size at 5 m). Its parallax factor is 1.0 at z₀ and falls to 0.55 at 40 m.

### Camera motion

| Motion | Values | Applies to |
| --- | --- | --- |
| Run bob | 14 px vertical dip per footstep, 2.8 steps/s | L0–L6 move as camera; L7 gets 1.3× amplitude with a 2-frame lag |
| Run sway | 8 px sideways, one cycle per 2 steps; roll ±1° | Same as bob |
| Slow motion (aiming) | World time scale 0.3. Forward speed eases to 0 over 12 presentation frames | L0–L6 world motion. L7 staging and L8–L9 use the scene clock |
| Slow motion (grenade) | World time scale 0.1 | L0–L6 world motion. The L7 final reach and L8–L9 use the scene clock |
| Recoil | L7 kicks 40 px up and rolls 2°, returns over 6 frames; world shakes 6 px for 4 frames | Per shot |
| Mortar shake | 30 px random shake, decays over 0.6 s | Scene 3 only |

### Transitions

- **T-FLASH:** L8 white at 100% for 4 frames, fades over 8. Used for the mortar and the grenade.
- **T-SMOKE:** FX-08 smoke wipe crosses the full frame left to right over 1 s; it is opaque for 6 frames in the middle, and the background set is swapped during those 6 frames. Used between field sets.
- **T-MUZZLE:** the muzzle flash FX-01 fills 60% of the frame for 2 frames; a set swap may hide behind it.
- **T-BLACK:** cut or fade to black on L8.
- **T-PAPER:** move a cropped newspaper edge across the frame. Cut to the letter during full coverage, without a visible hand.
- **T-INSERT:** cut between matched object states with sound across the cut. Use for the open letter and secured pocket inserts.

### Input

- **Click anywhere:** advances when the scene permits, or fires during an aim window. Scene 1 accepts advance only from 0:42.
- **Hover 1 s** on a glowing object (Scene 2): plays its detail.
- **Auto timers:** every scene advances on its own if the viewer does nothing.
- **No game UI** at any time: no crosshair, health, ammo, score, hit marker or prompt text.

## Hand and Rifle Pose Library

The HD IDs remain stable for production references. They now describe staging cues rather than fifteen separate hand animations. Scene 1 uses two visible hand states: the bandage insert and pocket contact. Scene 5 reuses the pocket-contact shape for the final reach.

During the run, show a low cropped rifle and occasional sleeve edge. Keep gripping hands outside the frame. The final reach remains visible before the grenade flash. Its disappearance after the flash, together with the stopped motion and silence, is the death signal.

### Art spec for the hands (all poses)

- **Build:** prepare four optional sublayers: L7a rifle, L7b left hand/sleeve insert, L7c right sleeve if needed, L7d foreground prop. Show only the sublayers required by the shot.
- **Hands:** a 19-year-old's hands, with thin wrists and long fingers. Represent chapped skin and dirt with a few broad marks. No rings or fine skin texture.
- **Sleeves:** US M1943 field jacket, olive drab, cuff with a buttoned adjustment tab. A wool knit cuff from the sweater underneath shows 1–2 cm past the jacket cuff.
- **Left wrist:** a plain field wristwatch on a canvas strap. Show it only where the crop permits. The left palm has a dirty field-dressing bandage with a dried rust-brown stain. Reveal it in HD-04. Preserve it in the pocket contact and final reach. No hand ash streak is required.
- **Rifle (L7a):** M1 Garand, walnut stock with worn dark patches where the hands hold it, canvas sling hanging loose under the forend. Seen from behind and right of the receiver.
- **Lighting:** visible inserts take the scene's key light colour. Use warm kitchen light, grey outdoor light and orange flare overlays. The bandage insert starts in FX-17 halftone before the Scene 1 colour reveal.

### Staging cues and image states

Use the scene clock for foreground edits and inserts. World slow motion does not stretch their specified presentation duration. Routine cues require no visible hand artwork.

| ID | Cue | Image and programmatic action | Timing | Used in |
| --- | --- | --- | --- | --- |
| HD-01 | Newspaper hold | PR-01 fills the frame. Hands remain below the crop. Translate the paper by up to 4 px for breathing | 3.5 s cycle | S1 |
| HD-02 | Paper transition | Translate and slightly rotate a cropped paper edge across the lens. Cut during full coverage | 14 playback frames within the 0:10–0:17 beat | S1 |
| HD-03 | Letter discovery | Hold the folded PR-02 on the crate. Handling occurs below frame | Hold until the open-letter cut | S1 |
| HD-04 | Bandage insert | Open PR-02 rests on the crate. A cropped left palm rests at its lower edge. Hold the fingers fixed. Apply colour masks over the still image | S1 0:17–0:33, followed by a concealed exit | S1 |
| HD-05 | Secured-letter insert | Move the letter below frame with the hand concealed. Cut to PR-14 with the letter already inside the pocket | S1 0:33–0:39 | S1 |
| HD-06 | Pocket contact | Show one cropped left-hand contact state over PR-14. Use a slight whole-layer settle, then hold. No repeated presses or finger closure | 3 s in S1, brief insert in S3 | S1, S3 |
| HD-07 | Return to room | Cut from the pocket insert to the warm crate/curtain framing. The hand leaves through the cut | At S1 0:42 | S1 → S2 |
| HD-08 | Cup insert | PR-05 stays on the crate. Steam and a gentle camera drift provide motion. No visible drinking gesture | First 4 s | S2 |
| HD-09 | Equipment pickup off-screen | Pan and dust conceal the pickup. Remove PR-06/PR-07 from the crate behind coverage. Introduce the low rifle after the cut | S3 0:03–0:05 | S3 |
| HD-10 | Low rifle carry | Crop the stock and all gripping hands below frame. Animate the rifle with run bob and sway. An occasional sleeve edge is sufficient | Continuous programmatic motion | S3–S5 |
| HD-10i | Injured carry | Reuse HD-10 with uneven bob and a sleeve stain overlay. Briefly expose the left sleeve for the hit. Keep the hand below frame | From S4 1:05 | S4, S5 |
| HD-11 | Aim transition | Move the rifle upward. Conceal the swap to the sight image behind the dark receiver crop. No grip change is shown | 8 playback frames | S4 |
| HD-12 | Sight hold | Use a separate static sight state: rear ring, front post and protective ears. Animate 3 px sway and target drift. Hands stay outside frame | 20-frame drift, then hold | S4 |
| HD-13 | Fire | Animate FX-01, recoil, world shake and a transformed PR-12 casing sprite. No trigger-finger animation | 2 flash + 6 recover + 10 casing frames | S4 |
| HD-14 | Return to carry | Conceal the sight/carry image swap during the downward receiver movement | 8 playback frames | S4 |
| HD-15 | Final reach | Sink the rifle by 15°. Slide the existing pocket-contact hand and stained sleeve toward PR-14, then hold. Keep fingers fixed | 20 presentation frames, then hold until S5 0:02 | S5 |

After the Scene 5 flash, Tommy's hands and rifle never return. The medic's letter pickup also occurs below the frame.

## Scene 1 — Breakfast (0:45)

Purpose: establish Tommy, the promise of Christmas, and the letter that ends the film. The set is BG-01 Kitchen, seen only at the edges around the newspaper.

**Set dressing in frame (bottom third, below the paper):** crate PR-04; on it the opened C-ration tin PR-03 with a spoon standing in it, the tin cup PR-05 with steam FX-12, the helmet PR-07 upside down. Framing hides all damage: around the paper the viewer sees only an intact lace curtain edge PR-23 at left and the crate below. Light falls from above-left as one beam full of turning dust motes FX-18; the viewer reads it as a window. It is the missing roof, revealed in Scene 2. The whole frame starts in FX-17 black-and-white halftone.

| Time | Camera and layers | Hand visibility / cue | On screen | Sound | Interaction |
| --- | --- | --- | --- | --- | --- |
| 0:00–0:03 | L8 black | None | Black | AU-01 spoon scraping tin, AU-02 distant rumble | None |
| 0:03–0:10 | Fade in. PR-01 scales from 300% to 100%. FX-13 blur clears over 5 s. FX-17 covers L0–L7 | HD-01, hands below frame | TX-01 comes into focus. Paper and room share the newsprint treatment | AU-01 ends, faint paper rustle | No advance |
| 0:10–0:17 | Hold the headline briefly. T-PAPER conceals a cut to the folded letter on the crate. Camera drift stays within the safe crop | HD-02 → HD-03, no visible handling | PR-02 folded. PR-04 crate and PR-23 curtain retain the cosy framing. FX-18 motes move in the beam | AU-03 paper movement, soft placement tap, AU-19 draught | Drift only |
| 0:17–0:21 | T-INSERT to the open letter on the crate. Begin a slow push-in. Suspend mouse drift for the insert | HD-04, stationary bandaged left palm at the letter edge | **Surprise:** dirty cream bandage and dried stain, initially monochrome. TX-02 and the drawing remain readable | AU-04 unfold bridges the cut | No advance |
| 0:21–0:33 | **FX-19 colour bleed.** Reveal yellow in the star first, then red roof and green tree. Masks spread along folds over 2 s, across the still hand, then L5 → L0 at 0.5 s offsets. Hold the completed reveal | HD-04 held, fingers fixed | Skin warms. The bandage gains its cream colour and rust-brown stain. The room becomes warm. Halftone dissolves only where colour arrives | AU-05 humming begins faintly. Warm tone rises during the spread, then ends | No advance. Keep the fully coloured letter readable for at least 3 s |
| 0:33–0:39 | The letter moves below the crop during a small camera dip. Conceal the hand and refold. T-INSERT to PR-14, with the letter already secured | HD-05, no visible folding or insertion | Pocket flap and a small paper edge establish the letter's location. Keep damage outside the framing | Paper and fabric rustle across the cut | No advance |
| 0:39–0:42 | Hold a close pocket insert | HD-06, one static contact state with a slight whole-layer settle | The hand rests over the pocket. No finger closure or repeated presses | One soft contact tap | No advance |
| 0:42–0:45 | HD-07 cut to warm crate/curtain framing. Gentle camera settle | No hands | Cup steam and dust continue. Kitchen damage stays concealed until Scene 2 | Draught and humming continue across the scene boundary | Click advances. Otherwise advance at 0:45 |

**Advance rule.** The timeline plays automatically. Clicks before 0:42 do not skip or accelerate the letter sequence. After the pocket contact holds for 3 s, a click can advance. The automatic scene duration remains 0:45.

**Image requirements.** Reuse the newspaper front image, a cropped folded-paper state, the open letter, the pocket insert and two held hand states. No newspaper inner spread, page-turn frames, catching pose, unfolding sequence, thumb tremor or visible tuck animation is required. Use masks for paper overlap and colour reveals. Prepare missing static states only where existing art cannot support the crop.

## Scene 2 — The House (0:40)

Purpose: show that a civilian family lived and lost here. Because mouse drift alone reveals only ±200 px, this scene adds a slow scripted head turn across the 3200 px kitchen panorama, with mouse drift layered on top.

### BG-01 Kitchen layout (left to right across the panorama)

| Panorama x (px) | Layer | Element |
| --- | --- | --- |
| 0–700 | L3 | Interior wall, wallpaper with a small floral pattern, half peeled. Family photo PR-08 on a nail at x 450 |
| 700–1500 | L4 + L0 | Dining table PR-11 set for four (plates, one cup on its side, a child's chair with a cushion). Roof gap above it shows L0 sky; ash FX-20 falls onto the table (the viewer reads it as snow) |
| 1100 | L5 | Wooden horse PR-09 on the floor in plaster dust, near foreground |
| 1500–2100 | L3 | Stove, dresser with broken crockery; calendar PR-10 on a nail at x 1900 |
| 2200–3200 | L3 opening, L1–L2 behind | Collapsed wall: brick heap on L5, the brick-edged gap on L3 framing the field on L1 (grey fields, treeline) and smoke columns on L2 |

### Beat sheet

| Time | Camera and layers | Hands | On screen | Sound | Interaction |
| --- | --- | --- | --- | --- | --- |
| 0:00–0:04 | View centred on the crate and table (pan position x 700). Brief push toward the cup rim | HD-08, no hands | PR-05 remains on the crate. FX-12 steam passes the lens. FX-20 ash touches the damp rim | AU-19 draught, faint room tone | Drift on |
| 0:04–0:24 | Scripted pan: first left to the photo (x 450), then right across the room, ending at the wall gap (x 2700). Speed 120 px/s on L3; slows to 30 px/s for 2 s at each object | No hands | PR-08, PR-09, PR-10 each glow faintly (FX: 10% warm rim light) while in view | AU-05 humming *Silent Night* outside; AU-02 rumble | Hover 1 s on a glowing object: its focus detail plays |
| 0:18 | — | — | — | AU-06: "Hale. Finish up. We move in five." (off-screen, right) | — |
| 0:24–0:40 | Pan stops facing the gap; field visible through it. Drift on | Hands out of frame | Field through the gap; smoke columns drift; SP-13 at the grave markers (see Surprise beats) | AU-05 continues | **Goal:** hold the cursor on the gap for 2 s. Click anywhere or 0:40 also advances |

### Focus details (hover 1 s; each 3 s; a second hover does nothing)

Focus treatment for all three: other layers blur 60% and darken 20%; the object scales to 130% over 12 frames and holds.

- **PR-08 Family photo.** Cracked glass. Mother, father in a suit, a boy and a girl. The father's face is circled in pencil; written beneath in the same pencil: *1943*. The father went to war.
- **PR-09 Wooden horse.** Painted red, one front leg snapped off and lying beside it. During the hold, one snowflake lands on its back and does not melt.
- **PR-10 Calendar.** *NOVEMBER 1944*. Days 1 to 9 are crossed out in pencil; after the 9th, nothing. The family left that day.

### Surprise beats

1. **Ash, not snow (0:02).** One grey flake lands on the damp cup rim. Its particle fades into a dark ash mark over 8 playback frames. Hold the mark briefly before the pan. No hand or thumb gesture is shown. Keep the mark on PR-05 until the cup spills in Scene 3.
2. **The room is broken (0:06–0:12).** As the pan reaches the table, the camera tilts up 8° for 2 s: the dust-filled light beam from Scene 1 is coming through a hole where the roof should be. Turning toward the photo, the lace curtain PR-23 from Scene 1 is revealed hanging on a wall that ends in raw broken brick 30 cm to its right.
3. **Warm inside, cold outside.** The interior keeps the warm lamplight grade from Scene 1. Everything seen through the roof gap and the wall gap is graded blue-grey. The boundary is sharp and follows the broken brick edge, as if the war begins exactly where the wall ends.
4. **The humming is a burial (0:24–0:40).** Through the wall gap, 40 m away on L3, SP-13 kneels beside a fresh rifle-and-helmet marker. Two identical markers stand beside it. His lowered head and still posture identify the humming as mourning. Animate a small body sway and falling ash. The planting and helmet placement are already complete.

**Transition to Scene 3:** the moment the goal is met, the humming continues for 1 s, then AU-07 begins.

## Scene 3 — The Mortar (0:20)

Purpose: break the calm in one second and start the run that does not stop. Sets: BG-01 Kitchen, then BG-02 Yard. Clicks are ignored for the whole scene.

**Set requirement:** BG-01 needs a doorway on L3 at panorama x 150, left of the photo, with a dark hallway beyond it.

| Time | Camera and layers | Hands | On screen | Sound |
| --- | --- | --- | --- | --- |
| 0:00.0 | View on the wall gap (end of Scene 2) | None in frame | Through the gap, SP-13 stops humming and looks up at the sky | AU-07 thin rising whistle; AU-05 humming stops mid-note at 0:00.5 |
| 0:00.8 | **T-FLASH.** Impact 15 m outside the gap | — | FX-04 white flash fills the gap, then the frame | Impact cut short by the next beat |
| 0:01.0–0:01.4 | **Surprise: frozen time.** Time scale 0 for 10 frames. FX-21 cluster hangs in the air: about 200 brick and plaster fragments, ash flakes stopped mid-fall, a glass shard catching light, the calendar PR-10 torn from its nail and hanging open mid-air at the left edge | — | Total stillness; the cluster rotates very slightly (1° over the 10 frames) | Pure silence |
| 0:01.4–0:02.5 | Time resumes. The cluster bursts toward and past the camera (particles scale up and exit all four edges via L5). Mortar shake 30 px. **FX-22 colour drain:** colour runs out of every layer as fluid toward the blast point, warm interior greying from the frame edges inward. Ends at 15% saturation; the fire in the blast crater stays orange | — | Plaster rain FX-05 | AU-08 high ringing 1.5 s, everything else muffled |
| 0:02.5 | Hearing returns | — | Smoke rolls in through the gap | AU-09 battle bed; AU-06 "GO! GO! EVERYBODY OUT!" |
| 0:03.0 | Whip pan left 0.4 s to the crate. FX-30 and dust cover the pickup | HD-09, all handling off-screen | PR-05 tips from the jolt. A masked coffee sheet pours over the crate. Its brown drains to grey. Remove PR-06/PR-07 behind coverage | Tin clatter, liquid splash, equipment pickup and helmet rustle |
| 0:04.0 | Camera rises 80 px over 12 frames. A brief pocket insert interrupts the rise | HD-06 held contact state, slight whole-layer settle | PR-14 and the same contact shape as Scene 1 | One soft contact tap, kit rattle |
| 0:05.0 | Whip pan left to the doorway | HD-10 run carry begins | Passing the floor: PR-08 photo lies face down, glass shattered | Glass crunch underfoot |
| 0:05.5 | Run starts (bob on, v = 6 m/s). Doorframe approaches as an L4 element and its edges pass both sides; frame dark for 4 frames | HD-10 | Swap BG-01 → BG-02 behind the dark | Footsteps on wood, then mud |
| 0:06–0:08 | BG-02 Yard: muddy farmyard, smoking mortar crater PR-20 at right with orange fire, broken cart, fence posts PR-17 passing on L5 | HD-10 | SP-01 two GIs running ahead; SP-02 sergeant at the yard gate, waving them on | AU-10 footsteps and breathing begin and never stop until Scene 5 |
| 0:08–0:11 | **Surprise: the house collapses behind him.** FX-28 dust overtakes the camera along both edges and the frame bottom. Brick sprites bounce through L5. Visibility falls to 30% for 2 s | HD-10, dust overlay on the low rifle and occasional sleeve edge | The two GIs ahead are swallowed by the dust, then reappear | AU-20 deep rumble and collapse behind; coughing breath |
| 0:11–0:18 | Dust clears. Yard opens toward the field. One GI ahead falls (SP-01 fall) and does not get up; the run passes him on the left | HD-10 | Field visible past the gate: grey, smoke on the horizon | AU-09 louder |
| 0:18–0:20 | **T-SMOKE** wipe; swap BG-02 → BG-03 Field A | HD-10 | — | Wind gust |

## Scene 4 — The Field (1:45)

Purpose: three shots, each clearly justified, each followed by a glimpse of the person killed. Then Tommy is wounded. The forward journey resumes after each aim hold. Sets: BG-03 Field A, BG-04 Field B and BG-05 Field C, swapped behind T-SMOKE.

**Grade for the whole scene:** selective colour (10% saturation; only orange fire and red blood keep colour). Snow FX-06 falls steadily on L6. Body count on the ground rises from 4 (Field A) to 8 (Field B) to 14 plus distant silhouettes (Field C); SP-10, both uniforms, face down, no wounds visible.

**Every shot uses the same sequence:** slow motion 0.3 with forward speed easing to 0 → HD-11 → HD-12 (sight drifts onto the target) → click or auto-fire at 6 s → HD-13 → speed returns over 0.5 s → HD-14 → back to HD-10.

The carry and sight images use programmatic transforms. Hands remain outside the crop throughout this sequence. After the injury, rifle sway and uneven camera bob show weakness. The sleeve stain appears briefly at the hit and returns during the final reach.

### Beat sheet

| Time | Set and layers | Hands | On screen | Sound | Interaction |
| --- | --- | --- | --- | --- | --- |
| 0:00–0:12 | BG-03 Field A. Open farmland, low stone field walls. Barn PR-21 on L4 at z = 60 m, upper window dark | HD-10 | SP-01 GIs running both sides; two fall. 0:05: SP-03 wounded GI at a fence post on the left, reaching out; the run passes him | AU-14 "Mom… Mom…"; AU-09; AU-10 | None |
| 0:12–0:20 | MG opens fire from the barn window | HD-10 | FX-02 muzzle flash pulses in the window. FX-29 tracers: drawn as streaks of glowing orange liquid with droplet tails, arcing toward camera. **Surprise cluster:** FX-24, about 150 crows burst up from the furrows at the first burst, a black cluster that splits and wheels across L2–L3. GIs drop flat (SP-01 prone) | AU-13 MG bursts; crow wingbeats and calls | None |
| 0:20–0:30 | **Shot 1 — the window.** Slow motion | HD-11 → HD-12 → HD-13 → HD-14 | Target obvious: the window is the only steadily lit shape; tracers point straight back at the camera | AU-11 rifle shot; AU-12 casing | Click or auto at 6 s |
| 0:30 | MG stops mid-burst | HD-14 → HD-10 | GIs get up | 1 s silence, then AU-06 "Gun's down! MOVE!" | — |
| 0:30–0:40 | Barn approaches, z 40 → 3 m; path passes under the window | HD-10 | **Surprise:** for 1.5 s, SP-04 slumped over the sill above: grey hair, no helmet, a man of about 55 in a uniform too big for him; a wedding ring on the hand hanging down. The crows have landed on the barn roof above him | Crows quiet | — |
| 0:40 | **T-SMOKE** → BG-04 Field B | HD-10 | — | Wind gust | — |
| 0:40–0:55 | BG-04: shell-crater field, burned tree stumps, more bodies. Karl's crater PR-20 directly ahead at z = 20 m, burning debris behind it | HD-10 | A farm dog barks somewhere, once, twice, then stops | AU-15; breathing ragged | — |
| 0:55–1:05 | **Shot 2 — the crater.** SP-05 Karl rises from the crater, rifle aimed at the camera | Shot sequence | Target obvious: dead centre, in the running line, a black silhouette against orange fire | AU-11 | Click or auto at 6 s |
| 1:05 | **Surprise: Tommy is hit.** As HD-14 lowers the rifle, an unseen bullet strikes his left forearm. World jolts 20 px sideways. L8 flashes red at 20% for 1 frame. Sound stops for 0.3 s | HD-10 → HD-10i. Show a cropped sleeve strip for 2 s, with the hand below frame | **FX-23 ink bloom:** animate a red reveal mask through the olive sleeve. Keep the final stain for the reach. Resume the run with uneven bob | Thud, sharp breath. Breathing catches on every second step | — |
| 1:05–1:15 | Approaching Karl's crater; his body on the near lip hands over from L4 to L5 at the bottom of frame | HD-10i | **Surprise:** Karl is no older than Tommy, eyes closed. In the bottom foreground, photo PR-15 lies in the mud: a young woman holding a baby, TX-03 *Für Karl — komm bald heim*. Tommy's next footstep throws FX-11 mud across it | TX-07 subtitle: "For Karl — come home soon" | — |
| 1:15 | **T-SMOKE** → BG-05 Field C | HD-10i | — | — | — |
| 1:15–1:26 | BG-05: dense bodies; burned vehicle PR-18 with FX-09 fire; FX-25 ember cluster (about 300 sparks) drifting across L4–L6. Left, z = 25 m: medic SP-07 kneeling over SP-08. Beyond, broken stone wall PR-19 with SP-06 crouched on top. Right, z = 15 m: foxhole PR-22, half hidden in smoke | HD-10i | — | AU-17 fire crackle | — |
| 1:26–1:30 | **Surprise: the flare.** FX-10 rises with a hiss and hangs. The grey world turns entirely orange (additive light on L0–L4); shadows of every sprite swing as the flare drifts down | HD-10i, low rifle and sleeve edge receive an orange overlay | — | AU-18 flare hiss | — |
| 1:30–1:40 | **Shot 3 — the medic.** SP-06 rises on the wall and aims at the medic | Shot sequence. Add a small procedural tremor to the HD-12 sight image | Target obvious: outlined against the flare-lit sky; his rifle points at the medic's back | AU-11 | Click or auto at 6 s |
| 1:40 | SP-06 drops behind the wall | HD-14 | SP-07 looks up, finds Tommy, nods once. Camera dips 20 px once: Tommy nods back | — | — |
| 1:40–1:45 | **The flash.** Shot 3's muzzle flash was held 4 frames instead of 2. Right, in the foxhole: SP-09 turns his head toward where the flash was, visible for 18 frames, one side lit orange. The flare dies; orange drains back to grey | HD-10i | Most viewers will miss the boy. Intended | Breathing, footsteps | None |

## Scene 5 — The Grenade (0:30)

Purpose: death without warning, and the viewer's control taken away at the moment they want it most. Sets: BG-05 Field C, then BG-06 Ground. Clicks do nothing for the whole scene.

| Time | Camera and layers | Hands | On screen | Sound |
| --- | --- | --- | --- | --- |
| 0:00.0 | Still running, full speed, BG-05, grey grade | HD-10i | Rotate and translate the PR-13 grenade sprite from the right edge into the running line. It lands two steps ahead with a small FX-11 splash | No warning cue, footsteps and breathing only |
| 0:00.5 | World slow motion 0.1. All sound drains to a heartbeat. The foreground gesture follows the scene clock | HD-15: sink the rifle and tilt the view 10° toward PR-14. Slide the fixed contact-hand image and bloodied sleeve toward the pocket over 20 presentation frames. Hold until the flash | Grenade in the lower centre, smoke from its handle. The bandage, stain and pocket reconnect the earlier story beats | AU-16 heartbeat, slowing |
| 0:02.0 | **T-FLASH** | Hands and rifle are gone after the flash and never return | White | Total silence. No explosion sound |
| 0:03.0 | BG-06 Ground: camera at mud level, whole frame rotated 70°. Snow falls toward the lens. Still grey grade | None | Mud, a frozen grass blade at the lens, sky filling the upper half | High thin ringing, slowly fading |
| 0:05–0:10 | **Surprise: colour returns, softly.** Not the warm lamplight of the kitchen and not liquid: a slow even fade to natural winter daylight colour over 5 s: pale blue sky, white snow, brown earth, the green of the grass blade. The world as it would look at peace | None | Foreground L5: the letter PR-02 has slipped half out of the pocket (pocket edge PR-14 at the frame corner). The crayon drawing is visible: house, tree, yellow star | Wind; a single distant bird |
| 0:07–0:14 | **FX-26 crayon run.** Snowflakes land on the drawing and melt into droplets. Each droplet makes the crayon colour run: red from the roof, green from the tree, in thin liquid streams off the paper edge into the mud. The reverse of Scene 1's bleed. The yellow star is drawn in heavy wax and does not run | None | Close on PR-02 | Very faint drip sounds |
| 0:10–0:14 | Background, at the foxhole (rotated view) | None | **Surprise:** SP-09 is clearly a boy of about 16, with an oversized helmet. Hold a frightened face state with a small shoulder tremor. Lower the sprite behind the foxhole rim | — |
| 0:15–0:20 | SP-07 close face image enters over the lens and becomes still | None | Hold the medic's concerned expression without mouth animation. His attention shifts toward the letter through a slight head tilt. Conceal the pickup below frame, then show the letter below his face with his grip outside the crop | Silence |
| 0:20–0:25 | FX-15 iris closes from the edges inward | None | Last thing visible for 2 full seconds: the yellow star on the letter the medic now holds. His fingers remain outside the crop. The star is the only saturated colour left | Silence |
| 0:25–0:30 | Black | — | — | Silence |

## Scene 6 — Black (0:45)

Purpose: name the dead on both sides as equals, give the real scale of the war, then leave the viewer in silence. Set: BG-00 black. No sound for the entire scene.

**Card style (TX-04):** white serif, 28 px, centred, letter-spaced 0.05 em. Each card fades in over 1 s and out over 1 s. Clicking advances to the next card only after the current one has held 3 s.

| Time | On screen | Hold |
| --- | --- | --- |
| 0:00–0:03 | Pure black | — |
| 0:03–0:09 | Card 1: Private Thomas Hale was 19. He did not come home for Christmas. | 4 s |
| 0:09–0:15 | Card 2: Neither did the man in the window. Or Karl. Or the man on the wall. | 4 s |
| 0:15–0:21 | Card 3: The boy in the foxhole lived. He never spoke about that morning. | 4 s |
| 0:21–0:28 | Card 4: An estimated 70 to 85 million people died in the Second World War. | 5 s |
| 0:28–0:35 | Card 5: Every one of them had someone waiting for them to come home. | 5 s |
| 0:35–0:36 | Black | — |
| 0:36–0:42 | **Surprise: FX-27 star draw.** A yellow crayon star draws itself at centre, 5 strokes of 0.4 s each, with visible wax grain and paper tooth. Beneath it, TX-05 *Please be careful.* writes itself in Annie's pencil handwriting. Hold 2 s. Then the yellow pulls out of the strokes as fluid toward the star's centre (FX-22), leaving a faint grey outline that fades with the handwriting | 2 s |
| 0:42–0:45 | Pure black. At 0:45 a small dim TX-06 "Replay" link appears at bottom centre; nothing else | — |

## Master Asset List

This inventory covers 7 background sets, 16 HD staging cues, 11 character entries, 26 props, 28 effects, 8 text elements and 21 audio items. The HD cues reuse two visible hand states, rifle states and prop images. They are not sixteen hand drawings. Black BG-00 and procedural effects do not require generated images. Gaps in numbering (SP-11, SP-12, FX-03, FX-16) remain unused.

### Backgrounds (BG)

| ID | Set | Image layers to prepare | Grade states | Used in |
| --- | --- | --- | --- | --- |
| BG-00 | Black | — | — | S0, S6 |
| BG-01 | Kitchen panorama, 3200 px | L0 sky through roof; L1 field and L2 smoke through wall gap; L3 walls (wallpaper, stove, dresser, doorway at x 150, brick-edged gap); L4 table; L5 brick heap, horse | Halftone, warm colour, drained grey | S1–S3 |
| BG-02 | Farmyard | L0–L3 yard, house rear, gate; L4 cart, crater; L5 fence posts | Grey 15% + orange fire | S3 |
| BG-03 | Field A, 2600 px | L0–L2 sky, treeline, smoke; L3 field walls; L4 barn | Selective colour | S4 |
| BG-04 | Field B, crater field | L0–L3 sky, stumps; L4 craters | Selective colour | S4 |
| BG-05 | Field C | L0–L3 sky, distant silhouettes of bodies; L4 vehicle, wall, foxhole | Selective colour, flare-orange state | S4–S5 |
| BG-06 | Ground, mud level | Generated layers with 2× source resolution and margins for the 70° rotation: mud, grass blade, sky | Grey, then natural winter colour | S5 |

### Characters (SP)

Prepare each character at 100% scale, equal to its size at 5 m. Use generated still states with separated parts where needed. Motion durations refer to code-driven playback, not newly generated frames. Conceal large pose changes behind smoke, terrain or a cut. Keep fingers fixed within each state.

| ID | Character | Static states and programmatic motion | Used in |
| --- | --- | --- | --- |
| SP-01 | US riflemen, 3 variants | Back-view running silhouette with separated limb parts for a restrained pivot cycle. Rotate into a fall, then swap to prone behind smoke or foreground coverage | S3, S4 |
| SP-02 | Sergeant | Static body with one separated arm. Rotate the whole arm for a broad wave, with fixed fingers | S3 |
| SP-03 | Wounded GI at fence post | Held reaching pose and subtle torso breathing. No finger movement | S4 |
| SP-04 | Machine-gunner, about 55, grey hair | Firing state with small recoil. Drop below the sill, then reveal the slumped static state. Keep the wedding ring readable on the still hand | S4 |
| SP-05 | Karl, about 19 | Translate the aim state above the crater rim, then below it after the shot. Reveal the separate dead state on the near lip | S4 |
| SP-06 | Soldier on the wall | Crouched and aim states. Conceal the change behind the wall during the rise. Drop the sprite behind the wall after the shot | S4 |
| SP-07 | Medic, red-cross armband | Kneeling state, separated head for one nod, concerned close face. Letter pickup occurs below frame. No detailed treatment or hand-contact animation | S4, S5 |
| SP-08 | Wounded man under the medic | Held state with a small torso breathing transform | S4 |
| SP-09 | Boy, about 16, oversized helmet | Side and frightened-face states, changed behind foxhole coverage. Small head/shoulder tremor, then lower the sprite into cover | S4, S5 |
| SP-10 | Bodies, 12 variants (6 US, 6 German) | Static, face down, no visible wounds | S3–S5 |
| SP-13 | GI humming at the graves | Kneeling state beside the completed marker. Subtle torso sway. Rotate a separated head upward at the mortar whistle | S2, S3 |

### Props (PR)

| ID | Prop | States | Used in |
| --- | --- | --- | --- |
| PR-01 | Newspaper | Front-page master. Reuse a cropped edge for T-PAPER. No inner spread, corner-hover state or page-turn drawings | S1 |
| PR-02 | Annie's letter with crayon drawing | Open master, cropped folded-paper state, secured-pocket state, half-out state and cropped medic-held view. Separate drawing masks for colour bleed/run. No unfolding frames | S1, S5 |
| PR-03 | C-ration tin with spoon | 1 | S1 |
| PR-04 | Crate | 1 | S1–S3 |
| PR-05 | Tin cup | Upright with coffee; tipped with liquid sheet; spilled | S1–S3 |
| PR-06 | M1 Garand leaning on crate | 1 (L7a rifle art is separate) | S3 |
| PR-07 | M1 helmet | Upside down on crate. Remove during concealed off-screen pickup | S1, S3 |
| PR-08 | Family photo with pencil circle and "1943" | On wall; face down shattered | S2, S3 |
| PR-09 | Wooden horse, red, one leg broken | 1 + snowflake | S2 |
| PR-10 | Calendar, November 1944, days 1–9 crossed | On nail; torn, hanging mid-air | S2, S3 |
| PR-11 | Table set for four, child's chair | 1 + ash accumulation | S2 |
| PR-12 | Brass casing | One sprite with programmatic translation, rotation and scale over 10 playback frames | S4 |
| PR-13 | Stick grenade | One sprite with programmatic tumble, then a held ground state with separate smoke | S5 |
| PR-14 | Jacket chest strip: pocket flap, button, dog-tag chain | Clean; dusty; with letter half out | S1, S3, S5 |
| PR-15 | Karl's photo with inscription | Clean; mud-splashed | S4 |
| PR-16 | MG 42 in window | 1 | S4 |
| PR-17 | Fence posts, 3 variants | 1 | S3, S4 |
| PR-18 | Burned-out vehicle | 1 | S4 |
| PR-19 | Broken stone wall | 1 | S4 |
| PR-20 | Shell craters, 3 variants (incl. Karl's with near lip) | Smoking; plain | S3, S4 |
| PR-21 | Barn with upper window | 1, plus crows-on-roof state | S4 |
| PR-22 | Foxhole with sandbag rim | 1 | S4, S5 |
| PR-23 | Lace curtain on broken wall | 1 | S1, S2 |
| PR-24 | Grave markers (rifle and helmet), 3 | 1 | S2 |
| PR-25 | Broken cart | 1 | S3 |
| PR-26 | Doorframe (approaching element) | 1 | S3 |

### Effects (FX)

| ID | Effect | Used in |
| --- | --- | --- |
| FX-01 | Tommy's muzzle flash (2 frames; held 4 on Shot 3) | S4 |
| FX-02 | MG muzzle flash loop | S4 |
| FX-04 | Mortar flash through wall gap | S3 |
| FX-05 | Plaster rain | S3 |
| FX-06 | Snow, outdoor | S4, S5 |
| FX-07 | Drifting smoke loops, 3 | S2–S5 |
| FX-08 | Full-frame smoke wipe | S3, S4 |
| FX-09 | Fire loops, 3 sizes | S3–S5 |
| FX-10 | Flare: rising sprite, hang, drift; additive orange light layer | S4 |
| FX-11 | Mud splash at frame bottom | S4, S5 |
| FX-12 | Coffee steam | S1, S2 |
| FX-13 | Screen: blur, vignette, ringing warp | S1–S5 |
| FX-14 | White flash (T-FLASH) | S3, S5 |
| FX-15 | Iris to black | S5 |
| FX-17 | Halftone newsprint grade | S1 |
| FX-18 | Dust-mote cluster in light beam | S1, S2 |
| FX-19 | Liquid colour bleed | S1 |
| FX-20 | Ash particles and a grey cup-rim mark revealed by a mask | S2, S3 |
| FX-21 | Frozen debris cluster (about 200 pieces) | S3 |
| FX-22 | Colour drain toward a point | S3, S6 |
| FX-23 | Blood ink bloom in sleeve | S4, S5 |
| FX-24 | Crow cluster (about 150) | S4 |
| FX-25 | Ember cluster (about 300) | S4 |
| FX-26 | Crayon colour run | S5 |
| FX-27 | Crayon star draw | S6 |
| FX-28 | Dust surge from behind | S3 |
| FX-29 | Liquid-light tracers | S4 |
| FX-30 | Whip-pan motion blur | S3 |

### Text (TX)

| ID | Text | Used in |
| --- | --- | --- |
| TX-00 | Content card: "This short depicts war and death. It contains no graphic gore." | S0 |
| TX-01 | Newspaper: *The Front Line Gazette*, Sunday, December 17, 1944; headline ALLIES PUSH ON — "BOYS HOME BY CHRISTMAS," SAYS GENERAL; casualty-list line | S1 |
| TX-02 | Annie's letter (child's pencil) and drawing | S1, S5 |
| TX-03 | *Für Karl — komm bald heim* | S4 |
| TX-04 | End cards 1–5 | S6 |
| TX-05 | *Please be careful.* in Annie's handwriting | S6 |
| TX-06 | Replay link | S6 |
| TX-07 | Subtitles | All |

### Audio (AU)

| ID | Sound | Used in |
| --- | --- | --- |
| AU-01 | Spoon scraping tin | S1 |
| AU-02 | Distant artillery rumble | S1, S2 |
| AU-03 | Newspaper movement across the concealed cut | S1 |
| AU-04 | Paper unfold sound across the folded/open insert cut | S1 |
| AU-05 | Man humming *Silent Night* | S1–S3 |
| AU-06 | Sergeant: "Hale. Finish up. We move in five." / "GO! GO! EVERYBODY OUT!" / "Gun's down! MOVE!" | S2–S4 |
| AU-07 | Mortar whistle | S3 |
| AU-08 | High ringing | S3, S5 |
| AU-09 | Battle ambience bed | S3, S4 |
| AU-10 | Footsteps on mud and breathing: normal, ragged, injured | S3–S5 |
| AU-11 | M1 Garand shot | S4 |
| AU-12 | Casing into mud | S4 |
| AU-13 | MG 42 bursts | S4 |
| AU-14 | Wounded GI: "Mom… Mom…" | S4 |
| AU-15 | Farm dog barking, twice | S4 |
| AU-16 | Heartbeat, slowing | S5 |
| AU-17 | Fire crackle | S4 |
| AU-18 | Flare hiss | S4 |
| AU-19 | Wind / draught | S1, S2, S5 |
| AU-20 | House collapse rumble | S3 |
| AU-21 | Foley pack: sip, tin clatter, liquid splash, glass crunch, kit rattle, crow wings, drips, bullet thud | S2–S5 |

## Build Order

Build the systems and the grey version of the whole film first, then add the colour and surprise effects, because those depend on timing that only a full run-through fixes.

### Phase 1 — Systems and blockout

- [ ] Set up the 10-layer compositor (L0–L9), parallax factors, mouse drift with 0.3 s lag
- [ ] Implement ground-plane scaling and the L4 → L5 handover at z = 1.5 m
- [ ] Implement run bob, sway, slow motion (0.3 and 0.1), recoil and shake from the Camera motion table
- [ ] Implement T-FLASH, T-SMOKE, T-MUZZLE, T-BLACK, T-PAPER and T-INSERT
- [ ] Implement scene input gates, hover 1 s and auto timers. Keep Scene 1 advance disabled until 0:42
- [ ] Block out all scenes with grey boxes and placeholder audio; time the full film against the 4:48 runtime

### Phase 2 — Story inserts and foreground states

- [ ] Prepare generated-image cutouts for the bandage insert and pocket contact. Reuse the contact state for the final reach
- [ ] Prepare open/folded/pocket letter states through crops, masks and paper planes
- [ ] Prepare low rifle carry and sight states. Keep gripping hands outside the crop
- [ ] Implement the HD staging cues with transforms, holds and concealed cuts. Do not create fifteen hand-animation sequences
- [ ] Check the final reach on the scene clock so it completes before the grenade flash

### Phase 3 — Sets and characters

- [ ] Generate and prepare BG-01 to BG-06 as full-colour depth layers. Apply scene grades during playback
- [ ] Prepare the listed SP character states and PR props as reusable still images. Separate only the parts required for programmatic motion
- [ ] Place every L4 element at its stated distance z and test the run timing past each one

### Phase 4 — Colour arc and surprises

- [ ] FX-17 halftone grade and FX-19 liquid colour bleed (Scene 1)
- [ ] Interior / exterior grade split and FX-20 ash mark on the cup rim (Scene 2)
- [ ] FX-21 frozen cluster, FX-22 colour drain, FX-28 dust surge (Scene 3)
- [ ] Selective-colour grade, FX-23 ink bloom, FX-24 crows, FX-25 embers, FX-29 tracers, FX-10 flare lighting (Scene 4)
- [ ] Natural-colour return, FX-26 crayon run, FX-15 iris (Scene 5)
- [ ] FX-27 star draw and card timing (Scene 6)

### Phase 5 — Sound and final checks

- [ ] Record or source AU-01 to AU-21; mix so the three silences (after Shot 1, the grenade, the ending) are true silence
- [ ] Viewer test without clicking: film must play start to finish on timers alone, under 5:00
- [ ] Viewer test clicking everything: letter sequence and end cards must not be skippable below their minimums
- [ ] Check that no game UI appears anywhere and that no close-up shows wounds
- [ ] Check that routine handling remains below frame or behind a motivated cut
- [ ] Check that the bandage, pocket contact and final reach remain readable with fixed fingers
- [ ] Check that Scene 1 plays its mandatory sequence through 0:42 before accepting advance
