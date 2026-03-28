import { useState } from "react";
import { Plus, Check, Circle, Flame, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockTasks = [
  { id: 1, title: "Review Q3 Roadmap", category: "Work", priority: "high", completed: false, overdue: true },
  { id: 2, title: "Write newsletter draft", category: "Content", priority: "medium", completed: false },
  { id: 3, title: "Gym session (Upper body)", category: "Health", priority: "low", completed: true },
];

const mockHabits = [
  { id: 1, title: "Morning Meditation", streak: 12, completed: true },
  { id: 2, title: "Read 10 pages", streak: 5, completed: false },
  { id: 3, title: "Drink 2L Water", streak: 2, completed: false },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(mockTasks);
  const [habits, setHabits] = useState(mockHabits);
  const [note, setNote] = useState("");

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = Math.round((completedTasks / tasks.length) * 100) || 0;

  return (
    <div className="p-4 md:p-8 pt-6 pb-20 md:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-muted-foreground font-medium text-sm mb-1">Good morning,</h2>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Let's make today count.</h1>
        </div>
        <button className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Task</span>
        </button>
      </header>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-card border rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors cursor-pointer active:scale-[0.98]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Daily Progress</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-destructive/30 transition-colors cursor-pointer active:scale-[0.98]">
          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">Overdue</span>
            <span className="text-2xl font-display font-bold text-destructive">1</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Priorities / Tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-lg">Today's Priorities</h3>
            </div>
            
            <div className="space-y-2.5">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-2xl border bg-card transition-all duration-200 hover:shadow-sm cursor-pointer",
                    task.completed && "opacity-60 bg-secondary/50 border-transparent",
                    task.overdue && !task.completed && "border-destructive/20 bg-destructive/[0.02] shadow-sm"
                  )}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.overdue && !task.completed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-2xl" />
                  )}
                  
                  <div className={cn(
                    "flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ml-1",
                    task.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50 text-transparent"
                  )}>
                    <Check className="w-3 h-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn(
                        "text-sm font-semibold truncate transition-all",
                        task.completed ? "line-through text-muted-foreground font-medium" : "text-foreground"
                      )}>
                        {task.title}
                      </p>
                      {task.id === 1 && !task.completed && (
                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">10:00 AM</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {task.category}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-semibold text-orange-500 flex items-center gap-1">
                          High Priority
                        </span>
                      )}
                      {task.priority === 'medium' && (
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          Medium
                        </span>
                      )}
                      {task.priority === 'low' && (
                        <span className="text-[10px] font-medium text-muted-foreground/70 flex items-center gap-1">
                          Low
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Quick Notes */}
          <section>
            <h3 className="font-display font-semibold text-lg mb-3">Quick Notes</h3>
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
              <textarea 
                className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:ring-0"
                placeholder="Jot down a quick thought..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Habits/Routines */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-lg">Routines</h3>
            </div>
            
            <div className="space-y-2.5">
              {habits.map(habit => (
                <div 
                  key={habit.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl border bg-card hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => toggleHabit(habit.id)}
                >
                  <div className="flex items-center gap-3">
                    <button className={cn(
                      "h-7 w-7 rounded-xl flex items-center justify-center transition-colors",
                      habit.completed ? "bg-accent text-accent-foreground shadow-sm border-transparent" : "bg-secondary text-muted-foreground border-border border"
                    )}>
                      {habit.completed ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    </button>
                    <span className={cn(
                      "font-medium text-sm",
                      habit.completed && "text-muted-foreground"
                    )}>{habit.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent font-medium text-xs px-2">
                    <Flame className="w-3.5 h-3.5" fill="currentColor" />
                    <span>{habit.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Up Next Mini Planner */}
          <section>
            <h3 className="font-display font-semibold text-lg mb-3">Up Next</h3>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-2xl p-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-primary">14:00</span>
                  <div className="w-px h-full bg-primary/20 my-1" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Deep Work Session</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2 line-clamp-1">Focus on Q3 roadmap.</p>
                  <button className="text-[10px] font-semibold bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:shadow transition-all w-fit">
                    Start Focus <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}