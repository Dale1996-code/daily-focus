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
    <div className="p-4 md:p-8 pt-8 pb-24 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-muted-foreground font-medium mb-1">Good morning,</h2>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Let's make today count.</h1>
      </header>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-2xl p-4 shadow-sm">
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
        
        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">Overdue</span>
            <span className="text-2xl font-display font-bold text-destructive">1</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Priorities / Tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-xl">Today's Priorities</h3>
              <button className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={cn(
                    "group flex items-center gap-3 p-3.5 rounded-2xl border bg-card transition-all duration-200 hover:shadow-sm cursor-pointer",
                    task.completed && "opacity-60 bg-secondary/50 border-transparent",
                    task.overdue && !task.completed && "border-destructive/30 bg-destructive/5"
                  )}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={cn(
                    "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    task.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium truncate transition-all",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {task.category}
                      </span>
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          High Priority
                        </span>
                      )}
                      {task.overdue && !task.completed && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                          Overdue
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
            <h3 className="font-display font-semibold text-xl mb-4">Quick Notes</h3>
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
              <textarea 
                className="w-full bg-transparent border-none outline-none resize-none min-h-[100px] text-foreground placeholder:text-muted-foreground/60 focus:ring-0"
                placeholder="Jot down a quick thought or idea..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Habits/Routines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-xl">Routines</h3>
            </div>
            
            <div className="space-y-3">
              {habits.map(habit => (
                <div 
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-2xl border bg-card hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => toggleHabit(habit.id)}
                >
                  <div className="flex items-center gap-3">
                    <button className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                      habit.completed ? "bg-accent text-accent-foreground shadow-sm border-transparent" : "bg-secondary text-muted-foreground border-border border"
                    )}>
                      {habit.completed ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <span className={cn(
                      "font-medium",
                      habit.completed && "text-muted-foreground"
                    )}>{habit.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent font-medium text-sm">
                    <Flame className="w-4 h-4" fill="currentColor" />
                    <span>{habit.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Up Next Mini Planner */}
          <section>
            <h3 className="font-display font-semibold text-xl mb-4">Up Next</h3>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-2xl p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-primary">14:00</span>
                  <div className="w-px h-full bg-primary/20 my-1" />
                </div>
                <div>
                  <h4 className="font-medium">Deep Work Session</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">Focus on Q3 roadmap without distractions.</p>
                  <button className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:shadow transition-all">
                    Start Timer <ArrowRight className="w-3 h-3" />
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