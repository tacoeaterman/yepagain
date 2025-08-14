import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Target } from "lucide-react";
import { Player } from "@/types/game";

interface CardRedirectModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onRedirect: (targetPlayerId: string) => void;
  availablePlayers: Player[];
  currentPlayerId: string;
}

export function CardRedirectModal({
  isOpen,
  onCancel,
  onRedirect,
  availablePlayers,
  currentPlayerId,
}: CardRedirectModalProps) {
  // Filter out current player from available targets
  const targetPlayers = availablePlayers.filter(player => player.id !== currentPlayerId);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-white/20"
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold text-center">
            <Target className="w-6 h-6 inline mr-2" />
            Choose Target Player
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-white/70 text-center text-sm">
            Select which player should receive the redirected card:
          </p>

          {/* Player Selection */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {targetPlayers.map((player) => (
              <Card 
                key={player.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => onRedirect(player.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-brand-accent/20 p-2 rounded-full">
                      <User className="w-4 h-4 text-brand-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{player.name}</h4>
                      <p className="text-white/60 text-sm">
                        Score: {player.totalScore || 0} | Cards: {player.hand?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
          >
            Cancel Redirect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
