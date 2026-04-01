import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
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
    <div className="relative group overflow-hidden rounded-xl">
      {/* Actions behind the card (Swipe to complete/delete) */}
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
                onClick={(e) => { e.stopPropagation(); /* Start focus logic */ window.location.href = '/focus'; }}
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
    <div className="p-4 md:p-8 pt-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      {/* Premium Header & Score */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-muted-foreground text-sm mb-1 tracking-tight">Tuesday, October 24</h2>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground">Good morning, Alex.</h1>
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
                className={cn(
                  "transition-all duration-1000 ease-out text-primary"
                )}
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
          
          {/* Up Next Mini Planner */}
          <section className="bg-card border rounded-xl p-4 shadow-sm flex gap-4 items-center group cursor-pointer hover:border-primary/20 transition-colors">
            <div className="flex flex-col items-center bg-secondary px-3 py-2 rounded-lg text-foreground min-w-[64px]">
              <span className="text-sm font-semibold">14:00</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Up Next</span>
              </div>
              <h4 className="font-semibold text-base">Deep Work Session</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">Focus on Q3 roadmap without distractions.</p>
            </div>
            <div className="hidden sm:flex h-8 w-8 bg-secondary text-foreground rounded-full items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </section>

          {/* Action Items */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Tasks</h3>
              <button className="text-sm text-muted-foreground hover:text-foreground">View all</button>
            </div>
            
            {/* Active Tasks */}
            <div className="space-y-2 relative z-10">
              {activeTasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground bg-secondary/30 rounded-xl border border-dashed">
                  <Check className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="font-medium text-sm">All caught up for now.</p>
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
                  className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:ring-0 leading-relaxed"
                  placeholder="What's on your mind?"
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                <div className="flex gap-1">
                   <button className="h-7 w-7 rounded-md text-muted-foreground flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors flex-shrink-0">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/60 transition-opacity">
                    {isSaving ? "Saving..." : captureText ? "Saved" : ""}
                  </span>
                  {captureText && (
                    <button className="text-xs font-medium text-primary-foreground bg-primary px-3 py-1 rounded-md hover:bg-primary/90 transition-colors">
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Routines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Habits</h3>
            </div>
            
            <div className="space-y-2">
              {habits.map(habit => (
                <div 
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-border transition-colors cursor-pointer group"
                  onClick={() => toggleHabit(habit.id)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={cn(
                        "flex-shrink-0 h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                        habit.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 text-transparent group-hover:border-primary/60"
                      )}
                    >
                      {habit.completed && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className={cn(
                      "text-sm transition-colors",
                      habit.completed ? "text-muted-foreground line-through" : "text-foreground font-medium"
                    )}>{habit.title}</span>
                  </div>
                  
                  {/* Subtle Streak indicator */}
                  <div className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors",
                    habit.completed ? "text-primary" : "text-muted-foreground"
                  )}>
                    <Flame className="w-3 h-3" fill={habit.completed ? "currentColor" : "none"} />
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
