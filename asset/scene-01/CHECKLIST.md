# Scene 1 — Breakfast asset checklist

This checklist covers Scene 1. Source: [Scene 1 production specification](../../doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md#scene-1--breakfast-045), [hand pose library](../../doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md#hand-and-rifle-pose-library), and [master inventory](../../doc/Home%20by%20Christmas%20%E2%80%94%202.5D%20Production%20Script.md#master-asset-list).

Checked sample items mean a static image exists, not that the complete production asset or animation is finished. Each required production state is tracked separately. Use the [AGENTS.md style prompt](../../AGENTS.md).

## Presentation rule

Present Scene 1 with generated still images and programmatic animation. Hands appear only in the bandage and pocket-contact inserts. Keep fingers fixed. Use crops, masks, object movement, sound and motivated cuts for routine handling.

The newspaper inner spread, page-turn drawings, catching pose, unfolding sequence, thumb tremor and visible tuck animation are no longer required. They are removed from this checklist, not marked complete.

## Completed image assets

All six selected image files below exist on disk. These checkmarks record completed static samples. Production preparation and scene assembly remain in the unchecked sections.

- [x] Tommy's hands/sleeves static sample — [shared asset](../tommy-hands-sleeves-v1.png).
- [x] PR-02 open letter, drawing and yellow star static sample — [shared asset](../annies-letter-v1.png).
- [x] PR-01 newspaper front-page sample — [selected cutout](PR-01-newspaper-front-v2.png).
- [x] PR-03 opened C-ration tin with standing spoon sample — [generated sample](PR-03-ration-tin-spoon-v1.png).
- [x] FX-17 supporting newsprint/halftone texture sample — [generated sample](FX-17-newsprint-texture-v1.png).
- [x] FX-19 supporting liquid colour-spread mask sample — [generated sample](FX-19-colour-spread-mask-v1.png).

## Completed text preparation

- [x] TX-01 exact specified newspaper text recorded — [TX-01-newspaper-text.md](TX-01-newspaper-text.md). Final typesetting and the unspecified casualty-list line remain unfinished.

The steam and dust below were covered broadly by the shared atmosphere entry. They are now explicit requirements. Audio was not included in the shared visual checklist; it is listed below rather than marked generated.

Generated with the built-in image_gen tool using the recorded style. [Exact generation prompts](prompts.json); [newspaper cutout edit prompt](newspaper-edit-prompt.txt). V1 newspaper is retained as the original sample; V2 is the selected cutout. Newspaper glyph placement and punctuation still need comparison with the authored TX-01 strings. The FX-17 sample is not a verified seamless tile or a complete grade; FX-19 is a still shape reference, not the timed host-specific reveal.

## Background and set dressing

- [ ] BG-01 kitchen master and Scene 1 crop: initially conceal all damage behind the newspaper and framing.
- [ ] BG-01 separate sky/openings, distant field/smoke, walls/doorway, table and foreground layers; keep one layout for subsequent kitchen scenes.
- [ ] BG-01 warm-colour base and above-left light beam, with separate opening halftone treatment.
- [ ] PR-04 crate, separate foreground prop.
- [ ] PR-05 tin cup upright with coffee; separate from FX-12 steam.
- [ ] PR-07 M1 helmet upside down on crate.
- [ ] PR-23 intact-looking lace curtain edge at frame left; separate from its broken-wall surroundings.

## Newspaper and ration tin production states

- [ ] Prepare exact TX-01 typography and camera margins on the existing PR-01 newspaper sample.
- [ ] PR-01 paper-edge crop for T-PAPER. Move it across the lens and conceal the cut during full coverage.
- [ ] PR-03 static tin/spoon placement on the crate. Play the spoon-scrape sound during black and the opening pull-back.

## Hand inserts and staging cues

- [ ] Prepare the cropped bandage state and pocket-contact state from the existing hand art. Verify anatomical handedness and bandage/watch placement.
- [ ] Separate the visible left-hand insert, sleeve, paper and pocket masks. No right-hand animation is required in Scene 1.
- [ ] HD-01 programmatic newspaper breathing sway, with all hands below frame.
- [ ] HD-02 T-PAPER transition at 0:10–0:17, with no visible page pinch or turn.
- [ ] HD-03 folded-letter hold on the crate, with no catch or bounce.
- [ ] HD-04 open-letter/bandage insert at 0:17–0:33. Hold the fingers fixed during the colour reveal.
- [ ] HD-05 concealed letter exit and cut to the secured pocket at 0:33–0:39.
- [ ] HD-06 one cropped contact state at 0:39–0:42. Apply a slight whole-layer settle, then hold for 3 s.
- [ ] HD-07 cut back to the warm crate/curtain framing at 0:42, with no hands visible.

Tommy's rifle is picked up in Scene 3, so the existing rifle trial is not a Scene 1 requirement.

## Letter and pocket

- [ ] PR-02 folded-paper crop or plane from the existing paper art, for the crate insert.
- [ ] PR-02 matched folded/open states for T-INSERT. Connect them with AU-04 across the cut.
- [ ] PR-02 separate paper, red-roof house, green tree and yellow-star layers for the colour reveal.
- [ ] PR-02 static open-letter placement on the crate, with the bandaged palm at its lower edge.
- [ ] PR-02 programmatic movement below the crop, with any supporting hand concealed.
- [ ] PR-14 clean jacket chest strip: left breast pocket, flap, button and dog-tag chain.
- [ ] PR-14 secured-letter state and occlusion masks for the pocket-contact insert. No visible insertion gesture.
- [ ] TX-02 final authored letter wording and consistent child's-pencil lettering; sample closing text is not a complete letter.

## Effects and compositing

- [ ] FX-12 coffee steam loop.
- [ ] FX-18 dust-mote cluster moving in the above-left light beam.
- [ ] FX-17 dynamic whole-frame halftone grade: paper fibre, ink bleed and 2–6 px dot-size behaviour from the script; a static texture alone does not complete this.
- [ ] FX-19 animated colour bleed at 0:21–0:33: yellow star, red roof, green tree, paper folds, the still bandage insert, then L5 through L0.
- [ ] FX-19 host-specific reveal masks with 0.5 s background layer delays. Keep the fully coloured letter readable for at least 3 s.
- [ ] FX-13 opening blur from 100% to 0 during the pull-back; implement rather than generate another prop image.
- [ ] Opening black/fade-in and held-prop/world colour-grade separation.

## Audio

- [ ] AU-01 spoon scraping tin.
- [ ] AU-02 distant artillery rumble.
- [ ] AU-03 paper movement across T-PAPER, with no visible page-turn gesture.
- [ ] AU-04 unfolding sound across the folded/open insert cut.
- [ ] AU-05 faint humming that connects to the following scenes.
- [ ] AU-19 soft draught.
- [ ] Unnumbered beat cues: soft placement tap, warm tone under colour bleed, paper/fabric rustle and one pocket-contact tap. No new AU IDs assigned.

## Scene assembly and verification

- [ ] Match HD staging cues, props and FX timing to the 0:45 scene cap. Frame counts represent playback, not new drawings.
- [ ] Test newspaper pull-back from 300% to 100% and legibility of the headline.
- [ ] Test mouse drift without revealing damaged parts of the kitchen too early.
- [ ] Verify the colour reveal and readable letter hold complete before the concealed exit and pocket cut.
- [ ] Verify clicks before 0:42 cannot skip or accelerate the sequence. Allow advance after the 3 s pocket hold.
- [ ] Verify T-PAPER and T-INSERT conceal handling and state changes without exposing fingers or damaged kitchen areas.
- [ ] Verify only the bandage insert and pocket contact show hands in Scene 1.
- [ ] Confirm all required layers are separately usable; no static preview is mistaken for a finished animation.
