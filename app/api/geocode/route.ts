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

    // ── VNR VJIET SNAP LOGIC ──────────────────────────────────
    // VNR VJIET coordinates
    const VNR_LAT = 17.53905;
    const VNR_LON = 78.38546;
    const distanceToVNR = getDistanceFromLatLonInKm(Number(lat), Number(lon), VNR_LAT, VNR_LON);
    
    // If within 1.5km of VNR VJIET, force snap to VNR VJIET
    let finalPoiLabel = precisionLabel;
    let finalPoiName = poiName;
    let finalNeighbourhood = neighbourhood;
    
    if (distanceToVNR < 1.5) {
      finalPoiLabel = "VNR VJIET";
      finalPoiName = "VNR VJIET";
      finalNeighbourhood = "Bachupally";
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
