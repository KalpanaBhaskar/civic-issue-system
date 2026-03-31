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
  feedbacks: Array<{ id: string; rating: number; comment: string }>;
};

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
    <div className="space-y-4">
      {issues.map((issue) => (
        <article key={issue.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{issue.category}</h3>
            <StatusBadge status={issue.status} />
          </div>
          <p className="text-sm text-slate-700">{issue.description}</p>
          <p className="text-xs text-slate-500">Severity: {issue.severity}</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="flex flex-wrap gap-2">
              {issue.images.map((image) => (
                <Image key={image} src={image} alt="Issue" width={96} height={96} className="h-24 w-24 rounded object-cover" />
              ))}
            </div>
            <GoogleMapView lat={issue.latitude} lng={issue.longitude} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded bg-blue-700 px-3 py-2 text-xs text-white" onClick={() => updateIssue(issue.id, { status: "IN_PROGRESS" })}>
              Mark In Progress
            </button>
            <button className="rounded bg-green-700 px-3 py-2 text-xs text-white" onClick={() => updateIssue(issue.id, { status: "RESOLVED" })}>
              Mark Resolved
            </button>
            <button className="rounded bg-amber-700 px-3 py-2 text-xs text-white" onClick={() => {
              const duplicateId = prompt("Enter issue ID to mark duplicate of:");
              if (duplicateId) updateIssue(issue.id, { duplicateOfId: duplicateId });
            }}>
              Mark Duplicate
            </button>
          </div>
          {issue.feedbacks.length > 0 && (
            <div className="mt-3 rounded-lg border border-slate-200 p-3">
              <h4 className="mb-2 text-sm font-semibold">Feedback</h4>
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
