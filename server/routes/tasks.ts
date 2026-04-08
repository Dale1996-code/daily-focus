import type { Express } from "express";
import { z } from "zod";
import { taskPriorityValues } from "@shared/schema";
import { parseBodyOrSend, requireOwnerId, sendNotFound } from "./http";
import type { RouteDeps } from "./types";

const optionalNullableDateSchema = z
  .union([z.coerce.date(), z.null()])
  .optional();

const createTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    category: z.string().trim().min(1).max(80).default("General"),
    priority: z.enum(taskPriorityValues).default("medium"),
    completed: z.boolean().optional().default(false),
    overdue: z.boolean().optional().default(false),
    dueDate: z.string().trim().min(1).optional().nullable(),
    dueAt: optionalNullableDateSchema,
  })
  .strict();

const patchTaskSchema = createTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export function registerTaskRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/tasks", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const data = await deps.storage.getTasks(ownerId);
    res.json(data);
  });

  app.post("/api/tasks", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, createTaskSchema, req.body);
    if (!parsed) return;

    const task = await deps.storage.createTask(ownerId, parsed);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, patchTaskSchema, req.body);
    if (!parsed) return;

    const task = await deps.storage.updateTask(ownerId, req.params.id, parsed);
    if (!task) return sendNotFound(res, "Task");
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    await deps.storage.deleteTask(ownerId, req.params.id);
    res.status(204).send();
  });
}
