import type { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgStore = connectPgSimple(session);

export function configureSession(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "change-me-in-production";
  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: true,
        tableName: "user_sessions",
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
    }),
  );
}
