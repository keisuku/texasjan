#!/usr/bin/env python3
"""Export the playable static surface, excluding experiments and rejected art."""
import argparse
import re
import shutil
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("output", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
out = args.output.resolve()
if out == root or root in out.parents:
    raise SystemExit("Export to a separate checkout or scratch output directory")
out.mkdir(parents=True, exist_ok=True)
runtime = ["index.html", "mahjong-score.js", "betting-engine.js", "betting-ai.js",
           "pot-settlement.js", "hand-strategy.js", "play-session.js",
           "play-experience.js", "play-experience.css", "skins/manifest.js"]
for name in runtime:
    target = out / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, target)
shutil.copytree(root / "assets", out / "assets", dirs_exist_ok=True)
text = (root / "index.html").read_text()
art = set(re.findall(r"\./((?:art|claude-handoff)/[^\s\"')]+\.(?:webp|png|jpg|jpeg))", text))
for name in art:
    target = out / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, target)
missing = []
for name in runtime:
    source = (root / name).read_text()
    for rel in re.findall(r"\./([^\s\"'()<>]+\.(?:js|css|webp|png|jpg|jpeg|svg))", source):
        if "${" in rel:
            continue
        if not (out / rel).is_file():
            missing.append((name, rel))
if missing:
    raise SystemExit("Unresolved runtime references: " + repr(missing))
files = [p for p in out.rglob("*") if p.is_file()]
print(f"Exported {len(files)} files, {sum(p.stat().st_size for p in files):,} bytes; runtime references resolved")
