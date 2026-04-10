import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import session from "express-session";
import { createServer } from "http";
import request from "supertest";
import { registerRoutes } from "../routes";
import type { IStorage } from "../storage";
import type {
  Blueprint,
  CaptureNote,
  FocusSession,
  Habit,
  InsertBlueprint,
  InsertCaptureNote,
  InsertFocusSession,
  InsertHabit,
  InsertPlannerEvent,
  InsertReflectionEntry,
  InsertTask,
  InsertUser,
  PlannerEvent,
  ReflectionEntry,
  Task,
  User,
} from "@shared/schema";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createMemoryStorage(): IStorage {
  const users: User[] = [];
  const tasks: Task[] = [];
  const habits: Habit[] = [];
  const notes: CaptureNote[] = [];
  const plannerEvents: PlannerEvent[] = [];
  const focusSessions: FocusSession[] = [];
  const reflectionEntries: ReflectionEntry[] = [];
  const blueprints: Blueprint[] = [];

  const byOwner = <T extends { ownerId: string }>(rows: T[], ownerId: string) =>
    rows.filter((row) => row.ownerId === ownerId);

  return {
    async getUser(id: string) {
      return users.find((user) => user.id === id);
    },
    async getUserByUsername(username: string) {
      return users.find((user) => user.username === username);
    },
    async countUsers() {
      return users.length;
    },
    async createUser(user: InsertUser) {
      const created: User = {
        id: createId("user"),
        username: user.username,
        password: user.password,
        createdAt: new Date(),
      };
      users.push(created);
      return created;
    },
    async updateUserPassword(id: string, password: string) {
      const user = users.find((item) => item.id === id);
      if (user) user.password = password;
    },
    async getTasks(ownerId: string) {
      return byOwner(tasks, ownerId).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    },
    async createTask(ownerId: string, task: InsertTask) {
      const created: Task = {
        id: createId("task"),
        ownerId,
        title: task.title,
        category: task.category ?? "General",
        priority: task.priority ?? "medium",
        completed: task.completed ?? false,
        overdue: task.overdue ?? false,
        dueDate: task.dueDate ?? null,
        dueAt: task.dueAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      tasks.push(created);
      return created;
    },
    async updateTask(ownerId: string, id: string, updates: Partial<InsertTask>) {
      const item = tasks.find((task) => task.id === id && task.ownerId === ownerId);
      if (!item) return undefined;
      Object.assign(item, updates, { updatedAt: new Date() });
      return item;
    },
    async deleteTask(ownerId: string, id: string) {
      const index = tasks.findIndex((task) => task.id === id && task.ownerId === ownerId);
      if (index >= 0) tasks.splice(index, 1);
    },
    async getHabits(ownerId: string) {
      return byOwner(habits, ownerId).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    },
    async createHabit(ownerId: string, habit: InsertHabit) {
      const created: Habit = {
        id: createId("habit"),
        ownerId,
        title: habit.title,
        streak: habit.streak ?? 0,
        completedToday: habit.completedToday ?? false,
        lastCompletedDate: habit.lastCompletedDate ?? null,
        lastCompletedAt: habit.lastCompletedAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      habits.push(created);
      return created;
    },
    async updateHabit(ownerId: string, id: string, updates: Partial<InsertHabit>) {
      const item = habits.find((habit) => habit.id === id && habit.ownerId === ownerId);
      if (!item) return undefined;
      Object.assign(item, updates, { updatedAt: new Date() });
      return item;
    },
    async deleteHabit(ownerId: string, id: string) {
      const index = habits.findIndex((habit) => habit.id === id && habit.ownerId === ownerId);
      if (index >= 0) habits.splice(index, 1);
    },
    async getCaptureNotes(ownerId: string) {
      return byOwner(notes, ownerId).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    },
    async createCaptureNote(ownerId: string, note: InsertCaptureNote) {
      const created: CaptureNote = {
        id: createId("note"),
        ownerId,
        content: note.content,
        processed: note.processed ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      notes.push(created);
      return created;
    },
    async deleteCaptureNote(ownerId: string, id: string) {
      const index = notes.findIndex((note) => note.id === id && note.ownerId === ownerId);
      if (index >= 0) notes.splice(index, 1);
    },
    async getPlannerEvents(ownerId: string, range?: { start?: Date; end?: Date }) {
      return byOwner(plannerEvents, ownerId)
        .filter((event) => {
          if (range?.start && event.startsAt < range.start) return false;
          if (range?.end && event.endsAt > range.end) return false;
          return true;
        })
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    },
    async createPlannerEvent(ownerId: string, event: InsertPlannerEvent) {
      const created: PlannerEvent = {
        id: createId("planner"),
        ownerId,
        title: event.title,
        eventType: event.eventType ?? "focus",
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        attendees: event.attendees ?? 0,
        notes: event.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      plannerEvents.push(created);
      return created;
    },
    async updatePlannerEvent(ownerId: string, id: string, updates: Partial<InsertPlannerEvent>) {
      const item = plannerEvents.find((event) => event.id === id && event.ownerId === ownerId);
      if (!item) return undefined;
      Object.assign(item, updates, { updatedAt: new Date() });
      return item;
    },
    async deletePlannerEvent(ownerId: string, id: string) {
      const index = plannerEvents.findIndex(
        (event) => event.id === id && event.ownerId === ownerId,
      );
      if (index >= 0) plannerEvents.splice(index, 1);
    },
    async getFocusSessions(ownerId: string, limit = 30) {
      return byOwner(focusSessions, ownerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
    async createFocusSession(ownerId: string, session: InsertFocusSession) {
      const created: FocusSession = {
        id: createId("focus"),
        ownerId,
        taskTitle: session.taskTitle ?? null,
        mode: session.mode ?? "focus",
        durationSeconds: session.durationSeconds,
        completed: session.completed ?? true,
        startedAt: session.startedAt ?? new Date(),
        endedAt: session.endedAt ?? null,
        createdAt: new Date(),
      };
      focusSessions.push(created);
      return created;
    },
    async getReflectionEntries(ownerId: string, limit = 30) {
      return byOwner(reflectionEntries, ownerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
    async createReflectionEntry(ownerId: string, entry: InsertReflectionEntry) {
      const created: ReflectionEntry = {
        id: createId("refl"),
        ownerId,
        wentWell: entry.wentWell ?? "",
        toImprove: entry.toImprove ?? "",
        lingeringThoughts: entry.lingeringThoughts ?? "",
        createdAt: new Date(),
      };
      reflectionEntries.push(created);
      return created;
    },
    async getBlueprints(ownerId: string) {
      return byOwner(blueprints, ownerId).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    },
    async createBlueprint(ownerId: string, blueprint: InsertBlueprint) {
      const created: Blueprint = {
        id: createId("bp"),
        ownerId,
        title: blueprint.title,
        description: blueprint.description ?? "",
        category: blueprint.category ?? "General",
        items: blueprint.items ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      blueprints.push(created);
      return created;
    },
    async updateBlueprint(ownerId: string, id: string, updates: Partial<InsertBlueprint>) {
      const item = blueprints.find((blueprint) => blueprint.id === id && blueprint.ownerId === ownerId);
      if (!item) return undefined;
      Object.assign(item, updates, { updatedAt: new Date() });
      return item;
    },
    async deleteBlueprint(ownerId: string, id: string) {
      const index = blueprints.findIndex(
        (blueprint) => blueprint.id === id && blueprint.ownerId === ownerId,
      );
      if (index >= 0) blueprints.splice(index, 1);
    },
  };
}

async function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    session({
      secret: "test-secret",
      resave: false,
      saveUninitialized: false,
    }),
  );
  const server = createServer(app);
  await registerRoutes(server, app, {
    storage: createMemoryStorage(),
  });
  return app;
}

test("GET /api/health remains public", async () => {
  const app = await createTestApp();
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("protected routes return 401 when not signed in", async () => {
  const app = await createTestApp();
  const response = await request(app).get("/api/tasks");
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
});

test("register, session check, and tasks CRUD", async () => {
  const app = await createTestApp();
  const agent = request.agent(app);

  const register = await agent
    .post("/api/auth/register")
    .send({ username: "owner", password: "secure-pass-123" });
  assert.equal(register.status, 201);

  const sessionStatus = await agent.get("/api/auth/session");
  assert.equal(sessionStatus.status, 200);
  assert.equal(sessionStatus.body.authenticated, true);

  const created = await agent
    .post("/api/tasks")
    .send({ title: "Write plan", category: "Work", priority: "high" });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, "Write plan");

  const patched = await agent
    .patch(`/api/tasks/${created.body.id}`)
    .send({ completed: true });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.completed, true);

  const list = await agent.get("/api/tasks");
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 1);

  const removed = await agent.delete(`/api/tasks/${created.body.id}`);
  assert.equal(removed.status, 204);
});

test("login/logout works and setup cannot be repeated", async () => {
  const app = await createTestApp();
  const setupAgent = request.agent(app);
  const loginAgent = request.agent(app);

  const register = await setupAgent
    .post("/api/auth/register")
    .send({ username: "owner", password: "secure-pass-123" });
  assert.equal(register.status, 201);

  const setupAgain = await loginAgent
    .post("/api/auth/register")
    .send({ username: "another", password: "secure-pass-123" });
  assert.equal(setupAgain.status, 409);

  const login = await loginAgent
    .post("/api/auth/login")
    .send({ username: "owner", password: "secure-pass-123" });
  assert.equal(login.status, 200);

  const sessionStatus = await loginAgent.get("/api/auth/session");
  assert.equal(sessionStatus.body.authenticated, true);

  const logout = await loginAgent.post("/api/auth/logout");
  assert.equal(logout.status, 204);

  const afterLogout = await loginAgent.get("/api/tasks");
  assert.equal(afterLogout.status, 401);
});

test("signed-in user can change password", async () => {
  const app = await createTestApp();
  const agent = request.agent(app);

  await agent
    .post("/api/auth/register")
    .send({ username: "owner", password: "secure-pass-123" });

  const change = await agent.post("/api/auth/change-password").send({
    currentPassword: "secure-pass-123",
    newPassword: "new-secure-pass-456",
  });
  assert.equal(change.status, 204);

  await agent.post("/api/auth/logout");

  const oldLogin = await agent
    .post("/api/auth/login")
    .send({ username: "owner", password: "secure-pass-123" });
  assert.equal(oldLogin.status, 401);

  const newLogin = await agent
    .post("/api/auth/login")
    .send({ username: "owner", password: "new-secure-pass-456" });
  assert.equal(newLogin.status, 200);
});

test("forgot-password flow resets password with one-time token", async () => {
  const app = await createTestApp();
  const setupAgent = request.agent(app);
  const forgotAgent = request.agent(app);

  await setupAgent
    .post("/api/auth/register")
    .send({ username: "owner", password: "secure-pass-123" });

  const requestReset = await forgotAgent
    .post("/api/auth/forgot-password/request")
    .send({ username: "owner" });
  assert.equal(requestReset.status, 200);
  assert.equal(typeof requestReset.body.resetToken, "string");

  const confirmReset = await forgotAgent
    .post("/api/auth/forgot-password/confirm")
    .send({
      username: "owner",
      resetToken: requestReset.body.resetToken,
      newPassword: "reset-pass-789",
    });
  assert.equal(confirmReset.status, 200);

  await forgotAgent.post("/api/auth/logout");

  const loginWithNew = await forgotAgent
    .post("/api/auth/login")
    .send({ username: "owner", password: "reset-pass-789" });
  assert.equal(loginWithNew.status, 200);
});

test("new planner/focus/reflection/blueprint endpoints work after login", async () => {
  const app = await createTestApp();
  const agent = request.agent(app);

  await agent
    .post("/api/auth/register")
    .send({ username: "owner", password: "secure-pass-123" });

  const planner = await agent.post("/api/planner-events").send({
    title: "Deep Work",
    eventType: "focus",
    startsAt: "2026-04-08T15:00:00.000Z",
    endsAt: "2026-04-08T16:00:00.000Z",
  });
  assert.equal(planner.status, 201);

  const focus = await agent.post("/api/focus-sessions").send({
    mode: "focus",
    durationSeconds: 1500,
    completed: true,
    startedAt: "2026-04-08T15:00:00.000Z",
    endedAt: "2026-04-08T15:25:00.000Z",
  });
  assert.equal(focus.status, 201);

  const reflection = await agent.post("/api/reflections").send({
    wentWell: "Stayed focused.",
    toImprove: "Start earlier.",
    lingeringThoughts: "Keep momentum.",
  });
  assert.equal(reflection.status, 201);

  const blueprint = await agent.post("/api/blueprints").send({
    title: "Morning Reset",
    description: "Daily startup routine",
    category: "Personal",
    items: ["Water", "Stretch", "Plan top 3"],
  });
  assert.equal(blueprint.status, 201);
});
