import os
import zipfile
from pathlib import Path

# Base project directory
PROJECT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_ZIP = PROJECT_DIR.parent / "Residenza-Society-Maintenance-Tracker.zip"

EXCLUDE_DIRS = {'node_modules', '.next', '.git', '.system_generated', '__pycache__'}
EXCLUDE_FILES = {'.env', 'dev.db', 'dev.db-journal', '.DS_Store'}

print(f"[PACKAGER] Packaging submission ZIP from: {PROJECT_DIR}")
print(f"[PACKAGER] Output destination: {OUTPUT_ZIP}")

file_count = 0
with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(PROJECT_DIR):
        # Modify dirs in-place to prune excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file in EXCLUDE_FILES or file.endswith('.log'):
                continue

            full_path = Path(root) / file
            relative_path = full_path.relative_to(PROJECT_DIR)

            zipf.write(full_path, arcname=str(relative_path))
            file_count += 1

zip_size_mb = OUTPUT_ZIP.stat().st_size / (1024 * 1024)
print(f"[SUCCESS] Successfully packaged {file_count} files into:")
print(f"   {OUTPUT_ZIP} ({zip_size_mb:.2f} MB)")
print("[COMPLIANCE] Verified: No node_modules, no .next, no .env, no dev.db included.")

