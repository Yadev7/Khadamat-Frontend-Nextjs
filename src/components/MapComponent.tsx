'use client';

import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for Marker icons in Next.js
const redIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
}) : null;

function MapViewUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (!center || !Array.isArray(center) || center.length < 2) return;
    
    const lat = parseFloat(String(center[0]));
    const lng = parseFloat(String(center[1]));
    
    // Strict numeric check
    if (isFinite(lat) && isFinite(lng) && !isNaN(lat) && !isNaN(lng)) {
      const timer = setTimeout(() => {
        try {
          map.flyTo([lat, lng], zoom, {
            duration: 1.5,
            easeLinearity: 0.25
          });
          map.invalidateSize();
        } catch (e) {
          console.error("Leaflet flyTo error:", e);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [center, zoom, map]);

  return null;
}

interface MapComponentProps {
  center?: [number, number];
  markers?: any[];
}

export default function MapComponent({ center, markers = [] }: MapComponentProps) {
  const defaultPosition: [number, number] = [34.0331, -5.0003]; // Fes

  // Extremely strict coordinate extraction
  let activeCenter: [number, number] = defaultPosition;
  let zoomLevel = 12;

  if (center && Array.isArray(center) && center.length >= 2) {
    const parsedLat = parseFloat(String(center[0]));
    const parsedLng = parseFloat(String(center[1]));
    if (isFinite(parsedLat) && isFinite(parsedLng) && !isNaN(parsedLat) && !isNaN(parsedLng)) {
      activeCenter = [parsedLat, parsedLng];
      zoomLevel = 14;
    }
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={activeCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {markers.map((marker, idx) => (
          redIcon && (
            <Marker key={idx} position={marker.position} icon={redIcon}>
              <Popup>
                <span className="font-bold text-indigo-600">{marker.label}</span>
              </Popup>
            </Marker>
          )
        ))}

        <MapViewUpdater center={activeCenter} zoom={zoomLevel} />
      </MapContainer>
    </div>
  );
}