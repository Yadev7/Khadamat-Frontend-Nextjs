'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export type MapMarker = {
  id: string;
  position: [number, number];
  label?: string;
  address?: string;
  active?: boolean;
};

type MapComponentProps = {
  center?: [number, number] | null;
  displayLabel?: string;
  isPicker?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: MapMarker[];
};

const FALLBACK_CENTER: [number, number] = [34.0331, -5.0003];

const MARKER_ICONS = {
  red: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  blue: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  violet: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
};

const isValidPosition = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  Number.isFinite(value[0]) &&
  Number.isFinite(value[1]);

// Leaflet resolves default marker assets relative to its own CSS. Custom icons
// provide absolute URLs, so the lookup must happen once at module scope.
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
}

function useMarkerIcons() {
  return useMemo(() => {
    if (typeof window === 'undefined') return null;

    const create = (url: string) =>
      new L.Icon({
        iconUrl: url,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

    return {
      red: create(MARKER_ICONS.red),
      blue: create(MARKER_ICONS.blue),
      violet: create(MARKER_ICONS.violet),
    };
  }, []);
}

// Inside MapComponent.tsx -> MapViewUpdater
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const lastCenterRef = useRef<string>('');

  useEffect(() => {
    if (!isValidPosition(center)) return;

    const centerKey = `${center[0]}-${center[1]}`;
    if (centerKey === lastCenterRef.current) return;

    lastCenterRef.current = centerKey;
    try {
      map.flyTo(center, zoom, { duration: 1.0 });
    } catch (error) {
      console.error("Leaflet flyTo animation error bypassed safely:", error);
    }
  }, [center, zoom, map]);

  return null;
}

function FitBoundsOnMarkers({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  // Hovering a card flips `active` and rebuilds the marker array. Keying the
  // effect on the set of positions (not the array identity) keeps the viewport
  // still while the user moves the pointer over the result list.
  const signature = useMemo(
    () =>
      markers
        .filter((marker) => marker && isValidPosition(marker.position))
        .map((marker) => `${marker.id}:${marker.position[0]},${marker.position[1]}`)
        .sort()
        .join('|'),
    [markers],
  );

  useEffect(() => {
    if (!signature) return;

    const positions = signature
      .split('|')
      .map((entry) => entry.split(':')[1])
      .map((pair) => pair.split(',').map(Number) as [number, number]);

    if (positions.length === 0) return;

    const timer = setTimeout(() => {
      map.invalidateSize();
      if (positions.length === 1) {
        map.flyTo(positions[0], 14, { duration: 1 });
      } else {
        map.fitBounds(L.latLngBounds(positions), { padding: [50, 50], duration: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [signature, map]);

  return null;
}

function InteractiveMarker({ marker, icon }: { marker: MapMarker; icon: L.Icon }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!markerRef.current) return;

    if (marker.active) {
      markerRef.current.openPopup();
    } else {
      markerRef.current.closePopup();
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

export default function MapComponent({
  center,
  displayLabel,
  isPicker = false,
  onLocationSelect,
  markers = [],
}: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const icons = useMarkerIcons();

  const hasCenter = isValidPosition(center);
  const activePosition: [number, number] = hasCenter ? center : FALLBACK_CENTER;
  const safeMarkers = useMemo(
    () => (Array.isArray(markers) ? markers.filter((m) => m && isValidPosition(m.position)) : []),
    [markers],
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onLocationSelect?.(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isMounted) {
    return <div className="w-full h-full bg-gray-100 animate-pulse rounded-4xl" />;
  }

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

        {/* The selected city / zone stays pinned at its centre even when result
            markers are on screen, so the current filter is always visible. */}
        {hasCenter && icons?.red && (
          <Marker position={activePosition} icon={icons.red} zIndexOffset={1000}>
            <Popup>
              <span className="font-bold text-indigo-600">{displayLabel || "Selected Center"}</span>
            </Popup>
          </Marker>
        )}

        {icons && safeMarkers.map((marker) => (
          <InteractiveMarker
            key={`pin-biz-${marker.id}`}
            marker={marker}
            icon={marker.active ? icons.violet : icons.blue}
          />
        ))}

        {/* 🌟 CONTROLLED: MapPicker only triggers click events when isPicker is true */}
        {isPicker && onLocationSelect && <MapPicker onLocationSelect={onLocationSelect} />}

        <MapViewUpdater center={activePosition} zoom={13} />
        <FitBoundsOnMarkers markers={safeMarkers} />
      </MapContainer>

      {onLocationSelect && (
        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              onLocationSelect(pos.coords.latitude, pos.coords.longitude);
            });
          }}
          className="absolute bottom-6 right-6 z-[500] bg-white p-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 text-indigo-600 transition-all"
          title="My Location"
        >
          <Navigation2 className="w-5 h-5 fill-current" />
        </button>
      )}
    </div>
  );
}