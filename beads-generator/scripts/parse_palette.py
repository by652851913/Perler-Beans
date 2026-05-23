"""Parse Mard 221.csv → palette.json with validated, clean color data."""
import csv
import json
import os
import sys

def parse_rgb(rgb_str: str) -> list[int] | None:
    """Parse '250,245,205' → [250, 245, 205]. Returns None on failure."""
    parts = [p.strip() for p in rgb_str.split(",")]
    if len(parts) != 3:
        return None
    try:
        vals = [int(p) for p in parts]
    except ValueError:
        return None
    if not all(0 <= v <= 255 for v in vals):
        return None
    return vals

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "..", "data")
    csv_path = os.path.join(data_dir, "Mard 221.csv")
    json_path = os.path.join(data_dir, "palette.json")

    if not os.path.exists(csv_path):
        print(f"ERROR: CSV not found at {csv_path}")
        sys.exit(1)

    colors = []
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            color_id = row.get("色号", "").strip()
            name = row.get("名称", "").strip()
            hex_val = row.get("HEX 值", "").strip()
            rgb_raw = row.get("RGB 值", "").strip()

            if not color_id or not name:
                continue

            rgb = parse_rgb(rgb_raw)
            if rgb is None:
                print(f"  SKIP {color_id} ({name}): invalid RGB '{rgb_raw}'")
                continue

            colors.append({
                "id": color_id,
                "name": name,
                "hex": hex_val if hex_val.startswith("#") else f"#{hex_val}",
                "rgb": rgb,
            })

    if len(colors) == 0:
        print("ERROR: No valid colors parsed!")
        sys.exit(1)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(colors, f, ensure_ascii=False, indent=2)

    print(f"Parsed {len(colors)} colors → {json_path}")

if __name__ == "__main__":
    main()
