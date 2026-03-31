import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { AdminIssueTable } from "@/components/AdminIssueTable";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { getIssueStats } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton"; // ✅ added

export default async function AdminPage() {
  const session = (await getServerSession(authOptions as never)) as { user?: { role?: string } } | null;

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const [issues, stats, resolved, locationClusters] = await Promise.all([
    prisma.issue.findMany({
      orderBy: { createdAt: "desc" },
      include: { feedbacks: true },
    }),
    getIssueStats(),
    prisma.issue.findMany({
      where: { status: "RESOLVED", resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    }),
    prisma.issue.findMany({
      select: { latitude: true, longitude: true },
    }),
  ]);

  const avgResolutionHours =
    resolved.length === 0
      ? 0
      : resolved.reduce((sum, item) => {
          const end = item.resolvedAt?.getTime() ?? item.createdAt.getTime();
          return sum + (end - item.createdAt.getTime());
        }, 0) /
        resolved.length /
        (1000 * 60 * 60);

  const topLocations = Object.entries(
    locationClusters.reduce<Record<string, number>>((acc, issue) => {
      const key = `${issue.latitude.toFixed(3)},${issue.longitude.toFixed(3)}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const analyticsRes = {
    totalIssues: stats.totalIssues,
    issuesPerCategory: stats.issuesPerCategory,
    avgResolutionHours,
    topLocations,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ✅ Header with Logout */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <LogoutButton />
        </div>

        <AnalyticsCharts analytics={analyticsRes} />

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            Issue Management
          </h2>
          <AdminIssueTable initialIssues={issues} />
        </section>

      </div>
    </main>
  );
}