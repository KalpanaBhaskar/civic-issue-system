"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { AdminIssueTable } from "@/components/AdminIssueTable";
import { AdminMapView } from "@/components/AdminMapView";
import { LogoutButton } from "@/components/LogoutButton";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type AnalyticsResponse = {
  totalIssues: number;
  issuesPerCategory: Array<{ category: string; _count: { category: number } }>;
  issuesPerSeverity?: Array<{ severity: string; _count: { severity: number } }>;
  topLocations: Array<[string, number]>;
  avgResolutionHours: number;
};

type Issue = {
  id: string;
  category: string;
  description: string;
  severity: string;
  status: "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED";
  latitude: number;
  longitude: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  feedbacks: Array<{ id: string; rating: number; comment: string }>;
};

type TabKey = "dashboard" | "trends" | "map";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = status === "authenticated" && role === "ADMIN";

  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) router.replace("/admin/login");
  }, [isAdmin, router, status]);

  useEffect(() => {
    if (!isAdmin) return;

    (async () => {
      const [issuesRes, analyticsRes] = await Promise.all([
        fetch("/api/issues"),
        fetch("/api/admin/analytics"),
      ]);

      const issuesData = await issuesRes.json();
      const analyticsData = await analyticsRes.json();

      if (!issuesRes.ok) {
        setError(issuesData?.error ?? "Failed to load issues");
        return;
      }
      if (!analyticsRes.ok) {
        setError(analyticsData?.error ?? "Failed to load analytics");
        return;
      }

      setIssues((issuesData?.issues ?? []) as Issue[]);
      setAnalytics(analyticsData as AnalyticsResponse);
    })().catch((e) => setError(e?.message ?? "Failed to load admin data"));
  }, [isAdmin]);

  const markers = useMemo(() => {
    return issues
      .filter((i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude))
      .map((i) => ({
        lat: i.latitude,
        lng: i.longitude,
        category: i.category,
        severity: i.severity as "LOW" | "MEDIUM" | "HIGH",
        description: i.description,
      }));
  }, [issues]);

  const categoryValues = useMemo(() => {
    const items = analytics?.issuesPerCategory ?? [];
    const labels = items.map((i) => i.category);
    const values = items.map((i) => i._count.category);
    return { labels, values };
  }, [analytics]);

  const severityValues = useMemo(() => {
    const items = analytics?.issuesPerSeverity ?? [];
    const map = new Map(items.map((i) => [i.severity, i._count.severity]));
    const labels = ["LOW", "MEDIUM", "HIGH"];
    const values = labels.map((s) => map.get(s) ?? 0);
    const colors = ["#22c55e", "#f59e0b", "#ef4444"];
    return { labels, values, colors };
  }, [analytics]);

  const statusTrend = useMemo(() => {
    // Approximation: group by date when the issue's `updatedAt` changed to its *current* status.
    const byDay = new Map<string, { UNDER_REVIEW: number; IN_PROGRESS: number; RESOLVED: number }>();
    for (const issue of issues) {
      const dt = issue.updatedAt ? new Date(issue.updatedAt) : null;
      if (!dt || Number.isNaN(dt.getTime())) continue;
      const day = dt.toISOString().slice(0, 10);
      const curr = byDay.get(day) ?? { UNDER_REVIEW: 0, IN_PROGRESS: 0, RESOLVED: 0 };
      curr[issue.status] = (curr[issue.status] ?? 0) + 1;
      byDay.set(day, curr);
    }

    const daysSorted = [...byDay.keys()].sort();
    const lastDays = daysSorted.slice(Math.max(0, daysSorted.length - 10));

    const under = lastDays.map((d) => byDay.get(d)?.UNDER_REVIEW ?? 0);
    const inprog = lastDays.map((d) => byDay.get(d)?.IN_PROGRESS ?? 0);
    const resolved = lastDays.map((d) => byDay.get(d)?.RESOLVED ?? 0);

    const totals = lastDays.map((_, idx) => under[idx] + inprog[idx] + resolved[idx]);
    const maxTotal = Math.max(...totals, 1);

    return {
      labels: lastDays,
      datasets: [
        { label: "Under Review", data: under, backgroundColor: "#f59e0b" },
        { label: "In Progress", data: inprog, backgroundColor: "#3b82f6" },
        { label: "Resolved", data: resolved, backgroundColor: "#22c55e" },
      ],
      maxTotal,
    };
  }, [issues]);

  const trendCharts = useMemo(() => {
    const catMax = Math.max(...categoryValues.values, 1);
    const sevMax = Math.max(...severityValues.values, 1);

    return {
      catMax,
      sevMax,
    };
  }, [categoryValues.values, severityValues.values]);

  if (!isAdmin) {
    return (
      <main className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          Loading admin...
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">Welcome, Admin</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "dashboard" ? "bg-slate-900 text-white shadow-sm" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "trends" ? "bg-slate-900 text-white shadow-sm" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "map" ? "bg-slate-900 text-white shadow-sm" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Map
            </button>
          </div>

          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {!analytics && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading analytics...
          </div>
        )}

        {/* Dashboard tab (existing UI) */}
        {activeTab === "dashboard" && analytics && (
          <>
            <AnalyticsCharts analytics={analytics} />
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">Issue Management</h2>
              <AdminIssueTable initialIssues={issues} />
            </section>
          </>
        )}

        {/* Trends tab (graphs only) */}
        {activeTab === "trends" && analytics && (
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg Resolution</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.avgResolutionHours.toFixed(1)}h</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Locations</p>
                <div className="mt-3 space-y-2 text-sm">
                  {analytics.topLocations.length === 0 ? (
                    <p className="text-slate-500">No location data available.</p>
                  ) : (
                    analytics.topLocations.map(([loc, count]) => (
                      <div key={loc} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="font-medium text-slate-700">{loc}</span>
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Issues per Category</h3>
                <div className="relative h-72">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: "#64748b" } },
                        y: { beginAtZero: true, max: trendCharts.catMax, ticks: { precision: 0 } },
                      },
                    }}
                    data={{
                      labels: categoryValues.labels,
                      datasets: [
                        {
                          label: "Issues",
                          data: categoryValues.values,
                          backgroundColor: "#0f172a",
                          borderRadius: 8,
                        },
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Issues per Severity</h3>
                <div className="relative h-72">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: "#64748b" } },
                        y: { beginAtZero: true, max: trendCharts.sevMax, ticks: { precision: 0 } },
                      },
                    }}
                    data={{
                      labels: severityValues.labels,
                      datasets: [
                        {
                          label: "Issues",
                          data: severityValues.values,
                          backgroundColor: severityValues.colors,
                          borderRadius: 8,
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Status Trend</h3>
              <div className="relative h-80">
                <Bar
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                    scales: {
                      x: { stacked: true, grid: { display: false }, ticks: { color: "#64748b" } },
                      y: { stacked: true, beginAtZero: true, max: statusTrend.maxTotal, ticks: { precision: 0 } },
                    },
                  }}
                  data={{
                    labels: statusTrend.labels,
                    datasets: statusTrend.datasets.map((d) => ({
                      label: d.label,
                      data: d.data,
                      backgroundColor: d.backgroundColor,
                    })),
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Map tab */}
        {activeTab === "map" && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Issue Map</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <AdminMapView markers={markers} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}