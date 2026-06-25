"""
Portrait Uploader to Supabase Storage
=======================================
Uploads all .png files from a local folder to a Supabase Storage bucket.
Reads credentials from a .env file in the same directory.

Usage:
  python upload_portraits.py --portraits portraits/

Requirements:
  pip install supabase python-dotenv
"""

import argparse
from pathlib import Path
from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SECRET_KEY")
BUCKET = "portraits"


def upload_portraits(portraits_dir: str):
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("ERROR: SUPABASE_URL or SUPABASE_SECRET_KEY not found in .env")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    portraits_path = Path(portraits_dir)
    images = list(portraits_path.glob("*.png"))

    print(f"\nUploading {len(images)} portraits to Supabase bucket '{BUCKET}'...\n")

    uploaded, skipped, failed = 0, 0, 0

    for image_path in images:
        file_name = image_path.name

        try:
            existing = supabase.storage.from_(BUCKET).list()
            existing_names = [f["name"] for f in existing]
            if file_name in existing_names:
                print(f"  [SKIP] {file_name} — already in bucket")
                skipped += 1
                continue
        except Exception:
            pass

        try:
            with open(image_path, "rb") as f:
                print(f"  Uploading {file_name}...")
                supabase.storage.from_(BUCKET).upload(
                    path=file_name,
                    file=f,
                    file_options={"content-type": "image/png"}
                )
            print(f"    ✓ Done")
            uploaded += 1
        except Exception as e:
            print(f"    ✗ Failed: {e}")
            failed += 1

    print("\n" + "=" * 50)
    print(f"Done! {uploaded} uploaded, {skipped} already existed, {failed} failed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload portraits to Supabase Storage.")
    parser.add_argument("--portraits", default="portraits", help="Folder with portrait images")
    args = parser.parse_args()

    upload_portraits(args.portraits)
