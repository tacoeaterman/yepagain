import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import AuthScreen from "@/pages/AuthScreen";
import MainMenu from "@/pages/MainMenu";
import Store from "@/pages/Store";
import HostGame from "@/pages/HostGame";
import JoinGame from "@/pages/JoinGame";
import GameLobby from "@/pages/GameLobby";
import GamePlay from "@/pages/GamePlay";
import GameResults from "@/pages/GameResults";
import ScheduleGame from "@/pages/ScheduleGame";
import Rules from "@/pages/Rules";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="floating-animation text-8xl mb-6">🥏</div>
          <h1 className="font-logo text-5xl font-bold mb-4 text-gradient text-outline">
            KICKED IN THE DISC
          </h1>
          <div className="glass-card p-6 rounded-2xl mx-auto max-w-sm">
            <div className="animate-spin w-12 h-12 border-4 border-logo-cyan border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-logo-dark font-medium">Loading awesome disc golf action...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Switch>
      <Route path="/" component={MainMenu} />
      <Route path="/store" component={Store} />
      <Route path="/host" component={HostGame} />
      <Route path="/join" component={JoinGame} />
      <Route path="/lobby/:gameCode" component={GameLobby} />
      <Route path="/game/:gameCode" component={GamePlay} />
      <Route path="/results/:gameCode" component={GameResults} />
      <Route path="/schedule" component={ScheduleGame} />
      <Route path="/rules" component={Rules} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-brand-gradient bg-pattern-dots">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
