"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
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
  interactiveMultiMode?: boolean;
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

// Helper to geocode with fallback (outside component to avoid recreation)
const geocode = async (locName: string) => {
  const l = locName.toLowerCase();
  
  // 1. Hardcoded overrides for strictly known problem locations & campus
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

  if (OVERRIDES[l]) return OVERRIDES[l];
  if (l.includes("vnr") || l.includes("vjiet")) return OVERRIDES["vnr vjiet"];

  // 2. Proxy through our backend for reliability and caching
  let queries = [
    `${locName}, Hyderabad, Telangana, India`,
    `${locName}, Telangana, India`,
    `${locName}, India`
  ];

  for (const query of queries) {
    const encoded = encodeURIComponent(query);
    try {
      const res = await fetch(`/api/geocode/forward?q=${encoded}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Small delay so we don't spam our own API simultaneously
          await new Promise(r => setTimeout(r, 200));
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
      }
    } catch (err) {
      console.warn("Proxy query failed", query);
    }
    
    // Artificial delay before retry
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Return fallback center of Hyderabad instead of crashing the app
  console.warn(`Could not find location: ${locName}. Using fallback center.`);
  return { lat: 17.3850, lon: 78.4867 };
};

export default function MapComponent({ routes, height = "h-64 sm:h-80 md:h-96", interactiveMultiMode = false }: MapComponentProps) {
  const [renderedRoutes, setRenderedRoutes] = useState<{
    id: string;
    originCoords: [number, number];
    destCoords: [number, number];
    originName: string;
    destName: string;
    routeCoords: [number, number][]; // May be empty in interactive mode initially
    color: string;
    label?: string;
    waypoints?: string[];
  }[]>([]);
  
  const [activePaths, setActivePaths] = useState<Record<string, [number, number][]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pathLoadingId, setPathLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!routes || routes.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchMapData() {
      try {
        setLoading(true);
        setError("");
        
        const fetchedRoutes = [];
        const initialPaths: Record<string, [number, number][]> = {};
        
        // Process sequentially
        for (const route of routes) {
          if (!isMounted) break;
          
          try {
            const oCoords = await geocode(route.origin);
            const dCoords = await geocode(route.destination);

            let allCoords = [{lat: oCoords.lat, lon: oCoords.lon}];
            
            // If NOT interactive mode, we eagerly fetch the OSRM path and all waypoints
            if (!interactiveMultiMode) {
              if (route.waypoints && route.waypoints.length > 0) {
                for (const wp of route.waypoints) {
                  if (wp.toLowerCase() === route.origin.toLowerCase() || wp.toLowerCase() === route.destination.toLowerCase()) continue;
                  try {
                    const c = await geocode(wp);
                    allCoords.push(c);
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
                initialPaths[route.id] = routeCoords;
              }
              
              // 600ms delay between OSRM requests to prevent throttling
              await new Promise(r => setTimeout(r, 600));
            }

            fetchedRoutes.push({
              id: route.id,
              originCoords: [oCoords.lat, oCoords.lon] as [number, number],
              destCoords: [dCoords.lat, dCoords.lon] as [number, number],
              originName: route.origin,
              destName: route.destination,
              routeCoords: initialPaths[route.id] || [],
              color: route.color,
              label: route.label || route.origin,
              waypoints: route.waypoints,
            });
          } catch (e) {
            console.error(`Failed to fetch basic map data for route ${route.id}`, e);
          }
        }

        if (isMounted) {
          if (fetchedRoutes.length === 0) {
            setError("Could not load any routes.");
          } else {
            setRenderedRoutes(fetchedRoutes);
            setActivePaths(initialPaths);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMapData();

    return () => { isMounted = false; };
  }, [routes, interactiveMultiMode]);

  // Click-to-fetch logic for interactive multi mode
  const fetchPathForRoute = async (routeId: string) => {
    if (activePaths[routeId] || pathLoadingId === routeId) return; // Already loaded or loading
    
    const r = renderedRoutes.find(x => x.id === routeId);
    if (!r) return;

    try {
      setPathLoadingId(routeId);
      
      let allCoords = [{lat: r.originCoords[0], lon: r.originCoords[1]}];
      
      if (r.waypoints && r.waypoints.length > 0) {
        for (const wp of r.waypoints) {
          if (wp.toLowerCase() === r.originName.toLowerCase() || wp.toLowerCase() === r.destName.toLowerCase()) continue;
          try {
            const c = await geocode(wp);
            allCoords.push(c);
            await new Promise(resolve => setTimeout(resolve, 600));
          } catch (err) {
            console.warn("Could not geocode waypoint", wp);
          }
        }
      }
      
      allCoords.push({lat: r.destCoords[0], lon: r.destCoords[1]});

      const coordsString = allCoords.map(c => `${c.lon},${c.lat}`).join(';');
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
      const routeDataAPI = await routeRes.json();
      
      if (routeDataAPI.code === "Ok" && routeDataAPI.routes && routeDataAPI.routes.length > 0) {
        const routeCoords = routeDataAPI.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        
        setActivePaths(prev => {
          // If interactive mode, maybe we want to only show ONE path at a time to avoid clutter?
          // The request implies "user has to click the point to show the path completely", 
          // let's clear other paths when a new one is clicked, or keep them? Let's just add it.
          const newPaths = { ...prev };
          newPaths[routeId] = routeCoords;
          return newPaths;
        });
      }
    } catch (e) {
      console.error(`Failed to fetch path on click for ${routeId}`, e);
    } finally {
      setPathLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${height} bg-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center border border-white/5`}>
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-slate-400 font-medium tracking-wide">Mapping Points...</span>
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
    if (activePaths[r.id]) {
      activePaths[r.id].forEach(c => masterBounds.extend(c));
    } else if (r.routeCoords) {
      r.routeCoords.forEach(c => masterBounds.extend(c));
    }
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
        
        {renderedRoutes.map((r) => {
          const pathCoords = activePaths[r.id] || r.routeCoords;
          const isPathLoaded = pathCoords && pathCoords.length > 0;
          const isLoadingThisPath = pathLoadingId === r.id;

          return (
            <div key={r.id}>
              {/* Origin Dot */}
              <Marker 
                position={r.originCoords} 
                icon={customDotIcon(r.color)}
                eventHandlers={{
                  click: () => {
                    if (interactiveMultiMode && !isPathLoaded) {
                      fetchPathForRoute(r.id);
                    }
                  }
                }}
              >
                <Popup className="dark-popup">
                  <div className="font-bold text-sm">{r.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Origin: <span className="text-slate-800 font-bold">{r.originName}</span></div>
                  {interactiveMultiMode && !isPathLoaded && (
                    <div className="mt-2">
                      {isLoadingThisPath ? (
                        <span className="text-[10px] text-blue-500 font-bold animate-pulse">Loading Route...</span>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            fetchPathForRoute(r.id);
                          }}
                          className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded w-full font-bold"
                        >
                          View Full Path
                        </button>
                      )}
                    </div>
                  )}
                </Popup>
              </Marker>
              
              {/* Destination Dot */}
              <Marker 
                position={r.destCoords} 
                icon={customDotIcon(r.color)}
                eventHandlers={{
                  click: () => {
                    if (interactiveMultiMode && !isPathLoaded) {
                      fetchPathForRoute(r.id);
                    }
                  }
                }}
              >
                <Popup className="dark-popup">
                  <div className="font-bold text-sm">{r.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Destination: <span className="text-slate-800 font-bold">{r.destName}</span></div>
                </Popup>
              </Marker>

              {/* Only render paths if loaded */}
              {isPathLoaded && (
                <>
                  <Polyline 
                    positions={pathCoords} 
                    color={r.color} 
                    weight={8} 
                    opacity={0.3}
                    lineCap="round"
                    lineJoin="round"
                  />
                  <Polyline 
                    positions={pathCoords} 
                    color={r.color} 
                    weight={5} 
                    opacity={1}
                    lineCap="round"
                    lineJoin="round"
                  />
                </>
              )}
            </div>
          );
        })}
      </MapContainer>
      
      {/* Loading overlay for path fetching */}
      {pathLoadingId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full z-[1000] border border-white/10 shadow-xl flex items-center gap-3">
           <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
           <span className="text-white text-xs font-bold">Fetching route geometry...</span>
        </div>
      )}
    </div>
  );
}
