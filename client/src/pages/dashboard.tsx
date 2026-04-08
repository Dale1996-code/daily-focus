import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Plus, Check, Circle, Flame, ArrowRight, Mic, Play, ChevronDown, ChevronRight, CalendarClock, MoreHorizontal, X, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, Habit, CaptureNote } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { useQuickActions } from "@/context/quick-actions";
import { useNavigate } from "@/lib/navigate";

function TaskCard({
  task,
  onToggle,
  onDelete,
  onStartFocus,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartFocus: () => void;
}) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (!isSwiping) setShowEdit(true);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div className="relative group overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex justify-between items-center px-4 rounded-xl bg-secondary/50">
        <div className="flex items-center gap-2 text-primary font-medium text-sm">
          <Check className="w-4 h-4" /> Complete
        </div>
        <div className="flex items-center gap-2 text-destructive font-medium text-sm">
          Delete <X className="w-4 h-4" />
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={() => setIsSwiping(true)}
        onDragEnd={(e, info) => {
          setIsSwiping(false);
          if (info.offset.x > 80) onToggle(task.id);
          else if (info.offset.x < -80) onDelete(task.id);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative z-10 flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl transition-all cursor-pointer",
          task.completed ? "opacity-60 bg-secondary/30" : "hover:shadow-sm hover:border-border",
          showEdit && "ring-2 ring-primary/50",
          task.overdue && !task.completed && "border-l-4 border-l-destructive shadow-sm"
        )}
      >
        <div
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={cn(
            "flex-shrink-0 h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors ml-1 z-20 cursor-pointer",
            task.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 text-transparent hover:border-primary/60"
          )}
        >
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex justify-between items-start gap-2">
            <p className={cn(
              "text-sm font-medium truncate transition-all leading-tight",
              task.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              {task.title}
            </p>
            {!task.completed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartFocus();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary p-1 rounded-md flex-shrink-0"
                title="Start Focus"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded text-xs">
              {task.category}
            </span>
            {task.priority === 'high' && (
              <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3" /> High
              </span>
            )}
            {task.overdue && !task.completed && (
              <span className="text-[10px] font-medium text-destructive flex items-center gap-1">
                Overdue
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AddTaskModal({ onClose, onAdd }: { onClose: () => void, onAdd: (task: { title: string, category: string, priority: string }) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("medium");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="bg-card border rounded-2xl p-5 shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display font-semibold text-lg mb-4">New Task</h3>
        <input
          autoFocus
          className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 mb-3"
          placeholder="What needs to get done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && title.trim()) { onAdd({ title: title.trim(), category, priority }); onClose(); } }}
        />
        <div className="flex gap-2 mb-4">
          {["Work", "Store Ops", "Health", "Personal"].map(c => (
            <button key={c} onClick={() => setCategory(c)} className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors", category === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40")}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["low", "medium", "high"] as const).map(p => (
            <button key={p} onClick={() => setPriority(p)} className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg border capitalize transition-colors flex-1", priority === p ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40")}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-secondary/50 transition-colors">Cancel</button>
          <button
            onClick={() => { if (title.trim()) { onAdd({ title: title.trim(), category, priority }); onClose(); } }}
            disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Add Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { addTaskSignal, focusCaptureSignal } = useQuickActions();
  const [showCompleted, setShowCompleted] = useState(false);
  const [captureText, setCaptureText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const captureTimer = useRef<NodeJS.Timeout | null>(null);
  const captureRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (addTaskSignal > 0) {
      setShowAddTask(true);
    }
  }, [addTaskSignal]);

  useEffect(() => {
    if (focusCaptureSignal > 0) {
      captureRef.current?.focus();
    }
  }, [focusCaptureSignal]);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => apiRequest<Task[]>("GET", "/api/tasks"),
  });

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
    queryFn: () => apiRequest<Habit[]>("GET", "/api/habits"),
  });

  const createTask = useMutation({
    mutationFn: (task: { title: string, category: string, priority: string }) =>
      apiRequest("POST", "/api/tasks", task),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Task>) =>
      apiRequest("PATCH", `/api/tasks/${id}`, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const updateHabit = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Habit>) =>
      apiRequest("PATCH", `/api/habits/${id}`, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/habits"] }),
  });

  const createCapture = useMutation({
    mutationFn: (content: string) => apiRequest("POST", "/api/capture", { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/capture"] }),
  });

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    updateTask.mutate({ id, completed: !task.completed });
  };

  const removeTask = (id: string) => deleteTask.mutate(id);

  const toggleHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const today = new Date().toISOString().split("T")[0];
    const wasCompleted = habit.completedToday;
    updateHabit.mutate({
      id,
      completedToday: !wasCompleted,
      lastCompletedDate: !wasCompleted ? today : habit.lastCompletedDate,
      streak: !wasCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
    });
  };

  const handleCaptureAdd = () => {
    if (!captureText.trim()) return;
    createCapture.mutate(captureText.trim());
    setCaptureText("");
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const completedHabitsCount = habits.filter(h => h.completedToday).length;
  const totalItems = tasks.length + habits.length;
  const completedItems = completedTasks.length + completedHabitsCount;
  const todayScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-4 md:p-8 pt-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <AnimatePresence>
        {showAddTask && (
          <AddTaskModal
            onClose={() => setShowAddTask(false)}
            onAdd={(t) => createTask.mutate(t)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-muted-foreground text-sm mb-1 tracking-tight">{today}</h2>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground">{greeting}.</h1>
        </div>

        {/* Today Score Widget */}
        <div className="flex flex-col items-end">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary" />
              <circle
                cx="24" cy="24" r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out text-primary"
                strokeDasharray={`${22 * 2 * Math.PI}`}
                strokeDashoffset={`${(22 * 2 * Math.PI) * (1 - todayScore / 100)}`}
              />
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="text-sm font-semibold leading-none">{todayScore}%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
        {/* MAIN COLUMN */}
        <div className="md:col-span-2 space-y-8">

          {/* Up Next */}
          <Link href="/planner" className="block">
            <div className="bg-card border rounded-xl p-4 shadow-sm flex gap-4 items-center group cursor-pointer hover:border-primary/20 transition-colors">
              <div className="flex flex-col items-center bg-secondary px-3 py-2 rounded-lg text-foreground min-w-[64px]">
                <span className="text-sm font-semibold">Now</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Up Next</span>
                </div>
                <h4 className="font-semibold text-base">Open Planner</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">Schedule your focus sessions for today.</p>
              </div>
              <div className="hidden sm:flex h-8 w-8 bg-secondary text-foreground rounded-full items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Tasks</h3>
              <button
                data-testid="button-add-task"
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {tasksLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2 relative z-10">
                {activeTasks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground bg-secondary/30 rounded-xl border border-dashed">
                    <Check className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="font-medium text-sm">All caught up!</p>
                    <button onClick={() => setShowAddTask(true)} className="mt-3 text-xs font-semibold text-primary hover:underline">
                      + Add your first task
                    </button>
                  </div>
                ) : (
                  activeTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={removeTask}
                      onStartFocus={() => navigate("/focus")}
                    />
                  ))
                )}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Completed ({completedTasks.length})
                </button>

                <AnimatePresence>
                  {showCompleted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2 mt-2"
                    >
                      {completedTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-2 px-3 rounded-lg border border-transparent hover:bg-secondary/50 group">
                          <Check className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground line-through flex-1">{task.title}</span>
                          <button onClick={() => toggleTask(task.id)} className="text-xs font-medium text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Undo
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-8">

          {/* Quick Capture */}
          <section>
            <h3 className="font-semibold text-lg mb-4">Capture</h3>
            <div className="bg-card border rounded-xl p-3 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all focus-within:border-primary/30 group">
              <div className="flex items-start gap-2">
                <textarea
                  ref={captureRef}
                  data-testid="input-capture"
                  className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:ring-0 leading-relaxed"
                  placeholder="What's on your mind?"
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleCaptureAdd(); }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                <button className="h-7 w-7 rounded-md text-muted-foreground flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors flex-shrink-0">
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2">
                  {captureText && (
                    <button
                      data-testid="button-capture-add"
                      onClick={handleCaptureAdd}
                      disabled={createCapture.isPending}
                      className="text-xs font-medium text-primary-foreground bg-primary px-3 py-1 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {createCapture.isPending ? "Saving..." : "Add"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Habits */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Habits</h3>
            </div>

            {habitsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : habits.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground bg-secondary/30 rounded-xl border border-dashed">
                <Flame className="w-6 h-6 mx-auto mb-2 opacity-20" />
                <p className="font-medium text-sm">No habits yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {habits.map(habit => (
                  <div
                    key={habit.id}
                    data-testid={`habit-item-${habit.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-border transition-colors cursor-pointer group"
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex-shrink-0 h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                        habit.completedToday ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 text-transparent group-hover:border-primary/60"
                      )}>
                        {habit.completedToday && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        habit.completedToday ? "text-muted-foreground line-through" : "text-foreground font-medium"
                      )}>{habit.title}</span>
                    </div>

                    <div className={cn(
                      "flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors",
                      habit.completedToday ? "text-primary" : "text-muted-foreground"
                    )}>
                      <Flame className="w-3 h-3" fill={habit.completedToday ? "currentColor" : "none"} />
                      <span>{habit.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
