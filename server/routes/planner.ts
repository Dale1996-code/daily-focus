import type { Express } from "express";
import { z } from "zod";
import { plannerEventTypeValues } from "@shared/schema";
import { parseBodyOrSend, requireOwnerId, sendNotFound } from "./http";
import type { RouteDeps } from "./types";

const plannerEventBaseSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    eventType: z.enum(plannerEventTypeValues).default("focus"),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    attendees: z.number().int().min(0).max(1000).optional().default(0),
    notes: z.string().trim().max(3000).optional().nullable(),
  });

const createPlannerEventSchema = plannerEventBaseSchema
  .refine((data) => data.endsAt > data.startsAt, {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

const patchPlannerEventSchema = plannerEventBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  })
  .refine(
    (data) =>
      !data.startsAt ||
      !data.endsAt ||
      (data.startsAt instanceof Date &&
        data.endsAt instanceof Date &&
        data.endsAt > data.startsAt),
    {
      message: "endsAt must be after startsAt",
      path: ["endsAt"],
    },
  );

export function registerPlannerRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/planner-events", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const start = typeof req.query.start === "string" ? new Date(req.query.start) : undefined;
    const end = typeof req.query.end === "string" ? new Date(req.query.end) : undefined;
    const range = {
      start: start && !Number.isNaN(start.getTime()) ? start : undefined,
      end: end && !Number.isNaN(end.getTime()) ? end : undefined,
    };

    const data = await deps.storage.getPlannerEvents(ownerId, range);
    res.json(data);
  });

  app.post("/api/planner-events", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, createPlannerEventSchema, req.body);
    if (!parsed) return;

    const created = await deps.storage.createPlannerEvent(ownerId, parsed);
    res.status(201).json(created);
  });

  app.patch("/api/planner-events/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, patchPlannerEventSchema, req.body);
    if (!parsed) return;

    const updated = await deps.storage.updatePlannerEvent(
      ownerId,
      req.params.id,
      parsed,
    );
    if (!updated) return sendNotFound(res, "Planner event");
    res.json(updated);
  });

  app.delete("/api/planner-events/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    await deps.storage.deletePlannerEvent(ownerId, req.params.id);
    res.status(204).send();
  });
}
