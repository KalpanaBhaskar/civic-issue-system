"use client";

import { useEffect, useState } from "react";

const categories = ["ROAD", "WASTE", "WATER", "TRAFFIC", "STREETLIGHT"] as const;
const severities = ["LOW", "MEDIUM", "HIGH"] as const;

export function IssueForm() {
  const [category, setCategory] = useState<(typeof categories)[number]>("ROAD");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<(typeof severities)[number]>("LOW");

  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");

  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fromStorage = localStorage.getItem("civic_session_id");
    if (!fromStorage) {
      localStorage.setItem("civic_session_id", crypto.randomUUID());
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {
        setLat("");
        setLng("");
      }
    );
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lat === "" || lng === "") return;

    setLoading(true);
    setMessage(null);

    const form = new FormData();
    form.append("category", category);
    form.append("description", description);
    form.append("severity", severity);
    form.append("latitude", String(lat));
    form.append("longitude", String(lng));
    form.append("sessionId", localStorage.getItem("civic_session_id") ?? "");

    if (images) {
      Array.from(images).forEach((file) => form.append("images", file));
    }

    const res = await fetch("/api/issues", { method: "POST", body: form });
    const data = await res.json();

    setLoading(false);
    setMessage(
      res.ok
        ? data.duplicateDetected
          ? "Issue submitted and flagged as potential duplicate."
          : "Issue submitted successfully."
        : data.error ?? "Submission failed"
    );

    if (res.ok) {
      setDescription("");
      setImages(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Report Civic Issue</h2>

      <select value={category} onChange={(e) => setCategory(e.target.value as never)} className="w-full rounded border border-slate-300 px-3 py-2">
        {categories.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border border-slate-300 px-3 py-2"
        rows={5}
        placeholder="Describe the issue in detail"
        required
      />

      <select value={severity} onChange={(e) => setSeverity(e.target.value as never)} className="w-full rounded border border-slate-300 px-3 py-2">
        {severities.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>

      <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} className="w-full text-sm" />

      <div className="grid grid-cols-2 gap-3">
        <input
          value={lat === "" ? "" : lat}
          onChange={(e) => {
            const val = e.target.value;
            setLat(val === "" ? "" : Number(val));
          }}
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Latitude"
        />
        <input
          value={lng === "" ? "" : lng}
          onChange={(e) => {
            const val = e.target.value;
            setLng(val === "" ? "" : Number(val));
          }}
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Longitude"
        />
      </div>

      <button disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-70">
        {loading ? "Submitting..." : "Submit issue"}
      </button>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </form>
  );
}