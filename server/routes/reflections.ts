import type { Express } from "express";
import { z } from "zod";
import { parseBodyOrSend, requireOwnerId } from "./http";
import type { RouteDeps } from "./types";

const createReflectionSchema = z
  .object({
    wentWell: z.string().trim().max(4000).optional().default(""),
    toImprove: z.string().trim().max(4000).optional().default(""),
    lingeringThoughts: z.string().trim().max(4000).optional().default(""),
  })
  .strict()
  .refine(
    (data) =>
      data.wentWell.length > 0 ||
      data.toImprove.length > 0 ||
      data.lingeringThoughts.length > 0,
    {
      message: "At least one answer is required",
    },
  );

export function registerReflectionRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/reflections", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const limitRaw = req.query.limit;
    const parsedLimit =
      typeof limitRaw === "string" && !Number.isNaN(Number(limitRaw))
        ? Number(limitRaw)
        : undefined;
    const limit = parsedLimit ? Math.min(Math.max(parsedLimit, 1), 100) : undefined;
    const data = await deps.storage.getReflectionEntries(ownerId, limit);
    res.json(data);
  });

  app.post("/api/reflections", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, createReflectionSchema, req.body);
    if (!parsed) return;

    const created = await deps.storage.createReflectionEntry(ownerId, parsed);
    res.status(201).json(created);
  });
}
