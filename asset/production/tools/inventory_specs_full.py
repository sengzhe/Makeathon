"""Phase 2 inventory: animation kit plus remaining script assets.

Same tuple layout as inventory_specs.SPECS. Props already authored in
props-prompts.json are added by build_jobs.py, not listed here.

Animation-kit rules (project decision, 2026-10-11):
- First person. Hands appear only for story beats: bandage reveal, pocket
  touch, final reach. Routine handling sits below the frame edge or behind a cut.
- Motion comes from held poses plus whole-object transforms in the engine
  (translate, rotate, bob, jitter), not from drawn hand animation.
- Moving characters are split into rig parts with a stated pivot; static
  characters (bodies, falls, prone) stay single sprites.
"""

from inventory_specs import GI, GER, MEDIC, BOY, HUMMER, HANDS, LETTER, RIFLE, FIELD_C, KITCHEN, RIFLEMAN

NO_HANDS = "No hands visible anywhere in the image"
PART = ("Rig part for cutout animation: draw only this part, cleanly cut at the joint with a "
        "simple rounded overlap edge so it can rotate under the neighbouring part")
SLEEVE = ("19-year-old's hand, thin wrist, long fingers, chapped red knuckles, dirt in nail beds, "
          "M1943 olive drab sleeve with buttoned cuff tab and wool knit cuff")
BANDAGE = "palm wrapped in a dirty field-dressing bandage with a dried rust-brown stain, canvas-strap wristwatch"
MEDIC_REF = "characters/SP-07_medic_kneeling-work_v1.png"
BOY_REF = "characters/SP-09_boy_foxhole-head-turn_v1.png"
HUM_REF = "characters/SP-13_humming-gi_kneel-push-rifle_v1.png"

FIRST_PERSON = [
    ("HD-K1", "rifle-carry", "First-person run carry: M1 Garand forend, barrel and muzzle entering "
     f"diagonally from the lower right frame edge toward upper left, seen from behind the receiver. {NO_HANDS}; "
     "the rifle simply enters from below the frame edge. One reusable sprite; raise, lower and bob are engine rotations",
     [RIFLE]),
    ("HD-K2", "sight-picture", "First-person aim: dark out-of-focus rear peep sight ring filling the "
     "frame centre, sharp front sight post with two protective ears inside it, barrel top below. "
     f"{NO_HANDS}. Ring interior transparent", [RIFLE]),
    ("HD-K3", "hand-left-palm-bandaged", f"Left hand only, palm turned to camera, open and slightly "
     f"curled, {SLEEVE}, {BANDAGE}. Enters from the bottom edge. Story beat: bandage reveal", [HANDS]),
    ("HD-K4", "hand-left-flat-press", f"Left hand only, back of hand to camera, fingers flat and "
     f"together as if pressing on a breast pocket, {SLEEVE}, bandage wrap visible around the palm edge, "
     "wristwatch. Enters from the bottom edge. Story beats: pocket touch and final reach", [HANDS]),
]

RIGS = [
    # (id, slug, part description, pivot, refs)
    *[(f"SP-01", f"us-rifleman-{v}_rig-upper", f"Same rifleman variant {v} as reference, back view, upper "
       "body from belt to helmet, rifle held across the front so it is hidden by the body", "pivot: belt centre",
       [ref]) for v, ref in [("01", RIFLEMAN), ("02", "characters/SP-01_us-rifleman-02_run_v1.png"),
                             ("03", "characters/SP-01_us-rifleman-03_run_v1.png")]],
    *[(f"SP-01", f"us-rifleman-{v}_rig-legs-{k}", f"Same rifleman variant {v}, back view, legs only from "
       f"belt down, running {pose}", "pivot: belt centre", [ref])
      for v, ref in [("01", RIFLEMAN), ("02", "characters/SP-01_us-rifleman-02_run_v1.png"),
                     ("03", "characters/SP-01_us-rifleman-03_run_v1.png")]
      for k, pose in [("contact", "contact pose, stride wide"), ("passing", "passing pose, legs together")]],
    ("SP-07", "medic_rig-body", f"{MEDIC}, kneeling three-quarter side view, body without head, arms "
     "reaching down and forward so forearms end below a low foreground edge", "pivot: neck base", [MEDIC_REF]),
    ("SP-07", "medic_rig-head", f"Head and helmet of the same medic, neutral three-quarter view, neck "
     "stub included", "pivot: neck base (look up and nod)", [MEDIC_REF]),
    ("SP-09", "boy_rig-body", f"{BOY}, shoulders and chest only, as seen just above a sandbag rim, arms "
     "below the rim", "pivot: neck base; whole sprite slides down for lowering into cover", [BOY_REF]),
    ("SP-09", "boy_rig-head", f"Head of the same boy with his oversized helmet, three-quarter view toward "
     "camera, neck stub", "pivot: neck base (head turn)", [BOY_REF]),
    ("SP-13", "humming-gi_rig-body", f"{HUMMER}, kneeling side view, body without head, arms forward "
     "and low, forearms hidden behind a grave-marker rifle in the foreground", "pivot: neck base", [HUM_REF]),
    ("SP-13", "humming-gi_rig-head", "Head of the same GI, bare head, side view, neck stub",
     "pivot: neck base (look up)", [HUM_REF]),
    ("SP-02", "sergeant_rig-body", f"US sergeant, {GI}, sergeant stripes, standing at a gate, body "
     "without right arm", "pivot: right shoulder", [RIFLEMAN]),
    ("SP-02", "sergeant_rig-arm", "Right arm of the same sergeant raised high holding an M1 rifle up to "
     "wave men on, hand concealed behind the rifle stock", "pivot: right shoulder", [RIFLEMAN]),
]

SPECS_FULL = [
    (2, sid, "hands", slug, "cutout", desc, refs) for sid, slug, desc, refs in FIRST_PERSON
] + [
    (2, sid, "characters", slug, "cutout", f"{PART}. {desc}. {pivot}. {NO_HANDS}", refs)
    for sid, slug, desc, pivot, refs in RIGS
] + [
    (2, "PR-02", "props", f"annies-letter_{slug}", "cutout",
     f"Annie's letter, same paper, crayon house, tree and yellow star as reference. State: {desc}. "
     "No handwriting text; text is authored separately", [LETTER])
    for slug, desc in [
        ("folded", "folded in thirds, closed, slightly creased"),
        ("unfold-01", "first fold opened, tri-fold half open"),
        ("unfold-02", "second fold opening, nearly flat"),
        ("open-blank-text", "fully open and flat"),
        ("crayon-run", "wet with melted snow droplets, red and green crayon running in thin streams off the edge; yellow star intact"),
    ]
] + [
    (2, "PR-06", "props", "m1-garand_leaning-on-crate", "cutout",
     "The same M1 Garand leaning upright against the right side of a wooden crate",
     [RIFLE, "props/PR-04_crate_v1.png"]),
    (2, "BG-02", "backgrounds", "farmyard", "plate",
     "Farmyard, first-person view: muddy yard, rear of a stone farmhouse, wooden yard gate ahead, "
     "fence posts, smoking mortar crater at right with orange fire, grey 15% grade", [KITCHEN]),
    (2, "BG-03", "backgrounds", "field-a", "plate",
     "Field A, first-person view: open winter farmland, low stone field walls, treeline and smoke "
     "on horizon, a barn with a dark upper window 60 m ahead, near-monochrome grade", [FIELD_C]),
    (2, "BG-04", "backgrounds", "field-b-crater-field", "plate",
     "Field B, first-person view: shell-crater field, burned tree stumps, scattered debris, smoke, "
     "burning debris behind a crater ahead, near-monochrome grade", [FIELD_C]),
    (2, "BG-06", "backgrounds", "ground-mud-level", "plate",
     "Mud-level ground view: camera lying in mud, a frozen grass blade near the lens, mud plane, "
     "pale winter sky in the upper half, natural winter colours, snow falling", [FIELD_C]),
    (2, "SP-03", "characters", "wounded-gi_fence-post", "cutout",
     f"Wounded {GI}, slumped sitting against a fence post, held pose, arms in lap hidden behind "
     f"raised knees. {NO_HANDS}; breathing is an engine scale loop", [RIFLEMAN]),
    (2, "SP-04", "characters", "machine-gunner_firing", "cutout",
     "German machine-gunner about 55, grey hair, no helmet, uniform too big, behind an MG 42 on a "
     f"window ledge, front view, hands hidden behind the gun receiver. {NO_HANDS}", []),
    (2, "SP-04", "characters", "machine-gunner_slumped", "cutout",
     "Same grey-haired German machine-gunner slumped over a window sill, one arm hanging down; the "
     "hanging hand shows a plain gold wedding ring (story beat)", []),
    (2, "SP-05", "characters", "karl_aim", "cutout",
     f"Karl, {GER}, about 19, waist up, aiming a rifle straight at camera, rifle foreshortened so the "
     f"receiver covers his hands. {NO_HANDS}. Rising is an engine slide up from behind the crater lip", []),
    (2, "SP-05", "characters", "karl_dead-on-lip", "cutout",
     f"Karl, {GER}, about 19, lying face up on a crater lip, eyes closed, peaceful young face, arms "
     f"at sides out of view. {NO_HANDS}", []),
    (2, "SP-06", "characters", "wall-soldier_crouch", "cutout",
     f"{GER}, crouched low on top of a broken stone wall, side view. {NO_HANDS}", []),
    (2, "SP-06", "characters", "wall-soldier_aim", "cutout",
     f"{GER}, risen on a wall, aiming a rifle to the left, side-view silhouette, hands lost in the "
     f"silhouette. {NO_HANDS}. Dropping is an engine slide down", []),
    (2, "SP-08", "characters", "wounded-under-medic", "cutout",
     f"Wounded {GI}, lying on his back, chest bandaged, eyes half open. {NO_HANDS}", [RIFLEMAN]),
    (2, "FX-01", "effects", "muzzle-flash-tommy", "fx", "Rifle muzzle flash, bright faceted star burst", []),
    (2, "FX-02", "effects", "mg-muzzle-flash", "fx", "Machine-gun muzzle flash, small pulsing burst", []),
    (2, "FX-04", "effects", "mortar-flash", "fx", "Mortar impact white-orange flash bloom", []),
    (2, "FX-05", "effects", "plaster-rain", "fx", "Falling plaster flakes and dust streaks", []),
    (2, "FX-08", "effects", "smoke-wipe", "fx", "Dense full-frame grey smoke bank for a transition wipe", []),
    (2, "FX-10", "effects", "flare", "fx", "Bright orange illumination flare with small smoke trail", []),
    (2, "FX-21", "effects", "frozen-debris-cluster", "fx", "Cluster of brick, plaster fragments, ash and one glass shard hanging in air", []),
    (2, "FX-24", "effects", "crow-cluster", "fx", "Flock of black crows bursting upward, about 40 visible", []),
    (2, "FX-25", "effects", "ember-cluster", "fx", "Drifting orange ember sparks cluster", []),
    (2, "FX-26", "effects", "crayon-run-streams", "fx", "Thin red and green liquid crayon streams with droplets", [LETTER]),
    (2, "FX-27", "effects", "crayon-star", "fx", "Single yellow wax crayon star, five strokes, visible wax grain", [LETTER]),
    (2, "FX-29", "effects", "liquid-tracers", "fx", "Streaks of glowing orange liquid tracers with droplet tails", []),
]
