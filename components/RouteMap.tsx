"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's missing Next.js marker icon bug
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper component to auto-fit bounds to the drawn route
function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [coords, map]);
  return null;
}

const OVERRIDES: Record<string, { lat: number; lon: number }> = {
  "vnr vjiet": { lat: 17.53905, lon: 78.38546 },
  "vnr vjiet, bachupally": { lat: 17.53905, lon: 78.38546 },
  "s grand": { lat: 17.525, lon: 78.385 },
  "pragathi nagar kaman": { lat: 17.5408, lon: 78.3938 },
  "pragathi nagar": { lat: 17.5200154, lon: 78.3968876 },
  "hyderabad spice": { lat: 17.5185, lon: 78.3965 },
  "angaara restaurant": { lat: 17.5180, lon: 78.3970 },
  "nizampet": { lat: 17.5180, lon: 78.3970 },
  "bachupally": { lat: 17.525, lon: 78.385 },
  "kphb": { lat: 17.4939602, lon: 78.4008412 },
  "jntu": { lat: 17.4940885, lon: 78.3935576 },
  "ameerpet": { lat: 17.4375012, lon: 78.4482505 },
  "nampally": { lat: 17.3923995, lon: 78.4701477 },
  "secunderabad": { lat: 17.4337246, lon: 78.5006827 },
  "kukatpally": { lat: 17.4930841, lon: 78.4054408 },
  "miyapur": { lat: 17.4981608, lon: 78.3567628 },
  "dilsukhnagar": { lat: 17.3684433, lon: 78.5228597 },
  "lb nagar": { lat: 17.3501617, lon: 78.5510938 },
  "madhapur": { lat: 17.4408924, lon: 78.3916304 },
  "hitech city": { lat: 17.469728, lon: 78.3852406 },
  "gachibowli": { lat: 17.4436222, lon: 78.3519638 },
  "kondapur": { lat: 17.4587912, lon: 78.3730556 }
};

async function findBestMatchLocation(name: string): Promise<[number, number] | null> {
  if (!name) return null;
  const l = name.toLowerCase();
  
  if (OVERRIDES[l]) return [OVERRIDES[l].lat, OVERRIDES[l].lon];
  if (l.includes("vnr") || l.includes("vjiet")) return [OVERRIDES["vnr vjiet"].lat, OVERRIDES["vnr vjiet"].lon];

  let queries = [
    `${name}, Hyderabad, Telangana, India`,
    `${name}, Telangana, India`,
    `${name}, India`
  ];

  for (const query of queries) {
    const encoded = encodeURIComponent(query);
    try {
      const res = await fetch(`/api/geocode/forward?q=${encoded}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          await new Promise(r => setTimeout(r, 200));
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      }
    } catch (err) {
      console.warn("Proxy query failed", query);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.warn(`Could not find location: ${name}. Using fallback center.`);
  return [17.3850, 78.4867];
}

interface RouteMapProps {
  waypoints: string[];
  className?: string;
}

export default function RouteMap({ waypoints, className = "" }: RouteMapProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [markerCoords, setMarkerCoords] = useState<{name: string, lat: number, lng: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoute() {
      if (!waypoints || waypoints.length < 2) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Geocode all waypoints
        const coordsPromises = waypoints.map(async (name) => {
          const coords = await findBestMatchLocation(name);
          return coords ? { name, lat: coords[0], lng: coords[1] } : null;
        });
        
        const resolvedCoords = (await Promise.all(coordsPromises)).filter(Boolean) as {name: string, lat: number, lng: number}[];
        
        if (resolvedCoords.length < 2) {
          throw new Error("Not enough valid coordinates found.");
        }

        setMarkerCoords(resolvedCoords);

        // 2. Format for OSRM: lng,lat;lng,lat
        const coordsString = resolvedCoords.map(c => `${c.lng},${c.lat}`).join(';');
        
        // 3. Fetch exact driving route
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
        if (!osrmRes.ok) throw new Error("OSRM failed");
        
        const osrmData = await osrmRes.json();
        if (osrmData.routes && osrmData.routes.length > 0) {
          const geojsonCoords = osrmData.routes[0].geometry.coordinates;
          // 4. Swap from [lng, lat] to [lat, lng]
          const leafletCoords: [number, number][] = geojsonCoords.map((c: [number, number]) => [c[1], c[0]]);
          setRouteCoords(leafletCoords);
        } else {
          throw new Error("No route found in OSRM response");
        }
      } catch (err) {
        console.error("Routing error:", err);
        // 5. Fallback: Draw straight lines between the resolved coordinates
        if (markerCoords.length >= 2) {
            setRouteCoords(markerCoords.map(c => [c.lat, c.lng]));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRoute();
  }, [waypoints]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[var(--border-color)] z-0 ${className}`}>
      
      {/* Floating Badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-[var(--card-bg)] text-[var(--text-primary)] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[var(--border-color)]">
        Route Map
      </div>

      {loading && (
        <div className="absolute inset-0 z-[1000] bg-[var(--card-bg)] bg-opacity-70 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">Mapping Route...</span>
        </div>
      )}

      <MapContainer 
        center={[17.3850, 78.4867]} 
        zoom={11} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        
        {routeCoords.length > 0 && (
          <>
            <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.8} />
            <FitBounds coords={routeCoords} />
          </>
        )}

        {markerCoords.map((c, i) => (
          <Marker key={i} position={[c.lat, c.lng]}>
            <Popup>{c.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
