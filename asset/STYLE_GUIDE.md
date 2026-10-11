# Home by Christmas — common visual style

Status: art direction used for the limited three-asset static style trial in `trial/`. Complete layered masters and animation remain future work.

## Reference and evidence

Visual source: [the user's supplied screenshot](/Users/sengzhe/Project/makathon/asset/reference/soldier-style-reference.png), preserved unchanged.

Model link supplied by the user: [British & German Soldier on Sketchfab](https://sketchfab.com/3d-models/british-german-soldier-1f0d680ef8cf45f28acc32d2ff2d44a0). The page returned HTTP 403 during inspection. No source found for the model's topology, shader setup, texture resolution, creator attribution or reuse licence. The observations below describe the visible screenshot, not verified implementation details of the downloadable model.

## What to carry over from the screenshot

Every observation in this table is sourced to the [preserved reference image](/Users/sengzhe/Project/makathon/asset/reference/soldier-style-reference.png). The application column contains proposed production choices.

| Visible characteristic | Observation from reference | Application across the animation |
| --- | --- | --- |
| Low-poly appearance | Helmet rims, shoulders, jawlines and buttons have angular, segmented contours | Use a small number of deliberate planar shapes to describe all characters, props and architecture. |
| Simplified human forms | Broad shoulders, simple necks and faces; equipment reads through silhouette | Keep restrained, approximately human proportions; express age through silhouette, posture and a few face planes. |
| Sparse facial detail | Eyes are largely hidden by a broad shadow area; nose and mouth are small shape cues | Use economical facial features. Preserve visible eyes/eyebrows when needed for the boy's fear or medic's concern. |
| Muted colour | Khaki/taupe, deep grey-green, brown straps and muted warm skin dominate | Use a restrained earth palette as the neutral base; reserve stronger colour for scripted story beats. |
| Matte surfaces | Large areas appear evenly coloured, with little visible gloss or fine texture | Treat fabric, wood, metal and skin as graphic matte materials; distinguish them mainly through colour and shape. |
| Broad shading | Large dark/light areas describe the forms rather than intricate surface shading | Use two or three main tonal planes per material as a working rule, with separate scene-light overlays. |
| Quiet edges | Edges read mainly from silhouette and neighbouring colours, rather than thick black strokes | Avoid a heavy comic outline. Use thin, restrained edge accents only where readability needs them. |
| Detail economy | The visible framing emphasizes helmets, straps and buttons over small surface detail | Spend detail on recognizable equipment and story marks, not general texture density. |

## Reusable style description

> Non-realistic 2.5D wartime illustration with the visual character of a simplified low-poly model. Construct figures, objects and environments from broad angular planes, clean polygonal silhouettes and restrained human proportions. Use muted olive, khaki, grey-green, earth brown and warm subdued skin tones. Materials are matte, with sparse surface texture and broad flat shading, usually two or three tonal planes per material. Faces are economical: simple nose and mouth shapes, minimal eye detail, and broad helmet shadows; retain just enough expression to communicate fear, exhaustion and care. Keep outlines subtle. Render depth through overlapping shapes, restrained perspective and separate foreground, middle-ground and background layers for parallax. Preserve the subject's established silhouette, costume, proportions and colour assignments across every pose and shot. Keep scene lighting, atmosphere, damage and colour grades on separate layers where possible. The mood is quiet, human and sombre.

This paragraph is a proposed adaptation of the [reference image](/Users/sengzhe/Project/makathon/asset/reference/soldier-style-reference.png) to the script's [layered production pipeline](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:75). It does not require actual 3D geometry: consistent layered drawings can use this visual language.

## Append an asset-specific brief

Use the style paragraph above, then specify:

> Subject: [script ID and description]. View: [required camera angle]. Pose/state: [one named state]. Preserve: [identity, equipment, proportions and story marks]. Deliver: [separate parts or background layers]. Lighting: neutral diffuse base, with designated scene-light overlays. For character/prop cutouts, transparent background, full intended silhouette, no ground or scenery baked into the cutout. For sets, supply separate opaque or transparent layers as appropriate. No captions, watermarks or invented lettering.

For the later animation pass, use the approved master art as a reference, then request the script's required pose/state. Avoid rebuilding an identity from a text-only prompt each time. This is a workflow recommendation, not a guarantee of output consistency.

## Boundaries

- Avoid photographic skin, pores, glossy plastic, shiny armour, cinematic realism, dense texture noise, exaggerated cartoon heads, anime styling and heavy black contours.
- The reference informs rendering style; the script defines the subject. Tommy uses the script's US M1943 jacket and M1 Garand rather than the left reference soldier's costume. [Costume spec](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:141).
- Simplify chapped knuckles, dirt, scratches and cloth grain into a few legible marks. Preserve the bandage, watch, right-hand ash streak and left-sleeve injury. [Hand details](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:140), [ash](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:226), [injury](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:275).
- Paper and crayon are deliberate material exceptions: retain visible wax grain, pencil marks and paper tooth where the story requires them. Keep their texture contained to those surfaces. [Ending star treatment](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:316).
- Keep exact letter/newspaper/calendar text as separate authored overlays. Reuse the same handwriting reference for Annie's letter and closing line. [Text list](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:419).

## Scene colour arc, applied over the common style

The following treatments come from the script rather than the Sketchfab screenshot.

| Scene | Treatment | Source |
| --- | --- | --- |
| S1 | Begin in black-and-white newsprint halftone. Yellow star appears first, followed by the drawing's red/green and warm colour spreading into the room. | [Breakfast colour bleed](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:186). |
| S2 | Warm interior; cold blue-grey visible through the ruined wall and roof. | [Interior/exterior split](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:228). |
| S3 | Colour drains toward the blast; the world ends at 15% saturation, with orange fire retained. | [Mortar colour drain](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:244). |
| S4 | Near-monochrome, nominally 10% saturation, with orange fire/flare and red blood permitted; the flare briefly floods the scene orange. | [Field grade](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:259), [flare](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:279). |
| S5 | Start grey. After the blast, softly restore natural winter colour; red and green crayon run, while the yellow star survives. | [Natural colour return and crayon run](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:294). |
| S6 | Black and white cards; the yellow crayon star briefly returns, then loses colour. | [Ending](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:305), [star draw](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:316). |

## 2.5D delivery recommendations

- Characters and props: transparent cutouts or layered masters. Keep hands, sleeves, rifle, sling and held items independently addressable.
- Sets: separate sky, horizon, distant scenery, structures, ground objects and near occluders. Paint hidden margins behind foreground objects so parallax does not expose missing artwork.
- Keep the same scale convention for ground-plane sprites, which the script defines at 5 m. [Sprite scaling](/Users/sengzhe/Project/makathon/doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md:104).
- Base art should support neutral, warm and flare-lit states. Add light and grade layers rather than regenerating the subject for each colour treatment.
- Match the script's required views; no full 360-degree character turnaround is proposed at this stage.

## First validation, after generation is authorized

The user selected only Tommy's hands/sleeves, his rifle, and Annie's letter/star for the first trial. Those three static previews are saved in `trial/`. Medic, boy and environment trials have not been generated. Before final production, compare the selected images at intended screen size and resolve texture density, handedness, paper folds and layer separation.
