"use client";
import { useEffect, useMemo, useRef, useCallback } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Truck } from "lucide-react";

export interface VehiclePosition {
  name: string;
  plate: string;
  driver: string;
  lat: number;
  lng: number;
  speed: number;
  heading: string;
  status: "Moving" | "Idle" | "Stopped" | "Offline";
}

const defaultVehicles: VehiclePosition[] = [
  { name: "Toyota Hilux", plate: "AA-3-5678", driver: "Solomon T.", lat: 8.9806, lng: 38.7578, speed: 65, heading: "NE", status: "Moving" },
  { name: "Isuzu Truck", plate: "AA-1-1234", driver: "Petros H.", lat: 9.0241, lng: 38.7469, speed: 0, heading: "N", status: "Idle" },
  { name: "Land Cruiser", plate: "OR-2-9012", driver: "Mulugeta G.", lat: 8.9932, lng: 38.7998, speed: 72, heading: "SW", status: "Moving" },
  { name: "Hyundai H350", plate: "AA-4-3456", driver: "Daniel B.", lat: 8.9600, lng: 38.7700, speed: 0, heading: "-", status: "Stopped" },
  { name: "Mitsubishi Fuso", plate: "SN-1-7890", driver: "Bereket A.", lat: 9.03, lng: 38.81, speed: 0, heading: "-", status: "Offline" },
];

const statusColors: Record<string, string> = {
  Moving: "#10b981",
  Idle: "#f59e0b",
  Stopped: "#94a3b8",
  Offline: "#ef4444",
};

const pulseCss = `
@keyframes marker-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.leaflet-control-attribution { display: none !important; }
`;

function createVehicleIcon(status: string, isMoving: boolean): L.DivIcon {
  const color = statusColors[status] || "#94a3b8";
  return L.divIcon({
    className: "vehicle-marker",
    html: `<div style="
      width: 18px; height: 18px;
      background: ${color};
      border: 2.5px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ${isMoving ? `animation: marker-pulse 2s infinite;` : ""}
      cursor: pointer;
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FitBounds({ vehicles }: { vehicles: VehiclePosition[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (vehicles.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(
        vehicles.map((v) => [v.lat, v.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      fitted.current = true;
    }
  }, [vehicles, map]);

  return null;
}

/** In-map zoom controls that properly use useMap() */
function MapZoomControls() {
  const map = useMap();

  return (
    <div className="absolute left-3 bottom-3 flex flex-col gap-0.5 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors"
      >
        −
      </button>
    </div>
  );
}

/** Button inside popup that pans to the marker */
function PopupTrackButton({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  const handleClick = useCallback(() => {
    map.setView([lat, lng], 16, { animate: true });
  }, [map, lat, lng]);

  return (
    <button
      onClick={handleClick}
      className="mt-2 w-full text-[10px] font-semibold bg-slate-800 text-white rounded-lg py-1.5 hover:bg-slate-700 transition-colors"
    >
      <Truck size={10} className="inline mr-1" /> Center on Vehicle
    </button>
  );
}

const headingArrows: Record<string, string> = {
  N: "\u2191", NE: "\u2197", E: "\u2192", SE: "\u2198",
  S: "\u2193", SW: "\u2199", W: "\u2190", NW: "\u2196",
};

export default function MapView({ vehicles = defaultVehicles }: { vehicles?: VehiclePosition[] }) {
  const activeCount = vehicles.filter((v) => v.status === "Moving" || v.status === "Idle").length;

  // Fixed center on Addis Ababa — FitBounds handles initial zoom-to-fit on mount.
  // Dynamic center would cause the map to re-center on every simulation tick, so we hardcode it.
  const initialCenter = useRef<[number, number]>([9.0, 38.76]);
  const center = initialCenter.current;

  // Cache one icon per status so we don't create new L.divIcon instances on every render
  const iconCache = useMemo(() => {
    const cache: Record<string, L.DivIcon> = {};
    for (const [status, moving] of Object.entries({ Moving: true, Idle: false, Stopped: false, Offline: false })) {
      cache[status] = createVehicleIcon(status, moving);
    }
    return cache;
  }, []);

  return (
    <>
      <style>{pulseCss}</style>
      <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <MapContainer
          center={center}
          zoom={13}
          zoomControl={false}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution=""
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds vehicles={vehicles} />
          <MapZoomControls />

          {/* HQ Marker */}
          <Marker
            position={[8.997, 38.768]}
            icon={L.divIcon({
              className: "hq-marker",
              html: `<div style="
                width: 28px; height: 28px;
                background: #F9A230;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 12px rgba(0,0,0,0.4);
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: bold; color: white;
              ">HQ</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })}
          >
            <Popup>
              <div className="text-xs font-semibold">NEXYOVI HQ - Bole, Addis Ababa</div>
            </Popup>
          </Marker>

          {/* Vehicle Markers */}
          {vehicles.map((v, i) => {
            const arrow = headingArrows[v.heading] || "";
            return (
              <Marker key={`${v.plate}-${i}`} position={[v.lat, v.lng]} icon={iconCache[v.status] || iconCache.Moving}>
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: statusColors[v.status] }}
                      />
                      <span className="font-bold text-sm">{v.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Plate: {v.plate}</div>
                      <div>Driver: {v.driver}</div>
                      <div className="flex items-center gap-2">
                        {v.speed > 0 ? (
                          <>
                            <span>{Math.round(v.speed)} km/h</span>
                            {arrow && <span>{arrow} {v.heading}</span>}
                          </>
                        ) : (
                          <span className="text-slate-400">{v.status}</span>
                        )}
                      </div>
                    </div>
                    <PopupTrackButton lat={v.lat} lng={v.lng} />
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Vehicle list overlay */}
        <div className="absolute right-3 top-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow-xl w-48 z-[1000]">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">
            Live Fleet ({activeCount})
          </div>
          {vehicles.map((v, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: statusColors[v.status] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-800 truncate">
                  {v.name}
                </div>
                <div className="text-[9px] text-slate-400">
                  {v.speed > 0 ? `${v.speed} km/h` : v.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute left-3 top-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-md z-[1000]">
          <div className="flex items-center gap-3 text-[10px]">
            {Object.entries(statusColors).map(([status, color]) => (
              <span key={status} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {status}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
