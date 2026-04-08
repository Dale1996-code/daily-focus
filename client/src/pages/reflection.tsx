import { useMemo, useState } from "react";
import {
  BookOpen,
  Sparkles,
  Target,
  ArrowRight,
  Lock,
  Calendar,
  History,
  Star,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { ReflectionEntry } from "@shared/schema";
import { format, isAfter, subDays } from "date-fns";

const prompts = [
  { title: "What went well today?", icon: Sparkles, color: "text-green-500", bg: "bg-green-500/10" },
  { title: "What could be improved?", icon: Target, color: "text-orange-500", bg: "bg-orange-500/10" },
  { title: "Any lingering thoughts?", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
];

export default function Reflection() {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [completed, setCompleted] = useState(false);
  const [showPastEntries, setShowPastEntries] = useState(false);

  const reflectionsQuery = useQuery<ReflectionEntry[]>({
    queryKey: ["/api/reflections"],
    queryFn: () => apiRequest<ReflectionEntry[]>("GET", "/api/reflections?limit=30"),
  });

  const createReflection = useMutation({
    mutationFn: (payload: {
      wentWell: string;
      toImprove: string;
      lingeringThoughts: string;
    }) => apiRequest("POST", "/api/reflections", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/reflections"] }),
  });

  const current = answers[step - 1];
  const setCurrentAnswer = (value: string) => {
    const next = [...answers];
    next[step - 1] = value;
    setAnswers(next);
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    await createReflection.mutateAsync({
      wentWell: answers[0].trim(),
      toImprove: answers[1].trim(),
      lingeringThoughts: answers[2].trim(),
    });
    setCompleted(true);
  };

  const recentEntries = reflectionsQuery.data ?? [];
  const weekStart = subDays(new Date(), 7);
  const reflectionsThisWeek = recentEntries.filter((entry) =>
    isAfter(new Date(entry.createdAt), weekStart),
  );
  const streakEstimate = reflectionsThisWeek.length;

  const latestEntry = useMemo(() => recentEntries[0], [recentEntries]);

  if (completed) {
    return (
      <div className="p-4 md:p-8 pt-6 pb-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="h-20 w-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
        >
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Reflection Saved</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            Nice work. This entry is now stored and will appear in your history.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep(1);
              setAnswers(["", "", ""]);
              setCompleted(false);
            }}
            className="px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-secondary/50 transition-colors"
          >
            Write Another
          </button>
          <Link href="/">
            <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Back to Today
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-6 pb-8 max-w-4xl mx-auto">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-muted-foreground text-sm mb-1 tracking-tight">Evening Routine</h2>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground">
            Daily Reflection
          </h1>
        </div>
        <button
          data-testid="button-past-entries"
          className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm flex items-center gap-2"
          onClick={() => setShowPastEntries((open) => !open)}
        >
          <History className="w-4 h-4" />
          {showPastEntries ? "Hide Entries" : "Past Entries"}
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setStep(index)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    step > index
                      ? "bg-primary/40 cursor-pointer"
                      : step === index
                        ? "bg-primary"
                        : "bg-secondary cursor-default",
                  )}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", prompts[step - 1].bg, prompts[step - 1].color)}>
                    {(() => {
                      const Icon = prompts[step - 1].icon;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <h3 className="text-xl font-semibold">{prompts[step - 1].title}</h3>
                </div>
              </motion.div>
            </AnimatePresence>

            <textarea
              data-testid={`reflection-textarea-${step}`}
              className="flex-1 w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/40 text-lg leading-relaxed focus:ring-0"
              placeholder="Start writing here..."
              value={current}
              onChange={(event) => setCurrentAnswer(event.target.value)}
              autoFocus
            />

            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Private entry
              </span>

              <div className="flex gap-2">
                {step > 1 && (
                  <button
                    data-testid="button-reflection-back"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  data-testid="button-reflection-next"
                  onClick={handleNext}
                  disabled={createReflection.isPending}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {createReflection.isPending
                    ? "Saving..."
                    : step < 3
                      ? "Next"
                      : "Complete"}
                  {step < 3 && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">This Week</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-semibold mb-1">{reflectionsThisWeek.length}</span>
                <span className="text-xs text-muted-foreground font-medium">Reflections</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold mb-1 flex items-center gap-1">
                  {streakEstimate} <Star className="w-4 h-4 text-orange-400 fill-current mb-1" />
                </span>
                <span className="text-xs text-muted-foreground font-medium">Current Streak</span>
              </div>
            </div>
          </div>

          <div
            data-testid="card-previous-entry"
            className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Calendar className="w-16 h-16" />
            </div>

            <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Latest Entry</h3>
            {latestEntry ? (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  {format(new Date(latestEntry.createdAt), "MMMM d, yyyy")}
                </p>
                <p className="text-sm font-medium leading-relaxed italic text-foreground/80 line-clamp-4">
                  "{latestEntry.wentWell || latestEntry.toImprove || latestEntry.lingeringThoughts}"
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No saved entries yet.</p>
            )}
          </div>

          {showPastEntries && (
            <div className="bg-card border rounded-2xl p-5 shadow-sm max-h-[300px] overflow-y-auto">
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">
                Past Entries
              </h3>
              {recentEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(entry.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                      <p className="text-sm line-clamp-3">
                        {entry.wentWell || entry.toImprove || entry.lingeringThoughts}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
