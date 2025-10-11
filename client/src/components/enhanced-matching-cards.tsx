import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X } from "lucide-react";
import { celebrateCorrectMatch, celebrateGameComplete } from "@/lib/confetti";
import VariantSelector from "./variant-selector";
import GameCompletionEncouragement from "./game-completion-encouragement";

interface MatchingPair {
  id: string;
  left: string;
  right: string;
  category: string;
}

const allMatchingData: MatchingPair[] = [
  {
    id: "1",
    left: "1066",
    right: "Norman Conquest",
    category: "History"
  },
  {
    id: "2",
    left: "1215",
    right: "Magna Carta signed",
    category: "History"
  },
  {
    id: "3",
    left: "1314",
    right: "Battle of Bannockburn",
    category: "History"
  },
  {
    id: "4",
    left: "London",
    right: "Capital of England",
    category: "Geography"
  },
  {
    id: "5",
    left: "Edinburgh",
    right: "Capital of Scotland",
    category: "Geography"
  },
  {
    id: "6",
    left: "Cardiff",
    right: "Capital of Wales",
    category: "Geography"
  },
  {
    id: "7",
    left: "House of Commons",
    right: "Lower house of Parliament",
    category: "Government"
  },
  {
    id: "8",
    left: "House of Lords",
    right: "Upper house of Parliament",
    category: "Government"
  },
  {
    id: "9",
    left: "Shakespeare",
    right: "Famous English playwright",
    category: "Culture"
  },
  {
    id: "10",
    left: "Burns Night",
    right: "Scottish celebration on January 25th",
    category: "Culture"
  },
  {
    id: "11",
    left: "18",
    right: "Legal voting age in UK",
    category: "Values"
  },
  {
    id: "12",
    left: "NHS",
    right: "National Health Service",
    category: "Values"
  }
];

interface EnhancedMatchingCardsProps {
  userId: string;
  onNextGame?: () => void;
  nextGameTitle?: string;
}

export default function EnhancedMatchingCards({ userId, onNextGame, nextGameTitle }: EnhancedMatchingCardsProps) {
  const [currentVariant, setCurrentVariant] = useState(4);
  const [completedVariants, setCompletedVariants] = useState<number[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [gameStats, setGameStats] = useState({ attempts: 0, correct: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const incorrectTimeoutRef = useRef<NodeJS.Timeout>();

  // Get data for current variant
  const currentData = useMemo(() => {
    const shuffled = [...allMatchingData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, currentVariant);
  }, [currentVariant]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(currentData.map(item => item.category)));
    return ["All", ...uniqueCategories];
  }, [currentData]);

  const filteredData = useMemo(() => {
    if (selectedCategory === "All") return currentData;
    return currentData.filter(item => item.category === selectedCategory);
  }, [currentData, selectedCategory]);

  const shuffledLeftItems = useMemo(() => {
    return [...filteredData].sort(() => Math.random() - 0.5);
  }, [filteredData]);

  const shuffledRightItems = useMemo(() => {
    return [...filteredData].sort(() => Math.random() - 0.5);
  }, [filteredData]);

  const handleItemClick = (id: string, side: 'left' | 'right') => {
    if (matchedPairs.has(id)) return;

    if (side === 'left') {
      setSelectedLeft(selectedLeft === id ? null : id);
    } else {
      setSelectedRight(selectedRight === id ? null : id);
    }
  };

  const checkMatch = () => {
    if (!selectedLeft || !selectedRight) return;

    setGameStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    if (selectedLeft === selectedRight) {
      // Correct match
      setMatchedPairs(prev => new Set(Array.from(prev).concat([selectedLeft])));
      setGameStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setSelectedLeft(null);
      setSelectedRight(null);
      
      celebrateCorrectMatch();

      // Check if game is complete
      if (matchedPairs.size + 1 === filteredData.length) {
        setTimeout(() => {
          celebrateGameComplete();
          if (!completedVariants.includes(currentVariant)) {
            setCompletedVariants(prev => [...prev, currentVariant]);
          }
        }, 500);
      }
    } else {
      // Incorrect match
      setShowIncorrect(true);
      incorrectTimeoutRef.current = setTimeout(() => {
        setShowIncorrect(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 3000);
    }
  };

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      checkMatch();
    }
  }, [selectedLeft, selectedRight]);

  const resetGame = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs(new Set());
    setShowIncorrect(false);
    setGameStats({ attempts: 0, correct: 0 });
    if (incorrectTimeoutRef.current) {
      clearTimeout(incorrectTimeoutRef.current);
    }
  };

  const handleVariantChange = (variant: number) => {
    setCurrentVariant(variant);
    resetGame();
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  const isGameComplete = matchedPairs.size === filteredData.length && filteredData.length > 0;
  const allVariantsCompleted = completedVariants.length === 4; // 4 variants: 4, 6, 8, 12

  return (
    <div className="space-y-6">
      <VariantSelector
        currentVariant={currentVariant}
        onVariantChange={handleVariantChange}
        completedVariants={completedVariants}
        gameTitle="General Matching"
      />

      {isGameComplete && (
        <GameCompletionEncouragement
          currentGameTitle="General Matching"
          nextGameTitle={nextGameTitle}
          completedVariants={completedVariants}
          totalVariants={4}
          onNextGame={onNextGame}
          onPlayAgain={handlePlayAgain}
          difficulty="middle"
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer ${
              selectedCategory === category 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Progress: {matchedPairs.size} / {filteredData.length} matches
          {gameStats.attempts > 0 && (
            <span className="ml-2">
              (Accuracy: {Math.round((gameStats.correct / gameStats.attempts) * 100)}%)
            </span>
          )}
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-2">
          <h3 className="font-semibold text-center mb-3">Items</h3>
          {shuffledLeftItems.map(item => (
            <Button
              key={`left-${item.id}`}
              variant={
                matchedPairs.has(item.id) ? "default" :
                selectedLeft === item.id ? (showIncorrect ? "destructive" : "secondary") :
                "outline"
              }
              className={`w-full h-auto p-3 text-left justify-start ${
                matchedPairs.has(item.id) ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-600" : "bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
              }`}
              onClick={() => handleItemClick(item.id, 'left')}
              disabled={matchedPairs.has(item.id)}
            >
              <div className="flex items-center gap-2">
                {matchedPairs.has(item.id) && <Check className="h-4 w-4" />}
                {selectedLeft === item.id && showIncorrect && <X className="h-4 w-4" />}
                <span>{item.left}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <h3 className="font-semibold text-center mb-3">Descriptions</h3>
          {shuffledRightItems.map(item => (
            <Button
              key={`right-${item.id}`}
              variant={
                matchedPairs.has(item.id) ? "default" :
                selectedRight === item.id ? (showIncorrect ? "destructive" : "secondary") :
                "outline"
              }
              className={`w-full h-auto p-3 text-left justify-start ${
                matchedPairs.has(item.id) ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-600" : "bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
              }`}
              onClick={() => handleItemClick(item.id, 'right')}
              disabled={matchedPairs.has(item.id)}
            >
              <div className="flex items-center gap-2">
                {matchedPairs.has(item.id) && <Check className="h-4 w-4" />}
                {selectedRight === item.id && showIncorrect && <X className="h-4 w-4" />}
                <span>{item.right}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {!isGameComplete && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-600">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">How to Play:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Choose your preferred difficulty: 4, 6, 8, or 12 matching pairs</li>
            <li>• Click one button from each column to make a match</li>
            <li>• Correct matches turn green and move to the bottom</li>
            <li>• Complete all variants to unlock the next matching game!</li>
          </ul>
        </div>
      )}
    </div>
  );
}