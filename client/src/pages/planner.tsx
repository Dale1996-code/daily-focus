import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const times = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const events = [
  { id: 1, title: "Product Sync", time: "10:00", duration: 60, type: "meeting", attendees: 4, day: 2 },
  { id: 2, title: "Deep Work: Q3 Roadmap", time: "13:00", duration: 120, type: "focus", day: 2 },
  { id: 3, title: "Design Review", time: "15:30", duration: 45, type: "review", attendees: 2, day: 2 },
  { id: 4, title: "1:1 with Sarah", time: "11:00", duration: 30, type: "meeting", attendees: 2, day: 3 },
  { id: 5, title: "Team Lunch", time: "12:30", duration: 60, type: "social", attendees: 8, day: 4 },
];

export default function Planner() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDay, setSelectedDay] = useState(2); // Tuesday

  return (
    <div className="p-4 md:p-8 pt-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-muted-foreground text-sm mb-1 tracking-tight">October 2023</h2>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground">Weekly Planner</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary p-1 rounded-lg border border-border/50">
            <button 
              onClick={() => setView('calendar')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                view === 'calendar' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                view === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 border border-border/50">
            <button className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2">Week 42</span>
            <button className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <button className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Event</span>
          </button>
        </div>
      </header>

      {/* Week Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {weekDays.map((day, i) => {
          const date = 23 + i;
          const isToday = i === 2; // Mock Tuesday as today
          const isSelected = selectedDay === i;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={cn(
                "flex flex-col items-center min-w-[4rem] p-3 rounded-xl transition-all border",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : isToday
                    ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                    : "bg-card border-border hover:border-border/80 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xs font-medium mb-1">{day}</span>
              <span className={cn(
                "text-lg font-semibold",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )}>{date}</span>
              {isToday && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Timeline View */}
        <div className="lg:col-span-2 bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-secondary/50 flex justify-between items-center">
            <h3 className="font-semibold text-base">{weekDays[selectedDay]}, Oct {23 + selectedDay}</h3>
            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border shadow-sm">
              {events.filter(e => e.day === selectedDay).length} events
            </span>
          </div>
          
          <div className="relative h-[600px] overflow-y-auto hide-scrollbar p-4">
            {/* Timeline grid */}
            <div className="absolute top-4 left-16 right-4 bottom-4 flex flex-col justify-between">
              {times.map(time => (
                <div key={time} className="w-full h-px bg-border/40 relative">
                  <span className="absolute -left-12 -top-2.5 text-xs text-muted-foreground font-medium">
                    {time}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Events for selected day */}
            <div className="absolute top-4 left-20 right-4 bottom-4">
              {events.filter(e => e.day === selectedDay).map(event => {
                const hour = parseInt(event.time.split(':')[0]);
                const minute = parseInt(event.time.split(':')[1] || '0');
                const topPercent = ((hour - 8) + (minute / 60)) / (times.length - 1) * 100;
                const heightPercent = (event.duration / 60) / (times.length - 1) * 100;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={event.id}
                    className={cn(
                      "absolute left-0 right-0 rounded-lg p-3 border shadow-sm flex flex-col gap-1 overflow-hidden transition-all hover:ring-2 hover:ring-primary/20 z-10 cursor-pointer",
                      event.type === 'meeting' && "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
                      event.type === 'focus' && "bg-primary/10 border-primary/20 text-primary",
                      event.type === 'review' && "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400",
                      event.type === 'social' && "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                    )}
                    style={{
                      top: `${topPercent}%`,
                      height: `${heightPercent}%`,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                      <span className="text-xs font-medium opacity-80">{event.time}</span>
                    </div>
                    
                    {event.duration >= 45 && (
                      <div className="flex items-center gap-3 mt-auto text-xs font-medium opacity-80">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.duration}m</span>
                        </div>
                        {event.attendees && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.attendees}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {/* Current time indicator (mocked) */}
              {selectedDay === 2 && (
                <div 
                  className="absolute left-[-16px] right-0 h-px bg-destructive z-20 flex items-center"
                  style={{ top: '35%' }}
                >
                  <div className="w-2 h-2 rounded-full bg-destructive absolute left-[-4px]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Mini Calendar */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-base mb-4">Focus Time</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Scheduled today</span>
                <span className="font-semibold">2h 0m</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[60%] rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You're 1 hour short of your daily goal. Find time to schedule another session.
              </p>
              <button className="w-full mt-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium py-2 rounded-lg transition-colors">
                Auto-Schedule
              </button>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-base mb-4">Upcoming</h3>
            <div className="space-y-3">
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center bg-secondary px-2 py-1 rounded-md min-w-[48px] group-hover:bg-background border border-transparent group-hover:border-border/50">
                    <span className="text-xs font-semibold">{event.time}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <span className="text-xs text-muted-foreground">{weekDays[event.day]} • {event.duration}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
