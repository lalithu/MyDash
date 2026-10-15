"""Create a Chrome Web Store upload ZIP from the shipped browser assets."""
import argparse
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('output', type=Path)
args = parser.parse_args()
manifest = json.loads((root / 'manifest.json').read_text())
assert manifest['manifest_version'] == 3
files = sorted(p for p in root.iterdir() if p.is_file() and
               (p.suffix in {'.js', '.html', '.css', '.png', '.json'} or p.name == 'LICENSE'))
assert all(not p.is_symlink() for p in files)
args.output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as package:
    for file in files:
        package.write(file, file.name)
print(f"Packaged MyDash {manifest['version']}: {len(files)} files -> {args.output}")
