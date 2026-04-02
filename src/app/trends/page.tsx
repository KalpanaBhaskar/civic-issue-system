"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type AnalyticsResponse = {
  totalIssues: number;
  issuesPerCategory: Array<{ category: string; _count: { category: number } }>;
  issuesPerSeverity: Array<{ severity: string; _count: { severity: number } }>;
  topLocations: Array<[string, number]>;
  avgResolutionHours: number;
};

export default function TrendsPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = status === "authenticated" && session?.user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return;

    (async () => {
      const res = await fetch("/api/admin/analytics", { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to load trends.");
        return;
      }
      setError(null);
      setAnalytics(data as AnalyticsResponse);
    })();
  }, [isAdmin]);

  const severityData = useMemo(() => {
    const map = new Map(
      (analytics?.issuesPerSeverity ?? []).map((item) => [item.severity, item._count.severity] as const)
    );
    return {
      labels: ["LOW", "MEDIUM", "HIGH"],
      values: ["LOW", "MEDIUM", "HIGH"].map((s) => map.get(s) ?? 0),
    };
  }, [analytics]);

  return (
    <main className="space-y-6">
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Welcome, Admin</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trends</h1>
        <p className="text-sm text-slate-600">Insights across reported issues, resolution time, and locations.</p>
      </div>

      {status === "authenticated" && !isAdmin && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Admin access required.</div>
      )}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {!analytics && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading trends...</div>
      )}

      {analytics && (
        <>
          <AnalyticsCharts
            analytics={{
              totalIssues: analytics.totalIssues,
              issuesPerCategory: analytics.issuesPerCategory,
              topLocations: analytics.topLocations,
              avgResolutionHours: analytics.avgResolutionHours,
            }}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Issues per Severity</h2>
            <Bar
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { ticks: { precision: 0 } },
                },
              }}
              data={{
                labels: severityData.labels,
                datasets: [
                  {
                    label: "Issues",
                    data: severityData.values,
                    backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
                    borderRadius: 8,
                  },
                ],
              }}
            />
          </section>
        </>
      )}
    </main>
  );
}

