'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation2, Loader2, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { t } from 'i18next';

export type MapMarker = {
  id: string;
  position: [number, number];
  label?: string;
  address?: string;
  active?: boolean;
  flyerUrl?: string;
  phone?: string;
  whatsapp?: string;
  onViewDetails?: () => void;
};

export type MapCircleBoundary = {
  center: [number, number];
  radius: number;
  color?: string;
};

type MapComponentProps = {
  center?: [number, number] | null;
  displayLabel?: string;
  isPicker?: boolean;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  markers?: MapMarker[];
  circleBoundary?: MapCircleBoundary | null;
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
  typeof value[0] === 'number' &&
  typeof value[1] === 'number' &&
  Number.isFinite(value[0]) &&
  Number.isFinite(value[1]);

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

function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const lastCenterRef = useRef<string>('');

  useEffect(() => {
    if (!map || !isValidPosition(center)) return;

    const [lat, lng] = center;
    if (isNaN(lat) || isNaN(lng)) return;

    const centerKey = `${lat}-${lng}`;
    if (centerKey === lastCenterRef.current) return;
    lastCenterRef.current = centerKey;

    try {
      map.setView([lat, lng], zoom, { animate: false });
    } catch (error) {
      console.error("Leaflet setView error:", error);
    }
  }, [center, zoom, map]);

  return null;
}

function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        console.error("Leaflet invalidateSize error:", e);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function FitBoundsOnCircle({ circleBoundary }: { circleBoundary: MapCircleBoundary | null }) {
  const map = useMap();

  useEffect(() => {
    if (!circleBoundary || !circleBoundary.center || !isValidPosition(circleBoundary.center)) return;

    const [lat, lng] = circleBoundary.center;
    const radiusMeters = circleBoundary.radius;

    const latDelta = radiusMeters / 111000;
    const lngDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

    const southWest = L.latLng(lat - latDelta, lng - lngDelta);
    const northEast = L.latLng(lat + latDelta, lng + lngDelta);
    const bounds = L.latLngBounds(southWest, northEast);

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
        map.fitBounds(bounds, {
          padding: [50, 50],
          duration: 1.0
        });
      } catch (e) {
        console.error("Leaflet fitBounds error:", e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [circleBoundary, map]);

  return null;
}

export default function MapComponent({
  center,
  displayLabel,
  isPicker = false,
  onLocationSelect,
  markers = [],
  circleBoundary = null,
}: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [pickedLocation, setPickedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    loading: boolean;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isValidPosition(center) && isPicker) {
      setPickedLocation(prev => {
        if (prev && prev.lat === center[0] && prev.lng === center[1]) return prev;
        return {
          lat: center[0],
          lng: center[1],
          address: displayLabel || "الموقع المختار",
          loading: false
        };
      });
    }
  }, [center, isPicker, displayLabel]);

  const icons = useMarkerIcons();
  const activePosition: [number, number] = isValidPosition(center) ? center : FALLBACK_CENTER;

  const safeMarkers = useMemo(
    () => (Array.isArray(markers) ? markers.filter((m) => m && isValidPosition(m.position)) : []),
    [markers],
  );

  const handleReverseGeocode = async (lat: number, lng: number) => {
    if (!isPicker || !onLocationSelect) return;

    setPickedLocation({ lat, lng, address: "جاري جلب العنوان...", loading: true });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      const addressText = data.display_name || "موقع بدون عنوان";

      setPickedLocation({ lat, lng, address: addressText, loading: false });
      onLocationSelect(lat, lng, addressText);
    } catch (error) {
      console.error("Reverse Geocoding error:", error);
      setPickedLocation({ lat, lng, address: "تعسّر جلب العنوان", loading: false });
      onLocationSelect(lat, lng, "");
    }
  };

  function MapPickerHandler() {
    useMapEvents({
      click(e) {
        handleReverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lon);

        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setPickedLocation({ lat: parsedLat, lng: parsedLng, address: display_name, loading: false });
          onLocationSelect?.(parsedLat, parsedLng, display_name);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
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
              placeholder="البحث عن مدينة أو عنوان..."
              className="w-full bg-white/90 backdrop-blur-md border-none rounded-2xl py-3 px-12 shadow-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-all"
            >
              بحث
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

        <InvalidateMapSize />
        <FitBoundsOnCircle circleBoundary={circleBoundary} />

        {circleBoundary && isValidPosition(circleBoundary.center) && (
          <Circle
            center={circleBoundary.center}
            radius={circleBoundary.radius}
            pathOptions={{
              color: circleBoundary.color || '#6366f1',
              fillColor: circleBoundary.color || '#6366f1',
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
        )}

        {isPicker && pickedLocation && icons?.red && (
          <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={icons.red} zIndexOffset={1000}>
            <Popup>
              <div className="p-2 font-sans max-w-xs">
                <span className="font-bold text-indigo-600 block text-xs mb-1">الموقع المحدد:</span>
                {pickedLocation.loading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                    <span>جاري جلب تفاصيل العنوان...</span>
                  </div>
                ) : (
                  <p className="text-slate-700 text-xs font-medium leading-relaxed">{pickedLocation.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {!isPicker && isValidPosition(center) && icons?.red && (
          <Marker position={center} icon={icons.red} zIndexOffset={1000}>
            <Popup>
              <span className="font-bold text-indigo-600">{displayLabel || "المركز المحدد"}</span>
            </Popup>
          </Marker>
        )}

        {/* Business Markers with Flyer & Call/Message buttons */}
        {icons && safeMarkers.map((marker) => (
          <Marker
            key={`pin-biz-${marker.id}`}
            position={marker.position}
            icon={marker.active ? icons.violet : icons.blue}
          >
            <Popup>
              <div className="p-1 font-sans w-56">
                {marker.flyerUrl && (
                  <div className="h-24 w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                    <img
                      src={marker.flyerUrl}
                      alt={marker.label || "Business"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=500";
                      }}
                    />
                  </div>
                )}

                <span className="font-black text-slate-900 block text-sm truncate mb-0.5">{marker.label}</span>
                {marker.address && <span className="text-[11px] text-slate-500 block truncate mb-3">{marker.address}</span>}

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                  {marker.phone ? (
                    <a
                      href={`tel:${marker.phone}`}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                      title="call"
                    >
                      <Phone size={12} />
                      <span>{t("search.call")}</span>
                    </a>
                  ) : (
                    <button className="bg-slate-50 text-slate-300 py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                      <Phone size={12} /><span>{t("search.call")}</span>
                    </button>
                  )}

                  {marker.whatsapp || marker.phone ? (
                    <a
                      href={`https://wa.me/${(marker.whatsapp || marker.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t("details_ads.whatsapp_default_msg") || "Hello, I found your profile.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-50 hover:bg-green-100 text-green-700 py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                      title="whatsapp"
                    >
                      <MessageCircle size={12} />
                      <span>{t("search.whatsapp")}</span>
                    </a>
                  ) : (
                    <button className="bg-slate-50 text-slate-300 py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                      <MessageCircle size={12} /><span>{t("search.message")}</span>
                    </button>
                  )}

                  <a
                    href={`/businesses/${marker.id}`}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                    title="details"
                  >
                    <ExternalLink size={12} />
                    <span>{t("search.details")}</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {isPicker && <MapPickerHandler />}
        <MapViewUpdater center={activePosition} zoom={13} />
      </MapContainer>

      {isPicker && onLocationSelect && (
        <button
          type="button"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              handleReverseGeocode(pos.coords.latitude, pos.coords.longitude);
            });
          }}
          className="absolute bottom-6 right-6 z-500 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 text-indigo-600 transition-all"
          title="موقعي الحالي"
        >
          <Navigation2 className="w-5 h-5 fill-current" />
        </button>
      )}
    </div>
  );
}