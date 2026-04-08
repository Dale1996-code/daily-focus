import type { Express } from "express";
import { z } from "zod";
import { focusModeValues } from "@shared/schema";
import { parseBodyOrSend, requireOwnerId } from "./http";
import type { RouteDeps } from "./types";

const optionalDateSchema = z.coerce.date().optional();
const optionalNullableDateSchema = z
  .union([z.coerce.date(), z.null()])
  .optional();

const createFocusSessionSchema = z
  .object({
    taskTitle: z.string().trim().max(200).optional().nullable(),
    mode: z.enum(focusModeValues).default("focus"),
    durationSeconds: z.number().int().positive(),
    completed: z.boolean().optional().default(true),
    startedAt: optionalDateSchema,
    endedAt: optionalNullableDateSchema,
  })
  .strict();

export function registerFocusRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/focus-sessions", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const limitRaw = req.query.limit;
    const parsedLimit =
      typeof limitRaw === "string" && !Number.isNaN(Number(limitRaw))
        ? Number(limitRaw)
        : undefined;
    const limit = parsedLimit ? Math.min(Math.max(parsedLimit, 1), 100) : undefined;
    const data = await deps.storage.getFocusSessions(ownerId, limit);
    res.json(data);
  });

  app.post("/api/focus-sessions", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, createFocusSessionSchema, req.body);
    if (!parsed) return;

    const created = await deps.storage.createFocusSession(ownerId, parsed);
    res.status(201).json(created);
  });
}
