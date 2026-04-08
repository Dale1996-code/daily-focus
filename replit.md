# Flow - Personal Productivity App

## Overview

Flow is a mobile-first personal productivity application designed to help users manage their daily tasks, habits, routines, and focus sessions. The app provides a dashboard-centric experience with five main sections: Today (dashboard), Templates (Blueprints), Planner, Focus (Pomodoro timer), and Reflection (journaling/review).

Key features include:
- **Task management** with swipe-to-complete/delete gestures and long-press editing
- **Habit tracking** with streak counting and daily completion states
- **Quick Capture** for fast note-taking and idea capture
- **Focus timer** (Pomodoro-style) with work/break session tracking
- **Weekly Planner** with drag-and-drop calendar events
- **Blueprints/Templates** for repeatable task checklists (e.g., store ops, coaching frameworks)
- **Reflection** with guided journaling prompts
- **Floating Action Button (FAB)** for quick access to common actions

The app is optimized for mobile use (bottom tab navigation) with a responsive desktop sidebar layout.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18 with TypeScript, using Vite as the build tool.

**Routing:** `wouter` — a lightweight client-side router. Routes map to:
- `/` → Dashboard (Today view)
- `/blueprints` → Task templates
- `/planner` → Weekly calendar planner
- `/focus` → Pomodoro timer
- `/reflection` → Guided journaling

**State Management:** TanStack Query (React Query v5) handles server state with a shared API client, short-lived cache freshness (`staleTime: 30s`), and standard refetch behavior to keep data reliable.

**UI Component Library:** shadcn/ui (New York style) built on Radix UI primitives. Components live in `client/src/components/ui/`. Tailwind CSS v4 (via `@tailwindcss/vite`) handles all styling with CSS custom properties for theming.

**Animations:** Framer Motion is used throughout for page transitions, drag interactions, FAB animations, and gesture-based task interactions (swipe to complete/delete, drag-and-drop in planner).

**Layout Pattern:**
- Mobile: Fixed bottom tab bar with 4 nav items + centered FAB
- Desktop: Fixed left sidebar (64px wide) with vertical nav links
- The `Layout` component wraps all pages and handles both layouts
- Custom browser events (`CustomEvent`) are used for cross-component communication (e.g., FAB triggering "open-add-task" or "focus-capture" in the dashboard)

**Fonts:** Inter (body) and Outfit (display) loaded from Google Fonts.

### Backend Architecture

**Framework:** Express.js (TypeScript) running on Node.js via `tsx` in development.

**Structure:**
- `server/index.ts` — Express app setup, logging middleware, HTTP server creation
- `server/routes.ts` — Route registration entrypoint
- `server/routes/*.ts` — Feature route modules (tasks, habits, capture, planner, focus, reflections, blueprints, health)
- `server/storage.ts` — Data access layer implementing the `IStorage` interface via `DbStorage`
- `server/vite.ts` — Vite dev server integration (middleware mode with HMR)
- `server/static.ts` — Static file serving for production builds

**API Design:** RESTful JSON API under `/api/` prefix:
- `GET/POST /api/tasks` — List and create tasks
- `PATCH/DELETE /api/tasks/:id` — Update and delete tasks
- `GET/POST /api/habits` — List and create habits
- `PATCH/DELETE /api/habits/:id` — Update and delete habits
- `GET/POST /api/capture` — List and create quick capture notes
- `DELETE /api/capture/:id` — Delete capture notes

**Validation:** Zod schemas (derived from Drizzle table definitions via `drizzle-zod`) validate all incoming request bodies before database operations.

**Build:** esbuild bundles the server for production into `dist/index.cjs`. A custom allowlist controls which npm dependencies get bundled vs. externalized, optimizing cold start time.

### Data Storage

**Database:** PostgreSQL via the `pg` driver. Connection is managed through a `Pool` using the `DATABASE_URL` environment variable.

**ORM:** Drizzle ORM with `drizzle-orm/node-postgres`. Schema is defined in `shared/schema.ts` and shared between frontend and backend.

**Schema:**

| Table | Key Columns |
|-------|-------------|
| `users` | `id` (uuid), `username`, `password` |
| `tasks` | `id`, `title`, `category`, `priority`, `completed`, `overdue`, `dueDate`, `createdAt` |
| `habits` | `id`, `title`, `streak`, `completedToday`, `lastCompletedDate`, `createdAt` |
| `capture_notes` | `id`, `content`, `processed`, `createdAt` |

**Migrations:** Drizzle Kit manages migrations with `drizzle-kit push` for schema synchronization. Migration output goes to `./migrations/`.

### Authentication and Authorization

The schema includes a `users` table and the storage interface has user-related methods (`getUser`, `getUserByUsername`, `createUser`), but authentication middleware (session management, passport) is not yet wired into the current routes. The `connect-pg-simple` package is listed as a dependency, suggesting session-based auth with PostgreSQL session storage is planned or partially implemented.

### Cross-Component Communication

Custom DOM events are used to trigger actions across unrelated components:
- `"open-add-task"` — FAB triggers task creation modal in Dashboard
- `"focus-capture"` — FAB focuses the Quick Capture input in Dashboard

This avoids prop drilling or global state for these specific UI interactions.

## External Dependencies

### Core Infrastructure
- **PostgreSQL** — Primary data store. Requires `DATABASE_URL` environment variable.
- **Drizzle ORM** — Type-safe database access and schema management
- **Express.js** — HTTP server and API framework

### Frontend Libraries
- **React 18** + **TypeScript** — UI framework
- **Vite** — Development server and build tool
- **wouter** — Lightweight client-side router
- **TanStack Query v5** — Server state management and caching
- **Framer Motion** — Animation and gesture library (drag, swipe, transitions)
- **Tailwind CSS v4** — Utility-first styling
- **shadcn/ui + Radix UI** — Accessible headless UI component primitives
- **Lucide React** — Icon library
- **canvas-confetti** — Celebration animations (likely for task completion)
- **react-hook-form + @hookform/resolvers** — Form state management with Zod validation
- **date-fns** — Date manipulation utilities
- **vaul** — Drawer/bottom sheet component
- **embla-carousel-react** — Carousel component
- **recharts** — Chart/data visualization components
- **cmdk** — Command palette component

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` — Replit development tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Development banner (dev only)
- Custom `vite-plugin-meta-images` — Updates OpenGraph/Twitter meta image tags with the correct Replit deployment domain

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (required for server startup and Drizzle config)
