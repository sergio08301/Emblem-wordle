import csv
import json
from pathlib import Path

ARRAY_SEP = "|"


def parse_array(value: str) -> list[str]:
    return [v.strip() for v in value.split(ARRAY_SEP) if v.strip()]


def convert(csv_path: Path, json_path: Path) -> None:
    characters = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            characters.append({
                "name": row["name"].strip(),
                "portrait_url": row["portrait_url"].strip() or None,
                "game": parse_array(row["game"]),
                "gender": parse_array(row["gender"]),
                "weapon": parse_array(row["weapon"]),
                "starting_class": parse_array(row["starting_class"]),
                "movement_type": parse_array(row["movement_type"]),
                "hair_color": parse_array(row["hair_color"]),
                "promotion_tier": row["promotion_tier"].strip(),
                "is_active": row["is_active"].strip().upper() == "TRUE",
            })

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"Converted {len(characters)} characters to {json_path.name}")


if __name__ == "__main__":
    scripts_dir = Path(__file__).parent
    convert(
        csv_path=scripts_dir / "characters.csv",
        json_path=scripts_dir / "characters.json",
    )
