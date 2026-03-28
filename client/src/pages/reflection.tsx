import { useState } from "react";
import { Smile, Meh, Frown, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Reflection() {
  const [mood, setMood] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  return (
    <div className="p-4 md:p-8 pt-8 pb-24 md:pb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Evening Reflection</h1>
        <p className="text-muted-foreground">Take a moment to review your day and prepare for tomorrow.</p>
      </header>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-display font-semibold text-xl text-center mb-6">How was your day overall?</h3>
            
            <div className="flex justify-center gap-4 md:gap-8">
              {[
                { id: 'bad', icon: Frown, label: 'Tough', color: 'text-destructive', bg: 'hover:bg-destructive/10 hover:border-destructive/30' },
                { id: 'okay', icon: Meh, label: 'Okay', color: 'text-amber-500', bg: 'hover:bg-amber-500/10 hover:border-amber-500/30' },
                { id: 'good', icon: Smile, label: 'Great', color: 'text-green-500', bg: 'hover:bg-green-500/10 hover:border-green-500/30' }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = mood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 w-24 md:w-32",
                      isSelected ? cn("border-primary bg-primary/5", m.color) : "border-transparent bg-secondary/50 text-muted-foreground",
                      m.bg
                    )}
                  >
                    <Icon className={cn("w-10 h-10 md:w-12 md:h-12", isSelected ? "" : "opacity-60")} />
                    <span className="font-medium text-sm md:text-base">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-display font-semibold text-xl mb-4">Wins for today</h3>
            <p className="text-sm text-muted-foreground mb-4">What's one thing you're proud of accomplishing?</p>
            <textarea 
              className="w-full bg-background border rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none placeholder:text-muted-foreground/50"
              placeholder="I finally finished that difficult report..."
            />
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => setStep(2)}
              disabled={!mood}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-display font-semibold text-xl mb-4">Rollover Tasks</h3>
            <p className="text-sm text-muted-foreground mb-6">These tasks weren't completed today. Move them to tomorrow or clear them out?</p>
            
            <div className="space-y-3">
              {[
                "Write newsletter draft",
                "Review team expenses"
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-background">
                  <span className="font-medium text-sm">{task}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
                      Drop
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium border bg-secondary rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      Tomorrow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-display font-semibold text-xl mb-4">Mind dump (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">Anything else on your mind? Get it out so you can rest.</p>
            <textarea 
              className="w-full bg-background border rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none placeholder:text-muted-foreground/50"
              placeholder="Don't forget to call mom tomorrow..."
            />
          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Back
            </button>
            <button 
              onClick={() => setStep(3)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Complete Day
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Day Complete!</h2>
          <p className="text-muted-foreground text-center max-w-sm mb-8">
            You've successfully wrapped up your day. Time to disconnect and recharge. Great work.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-secondary text-foreground px-6 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}