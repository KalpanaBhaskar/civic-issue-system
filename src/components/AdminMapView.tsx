"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet";
import type { MapMarker } from "@/components/GoogleMapView";

function severityToColor(severity: MapMarker["severity"]) {
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

function iconFor(severity: MapMarker["severity"]) {
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
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (!markers.length) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
  }, [map, markers]);
  return null;
}

export function AdminMapView({ markers }: { markers: MapMarker[] }) {
  const center = useMemo(() => {
    const first = markers[0];
    return first ? ([first.lat, first.lng] as [number, number]) : ([0, 0] as [number, number]);
  }, [markers]);

  const hasValidMarkers = markers.some((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

  if (!hasValidMarkers) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-500">
        No issue locations available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MarkerClusterGroup chunkedLoading>
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
                <div className="mt-1 text-xs text-slate-600">
                  {m.description.slice(0, 80)}
                  {m.description.length > 80 ? "…" : ""}
                </div>
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
        </MarkerClusterGroup>

        <FitBounds markers={markers} />
      </MapContainer>
    </div>
  );
}

