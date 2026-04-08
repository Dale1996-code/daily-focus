import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, addMinutes, format, isSameDay, startOfWeek } from "date-fns";
import { apiRequest } from "@/lib/api";
import type { PlannerEvent, PlannerEventType, Task } from "@shared/schema";

const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const eventTypeOptions: PlannerEventType[] = [
  "focus",
  "meeting",
  "review",
  "social",
  "admin",
];

function eventTypeClass(type: PlannerEventType) {
  if (type === "meeting") return "bg-blue-500/10 border-blue-500/30 text-blue-700";
  if (type === "focus") return "bg-primary/10 border-primary/30 text-primary";
  if (type === "review") return "bg-orange-500/10 border-orange-500/30 text-orange-700";
  if (type === "social") return "bg-green-500/10 border-green-500/30 text-green-700";
  return "bg-secondary border-border text-foreground";
}

interface CreateEventDraft {
  title: string;
  eventType: PlannerEventType;
  startTime: string;
  durationMinutes: number;
  attendees: number;
  notes: string;
}

function defaultDraft(): CreateEventDraft {
  return {
    title: "",
    eventType: "focus",
    startTime: "09:00",
    durationMinutes: 60,
    attendees: 0,
    notes: "",
  };
}

export default function Planner() {
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<CreateEventDraft>(defaultDraft);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const selectedDate = weekDates[selectedDayIndex];
  const weekEnd = addDays(weekStart, 6);

  const plannerQuery = useQuery<PlannerEvent[]>({
    queryKey: [
      "/api/planner-events",
      weekStart.toISOString(),
      weekEnd.toISOString(),
    ],
    queryFn: () =>
      apiRequest<PlannerEvent[]>(
        "GET",
        `/api/planner-events?start=${encodeURIComponent(
          weekStart.toISOString(),
        )}&end=${encodeURIComponent(weekEnd.toISOString())}`,
      ),
  });

  const tasksQuery = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => apiRequest<Task[]>("GET", "/api/tasks"),
  });

  const createPlannerEvent = useMutation({
    mutationFn: async (payload: {
      title: string;
      eventType: PlannerEventType;
      startsAt: string;
      endsAt: string;
      attendees: number;
      notes?: string;
    }) => apiRequest("POST", "/api/planner-events", payload),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["/api/planner-events"],
        exact: false,
      }),
  });

  const deletePlannerEvent = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/planner-events/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["/api/planner-events"],
        exact: false,
      }),
  });

  const dayEvents = useMemo(
    () =>
      (plannerQuery.data ?? [])
        .filter((event) => isSameDay(new Date(event.startsAt), selectedDate))
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        ),
    [plannerQuery.data, selectedDate],
  );

  const backlogTasks = useMemo(
    () => (tasksQuery.data ?? []).filter((task) => !task.completed).slice(0, 6),
    [tasksQuery.data],
  );

  const buildEventPayload = () => {
    const [hours, minutes] = draft.startTime.split(":").map(Number);
    const startsAt = new Date(selectedDate);
    startsAt.setHours(hours, minutes, 0, 0);
    const endsAt = addMinutes(startsAt, draft.durationMinutes);

    return {
      title: draft.title.trim(),
      eventType: draft.eventType,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      attendees: draft.attendees,
      notes: draft.notes.trim() || undefined,
    };
  };

  const handleCreateEvent = async () => {
    if (!draft.title.trim()) return;
    await createPlannerEvent.mutateAsync(buildEventPayload());
    setShowCreate(false);
    setDraft(defaultDraft());
  };

  return (
    <div className="p-4 md:p-8 pt-6 pb-24 md:pb-8 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-muted-foreground text-sm font-semibold mb-1 tracking-widest uppercase">
            {format(weekStart, "MMMM yyyy")}
          </h2>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
            Weekly Planner
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
          </span>
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {weekDates.map((day, index) => {
          const isSelected = index === selectedDayIndex;
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDayIndex(index)}
              className={cn(
                "min-w-[74px] px-3 py-2 rounded-xl border transition-all",
                isSelected
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border hover:border-primary/40",
              )}
            >
              <p className="text-[10px] uppercase tracking-wider font-semibold">
                {weekDayLabels[index]}
              </p>
              <p className="text-lg font-display font-bold">{format(day, "d")}</p>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <section className="lg:col-span-3 bg-card border rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-xl">
                {format(selectedDate, "EEEE, MMM d")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {dayEvents.length} scheduled block
                {dayEvents.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" />
              Add Block
            </button>
          </div>

          {plannerQuery.isLoading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Loading planner blocks...
            </div>
          ) : dayEvents.length === 0 ? (
            <div className="border border-dashed rounded-2xl p-8 text-center text-muted-foreground">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No blocks yet for this day.</p>
              <p className="text-sm mt-1">Add a focus block to lock in your time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <article
                  key={event.id}
                  className={cn(
                    "rounded-2xl border p-4 flex items-start justify-between gap-3",
                    eventTypeClass(event.eventType),
                  )}
                >
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-xs mt-1 flex items-center gap-1 opacity-80">
                      <Clock className="w-3 h-3" />
                      {format(new Date(event.startsAt), "h:mm a")} -{" "}
                      {format(new Date(event.endsAt), "h:mm a")}
                    </p>
                    {event.notes ? (
                      <p className="text-sm mt-2 opacity-90">{event.notes}</p>
                    ) : null}
                  </div>
                  <button
                    className="p-2 rounded-md hover:bg-black/5"
                    onClick={() => deletePlannerEvent.mutate(event.id)}
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="bg-card border rounded-3xl p-5">
          <h3 className="font-display font-bold text-lg mb-1">Task Backlog</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Click to schedule
          </p>

          {backlogTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open tasks. You are caught up.
            </p>
          ) : (
            <div className="space-y-2">
              {backlogTasks.map((task) => (
                <button
                  key={task.id}
                  className="w-full text-left border rounded-xl p-3 hover:border-primary/40 transition-colors"
                  onClick={() => {
                    setDraft((current) => ({ ...current, title: task.title }));
                    setShowCreate(true);
                  }}
                >
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{task.category}</p>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-card border rounded-2xl p-5 w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-display font-semibold text-lg mb-4">Create Planner Block</h2>

            <div className="space-y-3">
              <input
                className="w-full border rounded-lg px-3 py-2 bg-background"
                placeholder="Block title"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  className="border rounded-lg px-3 py-2 bg-background"
                  value={draft.eventType}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      eventType: event.target.value as PlannerEventType,
                    }))
                  }
                >
                  {eventTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  className="border rounded-lg px-3 py-2 bg-background"
                  value={draft.startTime}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, startTime: event.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 bg-background"
                  min={15}
                  step={15}
                  value={draft.durationMinutes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      durationMinutes: Math.max(15, Number(event.target.value) || 15),
                    }))
                  }
                  placeholder="Duration (minutes)"
                />
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 bg-background"
                  min={0}
                  max={1000}
                  value={draft.attendees}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      attendees: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  placeholder="Attendees"
                />
              </div>

              <textarea
                className="w-full border rounded-lg px-3 py-2 bg-background min-h-[80px]"
                placeholder="Notes (optional)"
                value={draft.notes}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
                onClick={handleCreateEvent}
                disabled={createPlannerEvent.isPending || !draft.title.trim()}
              >
                {createPlannerEvent.isPending ? "Saving..." : "Save block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
