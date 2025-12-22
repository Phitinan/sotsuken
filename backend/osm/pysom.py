import json

# Load the GeoJSON file
with open("japan_all_lines.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

VALID_RAILWAYS = ["rail", "light_rail", "subway", "monorail", "tram"]

filtered_lines = []

for feature in data["features"]:
    props = feature.get("properties", {})
    geometry = feature.get("geometry", {})

    # Only keep valid railway types
    if props.get("railway") not in VALID_RAILWAYS:
        continue

    # Must be a LineString
    if geometry.get("type") != "LineString":
        continue

    # Must have a Japanese line name
    name_jp = props.get("name:ja") or props.get("name")
    if not name_jp:
        continue

    # Operator (optional)
    operator = props.get("operator") or props.get("operator:ja") or ""

    filtered_lines.append({
        "name": name_jp,
        "operator": operator,
        "coordinates": geometry.get("coordinates")
    })

# Save the filtered result
with open("japan_railways_filtered.json", "w", encoding="utf-8") as out:
    json.dump(filtered_lines, out, ensure_ascii=False, indent=2)

print(f"Saved {len(filtered_lines)} railway/tram/monorail/subway lines to japan_railways_filtered.json")
