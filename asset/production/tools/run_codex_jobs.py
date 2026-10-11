"""Generate project image assets with parallel `codex exec` sessions.

Usage: python run_codex_jobs.py [--workers 10] [--phase 1|2|all] [--dry-run]

Logic: builds jobs from inventory_specs (phase 1 checklist, phase 2 full script)
plus props-prompts.json, skips any job whose output PNG already exists, then runs
one Codex session per image in a thread pool. Each session generates one image
with Codex's built-in image tool and copies it to the target path. Outputs are
validated (PNG, alpha present for transparent kinds) and logged to
asset/production/codex-run-log.jsonl. Failed jobs are retried once.
"""

import argparse
import json
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from inventory_specs import SPECS  # noqa: E402
from inventory_specs_full import SPECS_FULL  # noqa: E402

ASSET = Path(__file__).resolve().parents[2]
REPO = ASSET.parent
LOG = ASSET / "production" / "codex-run-log.jsonl"
TRIALS = ["tommy-hands-sleeves-v1.png", "m1-garand-v1.png", "annies-letter-v1.png"]
PHASE1_PROPS = {"PR-05", "PR-07", "PR-08", "PR-10", "PR-23", "PR-17", "PR-20", "PR-22"}
STYLE = ("Non-realistic 2.5D wartime illustration with a simplified low-poly appearance. Use broad "
         "angular planes, clean polygonal silhouettes, restrained human proportions and economical "
         "facial features. Apply muted olive, khaki, grey-green, earth brown and subdued warm skin "
         "tones. Materials are matte, with sparse texture and two or three broad shading tones. Keep "
         "outlines subtle and helmet shadows simple. Build depth through overlapping, separately "
         "layered foreground, middle-ground and background artwork. Preserve each character’s "
         "silhouette, costume and proportions across poses. Keep the mood quiet, human and sombre.")
TAILS = {
    "cutout": "EXACTLY ONE isolated subject, no contact sheet, grid, text, caption, border or "
              "watermark. True transparent alpha background, no backdrop, no ground shadow, no "
              "painted checkerboard. Neutral reusable lighting, complete silhouette, generous padding.",
    "fx": "Isolated effect source on a true transparent alpha background, no scene, no text, no "
          "painted checkerboard. Neutral reusable lighting.",
    "layer": "Single wide parallax layer, landscape 3:2. Everything outside the described layer is "
             "true transparent alpha. No characters, no text, no painted checkerboard.",
    "plate": "Full-bleed opaque background plate, landscape 3:2, no characters, no text, no border.",
}
log_lock = threading.Lock()


def build_jobs(phase):
    """Return job dicts {id, out, kind, prompt, refs} for the requested phase ('1', '2', 'all')."""
    jobs = []
    for ph, sid, folder, slug, kind, subject, extra in SPECS + SPECS_FULL:
        prompt = f"{STYLE}\nScript ID {sid}. {subject}.\n{TAILS[kind]}"
        jobs.append(dict(phase=ph, id=sid, out=f"{folder}/{sid}_{slug}_v1.png", kind=kind,
                         prompt=prompt, refs=extra + TRIALS))
    props = json.loads((ASSET / "production" / "props-prompts.json").read_text(encoding="utf-8"))
    for p in props:
        ph = 1 if p["id"] in PHASE1_PROPS else 2
        jobs.append(dict(phase=ph, id=p["id"], out=f"props/{p['id']}_{p['slug']}_v1.png",
                         kind="cutout", prompt=p["prompt"], refs=list(TRIALS)))
    jobs.sort(key=lambda j: j["phase"])
    return [j for j in jobs if phase == "all" or str(j["phase"]) == phase]


def validate(job):
    """Return None if the output exists and meets its kind's alpha rule, else an error string."""
    path = ASSET / job["out"]
    if not path.exists():
        return "missing output"
    try:
        im = Image.open(path)
        im.load()
    except Exception as exc:  # corrupt or partial file
        return f"unreadable: {exc}"
    if job["kind"] != "plate" and (im.mode != "RGBA" or im.getextrema()[3][0] > 10):
        return f"no transparency (mode {im.mode})"
    return None


def run_job(job):
    """Run one Codex session for a job, retrying once; log and return (job, error)."""
    out = ASSET / job["out"]
    instruction = (
        "Generate exactly one image with your built-in image generation tool. The attached images "
        "are style and continuity references. Image prompt:\n<<<\n" + job["prompt"] + "\n>>>\n"
        f"Then save the generated PNG to `{out}` (create the folder if needed), preserving the alpha "
        "channel. If the generated image has a painted or solid background where transparency was "
        "requested, regenerate rather than post-processing. Do not create or modify any other file "
        "in the repository. Reply with only the saved path.")
    cmd = ["codex", "exec", "--skip-git-repo-check", "--dangerously-bypass-approvals-and-sandbox",
           "--ephemeral", "-C", str(REPO)]
    for ref in job["refs"]:
        cmd += ["-i", str(ASSET / ref)]
    err = "not run"
    for attempt in (1, 2):
        start = time.time()
        try:
            res = subprocess.run(cmd, input=instruction, capture_output=True, text=True,
                                 encoding="utf-8", errors="replace", timeout=900, shell=False)
            err = validate(job) or None
            if err and res.returncode:
                err += f"; exit {res.returncode}: {res.stderr[-300:]}"
        except subprocess.TimeoutExpired:
            err = "timeout"
        with log_lock, LOG.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(dict(out=job["out"], attempt=attempt, error=err,
                                     seconds=round(time.time() - start))) + "\n")
        print(f"[{'ok' if not err else 'FAIL'}] {job['out']} ({attempt}) {err or ''}", flush=True)
        if not err:
            break
    return job, err


def main():
    """Parse arguments, filter finished jobs, and run the pool."""
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=10)
    ap.add_argument("--phase", default="all")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-first", type=int, default=0,
                    help="skip N leading pending jobs still in flight from a previous runner")
    args = ap.parse_args()
    jobs = [j for j in build_jobs(args.phase) if validate(j)][args.skip_first:]
    print(f"{len(jobs)} jobs pending", flush=True)
    if args.dry_run:
        for j in jobs:
            print(j["phase"], j["out"], len(j["refs"]))
        return
    with ThreadPoolExecutor(args.workers) as pool:
        results = list(pool.map(run_job, jobs))
    failed = [j["out"] for j, e in results if e]
    print(f"done: {len(jobs) - len(failed)} ok, {len(failed)} failed", *failed, sep="\n")


if __name__ == "__main__":
    main()
