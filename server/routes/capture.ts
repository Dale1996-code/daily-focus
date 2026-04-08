import type { Express } from "express";
import { z } from "zod";
import { parseBodyOrSend, requireOwnerId } from "./http";
import type { RouteDeps } from "./types";

const createCaptureSchema = z
  .object({
    content: z.string().trim().min(1).max(3000),
    processed: z.boolean().optional().default(false),
  })
  .strict();

export function registerCaptureRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/capture", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const data = await deps.storage.getCaptureNotes(ownerId);
    res.json(data);
  });

  app.post("/api/capture", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const parsed = parseBodyOrSend(res, createCaptureSchema, req.body);
    if (!parsed) return;

    const note = await deps.storage.createCaptureNote(ownerId, parsed);
    res.status(201).json(note);
  });

  app.delete("/api/capture/:id", async (req, res) => {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    await deps.storage.deleteCaptureNote(ownerId, req.params.id);
    res.status(204).send();
  });
}
