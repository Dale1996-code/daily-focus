import type { Express } from "express";
import { z } from "zod";
import { parseBodyOrSend, requireOwnerId, sendNotFound } from "./http";
import type { RouteDeps } from "./types";

const createBlueprintSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional().default(""),
    category: z.string().trim().min(1).max(100).default("General"),
    items: z.array(z.string().trim().min(1).max(400)).min(1).max(100),
  })
  .strict();

const patchBlueprintSchema = createBlueprintSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export function registerBlueprintRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/blueprints", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const data = await deps.storage.getBlueprints(ownerId);
    res.json(data);
  });

  app.post("/api/blueprints", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, createBlueprintSchema, req.body);
    if (!parsed) return;

    const created = await deps.storage.createBlueprint(ownerId, parsed);
    res.status(201).json(created);
  });

  app.patch("/api/blueprints/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, patchBlueprintSchema, req.body);
    if (!parsed) return;

    const updated = await deps.storage.updateBlueprint(
      ownerId,
      req.params.id,
      parsed,
    );
    if (!updated) return sendNotFound(res, "Blueprint");
    res.json(updated);
  });

  app.delete("/api/blueprints/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    await deps.storage.deleteBlueprint(ownerId, req.params.id);
    res.status(204).send();
  });
}
