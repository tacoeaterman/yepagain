import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function Rules() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-brand-gradient">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setLocation(-1)}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white text-center flex-1">
            <BookOpen className="w-8 h-8 inline mr-3" />
            Game Rules
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Rules Content */}
        <Card className="glass-card rounded-3xl p-8 border-0">
          <CardContent className="p-0">
            <div className="text-center">
              <div className="text-6xl mb-6">📖</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Rules Page
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Coming Soon!
              </p>
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <p className="text-white/70 text-lg leading-relaxed">
                  We're working hard to create comprehensive game rules that will help you master the art of disc golf card combat. 
                  Check back soon for detailed explanations of:
                </p>
                <ul className="text-white/60 text-left mt-4 space-y-2 max-w-md mx-auto">
                  <li>• Basic gameplay mechanics</li>
                  <li>• Card categories and effects</li>
                  <li>• Scoring and golf rules integration</li>
                  <li>• Special card interactions</li>
                  <li>• Strategy tips and tricks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
