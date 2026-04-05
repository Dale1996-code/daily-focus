const fs = require('fs');

let content = fs.readFileSync('client/src/pages/dashboard.tsx', 'utf8');

// 1. Add confetti import
if (!content.includes('import confetti')) {
  content = content.replace(
    'import { motion, AnimatePresence } from "framer-motion";',
    'import { motion, AnimatePresence } from "framer-motion";\nimport confetti from "canvas-confetti";'
  );
}

// 2. Dynamic greeting based on time
content = content.replace(
  'const todayScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;',
  `const todayScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Dynamic greeting
  const hour = new Date().getHours();
  let greeting = "Good evening";
  let subGreeting = "Time to wind down.";
  if (hour < 12) {
    greeting = "Good morning";
    subGreeting = "Let's make today count.";
  } else if (hour < 18) {
    greeting = "Good afternoon";
    subGreeting = "Keep the momentum going.";
  }`
);

content = content.replace(
  '<h2 className="text-muted-foreground font-medium text-sm mb-1 uppercase tracking-wider">Good morning</h2>',
  '<h2 className="text-muted-foreground font-medium text-sm mb-1 uppercase tracking-wider">{greeting}</h2>'
);

content = content.replace(
  '<h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Let\'s make today count.</h1>',
  '<h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{subGreeting}</h1>'
);


// 3. Confetti on 100% score
content = content.replace(
  'const todayScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;',
  `const todayScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Confetti on 100%
  useEffect(() => {
    if (todayScore === 100 && totalItems > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [todayScore, totalItems]);`
);


// 4. Update task toggle to dissolve & strike-through
// We will update the TaskCard component
content = content.replace(
  'const toggleTask = (id: number) => {',
  `const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      // Small pop when completing a task
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd']
      });
    }`
);

// 5. Update habits toggle to have confetti
content = content.replace(
  'const toggleHabit = (id: number) => {',
  `const toggleHabit = (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (habit && !habit.completed) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d']
      });
    }`
);

// Update TaskCard animation
content = content.replace(
  '<motion.div\n        drag="x"',
  `<AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        transition={{ duration: 0.2 }}
        drag="x"`
);

content = content.replace(
  '        {/* Smart Overdue Suggestion */}\n        {task.overdue && !task.completed && !task.completed && (\n          <div className="absolute bottom-[-1px] right-4 bg-background border border-border shadow-sm text-[10px] font-semibold px-2 py-1 rounded-t-lg flex gap-2">\n            <button className="text-primary hover:underline">Do now</button>\n            <div className="w-px bg-border my-0.5" />\n            <button className="text-muted-foreground hover:text-foreground">Reschedule</button>\n          </div>\n        )}\n      </motion.div>\n    </div>',
  `        {/* Smart Overdue Suggestion */}
        {task.overdue && !task.completed && !task.completed && (
          <div className="absolute bottom-[-1px] right-4 bg-background border border-border shadow-sm text-[10px] font-semibold px-2 py-1 rounded-t-lg flex gap-2">
            <button className="text-primary hover:underline">Do now</button>
            <div className="w-px bg-border my-0.5" />
            <button className="text-muted-foreground hover:text-foreground">Reschedule</button>
          </div>
        )}
      </motion.div>
      </AnimatePresence>
    </div>`
);

content = content.replace(
  'task.completed ? "opacity-60 bg-secondary/30" : "hover:shadow-sm",',
  `task.completed ? "opacity-60 bg-secondary/30 scale-[0.98] blur-[0.5px]" : "hover:shadow-sm",`
);

content = content.replace(
  'task.completed ? "line-through text-muted-foreground font-medium" : "text-foreground"',
  `task.completed ? "line-through text-muted-foreground font-medium decoration-2 decoration-primary/50" : "text-foreground"`
);

fs.writeFileSync('client/src/pages/dashboard.tsx', content);
console.log('Updated dashboard.tsx');
