import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X, Trophy } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";
import VariantSelector from "./variant-selector";
import GameCompletionEncouragement from "./game-completion-encouragement";

interface SportsHero {
  id: string;
  name: string;
  sport: string;
  achievement: string;
}

const allSportsHeroesData: SportsHero[] = [
  {
    id: "1",
    name: "Roger Bannister",
    sport: "Athletics",
    achievement: "First person to run a mile in under 4 minutes (1954)"
  },
  {
    id: "2",
    name: "Sir Mo Farah",
    sport: "Athletics", 
    achievement: "Four-time Olympic gold medalist in 5000m and 10000m"
  },
  {
    id: "3",
    name: "Dame Kelly Holmes",
    sport: "Athletics",
    achievement: "Double Olympic gold medalist in 800m and 1500m"
  },
  {
    id: "4",
    name: "Sir Lewis Hamilton",
    sport: "Formula 1",
    achievement: "Seven-time Formula 1 World Champion"
  },
  {
    id: "5",
    name: "Damon Hill",
    sport: "Formula 1",
    achievement: "1996 Formula 1 World Champion"
  },
  {
    id: "6",
    name: "Jenson Button",
    sport: "Formula 1",
    achievement: "2009 Formula 1 World Champion"
  },
  {
    id: "7",
    name: "Sir Jackie Stewart",
    sport: "Formula 1",
    achievement: "Three-time Formula 1 World Champion (1969, 1971, 1973)"
  },
  {
    id: "8",
    name: "Sir Bobby Moore",
    sport: "Football",
    achievement: "Captain of England's 1966 World Cup winning team"
  },
  {
    id: "9",
    name: "Sir Ian Botham",
    sport: "Cricket",
    achievement: "All-rounder with 5,200 runs and 383 wickets in Tests"
  },
  {
    id: "10",
    name: "Torvill and Dean",
    sport: "Ice Skating",
    achievement: "Olympic ice dance champions with perfect score (1984)"
  },
  {
    id: "11",
    name: "Sir Steve Redgrave",
    sport: "Rowing",
    achievement: "Five-time Olympic gold medalist (1984-2000)"
  },
  {
    id: "12",
    name: "Dame Sarah Storey",
    sport: "Paralympic Cycling",
    achievement: "Most successful British Paralympian with 17 gold medals"
  }
];

interface EnhancedSportsHeroesMatchingProps {
  userId: string;
  onNextGame?: () => void;
  nextGameTitle?: string;
}

export default function EnhancedSportsHeroesMatching({ userId, onNextGame, nextGameTitle }: EnhancedSportsHeroesMatchingProps) {
  const [currentVariant, setCurrentVariant] = useState(4);
  const [completedVariants, setCompletedVariants] = useState<number[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [showIncorrect, setShowIncorrect] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState({ attempts: 0, correct: 0 });
  const [sportFilter, setSportFilter] = useState<string>("All");

  // Get data for current variant
  const currentData = useMemo(() => {
    const shuffled = [...allSportsHeroesData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, currentVariant);
  }, [currentVariant]);

  const sports = useMemo(() => {
    const uniqueSports = Array.from(new Set(currentData.map(item => item.sport)));
    return ["All", ...uniqueSports];
  }, [currentData]);

  const filteredData = useMemo(() => {
    if (sportFilter === "All") return currentData;
    return currentData.filter(item => item.sport === sportFilter);
  }, [currentData, sportFilter]);

  const shuffledNames = useMemo(() => {
    return [...filteredData].sort(() => Math.random() - 0.5);
  }, [filteredData]);

  const shuffledSports = useMemo(() => {
    return [...filteredData].sort(() => Math.random() - 0.5);
  }, [filteredData]);

  const shuffledAchievements = useMemo(() => {
    return [...filteredData].sort(() => Math.random() - 0.5);
  }, [filteredData]);

  const handleSelection = (id: string, column: 'name' | 'sport' | 'achievement') => {
    if (matchedItems.has(id)) return;

    switch (column) {
      case 'name':
        setSelectedName(selectedName === id ? null : id);
        break;
      case 'sport':
        setSelectedSport(selectedSport === id ? null : id);
        break;
      case 'achievement':
        setSelectedAchievement(selectedAchievement === id ? null : id);
        break;
    }
  };

  const checkTripleMatch = () => {
    if (!selectedName || !selectedSport || !selectedAchievement) return;

    setGameStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    if (selectedName === selectedSport && selectedSport === selectedAchievement) {
      // Correct match
      setMatchedItems(prev => new Set(Array.from(prev).concat([selectedName])));
      setGameStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      
      celebrateWithTheme("sports");
      
      // Reset selections
      setSelectedName(null);
      setSelectedSport(null);
      setSelectedAchievement(null);

      // Check if game is complete
      if (matchedItems.size + 1 === filteredData.length) {
        setTimeout(() => {
          celebrateGameComplete();
          if (!completedVariants.includes(currentVariant)) {
            setCompletedVariants(prev => [...prev, currentVariant]);
          }
        }, 500);
      }
    } else {
      // Incorrect match
      setShowIncorrect(`${selectedName}-${selectedSport}-${selectedAchievement}`);
      setTimeout(() => {
        setShowIncorrect(null);
        setSelectedName(null);
        setSelectedSport(null);
        setSelectedAchievement(null);
      }, 3000);
    }
  };

  // Auto-check when all three selections are made
  useEffect(() => {
    if (selectedName && selectedSport && selectedAchievement) {
      checkTripleMatch();
    }
  }, [selectedName, selectedSport, selectedAchievement]);

  const resetGame = () => {
    setSelectedName(null);
    setSelectedSport(null);
    setSelectedAchievement(null);
    setMatchedItems(new Set());
    setShowIncorrect(null);
    setGameStats({ attempts: 0, correct: 0 });
  };

  const handleVariantChange = (variant: number) => {
    setCurrentVariant(variant);
    resetGame();
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  const isGameComplete = matchedItems.size === filteredData.length && filteredData.length > 0;

  return (
    <div className="space-y-6">
      <VariantSelector
        currentVariant={currentVariant}
        onVariantChange={handleVariantChange}
        completedVariants={completedVariants}
        gameTitle="Sports Heroes Triple Match"
      />

      {isGameComplete && (
        <GameCompletionEncouragement
          currentGameTitle="Sports Heroes Triple Match"
          nextGameTitle={nextGameTitle}
          completedVariants={completedVariants}
          totalVariants={4}
          onNextGame={onNextGame}
          onPlayAgain={handlePlayAgain}
          difficulty="advanced"
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {sports.map(sport => (
          <Badge
            key={sport}
            variant={sportFilter === sport ? "default" : "outline"}
            className={`cursor-pointer ${
              sportFilter === sport 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSportFilter(sport)}
          >
            {sport}
          </Badge>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Progress: {matchedItems.size} / {filteredData.length} matches
          {gameStats.attempts > 0 && (
            <span className="ml-2">
              (Accuracy: {Math.round((gameStats.correct / gameStats.attempts) * 100)}%)
            </span>
          )}
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Names Column */}
        <div className="space-y-2">
          <h3 className="font-semibold text-center mb-3">Name</h3>
          {shuffledNames.map(item => {
            const isMatched = matchedItems.has(item.id);
            const isSelected = selectedName === item.id;
            const isIncorrect = showIncorrect && showIncorrect.includes(item.id);
            
            return (
              <Button
                key={`name-${item.id}`}
                variant={
                  isMatched ? "default" :
                  isSelected ? (isIncorrect ? "destructive" : "secondary") :
                  "outline"
                }
                className={`w-full h-auto p-3 text-left justify-start ${
                  isMatched ? "bg-green-500 hover:bg-green-600" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                }`}
                onClick={() => handleSelection(item.id, 'name')}
                disabled={isMatched}
              >
                <div className="flex items-center gap-2">
                  {isMatched && <Check className="h-4 w-4" />}
                  {isIncorrect && <X className="h-4 w-4" />}
                  <span className="text-sm">{item.name}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Sports Column */}
        <div className="space-y-2">
          <h3 className="font-semibold text-center mb-3">Sport</h3>
          {shuffledSports.map(item => {
            const isMatched = matchedItems.has(item.id);
            const isSelected = selectedSport === item.id;
            const isIncorrect = showIncorrect && showIncorrect.includes(item.id);
            
            return (
              <Button
                key={`sport-${item.id}`}
                variant={
                  isMatched ? "default" :
                  isSelected ? (isIncorrect ? "destructive" : "secondary") :
                  "outline"
                }
                className={`w-full h-auto p-3 text-left justify-start ${
                  isMatched ? "bg-green-500 hover:bg-green-600" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                }`}
                onClick={() => handleSelection(item.id, 'sport')}
                disabled={isMatched}
              >
                <div className="flex items-center gap-2">
                  {isMatched && <Check className="h-4 w-4" />}
                  {isIncorrect && <X className="h-4 w-4" />}
                  <span className="text-sm">{item.sport}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Achievements Column */}
        <div className="space-y-2">
          <h3 className="font-semibold text-center mb-3">Achievement</h3>
          {shuffledAchievements.map(item => {
            const isMatched = matchedItems.has(item.id);
            const isSelected = selectedAchievement === item.id;
            const isIncorrect = showIncorrect && showIncorrect.includes(item.id);
            
            return (
              <Button
                key={`achievement-${item.id}`}
                variant={
                  isMatched ? "default" :
                  isSelected ? (isIncorrect ? "destructive" : "secondary") :
                  "outline"
                }
                className={`w-full h-auto p-3 text-left justify-start ${
                  isMatched ? "bg-green-500 hover:bg-green-600" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                }`}
                onClick={() => handleSelection(item.id, 'achievement')}
                disabled={isMatched}
              >
                <div className="flex items-center gap-2">
                  {isMatched && <Check className="h-4 w-4" />}
                  {isIncorrect && <X className="h-4 w-4" />}
                  <span className="text-xs">{item.achievement}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {!isGameComplete && (
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            How to Play Triple Match:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Choose your challenge level: 4, 6, 8, or 12 sports heroes</li>
            <li>• Select one item from each of the three columns (Name → Sport → Achievement)</li>
            <li>• All three selections must relate to the same sports hero</li>
            <li>• Complete all variants to unlock the next advanced game!</li>
          </ul>
        </div>
      )}
    </div>
  );
}