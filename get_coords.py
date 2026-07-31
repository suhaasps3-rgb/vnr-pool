import requests
import json
import time

locations = ["kphb", "jntu hyderabad", "ameerpet", "nampally", "secunderabad", "kukatpally", "pragathi nagar", "miyapur", "dilsukhnagar", "lb nagar", "madhapur", "hitech city", "gachibowli", "kondapur"]

out = {}
for loc in locations:
    res = requests.get(f"https://nominatim.openstreetmap.org/search?format=json&q={loc}, Hyderabad, Telangana, India", headers={"User-Agent": "antigravity-bot/1.0"}).json()
    if res:
        out[loc.replace(' hyderabad', '')] = {"lat": float(res[0]["lat"]), "lon": float(res[0]["lon"])}
        print(f"Found {loc}")
    time.sleep(1)

with open("top_coords.json", "w") as f:
    json.dump(out, f, indent=2)
