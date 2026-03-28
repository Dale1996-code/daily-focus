import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings2, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODES = {
  focus: { label: 'Focus', minutes: 25, color: 'text-primary', bg: 'bg-primary' },
  shortBreak: { label: 'Short Break', minutes: 5, color: 'text-accent', bg: 'bg-accent' },
  longBreak: { label: 'Long Break', minutes: 15, color: 'text-blue-500', bg: 'bg-blue-500' },
};

export default function Focus() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'focus') {
        setSessionsCompleted(prev => prev + 1);
        // Auto switch to break
        const nextMode = (sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(MODES[nextMode].minutes * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessionsCompleted]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const changeMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (MODES[mode].minutes * 60));
  const activeColor = MODES[mode].color;
  const activeBg = MODES[mode].bg;

  return (
    <div className="p-4 md:p-8 pt-8 pb-24 md:pb-12 min-h-[calc(100vh-5rem)] md:min-h-screen flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mode Selector */}
      <div className="flex bg-card border rounded-full p-1.5 mb-12 shadow-sm">
        {(Object.keys(MODES) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              mode === m 
                ? "bg-secondary text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative mb-12 group">
        <svg width="320" height="320" viewBox="0 0 320 320" className="rotate-[-90deg]">
          <circle 
            cx="160" cy="160" r="150" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8" 
            className="text-secondary/50"
          />
          <circle 
            cx="160" cy="160" r="150" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray={150 * 2 * Math.PI}
            strokeDashoffset={(150 * 2 * Math.PI) * (1 - progress)}
            className={cn("transition-all duration-1000 ease-linear", activeColor)}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-7xl md:text-8xl tracking-tighter mb-2">
            {formatTime(timeLeft)}
          </span>
          <span className="text-muted-foreground font-medium flex items-center gap-2">
            {mode === 'focus' ? 'Stay Focused' : 'Take a breath'} 
            {mode !== 'focus' && <Coffee className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="h-14 w-14 rounded-full border bg-card hover:bg-secondary text-muted-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95",
            activeBg,
            isRunning && "animate-pulse"
          )}
        >
          {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>
        
        <button className="h-14 w-14 rounded-full border bg-card hover:bg-secondary text-muted-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95">
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Session Tracker */}
      <div className="mt-16 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-3">Sessions Today</p>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-2 w-8 rounded-full transition-all duration-500",
                i < (sessionsCompleted % 4) ? activeBg : 
                (i === sessionsCompleted % 4 && isRunning && mode === 'focus') ? `${activeBg} animate-pulse` : 
                "bg-secondary border"
              )} 
            />
          ))}
        </div>
      </div>

    </div>
  );
}