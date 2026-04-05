import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, Plus, LayoutGrid, List, GripVertical, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Reorder, useDragControls } from "framer-motion";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const times = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

// Complex interactive state structure
const initialEvents = [
  { id: "1", title: "Product Sync", time: "10:00", duration: 60, type: "meeting", attendees: 4, day: 2, top: 2, height: 1 },
  { id: "2", title: "Deep Work: Q3 Roadmap", time: "13:00", duration: 120, type: "focus", day: 2, top: 5, height: 2 },
  { id: "3", title: "Design Review", time: "15:30", duration: 45, type: "review", attendees: 2, day: 2, top: 7.5, height: 0.75 },
];

const initialBacklog = [
  { id: "b1", title: "Write weekly update", duration: 30, type: "admin" },
  { id: "b2", title: "Review Q4 budget", duration: 60, type: "focus" },
  { id: "b3", title: "Clear inbox", duration: 45, type: "admin" },
];

function DraggableEvent({ event, onResize }: { event: any, onResize: (id: string, newHeight: number) => void }) {
  const controls = useDragControls();
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={elementRef}
      drag="y"
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(e, info) => {
        // Snap to grid (15 min increments roughly)
        // In a real app we'd calculate exact time slot based on y offset
      }}
      whileDrag={{ scale: 1.02, zIndex: 50, opacity: 0.9 }}
      className={cn(
        "absolute left-0 right-0 rounded-xl p-3 border shadow-sm flex flex-col gap-1 overflow-hidden hover:ring-2 hover:ring-primary/20 z-10 cursor-grab active:cursor-grabbing will-change-transform transform-gpu",
        event.type === 'meeting' && "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
        event.type === 'focus' && "bg-primary/10 border-primary/20 text-primary",
        event.type === 'review' && "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400",
        event.type === 'social' && "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400",
        event.type === 'admin' && "bg-secondary/80 border-border text-foreground"
      )}
      style={{
        top: `${(event.top / (times.length - 1)) * 100}%`,
        height: `${(event.height / (times.length - 1)) * 100}%`,
        touchAction: "none"
      }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm leading-tight select-none">{event.title}</h4>
        <span className="text-xs font-semibold opacity-80 select-none">{event.time}</span>
      </div>
      
      {event.duration >= 45 && (
        <div className="flex items-center gap-3 mt-auto text-xs font-semibold opacity-80 select-none">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{event.duration}m</span>
          </div>
          {event.attendees && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{event.attendees}</span>
            </div>
          )}
        </div>
      )}

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-background/20"
        onPointerDown={(e) => e.stopPropagation()} // Prevent dragging the whole card when resizing
      >
        <div className="w-8 h-1 rounded-full bg-current opacity-50" />
      </div>
    </motion.div>
  );
}

export default function Planner() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDay, setSelectedDay] = useState(2); // Tuesday
  const [events, setEvents] = useState(initialEvents);
  const [backlog, setBacklog] = useState(initialBacklog);

  return (
    <div className="p-4 md:p-8 pt-6 pb-24 md:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      
      {/* Premium Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-muted-foreground text-sm font-semibold mb-1 tracking-widest uppercase">October 2023</h2>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">Weekly Planner</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1 border shadow-inner">
            <button className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-all shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold px-3">Week 42</span>
            <button className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-all shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Week Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar shrink-0">
        {weekDays.map((day, i) => {
          const date = 23 + i;
          const isToday = i === 2; // Mock Tuesday as today
          const isSelected = selectedDay === i;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[4.5rem] h-[4.5rem] rounded-2xl transition-all border",
                isSelected 
                  ? "bg-foreground text-background border-foreground shadow-md scale-105" 
                  : isToday
                    ? "bg-primary/5 border-primary/30 text-primary hover:bg-primary/10"
                    : "bg-card border-border hover:border-border/80 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-0.5", isSelected ? "opacity-80" : "")}>{day}</span>
              <span className="text-xl font-display font-bold leading-none">{date}</span>
              {isToday && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Timeline View (Takes up more space now) */}
        <div className="lg:col-span-3 bg-card border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full relative group">
          
          {/* Timeline Header */}
          <div className="p-4 px-6 border-b bg-secondary/30 flex justify-between items-center z-20 shrink-0">
            <h3 className="font-display font-bold text-lg">{weekDays[selectedDay]}, Oct {23 + selectedDay}</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-background px-3 py-1.5 rounded-lg border shadow-sm">
                {events.filter(e => e.day === selectedDay).length} blocks
              </span>
            </div>
          </div>
          
          {/* Scrollable Timeline */}
          <div className="flex-1 overflow-y-auto hide-scrollbar relative">
            <div className="min-h-[800px] relative p-4 px-6">
              
              {/* Grid Lines */}
              <div className="absolute inset-y-4 left-20 right-6 flex flex-col justify-between z-0 pointer-events-none">
                {times.map((time, i) => (
                  <div key={time} className="w-full h-px bg-border/40 relative flex-1">
                    <span className="absolute -left-14 -top-2.5 text-xs font-bold text-muted-foreground">
                      {time}:00
                    </span>
                    {/* Half-hour marker */}
                    {i !== times.length - 1 && (
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-border/20 border-dashed" />
                    )}
                  </div>
                ))}
              </div>

              {/* Events Container */}
              <div className="absolute inset-y-4 left-24 right-6">
                {events.filter(e => e.day === selectedDay).map(event => (
                  <DraggableEvent 
                    key={event.id} 
                    event={event} 
                    onResize={(id, h) => {
                      setEvents(events.map(e => e.id === id ? { ...e, height: h } : e));
                    }} 
                  />
                ))}
                
                {/* Current time indicator (mocked) */}
                {selectedDay === 2 && (
                  <div 
                    className="absolute left-[-16px] right-0 h-[2px] bg-primary z-20 flex items-center shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                    style={{ top: '35%' }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-primary absolute left-[-4px]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Backlog / Drag Source */}
        <div className="hidden lg:flex flex-col gap-6 h-full">
          <div className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="font-display font-bold text-lg">Task Backlog</h3>
              <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 shrink-0">
              Drag into timeline
            </p>

            <Reorder.Group 
              axis="y" 
              values={backlog} 
              onReorder={setBacklog}
              className="space-y-3 overflow-y-auto hide-scrollbar flex-1 pb-4"
            >
              {backlog.map((task) => (
                <Reorder.Item 
                  key={task.id} 
                  value={task}
                  whileDrag={{ scale: 1.02, zIndex: 50, opacity: 0.9 }}
                  className="bg-background border rounded-2xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/30 group relative will-change-transform transform-gpu"
                  style={{ touchAction: "none" }}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1 pr-2">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.duration}m
                        </span>
                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                          {task.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            <div className="mt-auto pt-4 border-t border-dashed shrink-0">
               <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-green-700">Daily Goal Met</span>
                    <span className="text-[10px] font-medium text-green-600/80">4 focus sessions planned</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}