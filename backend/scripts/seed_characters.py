import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.character import Character


def seed() -> None:
    data_file = Path(__file__).parent / "characters.json"
    with open(data_file, encoding="utf-8") as f:
        characters_data = json.load(f)

    db = SessionLocal()
    try:
        added = 0
        updated = 0
        for data in characters_data:
            existing = db.query(Character).filter(Character.name == data["name"]).first()
            if existing:
                for key, value in data.items():
                    if key != "name":
                        setattr(existing, key, value)
                updated += 1
            else:
                db.add(Character(**data))
                added += 1
        db.commit()
        print(f"Done: {added} added, {updated} updated.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
