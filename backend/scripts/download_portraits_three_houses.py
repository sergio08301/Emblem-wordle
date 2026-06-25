"""
Fire Emblem Portrait Downloader — Three Houses fix
====================================================
Downloads missing portraits for Three Houses characters using fe16a code.

Usage:
  python download_portraits_three_houses.py --input characters.csv --output portraits/

Requirements:
  pip install requests pandas
"""

import argparse
import time
import re
import unicodedata
from pathlib import Path

import requests
import pandas as pd


WIKI_API = "https://fireemblemwiki.org/w/api.php"


def clean_name(name: str) -> str:
    name = re.sub(r'\s*\(.*?\)', '', name).strip()
    name = name.replace("'", "")
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    return name.lower().replace(" ", "_")


def fetch_image_url(filename: str) -> str | None:
    params = {
        "action": "query",
        "titles": f"File:{filename}",
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json",
    }
    try:
        response = requests.get(WIKI_API, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            if page.get("pageid", -1) == -1:
                return None
            imageinfo = page.get("imageinfo", [])
            if imageinfo:
                return imageinfo[0].get("url")
    except requests.RequestException as e:
        print(f"    API error for {filename}: {e}")
    return None


def download_image(url: str, output_path: Path) -> bool:
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        output_path.write_bytes(response.content)
        return True
    except requests.RequestException as e:
        print(f"    Download error: {e}")
        return False


def process_three_houses(input_csv: str, output_dir: str):
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_csv)

    # Filter only Three Houses characters
    three_houses = df[df["game"].str.contains("Three Houses", na=False)]
    print(f"\nFound {len(three_houses)} Three Houses characters...\n")

    downloaded, skipped, failed = 0, 0, 0
    not_found = []

    for _, row in three_houses.iterrows():
        name = str(row["name"]).strip()
        local_filename = f"{clean_name(name)}.png"
        local_path = output_path / local_filename

        if local_path.exists():
            print(f"  [SKIP] {name} — already exists")
            skipped += 1
            continue

        wiki_filename = f"Portrait_{clean_name(name)}_fe16a_cyl.png"
        print(f"  [fe16a] {name} — trying '{wiki_filename}'...")

        image_url = fetch_image_url(wiki_filename)

        if not image_url:
            print(f"    ✗ Not found")
            not_found.append(name)
            failed += 1
        else:
            success = download_image(image_url, local_path)
            if success:
                print(f"    ✓ Saved as {local_filename}")
                downloaded += 1
            else:
                failed += 1

        time.sleep(0.5)

    print("\n" + "=" * 50)
    print(f"Done! {downloaded} downloaded, {skipped} already existed, {failed} not found.")

    if not_found:
        print(f"\nStill missing ({len(not_found)}):")
        for n in not_found:
            print(f"  - {n}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Three Houses portraits using fe16a code.")
    parser.add_argument("--input", required=True, help="Path to your characters CSV file")
    parser.add_argument("--output", default="portraits", help="Folder to save portraits (default: portraits/)")
    args = parser.parse_args()

    process_three_houses(args.input, args.output)
