# Flow (Daily Focus Hub)

Flow is a full-stack productivity app built with:
- React + TypeScript (frontend)
- Express + TypeScript (backend API)
- PostgreSQL + Drizzle ORM (database)

## 1) Quick Start

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL database

### Setup
1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your real `DATABASE_URL` and a strong `SESSION_SECRET`.

4. Push schema changes to your database:
```bash
npm run db:push
```

5. Start the app:
```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000).

On first launch, you will see a setup screen to create the single owner account.

## 2) Useful Commands

- Run type-check:
```bash
npm run check
```

- Run tests:
```bash
npm run test
```

- Build production output:
```bash
npm run build
```

- Start production build:
```bash
npm run start
```

## 3) API Health Check

When the server is running:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptimeSeconds": 12
}
```

## 4) Authentication Flows

- First launch: create owner account in the setup screen.
- Returning users: sign in with username + password.
- Change password: use `Change Password` in the app sidebar/menu.
- Forgot password: use `Forgot password?` on the sign-in screen.
  - Step 1: request one-time reset token
  - Step 2: enter token + new password

## 5) Notes for Beginners

- `db:push` updates your database schema to match `shared/schema.ts`.
- `check` only checks for TypeScript errors. It does not start the app.
- `build` creates optimized files in `dist/`.
- Session login is cookie-based. Keep `SESSION_SECRET` private.

## 6) Deployment

- Replit deployment is configured in `.replit`.
- CI workflow is in `.github/workflows/ci.yml`.
- Operational runbook is in `docs/operations/deployment-playbook.md`.
