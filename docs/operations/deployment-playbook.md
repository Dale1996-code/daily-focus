# Deployment Playbook (Replit/Vercel)

## Goal
Ship safely, verify quickly, and rollback fast.

## Pre-Deploy Checklist
1. `npm ci`
2. `npm run check`
3. `npm run test`
4. `npm run build`
5. Confirm environment variables are set:
   - `DATABASE_URL`
   - `PORT`
   - `SESSION_SECRET`

## Database Step
1. Run schema sync:
```bash
npm run db:push
```
2. Verify critical tables exist:
   - `tasks`
   - `habits`
   - `capture_notes`
   - `planner_events`
   - `focus_sessions`
   - `reflection_entries`
   - `blueprints`

## Deploy
### Replit
1. Ensure `.replit` deployment section points to:
   - build: `npm run build`
   - run: `node ./dist/index.cjs`
2. Trigger deployment.

### Vercel (Node server mode)
1. Set the same env vars in the Vercel project.
2. Use production build command:
```bash
npm run build
```
3. Start command:
```bash
npm run start
```

## Post-Deploy Smoke Tests
1. Health:
```bash
curl https://<your-domain>/api/health
```
2. Create/read/delete task from UI.
3. Add planner event and refresh page.
4. Complete one focus session and confirm history updates.
5. Save one reflection entry and confirm it appears in Past Entries.

## Rollback
1. Re-deploy last known good build.
2. If issue is schema-related, restore database snapshot first (see backup checklist).
3. Re-run smoke tests.
