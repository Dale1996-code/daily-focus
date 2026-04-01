import { Link, useLocation, useRoute } from "wouter";
import { Home, Calendar, Timer, Plus, PenSquare, RefreshCw, Target, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@/lib/navigate";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/blueprints", label: "Templates", icon: Library },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/focus", label: "Focus", icon: Timer },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const navigate = useNavigate();

  const fabActions = [
    { label: "Schedule Focus", icon: Target, action: () => { setIsFabOpen(false); navigate("/focus"); } },
    { label: "Add Template", icon: RefreshCw, action: () => { setIsFabOpen(false); navigate("/blueprints"); } },
    { label: "Add Task", icon: Plus, action: () => { setIsFabOpen(false); navigate("/"); setTimeout(() => window.dispatchEvent(new CustomEvent("open-add-task")), 100); } },
    { label: "Quick Note", icon: PenSquare, action: () => { setIsFabOpen(false); navigate("/"); setTimeout(() => window.dispatchEvent(new CustomEvent("focus-capture")), 100); } },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-24 md:pb-0 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar px-4 py-8 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-display font-bold text-lg">F</span>
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">Flow</h1>
        </div>
        
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm border border-border/50" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}>
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Quick Add Button */}
        <button
          onClick={() => {
            navigate("/");
            setTimeout(() => window.dispatchEvent(new CustomEvent("open-add-task")), 100);
          }}
          className="mt-auto bg-primary text-primary-foreground flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Quick Add
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Global FAB (Mobile) */}
      <div className="md:hidden">
        {/* Backdrop */}
        {isFabOpen && (
          <div
            className="fixed inset-0 z-[9990] bg-background/60 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFabOpen(false);
            }}
            aria-hidden="true"
          />
        )}

        {/* FAB Container */}
        <div className="fixed bottom-24 right-4 z-[9999] flex flex-col items-end">
          {/* Action Menu */}
          {isFabOpen && (
            <div className="flex flex-col gap-4 items-end mb-4">
              {fabActions.map((action, i) => (
                <button 
                  key={i}
                  type="button"
                  data-testid={`fab-action-${i}`}
                  className="flex items-center justify-end gap-3 w-full bg-transparent border-none p-0 cursor-pointer outline-none m-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    action.action();
                  }}
                >
                  <div className="bg-background px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg border text-foreground">
                    {action.label}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-card border shadow-lg flex items-center justify-center text-foreground">
                    <action.icon className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Main Toggle Button */}
          <button 
            type="button"
            data-testid="button-fab-toggle"
            className={cn(
              "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 outline-none cursor-pointer border-none m-0 p-0",
              isFabOpen ? "bg-secondary text-foreground rotate-45" : "bg-primary text-primary-foreground"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFabOpen(!isFabOpen);
            }}
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
              <Link key={item.href} href={item.href} className={cn(
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
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
