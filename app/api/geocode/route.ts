import { NextResponse } from 'next/server';

// Helper to calculate distance between two coordinates in kilometers
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

// Precision Geofencing Database (Custom POIs)
const CUSTOM_POIS = [
  { name: "S Grand", lat: 17.525, lon: 78.385, neighbourhood: "Bachupally", radius: 0.05, priority: 1 },
  { name: "Hyderabad Spice", lat: 17.5185, lon: 78.3965, neighbourhood: "Bachupally", radius: 0.05, priority: 1 },
  { name: "Pista House Bachupally", lat: 17.5300, lon: 78.3800, neighbourhood: "Bachupally", radius: 0.05, priority: 1 },
  { name: "Pragathi Nagar Kaman", lat: 17.5408, lon: 78.3938, neighbourhood: "Pragathi Nagar", radius: 0.1, priority: 1 },
  { name: "Simhapuri Kaman", lat: 17.5350, lon: 78.3850, neighbourhood: "Bachupally", radius: 0.1, priority: 1 },
  
  // Adjusted bakery/restaurant coordinates away from VNR VJIET campus center
  { name: "Bakers Heaven", lat: 17.5310, lon: 78.3810, neighbourhood: "Bachupally", radius: 0.05, priority: 2 },
  { name: "Dosthi Biryani's", lat: 17.5312, lon: 78.3815, neighbourhood: "Bachupally", radius: 0.05, priority: 2 },
  { name: "Eat Magic.in", lat: 17.5315, lon: 78.3812, neighbourhood: "Bachupally", radius: 0.05, priority: 2 },
  { name: "Kammani Telugu Kitchen", lat: 17.5305, lon: 78.3805, neighbourhood: "Bachupally", radius: 0.08, priority: 2 },
  { name: "Biryani Factory", lat: 17.5320, lon: 78.3820, neighbourhood: "Bachupally", radius: 0.05, priority: 2 },
  
  { name: "Angaara Restaurant", lat: 17.5180, lon: 78.3970, neighbourhood: "Nizampet", radius: 0.05, priority: 1 },
  { name: "Allah's Kitchen and Bar", lat: 17.5200, lon: 78.3900, neighbourhood: "Nizampet", radius: 0.05, priority: 1 },
  { name: "Taqila Lounge and Restaurant", lat: 17.5250, lon: 78.3880, neighbourhood: "Bachupally", radius: 0.05, priority: 1 },
  { name: "Polar Bear", lat: 17.5150, lon: 78.3900, neighbourhood: "Nizampet", radius: 0.05, priority: 1 },
  { name: "The Golden Barrel", lat: 17.5210, lon: 78.3920, neighbourhood: "Bachupally", radius: 0.05, priority: 1 },
  { name: "Dominos", lat: 17.5300, lon: 78.3850, neighbourhood: "Bachupally", radius: 0.05, priority: 1 },
  { name: "VNR Hostel", lat: 17.5392, lon: 78.3865, neighbourhood: "Bachupally", radius: 0.15, priority: 5 },
  
  { name: "Mamata Academy of Medical Sciences", lat: 17.531, lon: 78.381, neighbourhood: "Bachupally", radius: 0.2, priority: 1 },
  { name: "Reach Super Speciality Hospital", lat: 17.528, lon: 78.382, neighbourhood: "Bachupally", radius: 0.1, priority: 1 },
  { name: "Relief Hospital Pragathi Nagar", lat: 17.541, lon: 78.395, neighbourhood: "Pragathi Nagar", radius: 0.1, priority: 1 },
  { name: "Silver Oaks International School", lat: 17.5455, lon: 78.3755, neighbourhood: "Bachupally", radius: 0.15, priority: 1 },
  { name: "Kennedy High The Global School", lat: 17.5332, lon: 78.3661, neighbourhood: "Bachupally", radius: 0.15, priority: 1 },
  { name: "Mallampet Lake", lat: 17.5500, lon: 78.3600, neighbourhood: "Mallampet", radius: 0.3, priority: 1 },
  { name: "Bachupally Police Station", lat: 17.5420, lon: 78.3780, neighbourhood: "Bachupally", radius: 0.1, priority: 1 },
  
  // VNR VJIET strictly overrides anything if the user is inside the 500m campus radius
  { name: "VNR VJIET", lat: 17.53905, lon: 78.38546, neighbourhood: "Bachupally", radius: 0.5, priority: 100 } 
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&extratags=1&namedetails=1&zoom=18&accept-language=en`,
      {
        headers: {
          'User-Agent': 'vnr-pool-app/1.0 (support@vnrpool.com)',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status ${response.status}`);
    }

    const data = await response.json();

    // ── Precision POI Parser ──────────────────────────────────
    // Priority order: building/POI name > amenity > shop > tourism > office > neighbourhood > suburb
    const addr = data.address || {};
    const extratags = data.extratags || {};
    const namedetails = data.namedetails || {};

    // High-granularity POI name candidates
    const poiName =
      data.name ||                          // OpenStreetMap place name (building, shop, etc.)
      namedetails['name:en'] ||             // English name variant
      namedetails['name'] ||                // Any language name
      extratags['name'] ||                  // Extra tag name
      addr['building'] ||                   // Building name
      addr['amenity'] ||                    // Cafe, hospital, school etc.
      addr['shop'] ||                       // Shop type
      addr['tourism'] ||                    // Tourist attraction
      addr['office'] ||                     // Office type
      addr['leisure'] ||                    // Park, stadium etc.
      addr['historic'] ||                   // Historic site
      null;

    // Neighbourhood / area fallback chain
    const neighbourhood =
      addr['neighbourhood'] ||
      addr['suburb'] ||
      addr['quarter'] ||
      addr['residential'] ||
      addr['village'] ||
      addr['town'] ||
      addr['city_district'] ||
      addr['city'] ||
      null;

    // Build precision string: "POI Name, Neighbourhood" or just neighbourhood
    let precisionLabel: string | null = null;
    if (poiName && neighbourhood) {
      precisionLabel = `${poiName}, ${neighbourhood}`;
    } else if (poiName) {
      precisionLabel = poiName;
    } else if (neighbourhood) {
      precisionLabel = neighbourhood;
    }

    // ── CUSTOM GEOFENCING SNAP LOGIC ──────────────────────────────────
    let finalPoiLabel = precisionLabel;
    let finalPoiName = poiName;
    let finalNeighbourhood = neighbourhood;
    
    // Find the highest priority matching POI. If tie, use closest.
    let closestPoi = null;
    let minDistance = Infinity;
    let maxPriority = -1;

    for (const poi of CUSTOM_POIS) {
      const dist = getDistanceFromLatLonInKm(Number(lat), Number(lon), poi.lat, poi.lon);
      const priority = poi.priority || 0;
      
      if (dist <= poi.radius) {
        if (priority > maxPriority) {
          maxPriority = priority;
          minDistance = dist;
          closestPoi = poi;
        } else if (priority === maxPriority && dist < minDistance) {
          minDistance = dist;
          closestPoi = poi;
        }
      }
    }

    if (closestPoi) {
      finalPoiLabel = closestPoi.name;
      finalPoiName = closestPoi.name;
      finalNeighbourhood = closestPoi.neighbourhood;
    }

    return NextResponse.json({
      ...data,
      // Attach structured POI result for client-side use
      poiLabel: finalPoiLabel,
      poiName: finalPoiName,
      neighbourhood: finalNeighbourhood,
    });
  } catch (error) {
    console.error('Geocoding Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to geocode location' }, { status: 500 });
  }
}
