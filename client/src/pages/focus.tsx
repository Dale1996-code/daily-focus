import { useState, useEffect } from "react";
import { Play, Pause, Square, RotateCcw, Volume2, Maximize2, Settings, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Focus() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [taskName, setTaskName] = useState("");
  const [sessions, setSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // seconds
  
  // Progress calculation
  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progress = ((totalTime - time) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (mode === 'focus') setTotalFocusTime(t => t + 1);
          return prev - 1;
        });
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      if (mode === 'focus') setSessions(s => s + 1);
    }
    return () => clearInterval(interval);
  }, [isActive, time, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTime(totalTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'focus') setTime(25 * 60);
    else if (newMode === 'shortBreak') setTime(5 * 60);
    else setTime(15 * 60);
  };

  return (
    <div className="min-h-[100dvh] md:min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500 max-w-3xl mx-auto relative overflow-hidden">
      
      {/* Ambient background glow based on mode */}
      <div className={cn(
        "absolute inset-0 -z-10 blur-[120px] opacity-30 transition-colors duration-1000",
        mode === 'focus' ? "bg-primary/40" : mode === 'shortBreak' ? "bg-green-500/40" : "bg-blue-500/40",
        isActive && "animate-pulse"
      )} />

      {/* Header controls */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center max-w-5xl mx-auto w-full px-4 pointer-events-none">
        <div className="bg-card/80 backdrop-blur border rounded-full px-4 py-2 text-sm font-medium shadow-sm flex items-center gap-2 pointer-events-auto">
          <span className={cn(
            "w-2 h-2 rounded-full",
            mode === 'focus' ? "bg-primary" : mode === 'shortBreak' ? "bg-green-500" : "bg-blue-500",
            isActive && "animate-pulse"
          )} />
          {mode === 'focus' ? "Focus Session" : mode === 'shortBreak' ? "Short Break" : "Long Break"}
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <button className="p-2.5 rounded-full bg-card/80 backdrop-blur border hover:bg-secondary text-muted-foreground transition-colors hidden sm:block">
            <Volume2 className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-full bg-card/80 backdrop-blur border hover:bg-secondary text-muted-foreground transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center mt-8">
        
        {/* Mode Selector */}
        <div className="flex p-1.5 bg-secondary/50 backdrop-blur rounded-2xl mb-12 border shadow-inner w-full max-w-[320px]">
          <button 
            onClick={() => switchMode('focus')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              mode === 'focus' ? "bg-background text-foreground shadow-sm scale-100" : "text-muted-foreground hover:text-foreground scale-95 hover:scale-100"
            )}
          >
            Focus
          </button>
          <button 
            onClick={() => switchMode('shortBreak')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              mode === 'shortBreak' ? "bg-background text-foreground shadow-sm scale-100" : "text-muted-foreground hover:text-foreground scale-95 hover:scale-100"
            )}
          >
            Short Break
          </button>
          <button 
            onClick={() => switchMode('longBreak')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              mode === 'longBreak' ? "bg-background text-foreground shadow-sm scale-100" : "text-muted-foreground hover:text-foreground scale-95 hover:scale-100"
            )}
          >
            Long Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center mb-16 scale-90 sm:scale-100">
          {/* Progress Ring */}
          <svg className="absolute w-[340px] h-[340px] -rotate-90 pointer-events-none">
            <circle 
              cx="170" cy="170" r="160" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="text-secondary/60" 
            />
            <motion.circle 
              cx="170" cy="170" r="160" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="8" 
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000",
                mode === 'focus' ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : 
                mode === 'shortBreak' ? "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              )}
              strokeDasharray={`${160 * 2 * Math.PI}`}
              strokeDashoffset={`${(160 * 2 * Math.PI) * (1 - progress / 100)}`}
              initial={{ strokeDashoffset: 160 * 2 * Math.PI }}
              animate={{ strokeDashoffset: (160 * 2 * Math.PI) * (1 - progress / 100) }}
            />
          </svg>

          {/* Time Text */}
          <div className="flex flex-col items-center z-10 text-center mt-4">
            <span className="font-display text-[6rem] sm:text-8xl font-bold tracking-tighter text-foreground leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(time)}
            </span>
            <input 
              type="text" 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="mt-6 bg-secondary/30 backdrop-blur border-none text-center text-muted-foreground hover:text-foreground outline-none focus:ring-2 focus:ring-primary/50 rounded-xl px-4 py-2 text-sm font-medium transition-colors w-full max-w-[240px]"
              placeholder="What are you working on?"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-secondary/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm border border-transparent hover:border-border hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95",
              isActive 
                ? "bg-secondary text-foreground border-2 border-border" 
                : mode === 'focus' 
                  ? "bg-primary text-primary-foreground" 
                  : mode === 'shortBreak'
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
            )}
          >
            {isActive ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-2" />
            )}
          </button>
          
          <button
            onClick={() => {
              setIsActive(false);
              setTime(totalTime);
              setSessions(s => s + 1);
            }}
            title="Complete session"
            className="w-14 h-14 rounded-full bg-secondary/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-green-500 hover:bg-green-500/10 hover:border-green-500/30 transition-all shadow-sm border border-transparent hover:scale-105 active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

      </div>
      
      {/* Session Stats (bottom) */}
      <div className="absolute bottom-28 md:bottom-12 left-4 right-4 flex justify-center max-w-5xl mx-auto w-full px-4 pointer-events-none">
        <div className="flex items-center justify-center gap-8 bg-card/80 backdrop-blur-xl px-8 py-4 rounded-3xl border shadow-sm w-full max-w-md pointer-events-auto">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Sessions</span>
            <span className="font-display font-bold text-xl" data-testid="stat-sessions">{sessions}<span className="text-muted-foreground text-sm font-medium">/4</span></span>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Time Focused</span>
            <span className="font-display font-bold text-xl" data-testid="stat-focus-time">
              {totalFocusTime >= 3600
                ? `${Math.floor(totalFocusTime / 3600)}h ${Math.floor((totalFocusTime % 3600) / 60)}m`
                : totalFocusTime >= 60
                  ? `${Math.floor(totalFocusTime / 60)}m`
                  : `${totalFocusTime}s`}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
