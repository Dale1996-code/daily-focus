-- Controlled overhaul baseline migration
-- Safe to run multiple times (uses IF NOT EXISTS where possible).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'planner_event_type') THEN
    CREATE TYPE planner_event_type AS ENUM ('meeting', 'focus', 'review', 'social', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'focus_mode') THEN
    CREATE TYPE focus_mode AS ENUM ('focus', 'shortBreak', 'longBreak');
  END IF;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS owner_id varchar NOT NULL DEFAULT 'local-user',
  ADD COLUMN IF NOT EXISTS due_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tasks'
      AND column_name = 'priority'
      AND udt_name <> 'task_priority'
  ) THEN
    ALTER TABLE tasks
      ALTER COLUMN priority TYPE task_priority
      USING CASE
        WHEN priority IN ('low', 'medium', 'high') THEN priority::task_priority
        ELSE 'medium'::task_priority
      END;
  END IF;
END $$;

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS owner_id varchar NOT NULL DEFAULT 'local-user',
  ADD COLUMN IF NOT EXISTS last_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE capture_notes
  ADD COLUMN IF NOT EXISTS owner_id varchar NOT NULL DEFAULT 'local-user',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS planner_events (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id varchar NOT NULL DEFAULT 'local-user',
  title text NOT NULL,
  event_type planner_event_type NOT NULL DEFAULT 'focus',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  attendees integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id varchar NOT NULL DEFAULT 'local-user',
  task_title text,
  mode focus_mode NOT NULL DEFAULT 'focus',
  duration_seconds integer NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reflection_entries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id varchar NOT NULL DEFAULT 'local-user',
  went_well text NOT NULL DEFAULT '',
  to_improve text NOT NULL DEFAULT '',
  lingering_thoughts text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blueprints (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id varchar NOT NULL DEFAULT 'local-user',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
