"use client";

export function GoogleMapView({ lat, lng }: { lat: number; lng: number }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const src = `https://www.google.com/maps/embed/v1/view?key=${key}&center=${lat},${lng}&zoom=17`;
  return (
    <div className="h-56 w-full overflow-hidden rounded-xl border border-slate-200">
      {key ? (
        <iframe title="Issue location map" width="100%" height="100%" style={{ border: 0 }} src={src} loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show map.
        </div>
      )}
    </div>
  );
}
