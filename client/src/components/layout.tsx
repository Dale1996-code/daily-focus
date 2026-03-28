import { Link, useLocation } from "wouter";
import { Home, Calendar, Timer, BookOpen, Plus, PenSquare, RefreshCw, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/reflection", label: "Reflect", icon: BookOpen },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-24 md:pb-0 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 px-4 py-8 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-display font-bold text-lg">F</span>
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">Flow</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Quick Add Button */}
        <button className="mt-auto bg-foreground text-background flex items-center justify-center gap-2 py-3 rounded-xl font-medium hover:bg-foreground/90 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Quick Add
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Global FAB (Mobile) */}
      <div className="md:hidden fixed bottom-24 right-4 z-[100] pointer-events-none">
        <div className="pointer-events-auto relative">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2"
              >
                {[
                  { label: "Schedule Focus", icon: Target },
                  { label: "Add Routine", icon: RefreshCw },
                  { label: "Add Note", icon: PenSquare },
                  { label: "Add Task", icon: Plus },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Clicked ${action.label}`);
                      setIsFabOpen(false);
                    }}
                    className="flex items-center gap-3 group pointer-events-auto active:scale-95 transition-transform"
                  >
                    <span className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border">
                      {action.label}
                    </span>
                    <div className="h-10 w-10 rounded-full bg-card border shadow-sm flex items-center justify-center text-foreground group-hover:bg-secondary transition-colors">
                      <action.icon className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFabOpen(!isFabOpen);
            }}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 pointer-events-auto relative z-10",
              isFabOpen ? "bg-secondary text-foreground rotate-45" : "bg-primary text-primary-foreground"
            )}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-w-[4.5rem] relative",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-2xl z-0"
                    />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  <span className="text-[10px] font-semibold relative z-10">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}