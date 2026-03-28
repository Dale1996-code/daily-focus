import { useState, useRef, useEffect } from "react";
import { Plus, Check, Circle, Flame, ArrowRight, Mic, Play, ChevronDown, ChevronRight, CalendarClock, MoreHorizontal, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Mock data
const initialTasks = [
  { id: 1, title: "Review Q3 Roadmap", category: "Work", priority: "high", completed: false, overdue: true },
  { id: 2, title: "Write newsletter draft", category: "Content", priority: "medium", completed: false },
  { id: 3, title: "Gym session (Upper body)", category: "Health", priority: "low", completed: true },
];

const initialHabits = [
  { id: 1, title: "Morning Meditation", streak: 12, completed: true },
  { id: 2, title: "Read 10 pages", streak: 5, completed: false },
  { id: 3, title: "Drink 2L Water", streak: 2, completed: false },
];

function TaskCard({ 
  task, 
  onToggle, 
  onDelete 
}: { 
  task: any, 
  onToggle: (id: number) => void,
  onDelete: (id: number) => void
}) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (!isSwiping) setShowEdit(true);
    }, 600); // 600ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl">
      {/* Actions behind the card (Swipe to complete/delete) */}
      <div className="absolute inset-0 flex justify-between items-center px-4 rounded-2xl bg-secondary/50">
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
          "relative z-10 flex items-center gap-3 p-3 bg-card border rounded-2xl transition-colors cursor-pointer",
          task.completed ? "opacity-60 bg-secondary/30" : "hover:shadow-sm",
          showEdit && "ring-2 ring-primary/50",
          task.overdue && !task.completed && "border-l-4 border-l-destructive shadow-sm"
        )}
      >
        <div 
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={cn(
            "flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ml-1 z-20 cursor-pointer",
            task.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 text-transparent hover:border-primary/60"
          )}
        >
          <Check className="w-3 h-3" />
        </div>
        
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex justify-between items-start gap-2">
            <p className={cn(
              "text-[15px] font-semibold truncate transition-all leading-tight",
              task.completed ? "line-through text-muted-foreground font-medium" : "text-foreground"
            )}>
              {task.title}
            </p>
            {!task.completed && (
              <button 
                onClick={(e) => { e.stopPropagation(); /* Start focus logic */ window.location.href = '/focus'; }}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary p-1.5 rounded-lg flex-shrink-0"
                title="Start Focus"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/50 px-2 py-0.5 rounded-md">
              {task.category}
            </span>
            {task.priority === 'high' && (
              <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Zap className="w-3 h-3" /> High
              </span>
            )}
            {task.overdue && !task.completed && (
              <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                Overdue
              </span>
            )}
          </div>
        </div>

        {/* Smart Overdue Suggestion */}
        {task.overdue && !task.completed && !task.completed && (
          <div className="absolute bottom-[-1px] right-4 bg-background border border-border shadow-sm text-[10px] font-semibold px-2 py-1 rounded-t-lg flex gap-2">
            <button className="text-primary hover:underline">Do now</button>
            <div className="w-px bg-border my-0.5" />
            <button className="text-muted-foreground hover:text-foreground">Reschedule</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [habits, setHabits] = useState(initialHabits);
  const [captureText, setCaptureText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  // Fake auto-save for quick capture
  useEffect(() => {
    if (captureText.trim().length > 0) {
      setIsSaving(true);
      const timer = setTimeout(() => setIsSaving(false), 800);
      return () => clearTimeout(timer);
    }
  }, [captureText]);

  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);
  const completedHabitsCount = habits.filter(h => h.completed).length;
  
  // Calculate Today Score (0-100)
  const totalItems = tasks.length + habits.length;
  const completedItems = completedTasks.length + completedHabitsCount;
  const todayScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="p-4 md:p-8 pt-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header & Score */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-muted-foreground font-medium text-sm mb-1 uppercase tracking-wider">Good morning</h2>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Let's make today count.</h1>
        </div>
        
        {/* Today Score Widget */}
        <div className="flex flex-col items-end">
          <div className="relative w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-sm">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
              <circle 
                cx="28" cy="28" r="26" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-1000 ease-out",
                  todayScore === 100 ? "text-green-500" : "text-primary"
                )}
                strokeDasharray={`${26 * 2 * Math.PI}`}
                strokeDashoffset={`${(26 * 2 * Math.PI) * (1 - todayScore / 100)}`}
              />
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="text-sm font-display font-bold leading-none">{todayScore}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Today Score</span>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
        
        {/* MAIN COLUMN */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Action Items Header */}
          <div className="flex items-center gap-4">
            <h3 className="font-display font-bold text-lg md:text-xl">Action Items</h3>
            <div className="h-px bg-border flex-1" />
          </div>
          
          {/* Active Tasks */}
          <div className="space-y-3 relative z-10">
            {activeTasks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground bg-secondary/30 rounded-2xl border border-dashed">
                <Check className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="font-medium">All caught up for now.</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>

          {/* Completed Tasks (Collapsible) */}
          {completedTasks.length > 0 && (
            <div>
              <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Completed today ({completedTasks.length})
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
                      <div key={task.id} className="flex items-center gap-3 p-2 px-3 rounded-xl bg-secondary/20 border border-transparent">
                        <Check className="w-3.5 h-3.5 text-primary opacity-70" />
                        <span className="text-sm text-muted-foreground line-through flex-1">{task.title}</span>
                        <button onClick={() => toggleTask(task.id)} className="text-[10px] font-medium text-muted-foreground hover:text-primary">
                          Undo
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Up Next Mini Planner */}
          <section className="bg-card border rounded-2xl p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CalendarClock className="w-24 h-24 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider relative z-10">Up Next</h3>
            <div className="flex gap-4 items-center relative z-10">
              <div className="flex flex-col items-center bg-primary/10 px-3 py-2 rounded-xl text-primary">
                <span className="text-xs font-bold">14:00</span>
                <span className="text-[10px] font-medium uppercase">90m</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base">Deep Work Session</h4>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">Focus on Q3 roadmap without distractions.</p>
              </div>
              <Link href="/focus">
                <a className="hidden sm:flex h-10 w-10 bg-primary text-primary-foreground rounded-full items-center justify-center shadow-md hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </a>
              </Link>
            </div>
          </section>

        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-8">

          {/* Quick Capture */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <h3 className="font-display font-bold text-lg">Quick Capture</h3>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="bg-card border rounded-2xl p-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all group">
              <div className="flex items-start gap-2">
                <textarea 
                  className="w-full bg-transparent border-none outline-none resize-none min-h-[40px] text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-0 leading-relaxed"
                  placeholder="Idea, thought, or task..."
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value)}
                />
                <button className="h-8 w-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:text-primary transition-colors flex-shrink-0 group-focus-within:bg-primary/10">
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] font-medium text-muted-foreground/60 transition-opacity">
                  {isSaving ? "Saving..." : captureText ? "Saved just now" : ""}
                </span>
                {captureText && (
                  <button className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                    Add to tasks
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Routines */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <h3 className="font-display font-bold text-lg">Routines</h3>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div className="space-y-3">
              {habits.map(habit => (
                <div 
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-2xl border bg-card hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => toggleHabit(habit.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* SVG Progress Ring for routine status */}
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <svg className="w-8 h-8 -rotate-90 transform">
                        <circle 
                          cx="16" cy="16" r="14" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          className="text-secondary" 
                        />
                        <circle 
                          cx="16" cy="16" r="14" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          strokeLinecap="round"
                          className={cn(
                            "transition-all duration-500",
                            habit.completed ? "text-accent" : "text-transparent group-hover:text-accent/30"
                          )}
                          strokeDasharray="88"
                          strokeDashoffset={habit.completed ? "0" : "88"}
                        />
                      </svg>
                      {habit.completed && <Check className="absolute w-3.5 h-3.5 text-accent" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-semibold text-sm transition-colors",
                        habit.completed ? "text-muted-foreground" : "text-foreground"
                      )}>{habit.title}</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        {habit.completed ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Subtle Streak indicator */}
                  <div className={cn(
                    "flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-lg transition-colors",
                    habit.completed ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                  )}>
                    <Flame className="w-3.5 h-3.5" fill={habit.completed ? "currentColor" : "none"} />
                    <span>{habit.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}