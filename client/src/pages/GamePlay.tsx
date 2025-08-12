import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/PlayerCard";
import { CardTargetModal } from "@/components/CardTargetModal";
import { CardAcknowledgmentModal } from "@/components/CardAcknowledgmentModal";
import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { useRoute, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card as CardType, PendingCardAcknowledgment } from "@/types/game";
import { Play, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function GamePlay() {
  const [match, params] = useRoute("/game/:gameCode");
  const { currentGame, listenToGame, findGameByCode, playCard, acknowledgeCard, submitScore, setParForHole, advanceToNextHole } = useGame();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showHand, setShowHand] = useState(true);
  const [parInput, setParInput] = useState<number | "">("");
  const [myHoleScore, setMyHoleScore] = useState<number | "">("");
  const [cardTargetModal, setCardTargetModal] = useState<{
    isOpen: boolean;
    card: CardType | null;
  }>({ isOpen: false, card: null });
  const [acknowledgmentModal, setAcknowledgmentModal] = useState<{
    isOpen: boolean;
    acknowledgment: PendingCardAcknowledgment | null;
  }>({ isOpen: false, acknowledgment: null });

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

  // Redirect to results when game finishes
  useEffect(() => {
    if (currentGame?.gamePhase === 'finished') {
      console.log('🏁 Game phase is finished, redirecting to results:', `/results/${currentGame.gameCode}`);
      setLocation(`/results/${currentGame.gameCode}`);
    }
  }, [currentGame?.gamePhase, currentGame?.gameCode, setLocation]);

  // Show acknowledgment modal for pending cards
  useEffect(() => {
    if (!user || !currentGame) return;
    
    const currentPlayer = currentGame.players[user.uid];
    const pendingAcknowledgments = currentPlayer?.pendingAcknowledgments || [];
    
    console.log('Checking for pending acknowledgments:', {
      userId: user.uid,
      pendingCount: pendingAcknowledgments.length,
      modalOpen: acknowledgmentModal.isOpen,
      pendingAcks: pendingAcknowledgments
    });
    
    // Show the oldest unacknowledged card
    if (pendingAcknowledgments.length > 0 && !acknowledgmentModal.isOpen) {
      const oldestAcknowledgment = pendingAcknowledgments.sort((a, b) => a.timestamp - b.timestamp)[0];
      console.log('Showing acknowledgment modal for card:', oldestAcknowledgment);
      setAcknowledgmentModal({ isOpen: true, acknowledgment: oldestAcknowledgment });
    }
  }, [currentGame?.players, user?.uid, acknowledgmentModal.isOpen]);

  // Sync local inputs when hole or game changes
  useEffect(() => {
    if (!currentGame || !user) return;
    setParInput(currentGame.currentPar ?? "");
    const holeIndex = currentGame.currentHole - 1;
    // Use strokes (raw count) for input, not golf scores
    const existing = currentGame.players[user.uid]?.strokes?.[holeIndex];
    setMyHoleScore(typeof existing === 'number' ? existing : "");
  }, [currentGame?.currentHole, currentGame?.currentPar, currentGame?.id, user?.uid]);

  const handleOpenCardModal = (card: CardType) => {
    setCardTargetModal({ isOpen: true, card });
  };

  const handlePlayCard = async (card: CardType, targetPlayerIds?: string[]) => {
    if (!currentGame?.id) return;
    await playCard(currentGame.id, card.id, targetPlayerIds);
    setCardTargetModal({ isOpen: false, card: null });
  };

  const handleAcknowledgeCard = async (acknowledgmentId: string) => {
    if (!currentGame?.id) return;
    await acknowledgeCard(currentGame.id, acknowledgmentId);
    setAcknowledgmentModal({ isOpen: false, acknowledgment: null });
  };

  const handleSubmitScore = async () => {
    if (!currentGame?.id || !user || myHoleScore === "") return;
    
    const score = Number(myHoleScore);
    
    // Validate score range
    if (score < 1 || score > 30) {
      toast({
        title: "Invalid score",
        description: "Please enter a score between 1 and 30 strokes",
        variant: "destructive",
      });
      return;
    }
    
    const holeIndex = currentGame.currentHole - 1;
    await submitScore(currentGame.id, holeIndex, score);
  };

  const handleUpdatePar = async () => {
    if (!currentGame?.id || parInput === "") return;
    await setParForHole(currentGame.id, Number(parInput));
  };

  const allPlayersScoredCurrentHole = () => {
    if (!currentGame) return false;
    const idx = currentGame.currentHole - 1;
    const parIsSet = currentGame.parsSet?.[idx] ?? false;
    // Can only advance if par is set AND all players have submitted scores
    return parIsSet && Object.values(currentGame.players).every(p => typeof p.scores?.[idx] === 'number');
  };

  const handleAdvanceHole = async () => {
    if (!currentGame?.id) return;
    await advanceToNextHole(currentGame.id);
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
  
  if (!currentPlayer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="glass-card rounded-3xl p-8 text-center border-0">
          <CardContent className="p-0">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">Player not found</h1>
            <p className="text-white/70 mb-6">You are not a player in this game.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentPlayer.hand || currentPlayer.hand.length === 0) {
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
  const isHost = currentGame.hostId === user.uid;

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
              <p className="text-white/70">{currentGame.gameName || 'Disc Golf Game'}</p>
              {isHost && (
                <div className="mt-3 flex items-center space-x-2">
                  <Input
                    type="number"
                    min={1}
                    value={parInput}
                    onChange={(e) => setParInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-24 bg-white/10 border-white/20 text-white"
                    placeholder="Par"
                  />
                  <Button onClick={handleUpdatePar} className="bg-white/10 text-white hover:bg-white/20">Set Par</Button>
                </div>
              )}
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

      {/* Your Score Entry */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          {(() => {
            const holeIndex = currentGame.currentHole - 1;
            const parIsSet = currentGame.parsSet?.[holeIndex] ?? false;
            

            
            return (
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <div className="text-white/80 text-sm mb-1">
                    Your strokes for hole {currentGame.currentHole} (Par {currentGame.currentPar})
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={myHoleScore}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setMyHoleScore('');
                      } else {
                        const numValue = Number(value);
                        // Only allow values between 1 and 30
                        if (numValue >= 1 && numValue <= 30) {
                          setMyHoleScore(numValue);
                        }
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder={parIsSet ? "Enter strokes (1-30)" : "Waiting for host to set par..."}
                    disabled={!parIsSet}
                  />
                  {!parIsSet ? (
                    <div className="text-yellow-400 text-xs mt-1">
                      ⏳ Host must set par before you can submit your score
                    </div>
                  ) : myHoleScore !== "" && typeof myHoleScore === 'number' ? (
                    <div className="text-white/60 text-xs mt-1">
                      Golf score: {myHoleScore - (currentGame.currentPar || 3) > 0 ? '+' : ''}{myHoleScore - (currentGame.currentPar || 3)}
                      {(myHoleScore < 1 || myHoleScore > 30) && (
                        <span className="text-red-400 ml-2">⚠️ Score must be 1-30</span>
                      )}
                    </div>
                  ) : parIsSet ? (
                    <div className="text-white/40 text-xs mt-1">
                      Valid range: 1-30 strokes
                    </div>
                  ) : null}
                </div>
                <Button 
                  onClick={handleSubmitScore} 
                  disabled={!parIsSet || myHoleScore === "" || typeof myHoleScore !== 'number' || myHoleScore < 1 || myHoleScore > 30} 
                  className="bg-brand-accent text-white h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Score
                </Button>
              </div>
            );
          })()}
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
                          onClick={() => handleOpenCardModal(card)}
                          className="w-full bg-brand-accent text-white font-semibold py-2 rounded-xl hover:bg-brand-accent/90 transition-colors"
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
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Host Controls for Hole Progression */}
      {isHost && (
        <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
          <CardContent className="p-0">
            {allPlayersScoredCurrentHole() ? (
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <div className="animate-spin text-lg">⚡</div>
                <div className="text-sm">Auto-advancing to next hole...</div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-white/80 text-sm">Waiting for all players to submit scores for hole {currentGame.currentHole}</div>
                <Button onClick={handleAdvanceHole} disabled={!allPlayersScoredCurrentHole()} className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-50">
                  Manual Advance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auto-advance indicator for non-host players */}
      {!isHost && allPlayersScoredCurrentHole() && (
        <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <div className="animate-spin text-lg">⚡</div>
              <div className="text-sm">Advancing to next hole...</div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Card Target Modal */}
      <CardTargetModal
        isOpen={cardTargetModal.isOpen}
        onClose={() => setCardTargetModal({ isOpen: false, card: null })}
        card={cardTargetModal.card}
        players={currentGame?.players || {}}
        currentUserId={user?.uid || ""}
        onPlayCard={handlePlayCard}
      />

      {/* Card Acknowledgment Modal */}
      <CardAcknowledgmentModal
        isOpen={acknowledgmentModal.isOpen}
        onAcknowledge={() => {
          if (acknowledgmentModal.acknowledgment) {
            handleAcknowledgeCard(acknowledgmentModal.acknowledgment.id);
          }
        }}
        card={acknowledgmentModal.acknowledgment?.card || null}
        playedBy={acknowledgmentModal.acknowledgment?.playedByName || ""}
      />

      {/* Pending Acknowledgments Indicator */}
      {currentPlayer?.pendingAcknowledgments && currentPlayer.pendingAcknowledgments.length > 0 && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentPlayer.pendingAcknowledgments.length} card{currentPlayer.pendingAcknowledgments.length > 1 ? 's' : ''} pending
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
