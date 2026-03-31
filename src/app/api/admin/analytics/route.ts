import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions as never)) as { user?: { role?: string } } | null;
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalIssues, issuesPerCategory, allResolved, locationClusters] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.groupBy({ by: ["category"], _count: { category: true } }),
      prisma.issue.findMany({
        where: { status: "RESOLVED", resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.issue.findMany({
        select: { latitude: true, longitude: true, category: true },
      }),
    ]);

    const avgResolutionHours =
      allResolved.length === 0
        ? 0
        : allResolved.reduce((sum, item) => {
            const end = item.resolvedAt?.getTime() ?? item.createdAt.getTime();
            return sum + (end - item.createdAt.getTime());
          }, 0) /
          allResolved.length /
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

    return NextResponse.json({
      totalIssues,
      issuesPerCategory,
      topLocations,
      avgResolutionHours,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load analytics", details: String(error) }, { status: 500 });
  }
}
