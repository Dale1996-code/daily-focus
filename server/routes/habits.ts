import type { Express } from "express";
import { z } from "zod";
import { parseBodyOrSend, requireOwnerId, sendNotFound } from "./http";
import type { RouteDeps } from "./types";

const optionalNullableDateSchema = z
  .union([z.coerce.date(), z.null()])
  .optional();

const createHabitSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    streak: z.number().int().min(0).optional().default(0),
    completedToday: z.boolean().optional().default(false),
    lastCompletedDate: z.string().trim().optional().nullable(),
    lastCompletedAt: optionalNullableDateSchema,
  })
  .strict();

const patchHabitSchema = createHabitSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export function registerHabitRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/habits", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const data = await deps.storage.getHabits(ownerId);
    res.json(data);
  });

  app.post("/api/habits", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, createHabitSchema, req.body);
    if (!parsed) return;

    const habit = await deps.storage.createHabit(ownerId, parsed);
    res.status(201).json(habit);
  });

  app.patch("/api/habits/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, patchHabitSchema, req.body);
    if (!parsed) return;

    const habit = await deps.storage.updateHabit(ownerId, req.params.id, parsed);
    if (!habit) return sendNotFound(res, "Habit");
    res.json(habit);
  });

  app.delete("/api/habits/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    await deps.storage.deleteHabit(ownerId, req.params.id);
    res.status(204).send();
  });
}
