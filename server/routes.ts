import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertHabitSchema, insertCaptureNoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Tasks ──────────────────────────────────────────────────────────
  app.get("/api/tasks", async (_req, res) => {
    const data = await storage.getTasks();
    res.json(data);
  });

  app.post("/api/tasks", async (req, res) => {
    const parsed = insertTaskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const task = await storage.createTask(parsed.data);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const task = await storage.updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    await storage.deleteTask(req.params.id);
    res.status(204).send();
  });

  // ── Habits ─────────────────────────────────────────────────────────
  app.get("/api/habits", async (_req, res) => {
    const data = await storage.getHabits();
    res.json(data);
  });

  app.post("/api/habits", async (req, res) => {
    const parsed = insertHabitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const habit = await storage.createHabit(parsed.data);
    res.status(201).json(habit);
  });

  app.patch("/api/habits/:id", async (req, res) => {
    const habit = await storage.updateHabit(req.params.id, req.body);
    if (!habit) return res.status(404).json({ error: "Habit not found" });
    res.json(habit);
  });

  app.delete("/api/habits/:id", async (req, res) => {
    await storage.deleteHabit(req.params.id);
    res.status(204).send();
  });

  // ── Quick Capture Notes ────────────────────────────────────────────
  app.get("/api/capture", async (_req, res) => {
    const data = await storage.getCaptureNotes();
    res.json(data);
  });

  app.post("/api/capture", async (req, res) => {
    const parsed = insertCaptureNoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const note = await storage.createCaptureNote(parsed.data);
    res.status(201).json(note);
  });

  app.delete("/api/capture/:id", async (req, res) => {
    await storage.deleteCaptureNote(req.params.id);
    res.status(204).send();
  });

  return httpServer;
}
