import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/PlayerCard";
import { useGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function GameResults() {
  const [match] = useRoute("/results/:gameCode");
  const { currentGame } = useGame();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!currentGame || !user) {
    return <div>Loading...</div>;
  }

  const players = Object.values(currentGame.players);
  const sortedPlayers = players.sort((a, b) => a.totalScore - b.totalScore);
  const winner = sortedPlayers[0];

  const handlePlayAgain = () => {
    setLocation("/host");
  };

  const handleMainMenu = () => {
    setLocation("/");
  };

  const shareResults = () => {
    const gameUrl = window.location.href;
    const leaderboardText = sortedPlayers
      .map((player, i) => `${i + 1}. ${player.name}: ${player.totalScore > 0 ? '+' : ''}${player.totalScore}`)
      .join('\n');
    
    const shareText = `🏌️‍♂️ Just finished a game of Kicked in the Disc! 🥏

🏆 WINNER: ${winner.name} (${winner.totalScore > 0 ? '+' : ''}${winner.totalScore})

📊 Final Leaderboard:
${leaderboardText}

${currentGame.totalHoles} holes played on ${currentGame.courseName || 'Disc Golf Course'}

Play with us: ${gameUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Kicked in the Disc - Game Results',
        text: shareText,
        url: gameUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Results copied!",
          description: "Game results copied to clipboard. Paste and share!",
        });
      }).catch(() => {
        toast({
          title: "Share manually",
          description: "Copy the results from the game activity to share",
          variant: "destructive",
        });
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      {/* Animated Winner Celebration */}
      <div className="text-center mb-8">
        <div className="animate-bounce text-8xl mb-4">🏆</div>
        <div className="animate-pulse text-yellow-400 text-2xl mb-2">✨ CHAMPION ✨</div>
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text drop-shadow-lg mb-4 animate-pulse">
          {winner.name.toUpperCase()}
        </h1>
        <div className="text-3xl font-bold text-white mb-4">
          🎉 WINS THE GAME! 🎉
        </div>
        <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold px-6 py-3 rounded-full transform rotate-2 shadow-lg">
          Final Score: {winner.totalScore > 0 ? '+' : ''}{winner.totalScore} strokes
        </div>
      </div>

      {/* Course Info Banner */}
      <Card className="glass-card rounded-3xl p-4 text-center mb-8 border-2 border-yellow-400/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
        <CardContent className="p-0">
          <div className="text-white/90 text-lg">
            🏌️‍♂️ {currentGame.totalHoles} holes completed at <span className="font-bold text-yellow-300">{currentGame.courseName || 'Disc Golf Course'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Final Leaderboard with Cartoon Style */}
      <Card className="glass-card rounded-3xl p-6 mb-8 border-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30">
        <CardContent className="p-0">
          <div className="text-center mb-6">
            <h3 className="text-4xl font-black text-white mb-2">🏅 FINAL LEADERBOARD 🏅</h3>
            <div className="text-lg text-white/80">Who came out on top?</div>
          </div>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const isWinner = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              
              return (
                <div
                  key={player.id}
                  className={`
                    relative rounded-2xl p-4 border-2 transition-all transform hover:scale-105
                    ${isWinner ? 'bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 border-yellow-400 animate-pulse' : 
                      isSecond ? 'bg-gradient-to-r from-gray-300/30 to-gray-500/30 border-gray-400' :
                      isThird ? 'bg-gradient-to-r from-orange-400/30 to-orange-600/30 border-orange-400' :
                      'bg-white/10 border-white/20'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        text-3xl font-black w-12 h-12 rounded-full flex items-center justify-center
                        ${isWinner ? 'bg-yellow-400 text-yellow-900' :
                          isSecond ? 'bg-gray-400 text-gray-900' :
                          isThird ? 'bg-orange-400 text-orange-900' :
                          'bg-white/20 text-white'}
                      `}>
                        {isWinner ? '👑' : isSecond ? '🥈' : isThird ? '🥉' : index + 1}
                      </div>
                      <div>
                        <div className={`text-xl font-bold ${isWinner ? 'text-yellow-100' : 'text-white'}`}>
                          {player.name}
                          {isWinner && <span className="ml-2 text-yellow-300">🌟</span>}
                        </div>
                        <div className="text-white/70 text-sm">
                          Total strokes: {(player.strokes || []).reduce((sum, s) => sum + (s || 0), 0)}
                        </div>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      player.totalScore < 0 ? 'text-green-400' : 
                      player.totalScore > 0 ? 'text-red-400' : 'text-white'
                    }`}>
                      {player.totalScore > 0 ? '+' : ''}{player.totalScore}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons with Fun Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={shareResults}
          className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-violet-600 transition-all transform hover:scale-105 shadow-lg"
        >
          📱 Share Results
        </Button>
        <Button
          onClick={handlePlayAgain}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
        >
          🔄 Play Again
        </Button>
        <Button
          onClick={handleMainMenu}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg"
        >
          🏠 Main Menu
        </Button>
      </div>

      {/* Fun Game Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-2xl mb-1">🕐</div>
          <div className="text-sm text-white/70">Game Duration</div>
          <div className="text-white font-bold">Epic!</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-2xl mb-1">👥</div>
          <div className="text-sm text-white/70">Players</div>
          <div className="text-white font-bold">{players.length}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-sm text-white/70">Best Score</div>
          <div className="text-green-400 font-bold">{Math.min(...players.map(p => p.totalScore))}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-2xl mb-1">🏌️‍♂️</div>
          <div className="text-sm text-white/70">Holes</div>
          <div className="text-white font-bold">{currentGame.totalHoles}</div>
        </div>
      </div>
    </div>
  );
}
