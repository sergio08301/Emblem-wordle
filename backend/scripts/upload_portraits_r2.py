"""
Portrait Uploader to Cloudflare R2
====================================
Uploads all .png files from a local folder to a Cloudflare R2 bucket.

Usage:
  python upload_portraits_r2.py --portraits portraits/

Requirements:
  pip install boto3
"""

import argparse
import os
import ssl
import certifi
import urllib3
from urllib3.util import ssl_ as urllib3_ssl
import boto3
from botocore.exceptions import ClientError
from pathlib import Path
from dotenv import load_dotenv

# Fix SSL handshake failure on Python 3.13 / Windows
_original_context = urllib3_ssl.create_urllib3_context
def _patched_context(*args, **kwargs):
    ctx = _original_context(*args, **kwargs)
    ctx.set_ciphers('DEFAULT:@SECLEVEL=1')
    return ctx
urllib3_ssl.create_urllib3_context = _patched_context
urllib3.disable_warnings()

load_dotenv()

ACCOUNT_ID    = os.getenv("R2_ACCOUNT_ID")
ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
SECRET_KEY    = os.getenv("R2_SECRET_ACCESS_KEY")
BUCKET        = "fe-guess-assets"

def upload_portraits(portraits_dir: str):
    if not all([ACCOUNT_ID, ACCESS_KEY_ID, SECRET_KEY]):
        print("ERROR: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID o R2_SECRET_ACCESS_KEY no encontrados en .env")
        return

    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=ACCESS_KEY_ID,
        aws_secret_access_key=SECRET_KEY,
        region_name="auto",
        verify=certifi.where(),
    )

    portraits_path = Path(portraits_dir)
    images = list(portraits_path.glob("*.png"))
    print(f"\nUploading {len(images)} portraits to R2 bucket '{BUCKET}'...\n")

    uploaded, skipped, failed = 0, 0, 0

    for i, image_path in enumerate(images, 1):
        file_name = image_path.name
        try:
            s3.head_object(Bucket=BUCKET, Key=file_name)
            print(f"  [{i}/{len(images)}] [SKIP] {file_name} — already in bucket")
            skipped += 1
            continue
        except ClientError:
            pass

        try:
            print(f"  [{i}/{len(images)}] Uploading {file_name}...")
            s3.upload_file(
                str(image_path),
                BUCKET,
                file_name,
                ExtraArgs={"ContentType": "image/png"},
            )
            print(f"    ✓ Done")
            uploaded += 1
        except Exception as e:
            print(f"    ✗ Failed: {e}")
            failed += 1

    print("\n" + "=" * 50)
    print(f"Done! {uploaded} uploaded, {skipped} already existed, {failed} failed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload portraits to Cloudflare R2.")
    parser.add_argument("--portraits", default="portraits", help="Folder with portrait images")
    args = parser.parse_args()
    upload_portraits(args.portraits)
