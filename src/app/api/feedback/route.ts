import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const parsed = feedbackSchema.parse(await request.json());
    const issue = await prisma.issue.findUnique({ where: { id: parsed.issueId } });
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    if (issue.status !== "RESOLVED") {
      return NextResponse.json({ error: "Feedback allowed only for resolved issues" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({ data: parsed });
    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit feedback", details: String(error) }, { status: 400 });
  }
}
