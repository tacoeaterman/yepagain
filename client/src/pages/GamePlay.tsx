import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/PlayerCard";
import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { useRoute, useLocation } from "wouter";
import { Card as CardType } from "@/types/game";
import { Play, Eye, EyeOff } from "lucide-react";

export default function GamePlay() {
  const [match, params] = useRoute("/game/:gameCode");
  const { currentGame, listenToGame, findGameByCode, playCard } = useGame();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [showHand, setShowHand] = useState(true);

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

  const handlePlayCard = async (card: CardType) => {
    if (currentGame?.id) {
      await playCard(currentGame.id, card.id);
    }
  };

  const getCardColor = (category: string) => {
    switch (category) {
      case 'Before Throw':
        return 'bg-blue-500/20 border-blue-400/40';
      case 'After Throw':
        return 'bg-red-500/20 border-red-400/40';
      case 'Self':
        return 'bg-green-500/20 border-green-400/40';
      case 'Wild':
        return 'bg-purple-500/20 border-purple-400/40';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

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

  // Check if cards have been dealt
  const currentPlayer = currentGame.players[user.uid];
  if (!currentPlayer?.hand || currentPlayer.hand.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="glass-card rounded-3xl p-8 text-center border-0">
          <CardContent className="p-0">
            <div className="text-6xl mb-4 animate-spin">🃏</div>
            <h1 className="text-2xl font-bold text-white mb-2">Dealing cards...</h1>
            <p className="text-white/70 mb-6">Please wait while cards are being dealt to all players.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const players = Object.values(currentGame.players);
  const sortedPlayers = players.sort((a, b) => (a.totalScore || 0) - (b.totalScore || 0));
  const progress = (currentGame.currentHole / currentGame.totalHoles) * 100;
  const isCurrentPlayerTurn = currentGame.currentPlayerTurn === user.uid;

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
              <p className="text-white/70 text-sm">
                Game Round: {currentGame.gameRound?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-sm">Par</div>
              <div className="text-3xl font-bold text-white">{currentGame.currentPar}</div>
              {isCurrentPlayerTurn && (
                <div className="text-green-400 text-sm font-semibold mt-1">Your Turn!</div>
              )}
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

      {/* Player's Hand */}
      {currentPlayer && (
        <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Your Hand ({currentPlayer.hand?.length || 0} cards)</h3>
              <Button
                onClick={() => setShowHand(!showHand)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                {showHand ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showHand ? 'Hide' : 'Show'} Hand
              </Button>
            </div>
            
            {showHand && currentPlayer.hand && currentPlayer.hand.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentPlayer.hand.map((card) => (
                  <Card key={card.id} className={`${getCardColor(card.category)} border-2 transition-all duration-200 hover:scale-105`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white/70 mb-1">
                          {card.category}
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">
                          {card.name}
                        </h4>
                        <p className="text-white/80 text-sm mb-4 leading-relaxed">
                          {card.description}
                        </p>
                        <Button
                          onClick={() => handlePlayCard(card)}
                          disabled={!isCurrentPlayerTurn}
                          className="w-full bg-brand-accent text-white font-semibold py-2 rounded-xl hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Card
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : showHand ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🃏</div>
                <p className="text-white/70">No cards in hand</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👁️</div>
                <p className="text-white/70">Hand is hidden</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-white mb-4">Players</h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                position={index + 1}
                showScore
                isCurrentTurn={player.id === currentGame.currentPlayerTurn}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Activity */}
      {currentGame.gameActivity && currentGame.gameActivity.length > 0 && (
        <Card className="glass-card rounded-3xl p-6 border-0">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-white mb-4">Game Activity</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentGame.gameActivity.slice(-10).map((activity, index) => (
                <div key={index} className="text-white/70 text-sm p-2 bg-white/5 rounded-lg">
                  {activity}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
