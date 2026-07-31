"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom dot icon for waypoints/origins to make it look sleek
const customDotIcon = (color: string) => L.divIcon({
  className: 'custom-dot-icon',
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export interface RouteConfig {
  id: string;
  origin: string;
  destination: string;
  waypoints?: string[];
  color: string;
  label?: string;
}

interface MapComponentProps {
  routes: RouteConfig[];
  height?: string;
}

function ChangeView({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

export default function MapComponent({ routes, height = "h-64 sm:h-80 md:h-96" }: MapComponentProps) {
  const [renderedRoutes, setRenderedRoutes] = useState<{
    id: string;
    originCoords: [number, number];
    destCoords: [number, number];
    originName: string;
    destName: string;
    routeCoords: [number, number][];
    color: string;
    label?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!routes || routes.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchRoutes() {
      try {
        setLoading(true);
        setError("");
        
        const fetchedRoutes = [];
        
        // Helper to geocode with fallback
        const geocode = async (locName: string) => {
          if (locName.toLowerCase().includes("vnr") || locName.toLowerCase().includes("vjiet") || locName.toLowerCase().includes("bachupally (vnr)")) {
            return { lat: 17.5388, lon: 78.3868 };
          }
          let queries = [
            `${locName} Hyderabad`,
            `${locName.split(' ')[0]} Hyderabad`
          ];
          const words = locName.split(' ');
          if (words.length > 2) {
            queries.splice(1, 0, `${words[0]} ${words[1]} Hyderabad`);
          }

          for (const query of queries) {
            const encoded = encodeURIComponent(query);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`);
            const data = await res.json();
            if (data && data.length > 0) {
              return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
          }
          throw new Error(`Could not find location: ${locName}`);
        };

        // Process sequentially with a delay to respect OSRM/Nominatim free tier limits
        for (const route of routes) {
          if (!isMounted) break;
          
          try {
            const oCoords = await geocode(route.origin);
            const dCoords = await geocode(route.destination);

            let allCoords = [{lat: oCoords.lat, lon: oCoords.lon}];
            
            if (route.waypoints && route.waypoints.length > 0) {
              for (const wp of route.waypoints) {
                if (wp.toLowerCase() === route.origin.toLowerCase() || wp.toLowerCase() === route.destination.toLowerCase()) continue;
                try {
                  const c = await geocode(wp);
                  allCoords.push(c);
                  // Artificial delay to prevent rate limit on Nominatim
                  await new Promise(r => setTimeout(r, 600));
                } catch (err) {
                  console.warn("Could not geocode waypoint", wp);
                }
              }
            }
            allCoords.push({lat: dCoords.lat, lon: dCoords.lon});

            // Fetch Route from OSRM
            const coordsString = allCoords.map(c => `${c.lon},${c.lat}`).join(';');
            const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
            const routeDataAPI = await routeRes.json();
            
            if (routeDataAPI.code === "Ok" && routeDataAPI.routes && routeDataAPI.routes.length > 0) {
              const routeCoords = routeDataAPI.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
              fetchedRoutes.push({
                id: route.id,
                originCoords: [oCoords.lat, oCoords.lon] as [number, number],
                destCoords: [dCoords.lat, dCoords.lon] as [number, number],
                originName: route.origin,
                destName: route.destination,
                routeCoords,
                color: route.color,
                label: route.label || route.origin
              });
            }
          } catch (e) {
            console.error(`Failed to fetch route ${route.id}`, e);
          }
          
          // 600ms delay between OSRM requests
          await new Promise(r => setTimeout(r, 600));
        }

        if (isMounted) {
          if (fetchedRoutes.length === 0) {
            setError("Could not load any routes.");
          } else {
            setRenderedRoutes(fetchedRoutes);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRoutes();

    return () => { isMounted = false; };
  }, [routes]);

  if (loading) {
    return (
      <div className={`w-full ${height} bg-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center border border-white/5`}>
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-slate-400 font-medium tracking-wide">Mapping Routes...</span>
      </div>
    );
  }

  if (error || renderedRoutes.length === 0) {
    return (
      <div className={`w-full ${height} bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20`}>
        <span className="text-red-400 text-sm font-medium">{error || "Failed to load route map."}</span>
      </div>
    );
  }

  // Calculate master bounds encompassing all routes
  let masterBounds = L.latLngBounds([]);
  renderedRoutes.forEach(r => {
    masterBounds.extend(r.originCoords);
    masterBounds.extend(r.destCoords);
    r.routeCoords.forEach(c => masterBounds.extend(c));
  });

  return (
    <div className={`w-full ${height} rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 relative`}>
      <MapContainer 
        center={renderedRoutes[0].originCoords} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
        className="z-0"
      >
        <ChangeView bounds={masterBounds} />
        {/* Google Maps Standard Tiles */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        
        {renderedRoutes.map((r) => (
          <div key={r.id}>
            {/* Origin Dot */}
            <Marker position={r.originCoords} icon={customDotIcon(r.color)}>
              <Popup className="dark-popup">
                <div className="font-bold text-sm">{r.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">Origin: <span className="text-slate-800 dark:text-slate-200 font-medium">{r.originName}</span></div>
              </Popup>
            </Marker>
            
            {/* Destination Dot */}
            <Marker position={r.destCoords} icon={customDotIcon(r.color)}>
              <Popup className="dark-popup">
                <div className="font-bold text-sm">{r.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">Destination: <span className="text-slate-800 dark:text-slate-200 font-medium">{r.destName}</span></div>
              </Popup>
            </Marker>

            {/* Outer shadow/border (Google Maps style) */}
            <Polyline 
              positions={r.routeCoords} 
              color={r.color} 
              weight={8} 
              opacity={0.3}
              lineCap="round"
              lineJoin="round"
            />
            {/* Solid Route Line */}
            <Polyline 
              positions={r.routeCoords} 
              color={r.color} 
              weight={5} 
              opacity={1}
              lineCap="round"
              lineJoin="round"
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
