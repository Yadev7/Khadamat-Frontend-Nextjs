'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';

const redIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: '/marker-icon-red.png', 
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
}) : null;

function MapViewUpdater({ center, zoom, markerRef }: { center: [number, number], zoom: number, markerRef: React.RefObject<L.Marker | null> }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
      const timer = setTimeout(() => {
        if (markerRef.current) markerRef.current.openPopup();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [center, zoom, map, markerRef]);
  return null;
}

interface MapComponentProps {
  center?: [number, number];
  displayLabel?: string; // النص الوحيد الذي سيظهر
}

export default function MapComponent({ center }: MapComponentProps) {
  const defaultPosition: [number, number] = [34.0331, -5.0003]; // Fes
  const [zoomLevel, setZoomLevel] = useState(10);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // إذا كان طول النص كبيراً (غالباً يكون اسم الحي)، نزيد الزوم
    // أو يمكن الاعتماد على وجود النص نفسه
    setZoomLevel(center ? 15 : 10);
  }, [center]);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {center && redIcon && (
          <Marker position={center} icon={redIcon} ref={markerRef}>
            {/* <Popup autoClose={false} closeOnClick={false}>
               <div className="text-center p-1">
                  <span className="text-indigo-600 font-extrabold text-lg">
                    {displayLabel}
                  </span>
               </div>
            </Popup> */}
          </Marker>
        )}

        <MapViewUpdater center={center || defaultPosition} zoom={zoomLevel} markerRef={markerRef} />
      </MapContainer>
    </div>
  );
}