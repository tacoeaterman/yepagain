import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/PlayerCard";
import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { useRoute, useLocation } from "wouter";

export default function GamePlay() {
  const [match, params] = useRoute("/game/:gameCode");
  const { currentGame, listenToGame, findGameByCode, submitScore } = useGame();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentScore, setCurrentScore] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (match && params?.gameCode && !currentGame) {
      setLoading(true);
      findGameByCode(params.gameCode)
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error finding game:', error);
          setLoading(false);
          setLocation("/");
        });
    }
  }, [match, params?.gameCode, currentGame, findGameByCode, setLocation]);

  useEffect(() => {
    if (currentGame?.id) {
      const unsubscribe = listenToGame(currentGame.id);
      return unsubscribe;
    }
  }, [currentGame?.id, listenToGame]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="glass-card rounded-3xl p-8 text-center border-0">
          <CardContent className="p-0">
            <div className="text-6xl mb-4 animate-bounce">🥏</div>
            <h1 className="text-2xl font-bold text-white mb-2">Loading game...</h1>
            <p className="text-white/70">Please wait while we load your game</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentGame || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="glass-card rounded-3xl p-8 text-center border-0">
          <CardContent className="p-0">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">Game not found</h1>
            <p className="text-white/70 mb-6">The game you're looking for doesn't exist or has been deleted.</p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-brand-accent text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-accent/90 transition-colors"
            >
              Back to Main Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if game is in playing phase
  if (currentGame.gamePhase !== 'playing') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="glass-card rounded-3xl p-8 text-center border-0">
          <CardContent className="p-0">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-white mb-2">Game not started</h1>
            <p className="text-white/70 mb-6">The host hasn't started the game yet. Please wait in the lobby.</p>
            <Button
              onClick={() => setLocation(`/lobby/${currentGame.gameCode}`)}
              className="bg-brand-accent text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-accent/90 transition-colors"
            >
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const players = Object.values(currentGame.players);
  const sortedPlayers = players.sort((a, b) => a.totalScore - b.totalScore);
  const progress = (currentGame.currentHole / currentGame.totalHoles) * 100;

  const handleScoreSubmit = async () => {
    await submitScore(currentGame.id, currentGame.currentHole - 1, currentScore);
  };

  const scoreButtons = [
    { value: 1, label: "Ace", color: "green" },
    { value: 2, label: "Eagle", color: "blue" },
    { value: 3, label: "Par", color: "white" },
    { value: 4, label: "Bogey", color: "yellow" },
    { value: 5, label: "+2", color: "red" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      {/* Game Progress Header */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Hole {currentGame.currentHole} of {currentGame.totalHoles}
              </h1>
              <p className="text-white/70">{currentGame.courseName || 'Disc Golf Course'}</p>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-sm">Par</div>
              <div className="text-3xl font-bold text-white">{currentGame.currentPar}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-brand-accent h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-white/70 text-sm mt-2 text-center">
            {Math.round(progress)}% Complete
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-white mb-4">Leaderboard</h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                position={index + 1}
                showScore
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score Input */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-white mb-4">Enter Your Score</h3>
          
          {/* Quick Score Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {scoreButtons.map((button) => (
              <Button
                key={button.value}
                onClick={() => setCurrentScore(button.value)}
                className={`p-4 rounded-xl font-semibold transition-colors border ${
                  currentScore === button.value
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-lg font-bold">{button.value}</div>
                <div className="text-xs">{button.label}</div>
              </Button>
            ))}
          </div>
          
          {/* Manual Score Input */}
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              min="1"
              max="10"
              value={currentScore}
              onChange={(e) => setCurrentScore(parseInt(e.target.value) || 3)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-center text-2xl font-bold"
            />
            <Button
              onClick={handleScoreSubmit}
              className="px-8 bg-brand-accent text-white font-semibold py-3 rounded-xl hover:bg-brand-accent/90 transition-colors"
            >
              Submit Score
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hole Activity */}
      <Card className="glass-card rounded-3xl p-6 border-0">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-white mb-4">Hole Activity</h3>
          <div className="space-y-2">
            {currentGame.gameActivity.slice(-5).map((activity, index) => (
              <div key={index} className="text-white/70 text-sm">
                {activity}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
