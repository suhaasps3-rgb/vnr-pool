import urllib.request
import json
import time

locations = [
    "S Grand, Bachupally",
    "Hyderabad Spice, Bachupally",
    "Pista House Bachupally",
    "Pragathi Nagar Kaman",
    "Simhapuri Kaman",
    "Bakers Heaven, Bachupally",
    "Dosthi Biryanis, Bachupally",
    "Eat Magic, Bachupally",
    "Kammani Telugu Kitchen, Bachupally",
    "Biryani Factory, Bachupally",
    "VNR Hostel, Bachupally",
    "Mamata Academy of Medical Sciences, Bachupally",
    "Reach Super Speciality Hospital, Bachupally",
    "Relief Hospital Pragathi Nagar",
    "Silver Oaks International School Bachupally",
    "Kennedy High The Global School Bachupally",
    "Mallampet Lake",
    "Bachupally Police Station"
]

results = []

for loc in locations:
    query = urllib.parse.quote(loc + ", Hyderabad")
    url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'vnr-pool-script/1.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data:
                results.append({"name": loc.split(',')[0], "lat": data[0]['lat'], "lon": data[0]['lon']})
            else:
                results.append({"name": loc.split(',')[0], "lat": None, "lon": None})
    except Exception as e:
        results.append({"name": loc, "error": str(e)})
    time.sleep(1) # rate limit

print(json.dumps(results, indent=2))
