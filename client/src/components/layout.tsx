import { Link, useLocation } from "wouter";
import {
  Home,
  Calendar,
  Timer,
  Plus,
  PenSquare,
  RefreshCw,
  Target,
  Library,
  BookOpen,
  LogOut,
  KeyRound,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@/lib/navigate";
import { useQuickActions } from "@/context/quick-actions";
import { useAuthSession } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/lib/api";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/blueprints", label: "Templates", icon: Library },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/reflection", label: "Reflect", icon: BookOpen },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { triggerAddTask, triggerFocusCapture } = useQuickActions();
  const session = useAuthSession();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(["/api/auth/session"], {
        authenticated: false,
        needsSetup: false,
      });
      navigate("/");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      apiRequest("POST", "/api/auth/change-password", payload),
    onSuccess: () => {
      setChangePasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setShowChangePassword(false);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setChangePasswordError(error.message);
      } else {
        setChangePasswordError("Could not change password. Please try again.");
      }
    },
  });

  const fabActions = [
    {
      label: "Schedule Focus",
      icon: Target,
      action: () => {
        setIsFabOpen(false);
        navigate("/focus");
      },
    },
    {
      label: "Add Template",
      icon: RefreshCw,
      action: () => {
        setIsFabOpen(false);
        navigate("/blueprints");
      },
    },
    {
      label: "Add Task",
      icon: Plus,
      action: () => {
        setIsFabOpen(false);
        navigate("/");
        setTimeout(triggerAddTask, 100);
      },
    },
    {
      label: "Quick Note",
      icon: PenSquare,
      action: () => {
        setIsFabOpen(false);
        navigate("/");
        setTimeout(triggerFocusCapture, 100);
      },
    },
    {
      label: "Change Password",
      icon: KeyRound,
      action: () => {
        setIsFabOpen(false);
        setChangePasswordError(null);
        setCurrentPassword("");
        setNewPassword("");
        setShowChangePassword(true);
      },
    },
    {
      label: "Sign Out",
      icon: LogOut,
      action: () => {
        setIsFabOpen(false);
        logoutMutation.mutate();
      },
    },
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

        {session.data?.user ? (
          <div className="mb-6 px-2 py-2 rounded-lg bg-secondary/40 border text-xs">
            <p className="text-muted-foreground uppercase tracking-wider mb-1">Signed in as</p>
            <p className="font-semibold truncate">{session.data.user.username}</p>
          </div>
        ) : null}
        
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
            setTimeout(triggerAddTask, 100);
          }}
          className="mt-auto bg-primary text-primary-foreground flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Quick Add
        </button>
        <button
          onClick={() => {
            setChangePasswordError(null);
            setCurrentPassword("");
            setNewPassword("");
            setShowChangePassword(true);
          }}
          className="mt-2 text-sm border rounded-lg py-2.5 hover:bg-secondary/50 transition-colors"
        >
          Change Password
        </button>
        <button
          onClick={() => logoutMutation.mutate()}
          className="mt-2 text-sm border rounded-lg py-2.5 hover:bg-secondary/50 transition-colors disabled:opacity-50"
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
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

      {showChangePassword && (
        <div
          className="fixed inset-0 z-[10000] bg-black/30 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => {
            setShowChangePassword(false);
            setChangePasswordError(null);
          }}
        >
          <div
            className="bg-card border rounded-2xl p-5 w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-display text-xl font-semibold mb-2">Change Password</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your current password and choose a new one.
            </p>

            <div className="space-y-3">
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 bg-background"
                placeholder="Current password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
              />
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 bg-background"
                placeholder="New password (8+ characters)"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>

            {changePasswordError ? (
              <p className="text-sm text-destructive mt-3">{changePasswordError}</p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={() => {
                  setShowChangePassword(false);
                  setChangePasswordError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60 flex items-center gap-2"
                disabled={
                  changePasswordMutation.isPending ||
                  currentPassword.length < 8 ||
                  newPassword.length < 8
                }
                onClick={() =>
                  changePasswordMutation.mutate({
                    currentPassword,
                    newPassword,
                  })
                }
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
