"""
CSV Portrait URL Updater
=========================
Updates the portrait_url column in your CSV with the public Supabase URLs.
Reads SUPABASE_URL from a .env file in the same directory.

Usage:
  python update_csv_urls.py --input characters.csv --output characters_final.csv

Requirements:
  pip install pandas python-dotenv
"""

import argparse
import unicodedata
from urllib.parse import quote
from dotenv import load_dotenv
import os
import pandas as pd

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
BUCKET = "portraits"


def build_portrait_url(name: str) -> str:
    filename = name.lower()
    # Strip accents: Céline -> celine, Chloé -> chloe, Scáthach -> scathach
    filename = unicodedata.normalize("NFD", filename)
    filename = "".join(c for c in filename if unicodedata.category(c) != "Mn")
    filename += ".png"
    # Only encode spaces as %20, leave parentheses as-is (matching Supabase behavior)
    encoded_filename = filename.replace(" ", "%20")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{encoded_filename}"


def update_urls(input_csv: str, output_csv: str):
    if not SUPABASE_URL:
        print("ERROR: SUPABASE_URL not found in .env")
        return

    df = pd.read_csv(input_csv)
    print(f"\nUpdating portrait_url for {len(df)} characters...")

    df["portrait_url"] = df["name"].apply(build_portrait_url)
    df.to_csv(output_csv, index=False)

    print(f"✓ Saved as {output_csv}")
    print(f"\nExample URLs (including special cases):")
    special = df[df['name'].str.contains(r'\(', regex=True)]
    for _, row in special.head(3).iterrows():
        print(f"  {row['name']} → {row['portrait_url']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update CSV with Supabase portrait URLs.")
    parser.add_argument("--input", required=True, help="Input CSV file")
    parser.add_argument("--output", default="characters_final.csv", help="Output CSV file")
    args = parser.parse_args()

    update_urls(args.input, args.output)
