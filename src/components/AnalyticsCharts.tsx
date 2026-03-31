"use client";

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type AnalyticsResponse = {
  totalIssues: number;
  issuesPerCategory: Array<{ category: string; _count: { category: number } }>;
  topLocations: Array<[string, number]>;
  avgResolutionHours: number;
};

export function AnalyticsCharts({ analytics }: { analytics: AnalyticsResponse }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Issues per category</h3>
        <Bar
          data={{
            labels: analytics.issuesPerCategory.map((item) => item.category),
            datasets: [
              {
                label: "Issues",
                data: analytics.issuesPerCategory.map((item) => item._count.category),
                backgroundColor: "#334155",
              },
            ],
          }}
        />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Summary</h3>
        <p className="mt-2 text-sm">Total issues: {analytics.totalIssues}</p>
        <p className="text-sm">Avg resolution time: {analytics.avgResolutionHours.toFixed(2)} hrs</p>
        <p className="mt-2 text-sm font-medium">Most affected locations</p>
        <ul className="list-disc pl-5 text-sm text-slate-700">
          {analytics.topLocations.map(([loc, count]) => (
            <li key={loc}>
              {loc}: {count}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
