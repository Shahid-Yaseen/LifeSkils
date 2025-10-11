import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X } from "lucide-react";
import { celebrateCorrectMatch, celebrateGameComplete } from "@/lib/confetti";

interface MatchingPair {
  id: string;
  left: string;
  right: string;
  category: string;
}

const matchingData: MatchingPair[] = [
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
  }
];

interface MatchingCardsProps {
  userId: string;
}

export default function MatchingCards({ userId }: MatchingCardsProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [feedback, setFeedback] = useState<{ leftId: string; rightId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());
  
  const categories = ["All", ...Array.from(new Set(matchingData.map(item => item.category)))];
  
  const filteredData = selectedCategory === "All" 
    ? matchingData 
    : matchingData.filter(item => item.category === selectedCategory);

  // Fisher-Yates shuffle algorithm for better randomization
  const shuffleArray = (array: MatchingPair[], seed: number) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Generate pseudo-random number using seed
      random = (random * 9301 + 49297) % 233280;
      const randomIndex = Math.floor((random / 233280) * (i + 1));
      
      // Swap elements
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  };

  // Create separate shuffled arrays for left and right columns to properly mix cards
  const shuffledLeftData = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 1000);
  }, [filteredData, shuffleSeed]);

  const shuffledRightData = useMemo(() => {
    // Use different seed for right column to ensure completely different order
    return shuffleArray(filteredData, shuffleSeed * 7309 + 1234);
  }, [filteredData, shuffleSeed]);

  // Helper functions
  const getButtonStatus = (itemId: string, side: 'left' | 'right') => {
    const key = `${itemId}-${side}`;
    return matches[key];
  };

  const isSelected = (itemId: string, side: 'left' | 'right') => {
    return side === 'left' ? selectedLeft === itemId : selectedRight === itemId;
  };

  // Only move correctly matched (green) items to bottom after 1 second delay
  const sortedLeftItems = useMemo(() => {
    return [...shuffledLeftData].sort((a, b) => {
      const aMatched = getButtonStatus(a.id, 'left') === 'correct' && !recentCorrectMatches.has(a.id);
      const bMatched = getButtonStatus(b.id, 'left') === 'correct' && !recentCorrectMatches.has(b.id);
      // Only sort if both items have different correct status and not recently matched
      if (aMatched !== bMatched) return aMatched ? 1 : -1;
      return 0; // Keep original shuffled order for unmatched items
    });
  }, [shuffledLeftData, matches, recentCorrectMatches]);
  
  const sortedRightItems = useMemo(() => {
    return [...shuffledRightData].sort((a, b) => {
      const aMatched = getButtonStatus(a.id, 'right') === 'correct' && !recentCorrectMatches.has(a.id);
      const bMatched = getButtonStatus(b.id, 'right') === 'correct' && !recentCorrectMatches.has(b.id);
      // Only sort if both items have different correct status and not recently matched
      if (aMatched !== bMatched) return aMatched ? 1 : -1;
      return 0; // Keep original shuffled order for unmatched items
    });
  }, [shuffledRightData, matches, recentCorrectMatches]);

  const handleLeftClick = (itemId: string) => {
    const currentStatus = getButtonStatus(itemId, 'left');
    if (currentStatus === 'correct') return; // Already correctly matched
    
    setSelectedLeft(selectedLeft === itemId ? null : itemId);
    if (selectedRight && selectedLeft !== itemId) {
      checkMatch(itemId, selectedRight);
    }
  };

  const handleRightClick = (itemId: string) => {
    const currentStatus = getButtonStatus(itemId, 'right');
    if (currentStatus === 'correct') return; // Already correctly matched
    
    setSelectedRight(selectedRight === itemId ? null : itemId);
    if (selectedLeft && selectedRight !== itemId) {
      checkMatch(selectedLeft, itemId);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    const isCorrect = leftId === rightId;
    const leftKey = `${leftId}-left`;
    const rightKey = `${rightId}-right`;
    
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      // Celebrate individual correct match immediately
      celebrateCorrectMatch();
      
      setScore(prev => {
        const newScore = prev + 1;
        // Check if game is complete
        if (newScore === matchingData.length) {
          setTimeout(() => celebrateGameComplete(), 500);
        }
        return newScore;
      });
      setMatches(prev => ({
        ...prev,
        [leftKey]: 'correct',
        [rightKey]: 'correct'
      }));
      
      // Keep cards in place for 1 second before allowing them to move to bottom
      setRecentCorrectMatches(prev => new Set(Array.from(prev).concat(leftId)));
      setTimeout(() => {
        setRecentCorrectMatches(prev => {
          const updated = new Set(prev);
          updated.delete(leftId);
          return updated;
        });
      }, 1000);
    } else {
      setMatches(prev => ({
        ...prev,
        [leftKey]: 'incorrect',
        [rightKey]: 'incorrect'
      }));
      // Clear incorrect feedback after 3 seconds
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          delete newMatches[leftKey];
          delete newMatches[rightKey];
          return newMatches;
        });
      }, 3000);
    }
    
    setFeedback({ leftId, rightId, correct: isCorrect });
    
    // Clear selections and feedback
    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
      setFeedback(null);
    }, isCorrect ? 2500 : 3000);
  };

  const resetGame = () => {
    setMatches({});
    setFeedback(null);
    setSelectedLeft(null);
    setSelectedRight(null);
    setScore(0);
    setAttempts(0);
    setRecentCorrectMatches(new Set());
    setShuffleSeed(Math.random()); // Re-shuffle on reset
  };

  const correctMatches = Object.values(matches).filter(status => status === 'correct').length / 2;
  const accuracy = attempts > 0 ? Math.round((correctMatches / attempts) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Matching Cards</h2>
          <p className="text-gray-600 dark:text-gray-300">Click one button from each column to match them</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetGame} className="flex items-center gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
            <RotateCcw className="h-4 w-4" />
            Reset Game
          </Button>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex gap-4 text-sm">
        <span className="bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 px-3 py-1 rounded-full border border-green-200 dark:border-green-700">
          Score: {score}/{filteredData.length}
        </span>
        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
          Attempts: {attempts}
        </span>
        {attempts > 0 && (
          <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
            Accuracy: {accuracy}%
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 ${
              selectedCategory === category 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => {
              setSelectedCategory(category);
              resetGame();
            }}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Column A
          </h3>
          <div className="min-h-[400px] flex flex-col justify-start space-y-3">{/* Container to prevent layout shift */}
            {sortedLeftItems.map((item) => {
            const status = getButtonStatus(item.id, 'left');
            const selected = isSelected(item.id, 'left');
            
            return (
              <Button
                key={`left-${item.id}`}
                variant={selected ? "default" : "outline"}
                className={`w-full p-4 h-auto text-left justify-start transition-all duration-300 ${
                  status === 'correct' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-300 dark:border-green-600' 
                    : status === 'incorrect'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-300 dark:border-red-600'
                    : selected
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLeftClick(item.id);
                }}
                disabled={status === 'correct'}
                style={{ 
                  scrollMarginTop: '1rem',
                  scrollBehavior: 'auto'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">
                    {item.left}
                  </span>
                  <div className="flex items-center gap-2">
                    {status === 'correct' && <Check className="h-4 w-4" />}
                    {status === 'incorrect' && <X className="h-4 w-4" />}
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </Button>
            );
          })}
          </div>{/* End container */}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Column B
          </h3>
          <div className="min-h-[400px] flex flex-col justify-start space-y-3">{/* Container to prevent layout shift */}
            {sortedRightItems.map((item) => {
            const status = getButtonStatus(item.id, 'right');
            const selected = isSelected(item.id, 'right');
            
            return (
              <Button
                key={`right-${item.id}`}
                variant={selected ? "default" : "outline"}
                className={`w-full p-4 h-auto text-left justify-start transition-all duration-300 ${
                  status === 'correct' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-300 dark:border-green-600' 
                    : status === 'incorrect'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-300 dark:border-red-600'
                    : selected
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleRightClick(item.id);
                }}
                disabled={status === 'correct'}
                style={{ 
                  scrollMarginTop: '1rem',
                  scrollBehavior: 'auto'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">
                    {item.right}
                  </span>
                  <div className="flex items-center gap-2">
                    {status === 'correct' && <Check className="h-4 w-4" />}
                    {status === 'incorrect' && <X className="h-4 w-4" />}
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </Button>
            );
            })}
          </div>{/* End container */}
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`text-center p-4 rounded-lg ${
          feedback.correct 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border border-green-300 dark:border-green-600' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-300 dark:border-red-600'
        }`}>
          {feedback.correct ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🎉</span>
              <span className="font-medium">Excellent match! 🎯</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <X className="h-5 w-5" />
              <span className="font-medium">Not a match. Try again!</span>
            </div>
          )}
        </div>
      )}

      {/* Game Complete Message */}
      {correctMatches === filteredData.length && filteredData.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 p-4 rounded-lg text-center border border-green-300 dark:border-green-600">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Check className="h-6 w-6" />
            <span className="text-lg font-bold">Congratulations!</span>
          </div>
          <p>You've matched all pairs correctly! Final score: {score}/{filteredData.length} ({accuracy}% accuracy)</p>
        </div>
      )}
    </div>
  );
}