import type { Request, Response } from "express";
import type { ZodType } from "zod";

interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendApiError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ApiErrorBody = {
    error: { code, message },
  };
  if (details !== undefined) {
    body.error.details = details;
  }
  return res.status(status).json(body);
}

export function sendNotFound(res: Response, entity: string) {
  return sendApiError(
    res,
    404,
    "NOT_FOUND",
    `${entity} not found`,
  );
}

export function parseBodyOrSend<T>(
  res: Response,
  schema: ZodType<T>,
  body: unknown,
): T | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    sendApiError(
      res,
      400,
      "VALIDATION_ERROR",
      "Invalid request body",
      parsed.error.flatten(),
    );
    return null;
  }
  return parsed.data;
}

export function requireOwnerId(req: Request, res: Response): string | null {
  const ownerId = req.session?.userId;
  if (!ownerId) {
    sendApiError(
      res,
      401,
      "UNAUTHORIZED",
      "You must sign in to access this resource",
    );
    return null;
  }
  return ownerId;
}
