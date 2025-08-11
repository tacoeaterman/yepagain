import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/GameCard";
import { useAuth } from "@/hooks/useAuth";
import { useGame } from "@/hooks/useGame";
import { Link, useLocation } from "wouter";
import { Plus, Users, ShoppingBag, Calendar, Bot, Bug, Clock } from "lucide-react";

export default function MainMenu() {
  const { user, logout } = useAuth();
  const { hasHostingPrivilege } = useGame();
  const [, setLocation] = useLocation();

  return (
    <>
      {/* Navigation Header */}
      <nav className="glass-card p-4 m-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-4xl floating-animation">🥏</div>
            <h1 className="text-2xl font-logo font-bold text-gradient text-outline">
              KICKED IN THE DISC
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-sm">{user?.displayName || user?.email}</span>
            <Button
              onClick={logout}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              size="sm"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* User Status Card */}
        <Card className="glass-card rounded-3xl p-6 mb-8 border-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Welcome, {user?.displayName?.split(' ')[0] || 'Player'}!
                </h2>
                <p className="text-white/70">Ready to play some disc golf?</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-white/70 text-sm">Hosting Privilege:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    hasHostingPrivilege 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {hasHostingPrivilege ? '✅ Purchased' : '❌ Not Purchased'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <Link href="/host">
            <GameCard
              title="Host Game"
              description="Create a new game for up to 6 players"
              disabled={!hasHostingPrivilege}
              icon={<Plus className="w-8 h-8 text-brand-accent" />}
              className={!hasHostingPrivilege ? "opacity-50" : ""}
            />
          </Link>

          <Link href="/join">
            <GameCard
              title="Join Game"
              description="Enter a game code to join an existing game"
              icon={<Users className="w-8 h-8 text-blue-400" />}
            />
          </Link>

          <Link href="/store">
            <GameCard
              title="Store"
              description="Purchase hosting privileges and upgrades"
              icon={<ShoppingBag className="w-8 h-8 text-purple-400" />}
            />
          </Link>
        </div>

        {/* Additional Game Modes & Support */}
        <Card className="glass-card rounded-3xl p-6 border-0">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-white mb-4">More Ways to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Schedule Game - Host Only */}
              <div className={`relative ${!hasHostingPrivilege ? 'opacity-50' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl transition-all ${!hasHostingPrivilege ? 'blur-sm' : ''}`}></div>
                <Button
                  disabled={!hasHostingPrivilege}
                  className="w-full h-full p-6 bg-transparent hover:bg-white/5 border-2 border-white/10 rounded-xl relative overflow-hidden group transition-all"
                  onClick={() => setLocation("/schedule")}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-300" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-white mb-1">Schedule Game</h4>
                      <p className="text-sm text-white/70">Plan a future game with friends</p>
                      <div className="flex items-center mt-2">
                        <Clock className="w-4 h-4 text-white/40 mr-1" />
                        <span className="text-xs text-white/40">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Solo Game - Host Only */}
              <div className={`relative ${!hasHostingPrivilege ? 'opacity-50' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl transition-all ${!hasHostingPrivilege ? 'blur-sm' : ''}`}></div>
                <Button
                  disabled={!hasHostingPrivilege}
                  className="w-full h-full p-6 bg-transparent hover:bg-white/5 border-2 border-white/10 rounded-xl relative overflow-hidden group transition-all"
                  onClick={() => {/* TODO: Implement solo game */}}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-500/20 p-3 rounded-lg">
                      <Bot className="w-6 h-6 text-green-300" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-white mb-1">Solo Game</h4>
                      <p className="text-sm text-white/70">Play against 1-4 AI bots</p>
                      <div className="flex items-center mt-2">
                        <Clock className="w-4 h-4 text-white/40 mr-1" />
                        <span className="text-xs text-white/40">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Support & Bug Report */}
            <div className="mt-6">
              <Button
                className="w-full p-4 bg-white/5 hover:bg-white/10 border-2 border-white/10 rounded-xl transition-all"
                onClick={() => {/* TODO: Implement bug report */}}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Bug className="w-5 h-5 text-red-300" />
                  <span className="text-white">Report a Bug</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
