'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// إصلاح الأيقونات لضمان ظهورها في Next.js
const redIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
}) : null;

function MapViewUpdater({ center, zoom, markerRef }: { center: [number, number], zoom: number, markerRef: React.RefObject<L.Marker | null> }) {
  const map = useMap();

  useEffect(() => {
    // التحقق من أن الإحداثيات أرقام صالحة وليست NaN أو undefined
    const isValid = center && !isNaN(center[0]) && !isNaN(center[1]);

    if (isValid) {
      // تحديث حجم الخريطة أولاً لضمان عدم وجود أجزاء رمادية
      map.invalidateSize();

      // الانتقال للموقع الجديد بنعومة
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });

      const timer = setTimeout(() => {
        if (markerRef.current) markerRef.current.openPopup();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [center, zoom, map, markerRef]);

  return null;
}

function MapPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapComponentProps {
  center?: [number, number];
  displayLabel?: string;
  isPicker?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function MapComponent({ center, displayLabel, isPicker, onLocationSelect }: MapComponentProps) {
  const defaultPosition: [number, number] = [34.0331, -5.0003]; // Fes

  // تحويل القيم مسبقاً لأرقام لضمان عدم تمرير Strings من قاعدة البيانات
  const sanitizedCenter: [number, number] | undefined = center
    ? [Number(center[0]), Number(center[1])]
    : undefined;

  const [zoomLevel, setZoomLevel] = useState(10);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // تعيين مستوى الزووم بناءً على وجود المركز
    setZoomLevel(sanitizedCenter ? 15 : 10);
  }, [sanitizedCenter]);

  // الموقع النشط للخريطة (المركز الممرر أو الافتراضي)
  const activePosition = sanitizedCenter && !isNaN(sanitizedCenter[0])
    ? sanitizedCenter
    : defaultPosition;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={activePosition}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sanitizedCenter && !isNaN(sanitizedCenter[0]) && redIcon && (
          <Marker position={sanitizedCenter} icon={redIcon} ref={markerRef}>
            {displayLabel && (
              <div className="text-center p-1">
                <span className="text-indigo-600 font-extrabold text-lg">
                  {displayLabel}
                </span>
              </div>
            )}
          </Marker>
        )}

        {isPicker && onLocationSelect && (
          <MapPicker onLocationSelect={onLocationSelect} />
        )}

        <MapViewUpdater
          center={center || defaultPosition}
          zoom={zoomLevel}
          markerRef={markerRef}
        />
      </MapContainer>
    </div>
  );
}