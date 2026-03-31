"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { StatusBadge } from "@/components/StatusBadge";
import { FeedbackForm } from "@/components/FeedbackForm";

type Issue = {
  id: string;
  category: string;
  description: string;
  severity: string;
  status: "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED";
  images: string[];
  duplicateOfId?: string | null;
  createdAt: string;
};

export function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState({ category: "", severity: "", status: "" });

  useEffect(() => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => !!value) as [string, string][]
    ).toString();
    fetch(`/api/issues${query ? `?${query}` : ""}`)
      .then((res) => res.json())
      .then((data) => setIssues(data.issues ?? []));
  }, [filters]);

  const hasIssues = useMemo(() => issues.length > 0, [issues.length]);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Track Reported Issues</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {["category", "severity", "status"].map((name) => (
          <input
            key={name}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder={`Filter by ${name}`}
            value={filters[name as keyof typeof filters]}
            onChange={(e) => setFilters((prev) => ({ ...prev, [name]: e.target.value.toUpperCase() }))}
          />
        ))}
      </div>
      {!hasIssues && <p className="text-sm text-slate-600">No issues found.</p>}
      <div className="grid gap-3">
        {issues.map((issue) => (
          <article key={issue.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{issue.category}</h3>
              <StatusBadge status={issue.status} />
            </div>
            <p className="text-sm text-slate-700">{issue.description}</p>
            <p className="mt-1 text-xs text-slate-500">Severity: {issue.severity}</p>
            {issue.duplicateOfId && <p className="text-xs text-amber-700">Potential duplicate of {issue.duplicateOfId}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {issue.images?.map((image) => (
                <Image key={image} src={image} alt="Issue" width={80} height={80} className="h-20 w-20 rounded object-cover" />
              ))}
            </div>
            {issue.status === "RESOLVED" && <FeedbackForm issueId={issue.id} />}
          </article>
        ))}
      </div>
    </section>
  );
}
