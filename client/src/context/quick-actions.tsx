import { createContext, useContext, useMemo, useState } from "react";

interface QuickActionsContextValue {
  addTaskSignal: number;
  focusCaptureSignal: number;
  triggerAddTask: () => void;
  triggerFocusCapture: () => void;
}

const QuickActionsContext = createContext<QuickActionsContextValue | null>(null);

export function QuickActionsProvider({ children }: { children: React.ReactNode }) {
  const [addTaskSignal, setAddTaskSignal] = useState(0);
  const [focusCaptureSignal, setFocusCaptureSignal] = useState(0);

  const value = useMemo<QuickActionsContextValue>(
    () => ({
      addTaskSignal,
      focusCaptureSignal,
      triggerAddTask: () => setAddTaskSignal((signal) => signal + 1),
      triggerFocusCapture: () =>
        setFocusCaptureSignal((signal) => signal + 1),
    }),
    [addTaskSignal, focusCaptureSignal],
  );

  return (
    <QuickActionsContext.Provider value={value}>
      {children}
    </QuickActionsContext.Provider>
  );
}

export function useQuickActions() {
  const ctx = useContext(QuickActionsContext);
  if (!ctx) {
    throw new Error("useQuickActions must be used within QuickActionsProvider");
  }
  return ctx;
}
