import { Card as CardType } from "@/types/game";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, User } from "lucide-react";

interface CardAcknowledgmentModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  card: CardType | null;
  playedBy: string;
}

export function CardAcknowledgmentModal({
  isOpen,
  onAcknowledge,
  card,
  playedBy,
}: CardAcknowledgmentModalProps) {
  if (!card) return null;

  const getCardColor = (category: string) => {
    switch (category) {
      case 'Before Throw': return 'bg-blue-500/20 border-blue-500/30';
      case 'After Throw': return 'bg-red-500/20 border-red-500/30';
      case 'Self': return 'bg-green-500/20 border-green-500/30';
      case 'Wild': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-white/10 border-white/20';
    }
  };

  const getCardEmoji = (category: string) => {
    switch (category) {
      case 'Before Throw': return '🎯';
      case 'After Throw': return '⚡';
      case 'Self': return '🛡️';
      case 'Wild': return '🌟';
      default: return '🃏';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-white/20"
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold text-center">
            Card Played On You!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Player Info */}
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <User className="w-5 h-5 text-white/70" />
              <span className="text-white font-medium">{playedBy}</span>
            </div>
            <p className="text-white/60 text-sm">played a card on you</p>
          </div>

          {/* Card Display */}
          <Card className={`${getCardColor(card.category)} border-2 transform hover:scale-105 transition-transform`}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-3">{getCardEmoji(card.category)}</div>
                <div className="text-sm font-semibold text-white/70 mb-2">
                  {card.category}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  {card.name}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {card.description}
                </p>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-white/90 text-xs font-medium">
                    This card effect is now active for you. Follow the instructions above during your next action.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledge Button */}
          <Button
            onClick={onAcknowledge}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

