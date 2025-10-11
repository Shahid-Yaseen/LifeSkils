import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Star, Trophy, Target } from "lucide-react";

interface VariantSelectorProps {
  currentVariant: number;
  onVariantChange: (variant: number) => void;
  completedVariants: number[];
  gameTitle: string;
}

const VARIANT_OPTIONS = [
  { size: 4, label: "Starter", icon: Target, description: "4 items - Quick practice", difficulty: "Easy" },
  { size: 6, label: "Standard", icon: Star, description: "6 items - Good challenge", difficulty: "Medium" },
  { size: 8, label: "Advanced", icon: Trophy, description: "8 items - Serious test", difficulty: "Hard" },
  { size: 12, label: "Master", icon: CheckCircle, description: "12 items - Complete mastery", difficulty: "Expert" }
];

export default function VariantSelector({ 
  currentVariant, 
  onVariantChange, 
  completedVariants, 
  gameTitle 
}: VariantSelectorProps) {
  return (
    <Card className="mb-6 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Choose Your Challenge Level for {gameTitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start with fewer items and work your way up to master all variants!
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VARIANT_OPTIONS.map(({ size, label, icon: Icon, description, difficulty }) => {
              const isCompleted = completedVariants.includes(size);
              const isCurrent = currentVariant === size;
              
              return (
                <Button
                  key={size}
                  variant={isCurrent ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 relative transition-all duration-200 ${
                    isCurrent 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  } ${
                    isCompleted ? "border-green-500 bg-green-50 dark:bg-green-900/20 hover:border-green-600 dark:hover:border-green-400" : ""
                  }`}
                  onClick={() => onVariantChange(size)}
                >
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="h-4 w-4 text-green-600 bg-white dark:bg-gray-800 rounded-full" />
                    </div>
                  )}
                  
                  <Icon className={`h-6 w-6 ${isCompleted ? "text-green-600" : ""}`} />
                  
                  <div className="text-center">
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs opacity-75">{size} items</div>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={`text-xs border-0 ${
                      difficulty === "Easy" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      difficulty === "Medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      difficulty === "Hard" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :
                      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    }`}
                  >
                    {difficulty}
                  </Badge>
                </Button>
              );
            })}
          </div>
          
          {completedVariants.length > 0 && (
            <div className="text-center pt-2">
              <Badge variant="outline" className="text-green-600 border-green-300 dark:text-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                ✓ {completedVariants.length} of {VARIANT_OPTIONS.length} variants completed
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}