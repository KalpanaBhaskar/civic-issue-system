import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { issueUpdateSchema } from "@/lib/validations";
import { authOptions } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = (await getServerSession(authOptions as never)) as { user?: { role?: string } } | null;
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = issueUpdateSchema.parse(await request.json());
    const updateData: Record<string, unknown> = {};

    if (parsed.status) {
      updateData.status = parsed.status;
      if (parsed.status === "RESOLVED") updateData.resolvedAt = new Date();
    }
    if (parsed.duplicateOfId !== undefined) updateData.duplicateOfId = parsed.duplicateOfId;

    if (parsed.mergeToIssueId) {
      await prisma.issue.updateMany({
        where: { duplicateOfId: id },
        data: { duplicateOfId: parsed.mergeToIssueId },
      });
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ issue });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update issue", details: String(error) }, { status: 400 });
  }
}
