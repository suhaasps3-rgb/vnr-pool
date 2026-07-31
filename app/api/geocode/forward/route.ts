import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  try {
    const encoded = encodeURIComponent(q);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`,
      {
        headers: {
          'User-Agent': 'vnr-pool-app/1.0 (support@vnrpool.com)',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        // Cache heavily since locations don't change
        cache: 'force-cache',
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Forward Geocoding Proxy Error:', error);
    
    // Fallback to open meteo on server side
    try {
        // Open-Meteo requires simple names, it fails on "Kukatpally, Hyderabad, India"
        const simpleName = q.split(',')[0].trim();
        const meteoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(simpleName)}&count=1&format=json`);
        if (meteoRes.ok) {
            const mData = await meteoRes.json();
            if (mData.results && mData.results.length > 0) {
                 return NextResponse.json([{ lat: mData.results[0].latitude, lon: mData.results[0].longitude }]);
            }
        }
    } catch (e) {
        console.error('Fallback Geocoding Proxy Error:', e);
    }

    return NextResponse.json({ error: 'Failed to geocode location' }, { status: 500 });
  }
}
