'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const createLeafletIcon = (url: string) => {
  if (typeof window === 'undefined') return null;
  return new L.Icon({
    iconUrl: url,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function MapViewUpdater({ center, zoom, hasMarkers }: { center: [number, number]; zoom: number; hasMarkers: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!hasMarkers && center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map, hasMarkers]);
  return null;
}

function FitBoundsOnMarkers({ markers }: { markers: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const validPositions = markers
        .filter((m: any) => m && m.position && !isNaN(m.position[0]) && !isNaN(m.position[1]))
        .map((m: any) => m.position);

      if (validPositions.length > 0) {
        const bounds = L.latLngBounds(validPositions);
        
        // تأخير بسيط لضمان رندرة الـ DOM بالكامل وحساب مقاسات الحاوية بشكل صحيح
        const timer = setTimeout(() => {
          map.invalidateSize();
          if (validPositions.length === 1) {
            map.flyTo(validPositions[0], 14, { duration: 1 });
          } else {
            map.fitBounds(bounds, { padding: [50, 50], duration: 1 });
          }
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [markers, map]);
  
  return null;
}

function InteractiveMarker({ marker, icon }: { marker: any; icon: L.Icon }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      if (marker.active) {
        markerRef.current.openPopup();
      } else {
        markerRef.current.closePopup();
      }
    }
  }, [marker.active]);

  return (
    <Marker ref={markerRef} position={marker.position} icon={icon}>
      <Popup closeButton={false} autoClose={false} closeOnClick={false}>
        <div className="p-1 font-sans">
          <span className="font-bold text-slate-800 block text-sm">{marker.label}</span>
          {marker.address && <span className="text-xs text-slate-500 block mt-0.5">{marker.address}</span>}
        </div>
      </Popup>
    </Marker>
  );
}

function MapInitializer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
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
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-full bg-gray-100 animate-pulse rounded-4xl" />;
  }

  delete (L.Icon.Default.prototype as any)._getIconUrl;

  const redIcon = createLeafletIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');
  const blueIcon = createLeafletIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png');
  const violetIcon = createLeafletIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png');

  const activePosition: [number, number] = center && !isNaN(center[0]) && !isNaN(center[1]) 
    ? center 
    : [34.0331, -5.0003];

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

  const hasMarkers = markers && markers.length > 0;

  return (
    <div className="w-full h-full relative group">
      {isPicker && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] w-full max-w-md px-4">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Search for city center..."
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
        className="h-full w-full rounded-4xl"
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapInitializer />

        {!hasMarkers && center && !isNaN(activePosition[0]) && !isNaN(activePosition[1]) && redIcon && (
          <Marker position={activePosition} icon={redIcon}>
            <Popup>
              <span className="font-bold text-indigo-600">{displayLabel || "Selected Center"}</span>
            </Popup>
          </Marker>
        )}

        {hasMarkers && blueIcon && violetIcon && markers.map((m: any) => {
          if (!m || !m.position || isNaN(m.position[0]) || isNaN(m.position[1])) return null;
          return (
            <InteractiveMarker 
              key={`pin-biz-${m.id}`} 
              marker={m} 
              icon={m.active ? violetIcon : blueIcon} 
            />
          );
        })}

        {isPicker && <MapPicker onLocationSelect={onLocationSelect} />}
        
        <MapViewUpdater center={activePosition} zoom={13} hasMarkers={hasMarkers} />
        <FitBoundsOnMarkers markers={markers} />
      </MapContainer>

      <button
        onClick={() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            if (onLocationSelect) {
              onLocationSelect(pos.coords.latitude, pos.coords.longitude);
            }
          });
        }}
        className="absolute bottom-6 right-6 z-[500] bg-white p-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 text-indigo-600 transition-all"
        title="My Location"
      >
        <Navigation2 className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
}