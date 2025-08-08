import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function GameCard({ title, description, icon, onClick, disabled, className }: GameCardProps) {
  return (
    <Card 
      className={cn(
        "p-6 card-hover cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-0 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-brand-primary/20 rounded-2xl flex items-center justify-center cartoon-shadow border-2 border-logo-dark">
          {icon}
        </div>
        <h3 className="font-logo font-bold text-lg mb-2 text-logo-dark">{title}</h3>
        <p className="text-muted-foreground font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}
