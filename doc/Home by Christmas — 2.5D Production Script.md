# Home by Christmas — 2.5D Production Script

Oct 11, 2026 · @Jason

## Overview

This is the production version of *Home by Christmas*, rebuilt for a 2.5D layered-parallax pipeline. Every beat names its layers, the pose of Tommy's hands, and the asset IDs it uses, so the Master asset list at the end is the complete build list. Story and ending are the same as the original script; staging is changed where a full-3D camera was assumed.

### What changed from the original

| Original staging | 2.5D staging | Why |
| --- | --- | --- |
| 120° mouse look in the kitchen | ±18° drift over a wide painted panorama | Larger rotation makes flat layers visibly separate |
| One continuous take across the field | Three field sets (A, B, C) swapped behind full-frame smoke or muzzle flash | Keeps art volume manageable; viewer still reads one take |
| Forward running everywhere | Forward motion only on the ground plane; sprites scale by distance; forward speed drops to 0 during aiming | Scaling sprites is cheap; the freeze also sells the slow motion |
| Looking down at Karl mid-jump | Karl lies on the near crater edge, seen as Tommy approaches; photo in bottom foreground | Downward camera tilt breaks flat layers |
| Letter unfolds by itself | Tommy's hands unfold it | Hands are always on screen in FPS; gives the hand layer a purpose |

### Runtime

| Scene | Content | Length | Field sets / backgrounds | Advances when |
| --- | --- | --- | --- | --- |
| 0 | Content card | 0:03 | Black | Click or timer |
| 1 | Breakfast and letter | 0:45 | BG-01 Kitchen (close) | Letter tucked / click / timer |
| 2 | The house | 0:40 | BG-01 Kitchen (panorama) | Look at wall gap / click / timer |
| 3 | Mortar and run-out | 0:20 | BG-01 → BG-02 Yard | Automatic |
| 4 | Field, 3 shots | 1:45 | BG-03 Field A, BG-04 Field B, BG-05 Field C | Each shot (click or auto at 6 s) |
| 5 | The grenade | 0:30 | BG-05 → BG-06 Ground | Automatic, clicks ignored |
| 6 | Black ending | 0:45 | Black | Card timers (click after 3 s each) |
|  | **Total** | **4:48** |  |  |

### ID conventions

Every element has one ID, used in the beat sheets and the asset list.

- **BG-** background set (multi-layer painting)
- **HD-** hand / rifle pose on Tommy's camera layer
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
| 2 House | The cosy kitchen is half destroyed. The "window light" was sky through the missing roof. The humming outside is a soldier marking a friend's grave | What looked like snow is ash: a flake lands on his hand and smears grey | Warm interior vs. blue-grey exterior split along the brick edge; FX-20 ash |
| 3 Mortar | The house does not just shake: it collapses behind him as he runs | Time freezes for 10 frames at impact: coffee hangs as a liquid crown, plaster and glass hang as a particle cluster. Then the colour drains out of the world toward the blast | FX-21 frozen cluster, FX-22 colour drain, FX-28 dust surge |
| 4 Field | Each target turns out to be a person: an old man, a young father. After Shot 2, Tommy is hit in the arm | The field is near-monochrome; the only colours are flare orange and blood red. Blood blooms through his sleeve like ink dropped in water. Crows lift as a black cluster at the first burst | FX-23 ink bloom, FX-24 crow cluster, FX-25 ember cluster, FX-29 liquid-light tracers |
| 5 Grenade | No warning. The thrower is a frightened boy | On the ground, soft natural colour returns: the world as it looks at peace. Melting snow makes the crayon colours run out of the letter into the mud, the reverse of Scene 1 | FX-26 crayon run, FX-15 iris |
| 6 Black | The boy lived | In the black, a yellow crayon star draws itself stroke by stroke, then its colour drains and it is gone | FX-27 star draw |

### Shared techniques

- **FX-17 Halftone grade.** Whole frame (L0–L7) rendered as black ink dots on off-white newsprint, with paper fibre texture and slight ink bleed at edges. Dot size 6 px in shadows, 2 px in highlights.
- **FX-19 Liquid colour bleed.** Colour spreads as fluid tendrils (ink-in-water look), not as a fade. Source shape → tendrils follow edges and creases (paper folds, knuckle creases, wood grain) → full layer. Halftone dots dissolve where colour arrives. Each layer floods 0.5 s after the one in front of it.
- **FX-22 Colour drain.** The reverse: colour pulls away as fluid toward a point (the blast), leaving grey behind.
- **Particle clusters** (dust motes, ash, frozen debris, crows, embers): 40–300 small drawn particles per cluster, moving as a group with individual jitter, so each layer has texture and motion.
- **Selective colour (Scene 4).** Grade everything to 10% saturation, then allow back only two hues: orange 20–40° (fire, flare) and red 350–10° (blood). Nothing else carries colour.

## Global Systems

These rules apply in every scene; the beat sheets only state where they change.

### Canvas

1920 × 1080 px, 24 fps for all drawn animation. Painted backgrounds are drawn at 2× resolution (3840 × 2160 per frame width) so they can be scaled up for the ground-level shot in Scene 5 without blur. Panoramas are wider than the frame: Kitchen 3200 px, Field sets 2600 px.

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
| L7 | Hands and rifle (HD) | locked to camera | Gets bob and recoil; never gets parallax |
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

Draw each L4 sprite once at 100% scale (its size at 5 m). Its parallax factor is 1.0 at z₀ and falls to 0.55 at 40 m.

### Camera motion

| Motion | Values | Applies to |
| --- | --- | --- |
| Run bob | 14 px vertical dip per footstep, 2.8 steps/s | L0–L6 move as camera; L7 gets 1.3× amplitude with a 2-frame lag |
| Run sway | 8 px sideways, one cycle per 2 steps; roll ±1° | Same as bob |
| Slow motion (aiming) | Time scale 0.3; forward speed eases to 0 over 12 frames | Everything except L8–L9 |
| Slow motion (grenade) | Time scale 0.1 | Everything except L8–L9 |
| Recoil | L7 kicks 40 px up and rolls 2°, returns over 6 frames; world shakes 6 px for 4 frames | Per shot |
| Mortar shake | 30 px random shake, decays over 0.6 s | Scene 3 only |

### Transitions

- **T-FLASH:** L8 white at 100% for 4 frames, fades over 8. Used for the mortar and the grenade.
- **T-SMOKE:** FX-08 smoke wipe crosses the full frame left to right over 1 s; it is opaque for 6 frames in the middle, and the background set is swapped during those 6 frames. Used between field sets.
- **T-MUZZLE:** the muzzle flash FX-01 fills 60% of the frame for 2 frames; a set swap may hide behind it.
- **T-BLACK:** cut or fade to black on L8.

### Input

- **Click anywhere:** advances the scene, or fires during an aim window.
- **Hover 1 s** on a glowing object (Scene 2): plays its detail.
- **Auto timers:** every scene advances on its own if the viewer does nothing.
- **No game UI** at any time: no crosshair, health, ammo, score, hit marker or prompt text.

## Hand and Rifle Pose Library

Tommy's hands and rifle are on screen in every shot from 0:00 of Scene 1 until the grenade flash; their disappearance in Scene 5 is the death signal. There are 15 poses, HD-01 to HD-15.

### Art spec for the hands (all poses)

- **Build:** draw on four sub-layers so poses can share parts: L7a rifle, L7b left hand + sleeve, L7c right hand + sleeve, L7d held prop (paper, letter, cup).
- **Hands:** a 19-year-old's hands. Thin wrists, long fingers. Knuckles chapped red from cold, dirt in the nail beds and skin creases, nails short and uneven. No rings.
- **Sleeves:** US M1943 field jacket, olive drab, cuff with a buttoned adjustment tab. A wool knit cuff from the sweater underneath shows 1–2 cm past the jacket cuff.
- **Left wrist:** a plain field wristwatch on a canvas strap, glass scratched. Visible in HD-01, HD-04, HD-10. Left palm: wrapped in a dirty field-dressing bandage with a dried rust-brown stain (an earlier wound), hidden behind the paper until HD-04.
- **Rifle (L7a):** M1 Garand, walnut stock with worn dark patches where the hands hold it, canvas sling hanging loose under the forend. Seen from behind and right of the receiver.
- **Lighting:** hands take the scene's key light colour. Warm (kitchen) in Scenes 1–2; flat grey outdoors; flare-orange on the side facing a flare in Shots 1–3. Hands are in FX-17 halftone until the colour bleed in Scene 1.

### Poses

Screen positions are in px on the 1920 × 1080 frame (origin top left). Frame counts are at 24 fps, before any slow motion is applied.

| ID | Pose | Placement and action | Frames | Used in |
| --- | --- | --- | --- | --- |
| HD-01 | Paper hold, idle | Both hands enter from the bottom edge, left at x 380, right at x 1540, y 820–1080. Each grips a side edge of the newspaper: thumb on the front face at mid-height, four fingers behind (their shadow visible through thin newsprint). Breathing loop: whole group rises and falls 4 px, slight paper flex. | 8-frame loop on twos (3.5 s cycle) | S1 |
| HD-02 | Page turn | Left hand holds. Right hand releases its edge, moves up to the top-right corner, pinches it between thumb and index finger, lifts and sweeps the page right to left; page shape follows in 6 drawn intermediate shapes. | 14 | S1 |
| HD-03 | Catch letter | Left hand lowers the paper to the lap (slides out of frame bottom). Right hand reaches to the crate top at lower right and picks up the folded letter between index and middle finger. | 12 | S1 |
| HD-04 | Unfold and hold letter | Letter at chest height, centre frame. Both thumbs open the two folds outward (tri-fold), 6 frames per fold. Hold: hands at the letter's lower corners, thumbs on the front; right thumb has a slight tremor (1 px, every 6 frames). | 12 + 8-frame hold loop | S1 |
| HD-05 | Refold and tuck | Folds closed in reverse (10 frames). Camera tilts down 10° (world layers shift up 110 px), revealing the jacket chest strip PR-14 at the frame bottom. Right hand slides the letter into the breast pocket on screen left (his left side). | 20 | S1 |
| HD-06 | Pocket touch | Left hand, fingers flat and together, presses the pocket twice. Keep this exact hand shape: it recurs in S3 (one press) and S5 (reach). | 12 (6 per press) | S1, S3 |
| HD-07 | Lower to lap | Both hands and paper drop out of the frame bottom; camera tilts back up to level. | 10 | S1 → S2 |
| HD-08 | Cup at rest | Right hand only, lower right, fingers through the handle of the tin cup PR-05 resting on the crate edge. Steam FX-12 rises. Left hand out of frame. | 8-frame steam loop; hand static | S2 |
| HD-09 | Grab rifle and helmet | Right hand jerks; cup tips over (PR-05 tipped state). Right hand grabs the rifle by the wrist of the stock where it leans on the crate at right. Left hand grabs the helmet PR-07 from the crate and lifts it up out of the frame top (putting it on), then comes down onto the forend. | 16 (hands overlap) | S3 |
| HD-10 | Run carry | Rifle diagonal: butt at lower right (x 1700, y 1080), muzzle toward upper left (x 1150, y 560). Right hand on the stock wrist at (1560, 960). Left hand under the forend at (1250, 760), fingers wrapped over the top. Receives run bob × 1.3 with 2-frame lag. Snowflakes settle on the left sleeve over time. Injured variant HD-10i (after the hit in Scene 4): left hand grips lower and weaker, fingers do not fully close, 2 px tremor every 4 frames; sleeve carries the FX-23 blood bloom; run bob turns uneven (every second step dips 6 px deeper). | 12-frame loop (2 steps) | S3, S4, S5 |
| HD-11 | Raise to aim | Rifle rotates about 35° anticlockwise and rises; butt goes into the shoulder below frame centre; receiver comes up to the eye. | 8 | S4 |
| HD-12 | Aim hold | Rear peep sight: dark, out-of-focus ring, 520 px diameter, centred. Front sight post with its two protective ears, sharp, inside the ring. Left hand visible at lower left gripping the forend, knuckles pale. Breathing sway 3 px. The front post drifts from rest to the target over 20 frames, ease-out. | 20 drift + hold | S4 |
| HD-13 | Fire | Muzzle flash FX-01 at the front sight for 2 frames; recoil per the Camera motion table; brass casing PR-12 spins out to the upper right. | 2 flash + 6 recover + 10 casing | S4 |
| HD-14 | Lower to run | HD-11 in reverse, returning to HD-10. | 8 | S4 |
| HD-15 | Freeze and reach | From HD-10: right grip loosens and the muzzle sinks 15°. Left hand leaves the forend and rises toward the chest; camera tilts down 10° to show PR-14; fingers close over the pocket with the letter (HD-06 hand shape). Held until the flash. | 20, then hold | S5 |

After the Scene 5 flash, no hand or rifle appears again.

## Scene 1 — Breakfast (0:45)

Purpose: establish Tommy, the promise of Christmas, and the letter that ends the film. The set is BG-01 Kitchen, seen only at the edges around the newspaper.

**Set dressing in frame (bottom third, below the paper):** crate PR-04; on it the opened C-ration tin PR-03 with a spoon standing in it, the tin cup PR-05 with steam FX-12, the helmet PR-07 upside down. Framing hides all damage: around the paper the viewer sees only an intact lace curtain edge PR-23 at left and the crate below. Light falls from above-left as one beam full of turning dust motes FX-18; the viewer reads it as a window. It is the missing roof, revealed in Scene 2. The whole frame starts in FX-17 black-and-white halftone.

| Time | Camera and layers | Hands | On screen | Sound | Interaction |
| --- | --- | --- | --- | --- | --- |
| 0:00–0:03 | L8 black | — | — | AU-01 spoon scraping tin; AU-02 distant rumble | None |
| 0:03–0:10 | Fade in. FX-17 halftone on all layers. PR-01 at 300% scale, FX-13 blur 100% → 0 over 5 s; scale eases 300% → 100% (the pull-back) | HD-01 enters from the bottom once scale passes 130% | Headline TX-01 comes into focus. Paper and room share the same dot texture, so the room reads as part of the printed page | AU-01; paper rustle | None |
| 0:10–0:18 | Paper at rest. Mouse drift on | HD-01 idle loop | Dust-mote cluster FX-18 turns slowly in the light beam, top left. Curtain PR-23 at left edge | AU-19 soft draught | Drift only |
| 0:18 | Top-right page corner curls 6 px every 3 s | HD-01 | PR-01 corner | — | Hover: curl lifts to 30 px |
| On click (or auto at 0:24) | — | HD-02 page turn | PR-01 page flips | AU-03 page turn | Click anywhere turns the page |
| +0:01 | — | HD-01 holding | PR-02 slides out, drops onto the crate (10 frames, 1 bounce) | Paper slip, soft tap | — |
| +0:02 | — | HD-03 catch letter | PR-02 in right hand | — | — |
| +0:03–0:05 | Paper out of frame. Letter centred, drift ±6° | HD-04 unfold. **Surprise:** as the folds open, the left palm turns to camera: bandaged, with a dried stain | PR-02 open, still monochrome | AU-04 unfold | — |
| +0:05–0:11 | **FX-19 colour bleed.** Yellow fills the crayon star first: the first colour in the film. Then red roof, green tree. Colour runs out of the crayon lines along the paper folds as liquid tendrils (2 s), over his fingers (skin warms; bandage turns cream with a rust-brown stain), then floods L5 → L0 one layer every 0.5 s. Halftone dots dissolve where colour arrives | HD-04 hold | TX-02 readable; the room ends in warm lamplight colour | AU-05 humming starts faintly; a low warm tone swells under the bleed and stops when it completes | Click: letter holds 3 s minimum |
| +0:11–0:14 | Camera tilts down 10° | HD-05 refold and tuck | PR-14 chest strip | Fabric rustle | — |
| +0:14–0:15 | Tilt held | HD-06 pocket touch (2 presses) | PR-14 | Two soft taps | — |
| +0:15–0:17 | Camera tilts back to level | HD-07 lower to lap | Room in warm colour, still framed so no damage shows | — | Continues into Scene 2 |

**Advance rule.** The letter sequence (from the page turn to HD-06) always plays, at 2× speed if the viewer clicks during it. It sets up the ending and cannot be skipped. Hard cap: Scene 1 ends at 0:45.

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
| 0:00–0:04 | View centred on the crate and table (pan position x 700) | HD-08: right hand lifts the cup up to bottom centre, tilts it (sip; steam passes the lens with a brief FX-13 blur), sets it back on the crate | PR-05, FX-12 | Sip; tin on wood | Drift on |
| 0:04–0:24 | Scripted pan: first left to the photo (x 450), then right across the room, ending at the wall gap (x 2700). Speed 120 px/s on L3; slows to 30 px/s for 2 s at each object | HD-08 hand stays resting on the crate, slides off the right edge as the head turns | PR-08, PR-09, PR-10 each glow faintly (FX: 10% warm rim light) while in view | AU-05 humming *Silent Night* outside; AU-02 rumble | Hover 1 s on a glowing object: its focus detail plays |
| 0:18 | — | — | — | AU-06: "Hale. Finish up. We move in five." (off-screen, right) | — |
| 0:24–0:40 | Pan stops facing the gap; field visible through it. Drift on | Hands out of frame | Field through the gap; smoke columns drift; SP-13 at the grave markers (see Surprise beats) | AU-05 continues | **Goal:** hold the cursor on the gap for 2 s. Click anywhere or 0:40 also advances |

### Focus details (hover 1 s; each 3 s; a second hover does nothing)

Focus treatment for all three: other layers blur 60% and darken 20%; the object scales to 130% over 12 frames and holds.

- **PR-08 Family photo.** Cracked glass. Mother, father in a suit, a boy and a girl. The father's face is circled in pencil; written beneath in the same pencil: *1943*. The father went to war.
- **PR-09 Wooden horse.** Painted red, one front leg snapped off and lying beside it. During the hold, one snowflake lands on its back and does not melt.
- **PR-10 Calendar.** *NOVEMBER 1944*. Days 1 to 9 are crossed out in pencil; after the 9th, nothing. The family left that day.

### Surprise beats

1. **Ash, not snow (0:02).** During the sip, one grey flake lands on the back of Tommy's right hand. When he sets the cup down his thumb brushes it, and it smears into a grey streak (8 frames, drawn on L7c). It stays on his hand for the rest of the film.
2. **The room is broken (0:06–0:12).** As the pan reaches the table, the camera tilts up 8° for 2 s: the dust-filled light beam from Scene 1 is coming through a hole where the roof should be. Turning toward the photo, the lace curtain PR-23 from Scene 1 is revealed hanging on a wall that ends in raw broken brick 30 cm to its right.
3. **Warm inside, cold outside.** The interior keeps the warm lamplight grade from Scene 1. Everything seen through the roof gap and the wall gap is graded blue-grey. The boundary is sharp and follows the broken brick edge, as if the war begins exactly where the wall ends.
4. **The humming is a burial (0:24–0:40).** Through the wall gap, 40 m away on L3: the GI who is humming *Silent Night* (SP-13) kneels, pushes a rifle bayonet-first into the frozen ground, and hangs a helmet on its stock. Two identical markers already stand beside it. He keeps humming. Ash falls on all three.

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
| 0:03.0 | Whip pan left 0.4 s to the crate (FX-30 motion-blur streak) | HD-09: right hand knocks the cup; coffee pours over the crate edge as a liquid sheet. Its brown is the last warm colour in the room and it greys as it runs. Right hand grabs the rifle, left hand lifts the helmet out of frame top | PR-05 tipped, PR-06, PR-07 | Tin cup clatter; liquid splash |
| 0:04.0 | Camera rises 80 px over 12 frames (standing up) | HD-06 single press on the pocket (camera tilts 5°) | — | Kit rattle |
| 0:05.0 | Whip pan left to the doorway | HD-10 run carry begins | Passing the floor: PR-08 photo lies face down, glass shattered | Glass crunch underfoot |
| 0:05.5 | Run starts (bob on, v = 6 m/s). Doorframe approaches as an L4 element and its edges pass both sides; frame dark for 4 frames | HD-10 | Swap BG-01 → BG-02 behind the dark | Footsteps on wood, then mud |
| 0:06–0:08 | BG-02 Yard: muddy farmyard, smoking mortar crater PR-20 at right with orange fire, broken cart, fence posts PR-17 passing on L5 | HD-10 | SP-01 two GIs running ahead; SP-02 sergeant at the yard gate, waving them on | AU-10 footsteps and breathing begin and never stop until Scene 5 |
| 0:08–0:11 | **Surprise: the house collapses behind him.** FX-28 dust surge overtakes the camera from behind: a dense brown-grey dust cluster flows forward past both frame edges and along the bottom; brick fragments bounce past on L5 ahead of him; visibility drops to 30% for 2 s | HD-10, dust settling on the sleeves | The two GIs ahead are swallowed by the dust, then reappear | AU-20 deep rumble and collapse behind; coughing breath |
| 0:11–0:18 | Dust clears. Yard opens toward the field. One GI ahead falls (SP-01 fall) and does not get up; the run passes him on the left | HD-10 | Field visible past the gate: grey, smoke on the horizon | AU-09 louder |
| 0:18–0:20 | **T-SMOKE** wipe; swap BG-02 → BG-03 Field A | HD-10 | — | Wind gust |

## Scene 4 — The Field (1:45)

Purpose: three shots, each clearly justified, each followed by a glimpse of the person killed; then Tommy is wounded. The run never stops. Sets: BG-03 Field A, BG-04 Field B, BG-05 Field C, swapped behind T-SMOKE.

**Grade for the whole scene:** selective colour (10% saturation; only orange fire and red blood keep colour). Snow FX-06 falls steadily on L6. Body count on the ground rises from 4 (Field A) to 8 (Field B) to 14 plus distant silhouettes (Field C); SP-10, both uniforms, face down, no wounds visible.

**Every shot uses the same sequence:** slow motion 0.3 with forward speed easing to 0 → HD-11 → HD-12 (sight drifts onto the target) → click or auto-fire at 6 s → HD-13 → speed returns over 0.5 s → HD-14 → back to HD-10.

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
| 1:05 | **Surprise: Tommy is hit.** As HD-14 lowers the rifle, an unseen bullet strikes his left forearm. World jolts 20 px sideways; L8 flashes red at 20% for 1 frame; all sound drops out for 0.3 s | HD-10 → HD-10i | **FX-23 ink bloom:** a red point on the olive sleeve spreads as ink tendrils through the fabric over 2 s; the only red not from fire. From here the run bob is uneven (limp) | Thud; sharp breath; breathing now catches on every second step | — |
| 1:05–1:15 | Approaching Karl's crater; his body on the near lip hands over from L4 to L5 at the bottom of frame | HD-10i | **Surprise:** Karl is no older than Tommy, eyes closed. In the bottom foreground, photo PR-15 lies in the mud: a young woman holding a baby, TX-03 *Für Karl — komm bald heim*. Tommy's next footstep throws FX-11 mud across it | TX-07 subtitle: "For Karl — come home soon" | — |
| 1:15 | **T-SMOKE** → BG-05 Field C | HD-10i | — | — | — |
| 1:15–1:26 | BG-05: dense bodies; burned vehicle PR-18 with FX-09 fire; FX-25 ember cluster (about 300 sparks) drifting across L4–L6. Left, z = 25 m: medic SP-07 kneeling over SP-08. Beyond, broken stone wall PR-19 with SP-06 crouched on top. Right, z = 15 m: foxhole PR-22, half hidden in smoke | HD-10i | — | AU-17 fire crackle | — |
| 1:26–1:30 | **Surprise: the flare.** FX-10 rises with a hiss and hangs. The grey world turns entirely orange (additive light on L0–L4); shadows of every sprite swing as the flare drifts down | HD-10i, hands lit orange on the left side | — | AU-18 flare hiss | — |
| 1:30–1:40 | **Shot 3 — the medic.** SP-06 rises on the wall and aims at the medic | Shot sequence (left hand trembles in HD-12) | Target obvious: outlined against the flare-lit sky; his rifle points at the medic's back | AU-11 | Click or auto at 6 s |
| 1:40 | SP-06 drops behind the wall | HD-14 | SP-07 looks up, finds Tommy, nods once. Camera dips 20 px once: Tommy nods back | — | — |
| 1:40–1:45 | **The flash.** Shot 3's muzzle flash was held 4 frames instead of 2. Right, in the foxhole: SP-09 turns his head toward where the flash was, visible for 18 frames, one side lit orange. The flare dies; orange drains back to grey | HD-10i | Most viewers will miss the boy. Intended | Breathing, footsteps | None |

## Scene 5 — The Grenade (0:30)

Purpose: death without warning, and the viewer's control taken away at the moment they want it most. Sets: BG-05 Field C, then BG-06 Ground. Clicks do nothing for the whole scene.

| Time | Camera and layers | Hands | On screen | Sound |
| --- | --- | --- | --- | --- |
| 0:00.0 | Still running, full speed, BG-05, grey grade | HD-10i | Stick grenade PR-13 tumbles in from the right edge (8-frame rotation loop) and lands in the mud two steps ahead, in the running line. Small FX-11 splash | No warning cue; footsteps and breathing only |
| 0:00.5 | Slow motion 0.1. All sound drains to a heartbeat | HD-15 freeze and reach: muzzle sinks; the left hand (bandaged, sleeve bloodied) leaves the forend and rises to the chest; camera tilts down 10° to PR-14; fingers close over the pocket with the letter | Grenade fills the lower centre of the frame, smoke curling from its handle | AU-16 heartbeat, slowing |
| 0:02.0 | **T-FLASH** | Hands and rifle are gone after the flash and never return | White | Total silence. No explosion sound |
| 0:03.0 | BG-06 Ground: camera at mud level, whole frame rotated 70°. Snow falls toward the lens. Still grey grade | None | Mud, a frozen grass blade at the lens, sky filling the upper half | High thin ringing, slowly fading |
| 0:05–0:10 | **Surprise: colour returns, softly.** Not the warm lamplight of the kitchen and not liquid: a slow even fade to natural winter daylight colour over 5 s: pale blue sky, white snow, brown earth, the green of the grass blade. The world as it would look at peace | None | Foreground L5: the letter PR-02 has slipped half out of the pocket (pocket edge PR-14 at the frame corner). The crayon drawing is visible: house, tree, yellow star | Wind; a single distant bird |
| 0:07–0:14 | **FX-26 crayon run.** Snowflakes land on the drawing and melt into droplets. Each droplet makes the crayon colour run: red from the roof, green from the tree, in thin liquid streams off the paper edge into the mud. The reverse of Scene 1's bleed. The yellow star is drawn in heavy wax and does not run | None | Close on PR-02 | Very faint drip sounds |
| 0:10–0:14 | Background, at the foxhole (rotated view) | None | **Surprise:** SP-09 seen clearly for the first time: a boy of about 16, helmet too big, hands shaking. He looks at what he has done, then lowers himself out of sight | — |
| 0:15–0:20 | SP-07 medic close-up layer slides in over the camera | None | His face over the lens, mouth moving, no sound. His hand rests on Tommy's chest, then stops. He picks up the letter and holds it | Silence |
| 0:20–0:25 | FX-15 iris closes from the edges inward | None | Last thing visible, for 2 full seconds: the yellow star in the medic's hand, the only saturated colour left | Silence |
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

This is the complete build list: 7 background sets, 16 hand poses (in the Pose Library), 11 characters, 26 props, 28 effects, 8 text elements and 21 audio items. Gaps in numbering (SP-11, SP-12, FX-03, FX-16) are unused.

### Backgrounds (BG)

| ID | Set | Layers to paint | Grade states | Used in |
| --- | --- | --- | --- | --- |
| BG-00 | Black | — | — | S0, S6 |
| BG-01 | Kitchen panorama, 3200 px | L0 sky through roof; L1 field and L2 smoke through wall gap; L3 walls (wallpaper, stove, dresser, doorway at x 150, brick-edged gap); L4 table; L5 brick heap, horse | Halftone, warm colour, drained grey | S1–S3 |
| BG-02 | Farmyard | L0–L3 yard, house rear, gate; L4 cart, crater; L5 fence posts | Grey 15% + orange fire | S3 |
| BG-03 | Field A, 2600 px | L0–L2 sky, treeline, smoke; L3 field walls; L4 barn | Selective colour | S4 |
| BG-04 | Field B, crater field | L0–L3 sky, stumps; L4 craters | Selective colour | S4 |
| BG-05 | Field C | L0–L3 sky, distant silhouettes of bodies; L4 vehicle, wall, foxhole | Selective colour, flare-orange state | S4–S5 |
| BG-06 | Ground, mud level | Painted at 2× for 70° rotation: mud, grass blade, sky | Grey, then natural winter colour | S5 |

### Characters (SP)

All drawn at 100% scale = size at 5 m.

| ID | Character | Animations (frames) | Used in |
| --- | --- | --- | --- |
| SP-01 | US riflemen, 3 variants | Back-view run cycle 8; fall 6; prone 1 | S3, S4 |
| SP-02 | Sergeant | Waving-on loop 8 at the gate | S3 |
| SP-03 | Wounded GI at fence post | Breathing loop 8; reaching arm 6 | S4 |
| SP-04 | Machine-gunner, about 55, grey hair | Firing loop 4 (in window); slump 8; close dead pose with wedding ring | S4 |
| SP-05 | Karl, about 19 | Rise from crater 10; aim hold; fall back 8; dead pose on crater lip (face up, eyes closed) | S4 |
| SP-06 | Soldier on the wall | Crouch; rise and aim 8; drop 6 | S4 |
| SP-07 | Medic, red-cross armband | Kneeling work loop 12; look up and nod 14; close-up over camera: face, hand on chest, picking up letter | S4, S5 |
| SP-08 | Wounded man under the medic | Breathing loop 8 | S4 |
| SP-09 | Boy, about 16, oversized helmet | Head turn 18 (in foxhole); lower into cover 16; hand-shake loop 6 | S4, S5 |
| SP-10 | Bodies, 12 variants (6 US, 6 German) | Static, face down, no visible wounds | S3–S5 |
| SP-13 | GI humming at the graves | Kneel and push rifle into ground 20; hang helmet 10; look up 6 | S2, S3 |

### Props (PR)

| ID | Prop | States | Used in |
| --- | --- | --- | --- |
| PR-01 | Newspaper | Front page; inner spread; 6 page-turn shapes; corner curl | S1 |
| PR-02 | Annie's letter with crayon drawing | Folded; 2 unfold states; open; in pocket half-out; crayon-run states; in medic's hand | S1, S5 |
| PR-03 | C-ration tin with spoon | 1 | S1 |
| PR-04 | Crate | 1 | S1–S3 |
| PR-05 | Tin cup | Upright with coffee; tipped with liquid sheet; spilled | S1–S3 |
| PR-06 | M1 Garand leaning on crate | 1 (L7a rifle art is separate) | S3 |
| PR-07 | M1 helmet | Upside down on crate; lifted | S1, S3 |
| PR-08 | Family photo with pencil circle and "1943" | On wall; face down shattered | S2, S3 |
| PR-09 | Wooden horse, red, one leg broken | 1 + snowflake | S2 |
| PR-10 | Calendar, November 1944, days 1–9 crossed | On nail; torn, hanging mid-air | S2, S3 |
| PR-11 | Table set for four, child's chair | 1 + ash accumulation | S2 |
| PR-12 | Brass casing | 10-frame spin | S4 |
| PR-13 | Stick grenade | 8-frame tumble; lying in mud, smoking | S5 |
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
| FX-20 | Ash flakes, with smear-on-hand state | S2, S3 |
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
| AU-03 | Page turn | S1 |
| AU-04 | Paper unfold | S1 |
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
- [ ] Implement T-FLASH, T-SMOKE, T-MUZZLE, T-BLACK and the input rules (click, hover 1 s, auto timers)
- [ ] Block out all scenes with grey boxes and placeholder audio; time the full film against the 4:48 runtime

### Phase 2 — Hands (most screen time)

- [ ] Draw the hand and sleeve base art on L7a–L7d, including the bandage, watch and ash streak
- [ ] Animate HD-01 to HD-15 and HD-10i; check every pose at running speed and in slow motion

### Phase 3 — Sets and characters

- [ ] Paint BG-01 to BG-06 in full colour (grades are applied on top later)
- [ ] Draw SP-01 to SP-13 and all props PR-01 to PR-26
- [ ] Place every L4 element at its stated distance z and test the run timing past each one

### Phase 4 — Colour arc and surprises

- [ ] FX-17 halftone grade and FX-19 liquid colour bleed (Scene 1)
- [ ] Interior / exterior grade split and FX-20 ash smear (Scene 2)
- [ ] FX-21 frozen cluster, FX-22 colour drain, FX-28 dust surge (Scene 3)
- [ ] Selective-colour grade, FX-23 ink bloom, FX-24 crows, FX-25 embers, FX-29 tracers, FX-10 flare lighting (Scene 4)
- [ ] Natural-colour return, FX-26 crayon run, FX-15 iris (Scene 5)
- [ ] FX-27 star draw and card timing (Scene 6)

### Phase 5 — Sound and final checks

- [ ] Record or source AU-01 to AU-21; mix so the three silences (after Shot 1, the grenade, the ending) are true silence
- [ ] Viewer test without clicking: film must play start to finish on timers alone, under 5:00
- [ ] Viewer test clicking everything: letter sequence and end cards must not be skippable below their minimums
- [ ] Check that no game UI appears anywhere and that no close-up shows wounds
