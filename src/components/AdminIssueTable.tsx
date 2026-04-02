"use client";

import { useState } from "react";
import Image from "next/image";
import { StatusBadge } from "@/components/StatusBadge";
import { GoogleMapView } from "@/components/GoogleMapView";

type Issue = {
  id: string;
  category: string;
  description: string;
  severity: string;
  status: "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED";
  latitude: number;
  longitude: number;
  images: string[];
  duplicateOfId?: string | null;
  createdAt?: string | Date;
  resolvedAt?: string | Date | null;
  feedbacks: Array<{ id: string; rating: number; comment: string }>;
};

function timeAgo(input: string | Date | undefined | null) {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 14) return `${days} days ago`;

  return date.toLocaleDateString();
}

function formatDuration(from: string | Date, to: string | Date) {
  const start = typeof from === "string" ? new Date(from) : from;
  const end = typeof to === "string" ? new Date(to) : to;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

  const diffMs = end.getTime() - start.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  if (days > 0) return `${days}d ${remHours}h`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function AdminIssueTable({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues);

  const updateIssue = async (id: string, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return;
    setIssues((prev) => prev.map((item) => (item.id === id ? { ...item, ...data.issue } : item)));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {issues.map((issue) => (
        <article key={issue.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{issue.category}</h3>
              <p className="text-xs text-slate-500">Issue ID: {issue.id.slice(0, 8)}...</p>
              <p className="mt-1 text-xs text-slate-500">Reported: {timeAgo(issue.createdAt)}</p>
              {issue.status === "RESOLVED" && issue.resolvedAt && (
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  Resolution time: {formatDuration(issue.createdAt ?? issue.resolvedAt, issue.resolvedAt)}
                </p>
              )}
            </div>
            <StatusBadge status={issue.status} />
          </div>
          <p className="text-sm leading-6 text-slate-600">{issue.description}</p>
          <p className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
            Severity: {issue.severity}
          </p>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="flex flex-wrap gap-2">
              {issue.images.map((image) => (
                <Image key={image} src={image} alt="Issue" width={96} height={96} className="h-24 w-24 rounded-xl border border-slate-200 object-cover" />
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2">
              <GoogleMapView
                markers={[
                  {
                    lat: issue.latitude,
                    lng: issue.longitude,
                    category: issue.category,
                    severity: issue.severity as "LOW" | "MEDIUM" | "HIGH",
                    description: issue.description,
                  },
                ]}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
              onClick={() => updateIssue(issue.id, { status: "IN_PROGRESS" })}
            >
              🚧 Mark In Progress
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
              onClick={() => updateIssue(issue.id, { status: "RESOLVED" })}
            >
              ✅ Mark Resolved
            </button>
            <button
              className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
              onClick={() => {
                const duplicateId = prompt("Enter issue ID to mark duplicate of:");
                if (duplicateId) updateIssue(issue.id, { duplicateOfId: duplicateId });
              }}
            >
              🔁 Mark Duplicate
            </button>
          </div>

          {issue.feedbacks.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Feedback</h4>
              {issue.feedbacks.map((feedback) => (
                <p key={feedback.id} className={`text-sm ${feedback.rating <= 2 ? "text-red-700" : "text-slate-700"}`}>
                  {feedback.rating}/5 - {feedback.comment}
                </p>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
