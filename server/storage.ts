import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  tasks,
  habits,
  captureNotes,
  plannerEvents,
  focusSessions,
  reflectionEntries,
  blueprints,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type Habit,
  type InsertHabit,
  type CaptureNote,
  type InsertCaptureNote,
  type PlannerEvent,
  type InsertPlannerEvent,
  type FocusSession,
  type InsertFocusSession,
  type ReflectionEntry,
  type InsertReflectionEntry,
  type Blueprint,
  type InsertBlueprint,
} from "@shared/schema";

function stripUndefined<T extends Record<string, unknown>>(updates: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  countUsers(): Promise<number>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<void>;

  getTasks(ownerId: string): Promise<Task[]>;
  createTask(ownerId: string, task: InsertTask): Promise<Task>;
  updateTask(
    ownerId: string,
    id: string,
    updates: Partial<InsertTask>,
  ): Promise<Task | undefined>;
  deleteTask(ownerId: string, id: string): Promise<void>;

  getHabits(ownerId: string): Promise<Habit[]>;
  createHabit(ownerId: string, habit: InsertHabit): Promise<Habit>;
  updateHabit(
    ownerId: string,
    id: string,
    updates: Partial<InsertHabit>,
  ): Promise<Habit | undefined>;
  deleteHabit(ownerId: string, id: string): Promise<void>;

  getCaptureNotes(ownerId: string): Promise<CaptureNote[]>;
  createCaptureNote(ownerId: string, note: InsertCaptureNote): Promise<CaptureNote>;
  deleteCaptureNote(ownerId: string, id: string): Promise<void>;

  getPlannerEvents(
    ownerId: string,
    range?: { start?: Date; end?: Date },
  ): Promise<PlannerEvent[]>;
  createPlannerEvent(
    ownerId: string,
    event: InsertPlannerEvent,
  ): Promise<PlannerEvent>;
  updatePlannerEvent(
    ownerId: string,
    id: string,
    updates: Partial<InsertPlannerEvent>,
  ): Promise<PlannerEvent | undefined>;
  deletePlannerEvent(ownerId: string, id: string): Promise<void>;

  getFocusSessions(ownerId: string, limit?: number): Promise<FocusSession[]>;
  createFocusSession(
    ownerId: string,
    session: InsertFocusSession,
  ): Promise<FocusSession>;

  getReflectionEntries(ownerId: string, limit?: number): Promise<ReflectionEntry[]>;
  createReflectionEntry(
    ownerId: string,
    entry: InsertReflectionEntry,
  ): Promise<ReflectionEntry>;

  getBlueprints(ownerId: string): Promise<Blueprint[]>;
  createBlueprint(ownerId: string, blueprint: InsertBlueprint): Promise<Blueprint>;
  updateBlueprint(
    ownerId: string,
    id: string,
    updates: Partial<InsertBlueprint>,
  ): Promise<Blueprint | undefined>;
  deleteBlueprint(ownerId: string, id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async countUsers(): Promise<number> {
    const records = await db.select({ id: users.id }).from(users);
    return records.length;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    await db.update(users).set({ password }).where(eq(users.id, id));
  }

  async getTasks(ownerId: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.ownerId, ownerId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(ownerId: string, task: InsertTask): Promise<Task> {
    const [created] = await db
      .insert(tasks)
      .values({ ...task, ownerId })
      .returning();
    return created;
  }

  async updateTask(
    ownerId: string,
    id: string,
    updates: Partial<InsertTask>,
  ): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ ...stripUndefined(updates), updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.ownerId, ownerId)))
      .returning();
    return updated;
  }

  async deleteTask(ownerId: string, id: string): Promise<void> {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.ownerId, ownerId)));
  }

  async getHabits(ownerId: string): Promise<Habit[]> {
    return db
      .select()
      .from(habits)
      .where(eq(habits.ownerId, ownerId))
      .orderBy(desc(habits.createdAt));
  }

  async createHabit(ownerId: string, habit: InsertHabit): Promise<Habit> {
    const [created] = await db
      .insert(habits)
      .values({ ...habit, ownerId })
      .returning();
    return created;
  }

  async updateHabit(
    ownerId: string,
    id: string,
    updates: Partial<InsertHabit>,
  ): Promise<Habit | undefined> {
    const [updated] = await db
      .update(habits)
      .set({ ...stripUndefined(updates), updatedAt: new Date() })
      .where(and(eq(habits.id, id), eq(habits.ownerId, ownerId)))
      .returning();
    return updated;
  }

  async deleteHabit(ownerId: string, id: string): Promise<void> {
    await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.ownerId, ownerId)));
  }

  async getCaptureNotes(ownerId: string): Promise<CaptureNote[]> {
    return db
      .select()
      .from(captureNotes)
      .where(eq(captureNotes.ownerId, ownerId))
      .orderBy(desc(captureNotes.createdAt));
  }

  async createCaptureNote(
    ownerId: string,
    note: InsertCaptureNote,
  ): Promise<CaptureNote> {
    const [created] = await db
      .insert(captureNotes)
      .values({ ...note, ownerId })
      .returning();
    return created;
  }

  async deleteCaptureNote(ownerId: string, id: string): Promise<void> {
    await db
      .delete(captureNotes)
      .where(and(eq(captureNotes.id, id), eq(captureNotes.ownerId, ownerId)));
  }

  async getPlannerEvents(
    ownerId: string,
    range?: { start?: Date; end?: Date },
  ): Promise<PlannerEvent[]> {
    const clauses = [eq(plannerEvents.ownerId, ownerId)];
    if (range?.start) clauses.push(gte(plannerEvents.startsAt, range.start));
    if (range?.end) clauses.push(lte(plannerEvents.endsAt, range.end));

    return db
      .select()
      .from(plannerEvents)
      .where(and(...clauses))
      .orderBy(asc(plannerEvents.startsAt));
  }

  async createPlannerEvent(
    ownerId: string,
    event: InsertPlannerEvent,
  ): Promise<PlannerEvent> {
    const [created] = await db
      .insert(plannerEvents)
      .values({ ...event, ownerId })
      .returning();
    return created;
  }

  async updatePlannerEvent(
    ownerId: string,
    id: string,
    updates: Partial<InsertPlannerEvent>,
  ): Promise<PlannerEvent | undefined> {
    const [updated] = await db
      .update(plannerEvents)
      .set({ ...stripUndefined(updates), updatedAt: new Date() })
      .where(and(eq(plannerEvents.id, id), eq(plannerEvents.ownerId, ownerId)))
      .returning();
    return updated;
  }

  async deletePlannerEvent(ownerId: string, id: string): Promise<void> {
    await db
      .delete(plannerEvents)
      .where(and(eq(plannerEvents.id, id), eq(plannerEvents.ownerId, ownerId)));
  }

  async getFocusSessions(ownerId: string, limit = 30): Promise<FocusSession[]> {
    return db
      .select()
      .from(focusSessions)
      .where(eq(focusSessions.ownerId, ownerId))
      .orderBy(desc(focusSessions.createdAt))
      .limit(limit);
  }

  async createFocusSession(
    ownerId: string,
    session: InsertFocusSession,
  ): Promise<FocusSession> {
    const [created] = await db
      .insert(focusSessions)
      .values({ ...session, ownerId })
      .returning();
    return created;
  }

  async getReflectionEntries(
    ownerId: string,
    limit = 30,
  ): Promise<ReflectionEntry[]> {
    return db
      .select()
      .from(reflectionEntries)
      .where(eq(reflectionEntries.ownerId, ownerId))
      .orderBy(desc(reflectionEntries.createdAt))
      .limit(limit);
  }

  async createReflectionEntry(
    ownerId: string,
    entry: InsertReflectionEntry,
  ): Promise<ReflectionEntry> {
    const [created] = await db
      .insert(reflectionEntries)
      .values({ ...entry, ownerId })
      .returning();
    return created;
  }

  async getBlueprints(ownerId: string): Promise<Blueprint[]> {
    return db
      .select()
      .from(blueprints)
      .where(eq(blueprints.ownerId, ownerId))
      .orderBy(desc(blueprints.createdAt));
  }

  async createBlueprint(
    ownerId: string,
    blueprint: InsertBlueprint,
  ): Promise<Blueprint> {
    const [created] = await db
      .insert(blueprints)
      .values({ ...blueprint, ownerId })
      .returning();
    return created;
  }

  async updateBlueprint(
    ownerId: string,
    id: string,
    updates: Partial<InsertBlueprint>,
  ): Promise<Blueprint | undefined> {
    const [updated] = await db
      .update(blueprints)
      .set({ ...stripUndefined(updates), updatedAt: new Date() })
      .where(and(eq(blueprints.id, id), eq(blueprints.ownerId, ownerId)))
      .returning();
    return updated;
  }

  async deleteBlueprint(ownerId: string, id: string): Promise<void> {
    await db
      .delete(blueprints)
      .where(and(eq(blueprints.id, id), eq(blueprints.ownerId, ownerId)));
  }
}

export const storage = new DbStorage();
