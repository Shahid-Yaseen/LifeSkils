import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, ArrowRight, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface GameCompletionEncouragementProps {
  currentGameTitle: string;
  nextGameTitle?: string;
  completedVariants: number[];
  totalVariants: number;
  onNextGame?: () => void;
  onPlayAgain?: () => void;
  difficulty: "beginner" | "middle" | "advanced";
}

export default function GameCompletionEncouragement({
  currentGameTitle,
  nextGameTitle,
  completedVariants,
  totalVariants,
  onNextGame,
  onPlayAgain,
  difficulty
}: GameCompletionEncouragementProps) {
  const allVariantsCompleted = completedVariants.length === totalVariants;
  
  useEffect(() => {
    if (allVariantsCompleted) {
      // Celebratory confetti for completing all variants
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#9370DB']
      });
    }
  }, [allVariantsCompleted]);

  const difficultyColors = {
    beginner: "green",
    middle: "blue", 
    advanced: "purple"
  };

  const color = difficultyColors[difficulty];

  if (!allVariantsCompleted) return null;

  return (
    <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-green-700 dark:text-green-300">
          🎉 Congratulations! 🎉
        </CardTitle>
        <p className="text-green-600 dark:text-green-400">
          You've mastered all variants of {currentGameTitle}!
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold">Complete Achievement</span>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {[4, 6, 8, 12].map((variant) => (
              <Badge 
                key={variant} 
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                ✓ {variant} items
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <h4 className="font-semibold mb-2">What's Next?</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Keep building your Life in UK test knowledge with these options:
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nextGameTitle && onNextGame && (
              <Button 
                onClick={onNextGame}
                className="h-auto p-4 bg-green-600 hover:bg-green-700"
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-semibold">Next Challenge</div>
                    <div className="text-xs opacity-90">{nextGameTitle}</div>
                  </div>
                </div>
              </Button>
            )}
            
            {onPlayAgain && (
              <Button 
                variant="outline" 
                onClick={onPlayAgain}
                className="h-auto p-4"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-semibold">Play Again</div>
                    <div className="text-xs opacity-75">Practice makes perfect!</div>
                  </div>
                </div>
              </Button>
            )}
          </div>
        </div>

        {difficulty === "advanced" && allVariantsCompleted && (
          <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-green-800 dark:text-green-200">
              🏆 Advanced Level Master! 🏆
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              You've completed the most challenging difficulty level!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}