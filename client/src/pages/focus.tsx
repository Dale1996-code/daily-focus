import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday } from "date-fns";
import { apiRequest } from "@/lib/api";
import type { FocusMode, FocusSession } from "@shared/schema";

const modeDurations: Record<FocusMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatSeconds(seconds: number) {
  if (seconds >= 3600) {
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m`;
  }
  return `${seconds}s`;
}

export default function Focus() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<FocusMode>("focus");
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(modeDurations.focus);
  const [taskName, setTaskName] = useState("");

  const focusSessionsQuery = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions"],
    queryFn: () => apiRequest<FocusSession[]>("GET", "/api/focus-sessions?limit=40"),
  });

  const logSessionMutation = useMutation({
    mutationFn: (payload: {
      taskTitle: string | null;
      mode: FocusMode;
      durationSeconds: number;
      completed: boolean;
      startedAt: string;
      endedAt: string;
    }) => apiRequest("POST", "/api/focus-sessions", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/focus-sessions"] }),
  });

  const totalTime = modeDurations[mode];
  const progress = ((totalTime - time) / totalTime) * 100;

  useEffect(() => {
    if (!isActive || time <= 0) return;

    const interval = setInterval(() => {
      setTime((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, time]);

  useEffect(() => {
    if (time !== 0) return;
    completeCurrentSession(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  const completeCurrentSession = async (completed: boolean) => {
    if (mode !== "focus") {
      setIsActive(false);
      setTime(totalTime);
      return;
    }

    const durationSeconds = totalTime - time;
    setIsActive(false);
    setTime(totalTime);

    if (durationSeconds <= 0) return;

    await logSessionMutation.mutateAsync({
      taskTitle: taskName.trim() || null,
      mode,
      durationSeconds,
      completed,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
    });
  };

  const switchMode = (newMode: FocusMode) => {
    setMode(newMode);
    setIsActive(false);
    setTime(modeDurations[newMode]);
  };

  const sessions = focusSessionsQuery.data ?? [];
  const todaySessions = sessions.filter(
    (session) => session.mode === "focus" && session.completed && isToday(new Date(session.createdAt)),
  );
  const focusedTodaySeconds = todaySessions.reduce(
    (sum, session) => sum + session.durationSeconds,
    0,
  );

  return (
    <div className="min-h-[100dvh] md:min-h-[80vh] flex flex-col items-center justify-center p-4 max-w-4xl mx-auto relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 -z-10 blur-[120px] opacity-30 transition-colors duration-1000",
          mode === "focus"
            ? "bg-primary/40"
            : mode === "shortBreak"
              ? "bg-green-500/40"
              : "bg-blue-500/40",
          isActive && "animate-pulse",
        )}
      />

      <div className="w-full max-w-md flex flex-col items-center mt-8">
        <div className="flex p-1.5 bg-secondary/50 rounded-2xl mb-12 border shadow-inner w-full max-w-[320px]">
          <button
            onClick={() => switchMode("focus")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              mode === "focus"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Focus
          </button>
          <button
            onClick={() => switchMode("shortBreak")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              mode === "shortBreak"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Short Break
          </button>
          <button
            onClick={() => switchMode("longBreak")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              mode === "longBreak"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Long Break
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-14">
          <svg className="absolute w-[340px] h-[340px] -rotate-90 pointer-events-none">
            <circle
              cx="170"
              cy="170"
              r="160"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-secondary/60"
            />
            <circle
              cx="170"
              cy="170"
              r="160"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(
                mode === "focus"
                  ? "text-primary"
                  : mode === "shortBreak"
                    ? "text-green-500"
                    : "text-blue-500",
              )}
              strokeDasharray={`${160 * 2 * Math.PI}`}
              strokeDashoffset={`${(160 * 2 * Math.PI) * (1 - progress / 100)}`}
            />
          </svg>

          <div className="flex flex-col items-center z-10 text-center mt-4">
            <span
              className="font-display text-[6rem] sm:text-8xl font-bold tracking-tighter text-foreground leading-none"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTime(time)}
            </span>
            <input
              type="text"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              className="mt-6 bg-secondary/30 border-none text-center text-muted-foreground hover:text-foreground outline-none focus:ring-2 focus:ring-primary/50 rounded-xl px-4 py-2 text-sm font-medium transition-colors w-full max-w-[240px]"
              placeholder="What are you working on?"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-8">
          <button
            onClick={() => {
              setIsActive(false);
              setTime(totalTime);
            }}
            className="w-14 h-14 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsActive((active) => !active)}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105",
              isActive
                ? "bg-secondary text-foreground border-2 border-border"
                : mode === "focus"
                  ? "bg-primary text-primary-foreground"
                  : mode === "shortBreak"
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white",
            )}
          >
            {isActive ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-2" />
            )}
          </button>

          <button
            onClick={() => completeCurrentSession(true)}
            title="Complete session"
            className="w-14 h-14 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-green-600 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-10 w-full grid md:grid-cols-2 gap-4">
        <section className="bg-card/90 border rounded-2xl p-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Today
          </h3>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Completed focus sessions</span>
            <span className="font-semibold">{todaySessions.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Total focused</span>
            <span className="font-semibold">{formatSeconds(focusedTodaySeconds)}</span>
          </div>
        </section>

        <section className="bg-card/90 border rounded-2xl p-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Recent Sessions
          </h3>
          {focusSessionsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading session history...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg px-3 py-2 text-sm flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {session.taskTitle || "Untitled session"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {session.mode} • {format(new Date(session.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <span className="text-xs flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    {formatSeconds(session.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
