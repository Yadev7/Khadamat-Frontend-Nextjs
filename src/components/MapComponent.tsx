'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Search, Navigation2 } from 'lucide-react'; // استيراد أيقونات إضافية
import 'leaflet/dist/leaflet.css';

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapViewUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
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

export default function MapComponent({ center, displayLabel, isPicker, onLocationSelect, markers }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // وظيفة البحث عن المدينة (Geocoding)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (onLocationSelect) {
          onLocationSelect(parseFloat(lat), parseFloat(lon));
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const activePosition: [number, number] = center || [34.0331, -5.0003];

  return (
    <div className="h-full w-full relative z-0 group">
      {/* شريط البحث فوق الخريطة */}
      {isPicker && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Search for city center (e.g. Casablanca center)..."
              className="w-full bg-white/90 backdrop-blur-md border-none rounded-2xl py-3 px-12 shadow-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isSearching ? 'animate-pulse text-indigo-500' : 'text-slate-400'}`} />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-all"
            >
              FIND
            </button>
          </form>
        </div>
      )}

      <MapContainer
        center={activePosition}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full rounded-[2rem]"
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {center && (
          <Marker position={activePosition} icon={redIcon}>
            <Popup className="custom-popup">
              <span className="font-bold text-indigo-600">{displayLabel || "Selected Center"}</span>
            </Popup>
          </Marker>
        )}

        {markers && markers.map((m: any) => (
          <Marker key={m.id} position={m.position}>
            <Popup className="custom-popup">
              <span className="font-bold text-slate-800">{m.label}</span>
            </Popup>
          </Marker>
        ))}

        {isPicker && <MapPicker onLocationSelect={onLocationSelect} />}
        <MapViewUpdater center={activePosition} zoom={13} />
      </MapContainer>

      {/* زر تحديد الموقع الحالي */}
      <button
        onClick={() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            onLocationSelect(pos.coords.latitude, pos.coords.longitude);
          });
        }}
        className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 text-indigo-600 transition-all"
        title="My Location"
      >
        <Navigation2 className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
}