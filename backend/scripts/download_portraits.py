"""
Fire Emblem Portrait Downloader
================================
Reads a CSV with character data, fetches portrait URLs from the
Fire Emblem Wiki API, downloads the images, and saves them locally.

Usage:
  python download_portraits.py --input characters.csv --output portraits/

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


GAME_TO_FE_CODE = {
    "Shadow Dragon": "fe11",
    "New Mystery of the Emblem": "fe12",
    "Echoes: Shadows of Valentia": "fe15",
    "Genealogy of the Holy War": "fe04",
    "Thracia 776": "fe05",
    "The Binding Blade": "fe06",
    "The Blazing Blade": "fe07",
    "The Sacred Stones": "fe08",
    "Path of Radiance": "fe09",
    "Radiant Dawn": "fe10",
    "Awakening": "fe13",
    "Fates": "fe14",
    "Three Houses": "fe16",
    "Engage": "fe17",
}

WIKI_API = "https://fireemblemwiki.org/api.php"


def clean_name(name: str) -> str:
    """
    Strip parenthetical suffixes like '(Shadow Dragon)' or '(Fates)',
    remove apostrophes, strip accents, and lowercase.
    Examples:
      'Cain (Shadow Dragon)' -> 'cain'
      "L'Arachel"            -> 'larachel'
      'Scáthach'             -> 'scathach'
      'Céline'               -> 'celine'
    """
    # Remove anything in parentheses: "Cain (Shadow Dragon)" -> "Cain"
    name = re.sub(r'\s*\(.*?\)', '', name).strip()
    # Remove apostrophes: "L'Arachel" -> "LArachel"
    name = name.replace("'", "")
    # Strip accents: "Scáthach" -> "Scathach"
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    # Lowercase and replace spaces with underscores
    return name.lower().replace(" ", "_")


def get_games_by_chronological_order(game_field: str) -> list[str]:
    """Return games sorted chronologically by fe code number."""
    games = [g.strip() for g in game_field.split("|") if g.strip()]
    def sort_key(g):
        code = GAME_TO_FE_CODE.get(g, "fe99")
        return int(code.replace("fe", ""))
    games.sort(key=sort_key)
    return games


def build_wiki_filename(name: str, fe_code: str) -> str:
    """
    Build the wiki filename for a portrait.
    Example: 'Cain (Shadow Dragon)', 'fe11' -> 'Portrait_cain_fe11_cyl.png'
    """
    return f"Portrait_{clean_name(name)}_{fe_code}_cyl.png"


def fetch_image_url(filename: str) -> str | None:
    """Query the wiki API to get the direct CDN URL for a file."""
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
    """Download an image from a URL and save it to output_path."""
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        output_path.write_bytes(response.content)
        return True
    except requests.RequestException as e:
        print(f"    Download error: {e}")
        return False


def process_characters(input_csv: str, output_dir: str):
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_csv)
    results = []
    not_found = []

    print(f"\nProcessing {len(df)} characters...\n")

    for _, row in df.iterrows():
        name = str(row["name"]).strip()
        game_field = str(row["game"]).strip()

        games = get_games_by_chronological_order(game_field)
        local_filename = f"{clean_name(name)}.png"
        local_path = output_path / local_filename

        # Skip if already downloaded
        if local_path.exists():
            print(f"  [SKIP] {name} — already downloaded")
            results.append({"name": name, "portrait_url": str(local_path), "status": "already_exists"})
            continue

        # Try each game the character appears in, starting from the earliest
        image_url = None
        used_code = None
        tried_filenames = []

        for game in games:
            fe_code = GAME_TO_FE_CODE.get(game)
            if not fe_code:
                continue
            wiki_filename = build_wiki_filename(name, fe_code)
            tried_filenames.append(wiki_filename)
            print(f"  [{fe_code}] {name} — trying '{wiki_filename}'...")
            image_url = fetch_image_url(wiki_filename)
            if image_url:
                used_code = fe_code
                break
            time.sleep(0.3)

        if not image_url:
            print(f"    ✗ No portrait found for {name}")
            not_found.append({"name": name, "game": game_field, "tried": " | ".join(tried_filenames)})
            results.append({"name": name, "portrait_url": "", "status": "not_found"})
            continue

        success = download_image(image_url, local_path)
        if success:
            print(f"    ✓ Saved as {local_filename} (from {used_code})")
            results.append({"name": name, "portrait_url": str(local_path), "status": "downloaded"})
        else:
            results.append({"name": name, "portrait_url": "", "status": "download_error"})

        time.sleep(0.5)

    # Summary
    print("\n" + "=" * 50)
    downloaded = sum(1 for r in results if r["status"] == "downloaded")
    skipped = sum(1 for r in results if r["status"] == "already_exists")
    failed = len(not_found)

    print(f"Done! {downloaded} downloaded, {skipped} already existed, {failed} not found.")

    if not_found:
        print(f"\nCharacters with no portrait found ({len(not_found)}):")
        for nf in not_found:
            print(f"  - {nf['name']} ({nf['game']})")
            print(f"    Tried: {nf['tried']}")
        print("\nFor these, find the portrait manually on the wiki and download it.")

    # Save report
    report_path = output_path / "download_report.csv"
    pd.DataFrame(results).to_csv(report_path, index=False)
    print(f"\nFull report saved to: {report_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Fire Emblem portraits from the wiki.")
    parser.add_argument("--input", required=True, help="Path to your characters CSV file")
    parser.add_argument("--output", default="portraits", help="Folder to save portraits (default: portraits/)")
    args = parser.parse_args()

    process_characters(args.input, args.output)
