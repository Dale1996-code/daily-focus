import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const mockSchedule = [
  { id: 1, title: "Deep Work: Strategy", time: "09:00", duration: 120, type: "focus" },
  { id: 2, title: "Team Sync", time: "11:30", duration: 30, type: "meeting" },
  { id: 3, title: "Lunch & Walk", time: "12:00", duration: 60, type: "break" },
  { id: 4, title: "Review PRs", time: "14:00", duration: 90, type: "work" },
  { id: 5, title: "Inbox Zero", time: "16:00", duration: 30, type: "admin" },
];

export default function Planner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generate days for the week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="p-4 md:p-8 pt-8 pb-24 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-muted-foreground font-medium mb-1">Schedule</h2>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Plan your time.</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 border rounded-xl hover:bg-secondary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 border rounded-xl font-medium bg-card min-w-[140px] text-center flex items-center justify-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            {format(currentDate, "MMMM yyyy")}
          </div>
          <button className="p-2 border rounded-xl hover:bg-secondary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Weekly View (Mini) */}
      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 mb-6 scrollbar-none snap-x">
        {weekDays.map((date, i) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === currentDate.toDateString();
          
          return (
            <div 
              key={i}
              onClick={() => setCurrentDate(date)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-2xl border cursor-pointer transition-all snap-center",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                  : "bg-card hover:bg-secondary hover:border-border",
                isToday && !isSelected && "border-primary/50 text-primary font-bold"
              )}
            >
              <span className="text-xs uppercase font-medium opacity-80 mb-1">
                {format(date, "EEE")}
              </span>
              <span className="text-xl font-display font-bold">
                {format(date, "d")}
              </span>
              {isToday && (
                <div className={cn(
                  "h-1 w-1 rounded-full mt-1",
                  isSelected ? "bg-primary-foreground" : "bg-primary"
                )} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Daily Schedule */}
        <div className="md:col-span-2">
          <div className="bg-card border rounded-3xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-xl">Daily Itinerary</h3>
              <button className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Block
              </button>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[4.5rem] top-2 bottom-2 w-px bg-border z-0" />
              
              <div className="space-y-6 relative z-10">
                {mockSchedule.map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-16 flex-shrink-0 text-right pt-2">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.time}
                      </span>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="relative mt-2.5 flex-shrink-0 h-3 w-3 rounded-full border-2 border-background bg-border group-hover:bg-primary group-hover:border-primary/20 transition-all z-10" />
                    
                    <div className={cn(
                      "flex-1 p-4 rounded-2xl border transition-all hover:shadow-sm cursor-pointer",
                      item.type === 'focus' ? "bg-primary/5 border-primary/20" :
                      item.type === 'break' ? "bg-accent/5 border-accent/20" :
                      "bg-background hover:bg-secondary/50"
                    )}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.duration}m
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goals / Backlog */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-secondary to-background border rounded-3xl p-6">
            <h3 className="font-display font-semibold text-xl mb-4">This Week</h3>
            <ul className="space-y-3">
              {[
                "Launch landing page",
                "Finalize Q3 presentation",
                "3 gym sessions",
                "Read 2 chapters of new book"
              ].map((goal, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{goal}</span>
                </li>
              ))}
            </ul>
            <button className="w-full mt-6 py-2.5 rounded-xl border border-dashed hover:bg-secondary/50 hover:border-solid transition-all text-sm font-medium text-muted-foreground">
              + Add Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}