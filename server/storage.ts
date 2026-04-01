import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import {
  users, tasks, habits, captureNotes,
  type User, type InsertUser,
  type Task, type InsertTask,
  type Habit, type InsertHabit,
  type CaptureNote, type InsertCaptureNote,
} from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  getHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, updates: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<void>;

  getCaptureNotes(): Promise<CaptureNote[]>;
  createCaptureNote(note: InsertCaptureNote): Promise<CaptureNote>;
  deleteCaptureNote(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getHabits(): Promise<Habit[]> {
    return db.select().from(habits).orderBy(desc(habits.createdAt));
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [created] = await db.insert(habits).values(habit).returning();
    return created;
  }

  async updateHabit(id: string, updates: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [updated] = await db.update(habits).set(updates).where(eq(habits.id, id)).returning();
    return updated;
  }

  async deleteHabit(id: string): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }

  async getCaptureNotes(): Promise<CaptureNote[]> {
    return db.select().from(captureNotes).orderBy(desc(captureNotes.createdAt));
  }

  async createCaptureNote(note: InsertCaptureNote): Promise<CaptureNote> {
    const [created] = await db.insert(captureNotes).values(note).returning();
    return created;
  }

  async deleteCaptureNote(id: string): Promise<void> {
    await db.delete(captureNotes).where(eq(captureNotes.id, id));
  }
}

export const storage = new DbStorage();
