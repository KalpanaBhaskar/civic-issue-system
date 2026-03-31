import { prisma } from "@/lib/prisma";

export async function getIssueStats() {
  const [totalIssues, issuesPerCategory] = await Promise.all([
    prisma.issue.count(),
    prisma.issue.groupBy({ by: ["category"], _count: { category: true } }),
  ]);
  return { totalIssues, issuesPerCategory };
}
