import { useState } from "react";
import { Copy, Plus, Check, ChevronRight, Briefcase, Users, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function apiRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

const blueprints = [
  {
    id: "ops",
    title: "Store Ops & Fresh",
    icon: Briefcase,
    description: "Daily freight flow and freshness checks.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    category: "Store Ops",
    tasks: [
      { id: 1, text: "Cull check: Pull bad quality from produce/meat/bakery" },
      { id: 2, text: "CVP / Markdowns: Ensure expiring items are marked down" },
      { id: 3, text: "Features: Check endcaps are full, signed, and zoned" },
      { id: 4, text: "Outs: Scan top 20 visible outs, check on-hands, pick if needed" },
      { id: 5, text: "Cleanliness: Spot-clean floors, scales, and glass" }
    ]
  },
  {
    id: "coaching",
    title: "5-Min Coaching",
    icon: MessageSquare,
    description: "Objective, direct feedback framework.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    category: "Work",
    tasks: [
      { id: 1, text: "State the Standard: 'The expectation for top stock is...'" },
      { id: 2, text: "State the Observation: 'I noticed today that...'" },
      { id: 3, text: "Ask the Why: 'What was the roadblock keeping us from hitting that?'" },
      { id: 4, text: "Set Agreement: 'Going forward can we agree we will do better?'" },
      { id: 5, text: "Follow up: Schedule a 2 min check-in for tomorrow" }
    ]
  },
  {
    id: "handoff",
    title: "Shift Handoff",
    icon: Users,
    description: "Pass the baton with no assumptions.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    category: "Store Ops",
    tasks: [
      { id: 1, text: "People Note: Call outs, coverage gaps, associates needing follow up" },
      { id: 2, text: "Freight Status: 'We finished X but Y still needs to be worked'" },
      { id: 3, text: "Store Condition: Zone level, backroom status, safety issues" },
      { id: 4, text: "The One Thing: Single highest priority next shift needs to tackle" }
    ]
  }
];

export default function Blueprints() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const qc = useQueryClient();

  const addTasksMutation = useMutation({
    mutationFn: async ({ tasks, category }: { tasks: { text: string }[], category: string }) => {
      await Promise.all(tasks.map(t =>
        apiRequest("POST", "/api/tasks", { title: t.text, category, priority: "medium" })
      ));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const handleUseBlueprint = async (e: React.MouseEvent, bp: typeof blueprints[0]) => {
    e.stopPropagation();
    if (addedId === bp.id) return;
    setAddedId(bp.id);
    await addTasksMutation.mutateAsync({ tasks: bp.tasks, category: bp.category });
    setTimeout(() => setAddedId(null), 3000);
  };

  return (
    <div className="p-4 md:p-8 pt-6 pb-24 md:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-muted-foreground font-medium text-sm mb-1 uppercase tracking-wider">Templates</h2>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Routine Blueprints</h1>
        <p className="text-muted-foreground text-sm max-w-lg">
          Consistency beats motivation. Populate your day with proven checklists and frameworks with a single tap.
        </p>
      </header>

      <div className="grid gap-4 md:gap-6">
        {blueprints.map((bp) => {
          const isLoading = addTasksMutation.isPending && addedId === bp.id;
          const isAdded = addedId === bp.id && !isLoading;

          return (
            <div
              key={bp.id}
              className="bg-card border rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              <div
                data-testid={`blueprint-header-${bp.id}`}
                className="p-5 md:p-6 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === bp.id ? null : bp.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", bp.bg, bp.color)}>
                    <bp.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">{bp.title}</h3>
                    <p className="text-sm text-muted-foreground">{bp.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    data-testid={`button-use-blueprint-${bp.id}`}
                    onClick={(e) => handleUseBlueprint(e, bp)}
                    disabled={isLoading || isAdded}
                    className={cn(
                      "hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                      isAdded
                        ? "bg-green-500/10 text-green-600"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-95 active:scale-90 disabled:opacity-70"
                    )}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                    ) : isAdded ? (
                      <><Check className="w-4 h-4" /> Added to Today</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Use Blueprint</>
                    )}
                  </button>
                  <div className={cn(
                    "p-2 rounded-full transition-transform duration-300",
                    expandedId === bp.id ? "rotate-90 bg-secondary" : "hover:bg-secondary"
                  )}>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === bp.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-secondary/10"
                  >
                    <div className="p-5 md:p-6 space-y-3">
                      <div className="flex items-center justify-between mb-4 sm:hidden">
                        <h4 className="font-semibold text-sm">Included Items</h4>
                        <button
                          onClick={(e) => handleUseBlueprint(e, bp)}
                          disabled={isLoading || isAdded}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300",
                            isAdded
                              ? "bg-green-500/10 text-green-600"
                              : "bg-primary text-primary-foreground disabled:opacity-70"
                          )}
                        >
                          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          {isAdded ? "Added" : "Use All"}
                        </button>
                      </div>
                      {bp.tasks.map((task) => (
                        <div key={task.id} className="flex gap-3 items-start group">
                          <div className="mt-1 h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                          </div>
                          <span className="text-sm font-medium leading-relaxed">{task.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      <button
        data-testid="button-create-blueprint"
        className="mt-8 w-full border-2 border-dashed border-border text-muted-foreground font-semibold rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("open-add-task"));
          window.location.href = "/";
        }}
      >
        <div className="h-12 w-12 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        Create Custom Blueprint
        <p className="text-xs font-normal text-muted-foreground mt-1">Add your own tasks to Today</p>
      </button>
    </div>
  );
}
