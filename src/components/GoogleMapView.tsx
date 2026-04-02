"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import { useMemo } from "react";
import "@/lib/leaflet";

type Severity = "LOW" | "MEDIUM" | "HIGH";

export type MapMarker = {
  lat: number;
  lng: number;
  category: string;
  severity: Severity;
  description: string;
};

function severityToColor(severity: Severity) {
  switch (severity) {
    case "LOW":
      return "#22c55e"; // green
    case "MEDIUM":
      return "#f59e0b"; // orange
    case "HIGH":
      return "#ef4444"; // red
    default:
      return "#64748b";
  }
}

export function GoogleMapView({ markers }: { markers: MapMarker[] }) {
  const center = useMemo(() => {
    const first = markers[0];
    return first ? ([first.lat, first.lng] as [number, number]) : ([0, 0] as [number, number]);
  }, [markers]);

  const hasValidMarkers = markers.some((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

  const iconFor = (severity: Severity) => {
    const color = severityToColor(severity);
    const html = `<div style="
      width:18px;
      height:18px;
      border-radius:9999px;
      background:${color};
      border:2px solid white;
      box-shadow:0 4px 14px rgba(0,0,0,0.18);
    " />`;
    return L.divIcon({ html, className: "", iconSize: [18, 18], iconAnchor: [9, 9] });
  };

  if (!hasValidMarkers) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-500">
        Location not available
      </div>
    );
  }

  return (
    <div className="h-56 w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center} zoom={16} className="h-full w-full scroll-smooth" style={{ zIndex: 0 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m, idx) => (
          <Marker
            key={`${m.lat}-${m.lng}-${idx}`}
            position={[m.lat, m.lng]}
            icon={iconFor(m.severity)}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1} className="max-w-xs whitespace-normal">
              <div className="text-xs font-semibold text-slate-900">
                {m.category} · {m.severity.replaceAll("_", " ")}
              </div>
              <div className="mt-1 text-xs text-slate-600">{m.description.slice(0, 80)}{m.description.length > 80 ? "…" : ""}</div>
            </Tooltip>
            <Popup>
              <div className="max-w-xs">
                <div className="text-sm font-semibold text-slate-900">
                  {m.category} · {m.severity.replaceAll("_", " ")}
                </div>
                <p className="mt-1 text-sm text-slate-700">{m.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}