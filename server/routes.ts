import type { Express } from "express";
import type { Server } from "http";
import { storage, type IStorage } from "./storage";
import { registerHealthRoutes } from "./routes/health";
import { registerAuthRoutes } from "./routes/auth";
import { registerTaskRoutes } from "./routes/tasks";
import { registerHabitRoutes } from "./routes/habits";
import { registerCaptureRoutes } from "./routes/capture";
import { registerPlannerRoutes } from "./routes/planner";
import { registerFocusRoutes } from "./routes/focus";
import { registerReflectionRoutes } from "./routes/reflections";
import { registerBlueprintRoutes } from "./routes/blueprints";
import { sendApiError } from "./routes/http";

interface RegisterRoutesOptions {
  storage?: IStorage;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
  options: RegisterRoutesOptions = {},
): Promise<Server> {
  const deps = {
    storage: options.storage ?? storage,
  };

  registerHealthRoutes(app);
  registerAuthRoutes(app, deps);

  app.use("/api", (req, res, next) => {
    if (req.path === "/health" || req.path.startsWith("/auth")) {
      return next();
    }

    if (!req.session?.userId) {
      return sendApiError(
        res,
        401,
        "UNAUTHORIZED",
        "You must sign in to use this API.",
      );
    }

    return next();
  });

  registerTaskRoutes(app, deps);
  registerHabitRoutes(app, deps);
  registerCaptureRoutes(app, deps);
  registerPlannerRoutes(app, deps);
  registerFocusRoutes(app, deps);
  registerReflectionRoutes(app, deps);
  registerBlueprintRoutes(app, deps);

  return httpServer;
}
