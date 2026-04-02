import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { haversineDistanceMeters } from "@/lib/utils";
import { issueCreateSchema } from "@/lib/validations";
import { uploadIssueImages } from "@/lib/upload";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const status = searchParams.get("status") || undefined;

    const issues = await prisma.issue.findMany({
      where: {
        category: category as never,
        severity: severity as never,
        status: status as never,
      },
      orderBy: { createdAt: "desc" },
      include: { feedbacks: true },
    });

    return NextResponse.json({ issues });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch issues", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const parsed = issueCreateSchema.parse({
      category: formData.get("category"),
      description: formData.get("description"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      severity: formData.get("severity"),
      sessionId: formData.get("sessionId") || undefined,
    });

    const imageUrls = files.length ? await uploadIssueImages(files) : [];

    const candidates = await prisma.issue.findMany({
      where: { category: parsed.category },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const normalizeForMatch = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

    const tokenSet = (value: string) =>
      new Set(
        normalizeForMatch(value)
          .split(" ")
          .map((t) => t.trim())
          .filter((t) => t.length >= 3)
      );

    let duplicateOfId: string | null = null;
    for (const issue of candidates) {
      const distance = haversineDistanceMeters(parsed.latitude, parsed.longitude, issue.latitude, issue.longitude);

      // Similarity: simple includes / token match (cheap but effective for hackathon/demo).
      const a = normalizeForMatch(parsed.description);
      const b = normalizeForMatch(issue.description);

      const includesMatch = a.length > 0 && b.length > 0 && (a.includes(b) || b.includes(a));
      const aTokens = tokenSet(a);
      const bTokens = tokenSet(b);
      const minTokenCount = Math.min(aTokens.size, bTokens.size);
      const intersectionCount = [...aTokens].filter((t) => bTokens.has(t)).length;
      const tokenMatchRatio = minTokenCount === 0 ? 0 : intersectionCount / minTokenCount;

      const descriptionMatch = includesMatch || tokenMatchRatio >= 0.4;

      if (distance <= 100 && descriptionMatch) {
        duplicateOfId = issue.id;
        break;
      }
    }

    const issue = await prisma.issue.create({
      data: {
        sessionId: parsed.sessionId,
        category: parsed.category,
        description: parsed.description,
        images: imageUrls,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        severity: parsed.severity,
        status: "UNDER_REVIEW",
        duplicateOfId,
      },
    });

    return NextResponse.json({ issue, duplicateDetected: !!duplicateOfId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create issue", details: String(error) }, { status: 400 });
  }
}
