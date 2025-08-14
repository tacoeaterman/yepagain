import { useState } from "react";
import { Card as CardType, Player } from "@/types/game";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, User, Target } from "lucide-react";

interface CardTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardType | null;
  players: Record<string, Player>;
  currentUserId: string;
  currentHole?: number;
  totalHoles?: number;
  onPlayCard: (card: CardType, targetPlayerIds?: string[]) => void;
}

export function CardTargetModal({
  isOpen,
  onClose,
  card,
  players,
  currentUserId,
  currentHole = 1,
  totalHoles = 18,
  onPlayCard,
}: CardTargetModalProps) {
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  if (!card) return null;

  // Check if Jealousy is being played on the last hole
  const isJealousyCard = card.name.toLowerCase().includes('jealousy');
  const isLastHole = currentHole === totalHoles;
  const jealousyRestricted = isJealousyCard && isLastHole;

  // Determine targeting type based on card description and effect
  const getTargetingType = (card: CardType) => {
    const description = card.description.toLowerCase();
    const effect = card.effect.toLowerCase();
    
    // Self cards don't need targeting
    if (card.category === 'Self') return 'self';
    
    // Cards that explicitly mention "all opponents" or "all other players"
    if (description.includes('all opponents') || description.includes('all other players') || 
        effect.includes('all') || card.effect === 'force_all_rethrow_worst' || 
        card.effect === 'force_knees' || card.effect === 'force_mando' ||
        card.effect === 'move_closer_others_further') {
      return 'all_opponents';
    }
    
    // Cards that mention "an opponent" need single target
    if (description.includes('an opponent') || description.includes('opponent\'s') ||
        effect.includes('opponent') || card.effect === 'swap_scorecards') {
      return 'single_opponent';
    }
    
    // Default to single opponent for safety
    return 'single_opponent';
  };

  const targetingType = getTargetingType(card);
  const otherPlayers = Object.values(players).filter(p => p.id !== currentUserId);

  const handleTargetToggle = (playerId: string) => {
    if (targetingType === 'single_opponent') {
      setSelectedTargets([playerId]);
    } else if (targetingType === 'all_opponents') {
      // For "all opponents" cards, selection is automatic
      return;
    }
  };

  const handlePlayCard = () => {
    let targets: string[] = [];
    
    if (targetingType === 'all_opponents') {
      targets = otherPlayers.map(p => p.id);
    } else if (targetingType === 'single_opponent') {
      targets = selectedTargets;
    }
    // 'self' cards don't need targets
    
    onPlayCard(card, targets.length > 0 ? targets : undefined);
    setSelectedTargets([]);
    onClose();
  };

  const canPlay = () => {
    // Check if Jealousy is restricted on last hole
    if (jealousyRestricted) return false;
    
    if (targetingType === 'self' || targetingType === 'all_opponents') return true;
    if (targetingType === 'single_opponent') return selectedTargets.length === 1;
    return false;
  };

  const getCardColor = (category: string) => {
    switch (category) {
      case 'Before Throw': return 'bg-blue-500/20 border-blue-500/30';
      case 'After Throw': return 'bg-red-500/20 border-red-500/30';
      case 'Self': return 'bg-green-500/20 border-green-500/30';
      case 'Wild': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-white/10 border-white/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Play Card</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Card Display */}
          <Card className={`${getCardColor(card.category)} border-2`}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm font-semibold text-white/70 mb-1">
                  {card.category}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {card.name}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Targeting Section */}
          <div className="space-y-4">
            {targetingType === 'self' && (
              <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <User className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">This card affects only you</p>
                <p className="text-white/60 text-sm">No targeting required</p>
              </div>
            )}

            {targetingType === 'all_opponents' && (
              <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <Users className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-white font-medium">This card affects all opponents</p>
                <p className="text-white/60 text-sm">All other players will be targeted automatically</p>
                <div className="mt-3 space-y-2">
                  {otherPlayers.map(player => (
                    <div key={player.id} className="flex items-center justify-center space-x-2 text-white/80">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{player.name}</span>
                      <Target className="w-4 h-4 text-red-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {targetingType === 'single_opponent' && (
              <div className="space-y-3">
                <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <Target className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-white font-medium text-sm">Choose one player to target</p>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {otherPlayers.map(player => (
                    <Button
                      key={player.id}
                      onClick={() => handleTargetToggle(player.id)}
                      className={`w-full p-4 rounded-xl transition-all ${
                        selectedTargets.includes(player.id)
                          ? 'bg-brand-accent border-2 border-brand-accent text-white'
                          : 'bg-white/5 hover:bg-white/10 border-2 border-white/10 text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-xs opacity-70">
                            {player.isHost ? '👑 Host' : 'Player'} • {player.hand?.length || 0} cards
                          </div>
                        </div>
                        {selectedTargets.includes(player.id) && (
                          <Target className="w-5 h-5 ml-auto" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Jealousy Restriction Warning */}
          {jealousyRestricted && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-200 text-sm font-medium text-center">
                ⚠️ Jealousy cannot be played on the last hole!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlayCard}
              disabled={!canPlay()}
              className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Play Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

