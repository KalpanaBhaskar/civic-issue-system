"use client";

import { useState } from "react";

export function FeedbackForm({ issueId }: { issueId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId, rating, comment }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? "Feedback submitted" : data.error ?? "Submission failed");
    if (res.ok) setComment("");
  };

  return (
    <form onSubmit={submit} className="mt-2 space-y-2 rounded-lg border border-slate-200 p-3">
      <h4 className="text-sm font-semibold">Share feedback</h4>
      <div className="flex items-center gap-2">
        <label className="text-sm">Rating</label>
        <select
          className="rounded border border-slate-300 px-2 py-1 text-sm"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />
      <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60" disabled={loading}>
        {loading ? "Saving..." : "Submit feedback"}
      </button>
      {message && <p className="text-xs text-slate-600">{message}</p>}
    </form>
  );
}
