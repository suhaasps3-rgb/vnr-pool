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

interface MapComponentProps {
  origin: string;
  destination: string;
}

function ChangeView({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function MapComponent({ origin, destination }: MapComponentProps) {
  const [routeData, setRouteData] = useState<{
    originCoords: [number, number];
    destCoords: [number, number];
    routeCoords: [number, number][];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRoute() {
      try {
        setLoading(true);
        // Geocode Origin
        const oQuery = encodeURIComponent(`${origin} Hyderabad`);
        const oRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${oQuery}`);
        const oData = await oRes.json();
        if (!oData || oData.length === 0) throw new Error(`Could not find location: ${origin}`);

        // Geocode Destination
        const dQuery = encodeURIComponent(`${destination} Hyderabad`);
        const dRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${dQuery}`);
        const dData = await dRes.json();
        if (!dData || dData.length === 0) throw new Error(`Could not find location: ${destination}`);

        const oLat = parseFloat(oData[0].lat);
        const oLon = parseFloat(oData[0].lon);
        const dLat = parseFloat(dData[0].lat);
        const dLon = parseFloat(dData[0].lon);

        // Fetch Route from OSRM
        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${oLon},${oLat};${dLon},${dLat}?overview=full&geometries=geojson`);
        const routeDataAPI = await routeRes.json();
        
        if (routeDataAPI.code !== "Ok" || !routeDataAPI.routes || routeDataAPI.routes.length === 0) {
          throw new Error("Could not find a driving route between these locations.");
        }

        // GeoJSON uses [lon, lat], Leaflet uses [lat, lon]
        const routeCoords = routeDataAPI.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

        setRouteData({
          originCoords: [oLat, oLon],
          destCoords: [dLat, dLon],
          routeCoords,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRoute();
  }, [origin, destination]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
        <span className="text-slate-400">Loading map...</span>
      </div>
    );
  }

  if (error || !routeData) {
    return (
      <div className="w-full h-64 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-200 dark:border-red-500/20">
        <span className="text-red-500 text-sm font-medium">{error || "Failed to load route map."}</span>
      </div>
    );
  }

  const bounds = L.latLngBounds([routeData.originCoords, routeData.destCoords]);

  return (
    <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 relative">
      <div className="absolute top-4 right-4 z-[400] bg-[#0F172A] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
        Route Map
      </div>
      <MapContainer 
        center={routeData.originCoords} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <ChangeView bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={routeData.originCoords}>
          <Popup>{origin} (Origin)</Popup>
        </Marker>
        <Marker position={routeData.destCoords}>
          <Popup>{destination} (Destination)</Popup>
        </Marker>
        <Polyline positions={routeData.routeCoords} color="#3B82F6" weight={5} opacity={0.8} />
      </MapContainer>
    </div>
  );
}
