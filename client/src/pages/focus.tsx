import { useState, useEffect } from "react";
import { Play, Pause, Square, RotateCcw, Volume2, Maximize2, Settings, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Focus() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [taskName, setTaskName] = useState("Deep Work: Q3 Roadmap");
  
  // Progress calculation
  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progress = ((totalTime - time) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      // Handle timer complete (play sound, show notification, etc)
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500 max-w-3xl mx-auto relative">
      
      {/* Ambient background glow based on mode */}
      <div className={cn(
        "absolute inset-0 -z-10 blur-[100px] opacity-20 transition-colors duration-1000",
        mode === 'focus' ? "bg-primary/40" : mode === 'shortBreak' ? "bg-green-500/40" : "bg-blue-500/40"
      )} />

      {/* Header controls */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center max-w-5xl mx-auto w-full px-4">
        <div className="bg-card border rounded-full px-4 py-2 text-sm font-medium shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Focus Session
        </div>
        
        <div className="flex gap-2">
          <button className="p-2.5 rounded-full bg-card border hover:bg-secondary text-muted-foreground transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-full bg-card border hover:bg-secondary text-muted-foreground transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Mode Selector */}
        <div className="flex p-1 bg-secondary/50 rounded-xl mb-12 border shadow-inner">
          <button 
            onClick={() => switchMode('focus')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === 'focus' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Focus
          </button>
          <button 
            onClick={() => switchMode('shortBreak')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === 'shortBreak' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Short Break
          </button>
          <button 
            onClick={() => switchMode('longBreak')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === 'longBreak' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Long Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Progress Ring */}
          <svg className="absolute w-[320px] h-[320px] -rotate-90">
            <circle 
              cx="160" cy="160" r="150" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="text-secondary/50" 
            />
            <motion.circle 
              cx="160" cy="160" r="150" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000",
                mode === 'focus' ? "text-primary" : mode === 'shortBreak' ? "text-green-500" : "text-blue-500"
              )}
              strokeDasharray={`${150 * 2 * Math.PI}`}
              strokeDashoffset={`${(150 * 2 * Math.PI) * (1 - progress / 100)}`}
              initial={{ strokeDashoffset: 150 * 2 * Math.PI }}
              animate={{ strokeDashoffset: (150 * 2 * Math.PI) * (1 - progress / 100) }}
            />
          </svg>

          {/* Time Text */}
          <div className="flex flex-col items-center z-10 text-center mt-4">
            <span className="font-display text-8xl font-bold tracking-tighter text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(time)}
            </span>
            <input 
              type="text" 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="mt-4 bg-transparent border-none text-center text-muted-foreground hover:text-foreground outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-4 py-1 text-sm font-medium transition-colors w-full max-w-[200px]"
              placeholder="What are you working on?"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm border border-transparent hover:border-border"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95",
              isActive 
                ? "bg-secondary text-foreground border" 
                : mode === 'focus' 
                  ? "bg-primary text-primary-foreground" 
                  : mode === 'shortBreak'
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
            )}
          >
            {isActive ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>
          
          <button className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm border border-transparent hover:border-border">
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

      </div>
      
      {/* Session Stats (bottom) */}
      <div className="absolute bottom-8 left-4 right-4 flex justify-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-8 bg-card/80 backdrop-blur-md px-6 py-3 rounded-2xl border shadow-sm text-sm">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Sessions</span>
            <span className="font-semibold text-lg">3<span className="text-muted-foreground text-sm font-normal">/4</span></span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Time Focused</span>
            <span className="font-semibold text-lg">1h 15m</span>
          </div>
        </div>
      </div>

    </div>
  );
}
