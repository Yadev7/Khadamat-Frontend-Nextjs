'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix for default Leaflet icons in Next.js
const redIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
}) : null;

function MapViewUpdater({ center, markers }: { center?: [number, number], markers: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const group = new L.FeatureGroup(markers.map(m => L.marker(m.position)));
      map.fitBounds(group.getBounds().pad(0.1));
    } else if (center) {
      map.flyTo(center, 13);
    }
  }, [center, markers, map]);

  return null;
}

interface MapMarker {
  position: [number, number];
  label: string;
}

interface MapComponentProps {
  center?: [number, number];
  markers?: MapMarker[];
}

export default function MapComponent({ center, markers = [] }: MapComponentProps) {
  const defaultPosition: [number, number] = [34.0331, -5.0003]; // Fes

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={center || defaultPosition}
        zoom={13}
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

        <MapViewUpdater center={center} markers={markers} />
      </MapContainer>
    </div>
  );
}