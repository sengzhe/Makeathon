"""Asset inventory for parallel Codex image generation.

Each spec is (phase, id, folder, slug, kind, subject, extra_refs).
phase 1 = asset/CHECKLIST.md items, phase 2 = remaining script inventory.
kind: "cutout" (transparent isolated sprite), "layer" (transparent wide layer),
"plate" (opaque full-frame background), "fx" (transparent effect source).
Prop specs already authored in props-prompts.json are merged in by build_jobs.py.
"""

RIFLEMAN = "characters/SP-01_us-rifleman-01_run_v2.png"
JACKET = "props/PR-14_jacket-chest_clean_v1.png"
KITCHEN = "backgrounds/BG-01_kitchen-panorama_color_v1.png"
FIELD_C = "backgrounds/BG-05_field-c_color_v1.png"
HANDS = "tommy-hands-sleeves-v1.png"
LETTER = "annies-letter-v1.png"
RIFLE = "m1-garand-v1.png"

GI = ("US infantryman, December 1944, M1943 olive drab field jacket, M1 helmet with simple "
      "shadow, khaki trousers, canvas leggings, M1 Garand")
GER = ("German infantryman, December 1944, field-grey wool tunic, coal-scuttle M42 helmet, "
       "dark boots, Kar98k rifle")
MEDIC = ("US Army medic about 30, M1 helmet with red cross on white circle, red-cross armband "
         "on left sleeve, olive drab M1943 jacket, two medical pouches on belt, tired kind face, "
         "short stubble")
BOY = ("German soldier boy about 16, thin face, helmet visibly too big for him, oversized "
       "field-grey greatcoat")
HUMMER = ("US GI about 25, M1943 jacket, no helmet in hands at start, quiet expression, "
          "frost on shoulders")

SPECS = [
    # ---------- Phase 1: checklist ----------
    (1, "PR-14", "props", "jacket-chest_dusty", "cutout",
     "Jacket chest strip, dusty state: same left breast pocket flap, button and dog-tag chain as "
     "the reference, now coated in light grey plaster dust", [JACKET]),
    (1, "PR-14", "props", "jacket-chest_letter-half-out", "cutout",
     "Jacket chest strip, final state: same pocket, Annie's folded cream letter slipped half out "
     "of the breast pocket, yellow crayon star corner visible, light blood stain near the pocket edge",
     [JACKET, LETTER]),
    (1, "BG-01", "backgrounds", "kitchen_L0-sky", "plate",
     "Kitchen panorama layer L0: overcast winter sky gradient only, pale blue-grey, faint cloud "
     "planes, wide 3:1 panorama strip", [KITCHEN]),
    (1, "BG-01", "backgrounds", "kitchen_L1-L2-field-smoke", "layer",
     "Kitchen panorama layers L1-L2: distant grey fields, low treeline and three thin smoke "
     "columns, seen through a wall gap; transparent above the horizon sky area", [KITCHEN]),
    (1, "BG-01", "backgrounds", "kitchen_L3-walls", "layer",
     "Kitchen panorama layer L3: interior walls only, left to right: dark doorway to hallway, "
     "half-peeled floral wallpaper, stove, dresser with broken crockery, then collapsed wall with "
     "brick-edged gap. Roof gap and wall gap are fully transparent. No table, no props", [KITCHEN]),
    (1, "BG-01", "backgrounds", "kitchen_L5-brick-heap", "cutout",
     "Kitchen near-foreground L5: heap of broken bricks and plaster chunks, low and wide", [KITCHEN]),
    (1, "BG-05", "backgrounds", "field-c_L0-L1-sky-horizon", "plate",
     "Field C layers L0-L1: overcast winter sky with low treeline and distant smoke columns",
     [FIELD_C]),
    (1, "BG-05", "backgrounds", "field-c_L2-L3-far-field", "layer",
     "Field C layers L2-L3: far muddy snow field band with tiny distant silhouettes of fallen "
     "bodies and broken stumps; transparent sky", [FIELD_C]),
    (1, "BG-05", "backgrounds", "field-c_L4-ground", "layer",
     "Field C ground plane L4: muddy trampled snow, boot ruts and shell scars receding to the "
     "horizon, no props, no people; transparent sky", [FIELD_C]),
    (1, "SP-01", "characters", "us-rifleman-01_fall", "cutout",
     "Same rifleman as reference, back view, falling forward mid-stride, rifle slipping", [RIFLEMAN]),
    (1, "SP-01", "characters", "us-rifleman-01_prone", "cutout",
     "Same rifleman as reference, lying prone face down, rifle forward, seen from behind", [RIFLEMAN]),
    (1, "SP-01", "characters", "us-rifleman-02_run", "cutout",
     f"Rifleman variant 2: {GI}, taller and lanky, scarf at neck, back-view run", [RIFLEMAN]),
    (1, "SP-01", "characters", "us-rifleman-02_fall", "cutout",
     "Rifleman variant 2 (tall, lanky, scarf), back view, falling sideways", [RIFLEMAN]),
    (1, "SP-01", "characters", "us-rifleman-02_prone", "cutout",
     "Rifleman variant 2 (tall, lanky, scarf), prone face down seen from behind", [RIFLEMAN]),
    (1, "SP-01", "characters", "us-rifleman-03_run", "cutout",
     f"Rifleman variant 3: {GI}, stocky, pack and entrenching tool on back, back-view run",
     [RIFLEMAN]),
    (1, "SP-01", "characters", "us-rifleman-03_fall", "cutout",
     "Rifleman variant 3 (stocky, pack, entrenching tool), back view, knees buckling", [RIFLEMAN]),
    (1, "SP-01", "characters", "us-rifleman-03_prone", "cutout",
     "Rifleman variant 3 (stocky, pack, entrenching tool), prone face down seen from behind",
     [RIFLEMAN]),
    (1, "SP-07", "characters", "medic_kneeling-work", "cutout",
     f"{MEDIC}, kneeling in three-quarter side view, both hands pressing a bandage on an unseen "
     "wounded man below frame", []),
    (1, "SP-07", "characters", "medic_look-up-nod", "cutout",
     f"{MEDIC}, same kneeling pose, head raised looking toward camera with a small nod", []),
    (1, "SP-07", "characters", "medic_closeup-face", "cutout",
     f"{MEDIC}, close-up face leaning over the camera from above, mouth slightly open speaking, "
     "worried eyes, overcast sky behind not included", []),
    (1, "SP-07", "characters", "medic_hand-holding-letter", "cutout",
     "Medic's dirty hand and olive sleeve with red-cross armband edge, holding Annie's letter with "
     "the yellow crayon star facing camera", [LETTER]),
    (1, "SP-09", "characters", "boy_foxhole-head-turn", "cutout",
     f"{BOY}, head and shoulders above a sandbag rim, head turned toward camera, one side lit orange",
     [FIELD_C]),
    (1, "SP-09", "characters", "boy_lowering-into-cover", "cutout",
     f"{BOY}, half body, crouching down, shoulders sinking, frightened eyes", []),
    (1, "SP-09", "characters", "boy_hands-shaking", "cutout",
     f"{BOY}, waist-up front view, clearly seen, staring ahead in shock, both hands raised and "
     "trembling, rifle gone", []),
] + [
    (1, "SP-10", "characters", f"body-us-{i:02d}", "cutout",
     f"Fallen {GI}, lying still face down, no visible wounds, pose: {p}", [RIFLEMAN])
    for i, p in enumerate(["arms forward, rifle beside", "on side, knees bent", "one arm under body",
                           "helmet fallen off nearby", "legs crossed, half in snow",
                           "arm outstretched toward rifle"], 1)
] + [
    (1, "SP-10", "characters", f"body-de-{i:02d}", "cutout",
     f"Fallen {GER}, lying still face down, no visible wounds, pose: {p}", [])
    for i, p in enumerate(["arms forward, rifle beside", "on side, knees bent", "one arm under body",
                           "helmet fallen off nearby", "legs crossed, half in snow",
                           "arm outstretched toward rifle"], 1)
] + [
    (1, "SP-13", "characters", "humming-gi_kneel-push-rifle", "cutout",
     f"{HUMMER}, kneeling, pushing an M1 rifle bayonet-first into frozen ground", [RIFLE]),
    (1, "SP-13", "characters", "humming-gi_hang-helmet", "cutout",
     f"{HUMMER}, kneeling, hanging an M1 helmet on the upturned rifle stock", [RIFLE]),
    (1, "SP-13", "characters", "humming-gi_look-up", "cutout",
     f"{HUMMER}, kneeling beside the grave marker, head tilted up toward the sky", []),
    (1, "FX-07", "effects", "smoke-loop-01", "fx", "Drifting grey smoke column, soft angular planes", []),
    (1, "FX-07", "effects", "smoke-loop-02", "fx", "Low horizontal drifting smoke bank", []),
    (1, "FX-07", "effects", "smoke-loop-03", "fx", "Thin wispy rising smoke from a crater", []),
    (1, "FX-09", "effects", "fire-small", "fx", "Small orange fire, faceted flame shapes", []),
    (1, "FX-09", "effects", "fire-medium", "fx", "Medium orange fire with dark smoke base", []),
    (1, "FX-09", "effects", "fire-large", "fx", "Large vehicle fire, tall orange flames", []),
    (1, "FX-06", "effects", "snow-flakes", "fx", "Scattered white low-poly snowflakes, varied sizes", []),
    (1, "FX-20", "effects", "ash-flakes", "fx", "Scattered grey ash flakes, irregular shapes", []),
    (1, "FX-12", "effects", "coffee-steam", "fx", "Soft pale steam wisps rising from a cup, vertical", []),
    (1, "FX-18", "effects", "dust-motes", "fx", "Cluster of warm glowing dust motes in a light beam", []),
    (1, "FX-11", "effects", "mud-splash", "fx", "Brown mud splash burst with droplets, low wide", []),
    (1, "FX-28", "effects", "dust-surge", "fx", "Dense brown-grey dust cloud surging forward", []),
    (1, "FX-23", "effects", "sleeve-blood_01-point", "fx",
     "Small dark red point stain soaking into olive wool fabric, isolated stain only", [HANDS]),
    (1, "FX-23", "effects", "sleeve-blood_02-spread", "fx",
     "Dark red ink-like stain spreading in tendrils through fabric weave, isolated stain only", [HANDS]),
    (1, "FX-23", "effects", "sleeve-blood_03-full", "fx",
     "Full dark red bloodstain bloom across a forearm sleeve area, isolated stain only", [HANDS]),
]
