import { z } from "zod";

export const issueCreateSchema = z.object({
  category: z.enum(["ROAD", "WASTE", "WATER", "TRAFFIC", "STREETLIGHT"]),
  description: z.string().min(10).max(1000),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  sessionId: z.string().optional(),
});

export const issueUpdateSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"]).optional(),
  duplicateOfId: z.string().uuid().nullable().optional(),
  mergeToIssueId: z.string().uuid().optional(),
});

export const feedbackSchema = z.object({
  issueId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).max(500),
});
