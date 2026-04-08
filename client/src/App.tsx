import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Planner from "@/pages/planner";
import Focus from "@/pages/focus";
import Blueprints from "@/pages/blueprints";
import Reflection from "@/pages/reflection";
import NotFound from "@/pages/not-found";
import { QuickActionsProvider } from "@/context/quick-actions";
import { AuthGate } from "@/components/auth-gate";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/blueprints" component={Blueprints}/>
        <Route path="/planner" component={Planner}/>
        <Route path="/focus" component={Focus}/>
        <Route path="/reflection" component={Reflection}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuickActionsProvider>
        <TooltipProvider>
          <Toaster />
          <AuthGate>
            <Router />
          </AuthGate>
        </TooltipProvider>
      </QuickActionsProvider>
    </QueryClientProvider>
  );
}

export default App;
