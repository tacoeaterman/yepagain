import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/PlayerCard";
import { useGame } from "@/hooks/useGame";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { Copy, MessageCircle, Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GameLobby() {
  const [match, params] = useRoute("/lobby/:gameCode");
  const { currentGame, listenToGame, findGameByCode, startGame, setParForHole } = useGame();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parInput, setParInput] = useState<number | "">("");

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
          toast({
            title: "Game not found",
            description: "The game you're looking for doesn't exist or has been deleted.",
            variant: "destructive",
          });
          setLocation("/");
        });
    }
  }, [match, params?.gameCode, currentGame, findGameByCode, setLocation, toast]);

  useEffect(() => {
    if (currentGame?.id) {
      const unsubscribe = listenToGame(currentGame.id);
      return unsubscribe;
    }
  }, [currentGame?.id, listenToGame]);

  useEffect(() => {
    if (currentGame) {
      setParInput(currentGame.currentPar ?? "");
    }
  }, [currentGame?.currentPar]);

  // Auto-redirect to game when game phase changes to 'playing'
  useEffect(() => {
    if (currentGame?.gamePhase === 'playing') {
      toast({
        title: "Game starting!",
        description: "Redirecting to game...",
      });
      setLocation(`/game/${currentGame.gameCode}`);
    }
  }, [currentGame?.gamePhase, currentGame?.gameCode, setLocation, toast]);

  const copyGameCode = async () => {
    if (currentGame?.gameCode) {
      try {
        await navigator.clipboard.writeText(currentGame.gameCode);
        setCopied(true);
        toast({
          title: "Game code copied!",
          description: "Share this code with your friends to join the game.",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Failed to copy",
          description: "Please copy the game code manually.",
          variant: "destructive",
        });
      }
    }
  };

  const shareGameLink = async () => {
    if (currentGame?.gameCode) {
      const gameUrl = `${window.location.origin}/join`;
      const message = `Join my disc golf game! 🥏\n\nGame Code: ${currentGame.gameCode}\n\nSign up and join here: ${gameUrl}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join my Disc Golf Game',
            text: message,
            url: gameUrl,
          });
        } catch (error) {
          // User cancelled sharing
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        try {
          await navigator.clipboard.writeText(message);
          toast({
            title: "Game link copied!",
            description: "Share this message with your friends to invite them.",
          });
        } catch (error) {
          toast({
            title: "Failed to copy",
            description: "Please share the game code manually.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const sendTextMessage = () => {
    if (currentGame?.gameCode) {
      const gameUrl = `${window.location.origin}/join`;
      const message = `Join my disc golf game! 🥏\n\nGame Code: ${currentGame.gameCode}\n\nSign up and join here: ${gameUrl}`;
      
      // Open SMS app with pre-filled message
      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="glass-card rounded-3xl p-8 text-center border-0">
          <CardContent className="p-0">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h1 className="text-2xl font-bold text-white mb-2">Looking for game...</h1>
            <p className="text-white/70">Please wait while we find your game</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentGame || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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

  const isHost = currentGame.hostId === user.uid;
  const players = Object.values(currentGame.players);

  const handleStartGame = async () => {
    if (currentGame?.id) {
      await startGame(currentGame.id);
      setLocation(`/game/${currentGame.gameCode}`);
    }
  };

  const handleUpdatePar = async () => {
    if (!currentGame?.id || parInput === "") return;
    await setParForHole(currentGame.id, Number(parInput));
    toast({ title: "Par set", description: `Par set to ${parInput} for hole 1` });
  };

  const handleLeaveGame = () => {
    setLocation("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      {/* Game Info Header */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentGame.gameName || 'Disc Golf Game'}
              </h1>
              <p className="text-white/70">
                {currentGame.totalHoles} holes • Standard Stroke Play
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-brand-accent">
                {currentGame.gameCode}
              </div>
              <div className="text-white/70 text-sm">Game Code</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white/70 text-sm">
              Players: <span className="text-white font-semibold">{players.length}</span>/6
            </div>
            <div className="text-white/70 text-sm">
              Status: <span className="text-yellow-400 font-semibold">Waiting for players</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Code Sharing Section */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-white mb-4">Share Game Code</h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-mono font-bold text-brand-accent text-center">
                {currentGame.gameCode}
              </div>
            </div>
            <Button
              onClick={copyGameCode}
              className={`px-4 py-4 rounded-xl transition-colors ${
                copied 
                  ? 'bg-green-500/20 text-green-300 border-green-400/40' 
                  : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={shareGameLink}
              className="flex-1 bg-brand-primary text-white font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
            <Button
              onClick={sendTextMessage}
              className="flex-1 bg-brand-secondary text-white font-semibold py-3 rounded-xl hover:bg-brand-secondary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Text
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card className="glass-card rounded-3xl p-6 mb-6 border-0">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-white mb-4">Players</h3>
          <div className="space-y-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Host Controls */}
      {isHost && (
        <Card className="glass-card rounded-3xl p-6 border-0">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-white mb-4">Host Controls</h3>
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <div className="text-white/80 text-sm mb-1">Par for hole 1</div>
                <Input
                  type="number"
                  min={1}
                  value={parInput}
                  onChange={(e) => setParInput(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Par"
                />
              </div>
              <Button onClick={handleUpdatePar} className="bg-white/10 text-white hover:bg-white/20">Set Par</Button>
              <Button
                onClick={handleStartGame}
                disabled={players.length < 1}
                className="flex-1 bg-brand-accent text-white font-semibold py-3 rounded-xl hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Game
              </Button>
              <Button
                onClick={handleLeaveGame}
                className="px-8 bg-red-500/20 text-red-300 font-semibold py-3 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                Cancel Game
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Controls */}
      {!isHost && (
        <Card className="glass-card rounded-3xl p-6 border-0">
          <CardContent className="p-0 text-center">
            <Button
              onClick={handleLeaveGame}
              className="bg-red-500/20 text-red-300 font-semibold py-3 px-8 rounded-xl hover:bg-red-500/30 transition-colors"
            >
              Leave Game
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
