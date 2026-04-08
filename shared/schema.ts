import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const OWNER_ID_DEFAULT = "local-user";

export const taskPriorityValues = ["low", "medium", "high"] as const;
export const taskPriorityEnum = pgEnum("task_priority", taskPriorityValues);

export const plannerEventTypeValues = [
  "meeting",
  "focus",
  "review",
  "social",
  "admin",
] as const;
export const plannerEventTypeEnum = pgEnum(
  "planner_event_type",
  plannerEventTypeValues,
);

export const focusModeValues = ["focus", "shortBreak", "longBreak"] as const;
export const focusModeEnum = pgEnum("focus_mode", focusModeValues);

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().default(OWNER_ID_DEFAULT),
  title: text("title").notNull(),
  category: text("category").notNull().default("General"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  overdue: boolean("overdue").notNull().default(false),
  // Legacy string field kept for compatibility while moving to dueAt.
  dueDate: text("due_date"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const habits = pgTable("habits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().default(OWNER_ID_DEFAULT),
  title: text("title").notNull(),
  streak: integer("streak").notNull().default(0),
  completedToday: boolean("completed_today").notNull().default(false),
  // Legacy string field kept for compatibility while moving to timestamp.
  lastCompletedDate: text("last_completed_date"),
  lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const captureNotes = pgTable("capture_notes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().default(OWNER_ID_DEFAULT),
  content: text("content").notNull(),
  processed: boolean("processed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const plannerEvents = pgTable("planner_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().default(OWNER_ID_DEFAULT),
  title: text("title").notNull(),
  eventType: plannerEventTypeEnum("event_type").notNull().default("focus"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  attendees: integer("attendees").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const focusSessions = pgTable("focus_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().default(OWNER_ID_DEFAULT),
  taskTitle: text("task_title"),
  mode: focusModeEnum("mode").notNull().default("focus"),
  durationSeconds: integer("duration_seconds").notNull(),
  completed: boolean("completed").notNull().default(true),
  startedAt: timestamp("started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reflectionEntries = pgTable("reflection_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().default(OWNER_ID_DEFAULT),
  wentWell: text("went_well").notNull().default(""),
  toImprove: text("to_improve").notNull().default(""),
  lingeringThoughts: text("lingering_thoughts").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const blueprints = pgTable("blueprints", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().default(OWNER_ID_DEFAULT),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("General"),
  items: jsonb("items")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCaptureNoteSchema = createInsertSchema(captureNotes).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlannerEventSchema = createInsertSchema(plannerEvents).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  ownerId: true,
  createdAt: true,
});

export const insertReflectionEntrySchema = createInsertSchema(
  reflectionEntries,
).omit({
  id: true,
  ownerId: true,
  createdAt: true,
});

export const insertBlueprintSchema = createInsertSchema(blueprints).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export type TaskPriority = (typeof taskPriorityValues)[number];
export type PlannerEventType = (typeof plannerEventTypeValues)[number];
export type FocusMode = (typeof focusModeValues)[number];

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertCaptureNote = z.infer<typeof insertCaptureNoteSchema>;
export type CaptureNote = typeof captureNotes.$inferSelect;

export type InsertPlannerEvent = z.infer<typeof insertPlannerEventSchema>;
export type PlannerEvent = typeof plannerEvents.$inferSelect;

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

export type InsertReflectionEntry = z.infer<typeof insertReflectionEntrySchema>;
export type ReflectionEntry = typeof reflectionEntries.$inferSelect;

export type InsertBlueprint = z.infer<typeof insertBlueprintSchema>;
export type Blueprint = typeof blueprints.$inferSelect;
