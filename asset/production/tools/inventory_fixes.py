"""Phase 3 inventory: v2 corrections from the script coverage audit (2026-10-11).

Same tuple layout as inventory_specs.SPECS. A slug ending in _vN sets the output
version explicitly; each fix uses its v1 as a continuity reference and keeps v1 on disk.
"""

from inventory_specs import HANDS, JACKET, LETTER, MEDIC

V1 = {
    "k4": "hands/HD-K4_hand-left-flat-press_v1.png",
    "k3": "hands/HD-K3_hand-left-palm-bandaged_v1.png",
    "crow": "effects/FX-24_crow-parts_v1.png",
    "bg01": "backgrounds/BG-01_kitchen_L3-walls_v1.png",
    "bg02": "backgrounds/BG-02_farmyard_v1.png",
    "bg03": "backgrounds/BG-03_field-a_v1.png",
    "bg04": "backgrounds/BG-04_field-b-crater-field_v1.png",
    "sp03": "characters/SP-03_wounded-gi_fence-post_v1.png",
    "pr14": "props/PR-14_jacket-chest_letter-half-out_v1.png",
    "sp07": "characters/SP-07_medic_closeup-face_v1.png",
}

SPECS_FIX = [
    (3, "HD-K4", "hands", "hand-left-flat-press_v2", "cutout",
     "Tommy's LEFT hand only, seen from his own first-person view, back of the hand toward camera, "
     "fingers flat and together pointing up and slightly right as if pressing a breast pocket. "
     "Anatomy check: for a left hand with its back to camera the THUMB is on the RIGHT side of the "
     "image, little finger on the left. Dirty field-dressing bandage wraps around the palm and shows "
     "at the hand edges, canvas-strap wristwatch, M1943 olive sleeve with buttoned cuff tab and wool "
     "knit cuff, entering from the bottom edge. Same skin, bandage and watch as the references",
     [V1["k3"], V1["k4"], HANDS]),
    (3, "FX-24", "effects", "crow-parts_v2", "fx",
     "Crow sprite parts, spaced apart with clear gaps: three black crow bodies IN FLIGHT with NO wings "
     "attached (only small wing-root stubs at the shoulders), legs tucked, tail fanned: side view, "
     "three-quarter view, banking view. Nothing else in the image; wings exist separately",
     [V1["crow"]]),
    (3, "BG-01", "backgrounds", "kitchen_L3-walls_v2", "layer",
     "Same kitchen wall layer as reference with identical layout, but the doorway at the far left "
     "opens onto a dark unlit hallway that reads as near-black shadow; roof gap and wall gap stay "
     "fully transparent", [V1["bg01"]]),
    (3, "BG-02", "backgrounds", "farmyard_v2", "plate",
     "Same farmyard as reference, but ONLY the muddy yard ground, the rear of the stone farmhouse, the "
     "wooden yard gate and sky. Remove the cart, crates, fence posts and mortar crater entirely; "
     "those are separate sprites. Grey 15% grade", [V1["bg02"]]),
    (3, "BG-03", "backgrounds", "field-a_v2", "plate",
     "Same Field A as reference with low stone field walls, open farmland, treeline and smoke on the "
     "horizon. Remove the barn, every fence post and the foreground rocks; those are separate "
     "sprites. Near-monochrome grade", [V1["bg03"]]),
    (3, "BG-04", "backgrounds", "field-b-crater-field_v2", "plate",
     "Same crater field as reference with stumps, smaller distant craters and smoke, but the large "
     "central crater ahead and its fire are removed and replaced by plain churned mud. "
     "Near-monochrome grade", [V1["bg04"]]),
    (3, "SP-03", "characters", "wounded-gi_fence-post_v2", "cutout",
     "Same wounded GI as reference, seated with his back against an unseen post (post not drawn), "
     "held pose, one arm extended toward the camera asking for help, the reaching hand a simple fixed "
     "static silhouette with no finger detail, other arm in his lap", [V1["sp03"]]),
    (3, "PR-14", "props", "jacket-chest_letter-half-out_v2", "cutout",
     "Same jacket chest strip as reference with Annie's letter slipped half out of the breast pocket, "
     "unfolded enough that the crayon drawing reads clearly: red-roof house, green tree and yellow "
     "star; light blood stain near the pocket edge", [V1["pr14"], JACKET, LETTER]),
    (3, "SP-07", "characters", "medic_closeup-face_v2", "cutout",
     f"Same medic as reference, {MEDIC}, close-up face leaning over the camera from above, mouth "
     "CLOSED, concerned quiet eyes, held expression", [V1["sp07"]]),
]
