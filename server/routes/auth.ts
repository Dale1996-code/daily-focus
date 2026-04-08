import type { Express } from "express";
import { z } from "zod";
import { parseBodyOrSend, sendApiError } from "./http";
import type { RouteDeps } from "./types";
import { hashPassword, verifyPassword } from "../auth/password";
import crypto from "node:crypto";

const credentialsSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dot, underscore, or dash"),
    password: z.string().min(8).max(128),
  })
  .strict();

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
  })
  .strict()
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

const forgotPasswordRequestSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dot, underscore, or dash"),
  })
  .strict();

const forgotPasswordConfirmSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dot, underscore, or dash"),
    resetToken: z.string().trim().min(6).max(64),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

type PasswordResetRecord = {
  token: string;
  expiresAt: number;
};

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const passwordResetStore = new Map<string, PasswordResetRecord>();

function resetKeyFromUsername(username: string) {
  return username.trim().toLowerCase();
}

function generateResetToken() {
  return crypto.randomInt(100000, 999999).toString();
}

async function verifyPasswordAndUpgradeIfNeeded(
  deps: RouteDeps,
  user: { id: string; password: string },
  inputPassword: string,
): Promise<boolean> {
  const isLegacyPlainText = !user.password.startsWith("scrypt$");

  if (isLegacyPlainText) {
    const ok = inputPassword === user.password;
    if (!ok) return false;
    const upgradedHash = await hashPassword(inputPassword);
    await deps.storage.updateUserPassword(user.id, upgradedHash);
    return true;
  }

  return verifyPassword(inputPassword, user.password);
}

function safeUser(user: { id: string; username: string }) {
  return { id: user.id, username: user.username };
}

export function registerAuthRoutes(app: Express, deps: RouteDeps) {
  app.get("/api/auth/session", async (req, res) => {
    const userCount = await deps.storage.countUsers();
    const ownerId = req.session?.userId;
    if (!ownerId) {
      return res.json({
        authenticated: false,
        needsSetup: userCount === 0,
      });
    }

    const user = await deps.storage.getUser(ownerId);
    if (!user) {
      req.session.destroy(() => undefined);
      return res.json({
        authenticated: false,
        needsSetup: userCount === 0,
      });
    }

    return res.json({
      authenticated: true,
      needsSetup: false,
      user: safeUser(user),
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    const parsed = parseBodyOrSend(res, credentialsSchema, req.body);
    if (!parsed) return;

    const existingUserCount = await deps.storage.countUsers();
    if (existingUserCount > 0) {
      return sendApiError(
        res,
        409,
        "SETUP_COMPLETE",
        "Account setup is already complete. Please sign in.",
      );
    }

    const duplicate = await deps.storage.getUserByUsername(parsed.username);
    if (duplicate) {
      return sendApiError(
        res,
        409,
        "USERNAME_TAKEN",
        "That username is already in use.",
      );
    }

    const password = await hashPassword(parsed.password);
    const user = await deps.storage.createUser({
      username: parsed.username,
      password,
    });

    req.session.userId = user.id;
    req.session.username = user.username;

    return res.status(201).json({
      authenticated: true,
      user: safeUser(user),
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = parseBodyOrSend(res, credentialsSchema, req.body);
    if (!parsed) return;

    const user = await deps.storage.getUserByUsername(parsed.username);
    if (!user) {
      return sendApiError(res, 401, "INVALID_CREDENTIALS", "Invalid username or password.");
    }

    const ok = await verifyPasswordAndUpgradeIfNeeded(
      deps,
      { id: user.id, password: user.password },
      parsed.password,
    );

    if (!ok) {
      return sendApiError(res, 401, "INVALID_CREDENTIALS", "Invalid username or password.");
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    return res.json({
      authenticated: true,
      user: safeUser(user),
    });
  });

  app.post("/api/auth/change-password", async (req, res) => {
    const ownerId = req.session?.userId;
    if (!ownerId) {
      return sendApiError(res, 401, "UNAUTHORIZED", "You must be signed in.");
    }

    const parsed = parseBodyOrSend(res, changePasswordSchema, req.body);
    if (!parsed) return;

    const user = await deps.storage.getUser(ownerId);
    if (!user) {
      req.session.destroy(() => undefined);
      return sendApiError(res, 401, "UNAUTHORIZED", "Session is invalid. Please sign in again.");
    }

    const currentOk = await verifyPasswordAndUpgradeIfNeeded(
      deps,
      { id: user.id, password: user.password },
      parsed.currentPassword,
    );
    if (!currentOk) {
      return sendApiError(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Current password is incorrect.",
      );
    }

    const nextHash = await hashPassword(parsed.newPassword);
    await deps.storage.updateUserPassword(user.id, nextHash);

    return res.status(204).send();
  });

  app.post("/api/auth/forgot-password/request", async (req, res) => {
    const parsed = parseBodyOrSend(res, forgotPasswordRequestSchema, req.body);
    if (!parsed) return;

    const user = await deps.storage.getUserByUsername(parsed.username);
    if (!user) {
      // Do not reveal whether a username exists.
      return res.json({
        ok: true,
        message: "If the username exists, a reset token has been generated.",
      });
    }

    const token = generateResetToken();
    const resetKey = resetKeyFromUsername(parsed.username);
    passwordResetStore.set(resetKey, {
      token,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    });

    return res.json({
      ok: true,
      resetToken: token,
      expiresInMinutes: Math.floor(RESET_TOKEN_TTL_MS / 60000),
      message:
        "Use this one-time token to reset your password. It expires soon.",
    });
  });

  app.post("/api/auth/forgot-password/confirm", async (req, res) => {
    const parsed = parseBodyOrSend(res, forgotPasswordConfirmSchema, req.body);
    if (!parsed) return;

    const user = await deps.storage.getUserByUsername(parsed.username);
    if (!user) {
      return sendApiError(
        res,
        400,
        "INVALID_RESET",
        "Invalid reset request.",
      );
    }

    const resetKey = resetKeyFromUsername(parsed.username);
    const resetRecord = passwordResetStore.get(resetKey);
    if (!resetRecord) {
      return sendApiError(
        res,
        400,
        "INVALID_RESET",
        "Reset token not found. Request a new one.",
      );
    }

    if (Date.now() > resetRecord.expiresAt) {
      passwordResetStore.delete(resetKey);
      return sendApiError(
        res,
        400,
        "RESET_EXPIRED",
        "Reset token expired. Request a new one.",
      );
    }

    if (resetRecord.token !== parsed.resetToken) {
      return sendApiError(
        res,
        400,
        "INVALID_RESET",
        "Reset token is incorrect.",
      );
    }

    const password = await hashPassword(parsed.newPassword);
    await deps.storage.updateUserPassword(user.id, password);
    passwordResetStore.delete(resetKey);

    req.session.userId = user.id;
    req.session.username = user.username;

    return res.json({
      authenticated: true,
      user: safeUser(user),
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        return sendApiError(res, 500, "LOGOUT_FAILED", "Could not log out.");
      }
      res.clearCookie("connect.sid");
      return res.status(204).send();
    });
  });
}
