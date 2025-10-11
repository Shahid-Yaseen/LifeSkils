import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X, BookOpen } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";

interface HolidayMeaningPair {
  id: string;
  holiday: string;
  meaning: string;
  category: string;
}

const holidayMeaningData: HolidayMeaningPair[] = [
  {
    id: "1",
    holiday: "Lent",
    meaning: "Christian period of fasting, prayer, and reflection before Easter",
    category: "Christian"
  },
  {
    id: "2", 
    holiday: "Easter",
    meaning: "Christian celebration of Jesus Christ's resurrection from the dead",
    category: "Christian"
  },
  {
    id: "3",
    holiday: "Vaisakhi",
    meaning: "Sikh New Year and harvest festival celebrating the founding of the Khalsa",
    category: "Sikh"
  },
  {
    id: "4",
    holiday: "Diwali",
    meaning: "Hindu and Sikh festival of lights celebrating victory of light over darkness",
    category: "Hindu/Sikh"
  },
  {
    id: "5",
    holiday: "Hanukkah",
    meaning: "Jewish festival of lights commemorating the rededication of the Temple",
    category: "Jewish"
  },
  {
    id: "6",
    holiday: "Eid al-Fitr",
    meaning: "Islamic celebration marking the end of Ramadan fasting month",
    category: "Islamic"
  },
  {
    id: "7",
    holiday: "Eid al-Adha",
    meaning: "Islamic festival of sacrifice commemorating Abraham's willingness to sacrifice his son",
    category: "Islamic"
  },
  {
    id: "8",
    holiday: "Valentine's Day",
    meaning: "Day dedicated to romantic love and affection between intimate companions",
    category: "Cultural"
  },
  {
    id: "9",
    holiday: "April Fool's Day",
    meaning: "Day of practical jokes, pranks, and hoaxes in many countries",
    category: "Cultural"
  },
  {
    id: "10",
    holiday: "Mother's Day",
    meaning: "Day honoring mothers, motherhood, maternal bonds, and mothers' influence in society",
    category: "Cultural"
  },
  {
    id: "11",
    holiday: "Father's Day",
    meaning: "Day celebrating fatherhood, paternal bonds, and fathers' influence in society",
    category: "Cultural"
  },
  {
    id: "12",
    holiday: "Halloween",
    meaning: "Ancient Celtic festival now celebrated with costumes, trick-or-treating, and spooky themes",
    category: "Cultural"
  },
  {
    id: "13",
    holiday: "Bonfire Night",
    meaning: "British commemoration of Guy Fawkes' failed Gunpowder Plot to blow up Parliament",
    category: "British Historical"
  },
  {
    id: "14",
    holiday: "Remembrance Day",
    meaning: "Memorial day honoring military personnel who died in service to their country",
    category: "Memorial"
  },
  {
    id: "15",
    holiday: "Christmas Eve",
    meaning: "Evening before Christmas Day, traditionally a time of preparation and anticipation",
    category: "Christian"
  },
  {
    id: "16",
    holiday: "Christmas Day",
    meaning: "Christian celebration of the birth of Jesus Christ and gift-giving",
    category: "Christian"
  },
  {
    id: "17",
    holiday: "Boxing Day",
    meaning: "British tradition of giving gifts to service workers and the less fortunate",
    category: "British Cultural"
  },
  {
    id: "18",
    holiday: "Hogmanay",
    meaning: "Scottish celebration of New Year's Eve with unique traditions and customs",
    category: "Scottish Cultural"
  }
];

interface HolidayMeaningsMatchingProps {
  userId: string;
}

export default function HolidayMeaningsMatching({ userId }: HolidayMeaningsMatchingProps) {
  const [selectedHoliday, setSelectedHoliday] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [feedback, setFeedback] = useState<{ holidayId: string; meaningId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());

  const categories = ["All", ...Array.from(new Set(holidayMeaningData.map(item => item.category)))];
  
  const filteredData = selectedCategory === "All" 
    ? holidayMeaningData 
    : holidayMeaningData.filter(item => item.category === selectedCategory);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: HolidayMeaningPair[], seed: number) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const randomIndex = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  };

  // Create separate shuffled arrays for holidays and meanings columns
  const shuffledHolidays = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 1000);
  }, [filteredData, shuffleSeed]);

  const shuffledMeanings = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 7309 + 1234);
  }, [filteredData, shuffleSeed]);

  // Helper functions
  const getButtonStatus = (itemId: string, side: 'holiday' | 'meaning') => {
    const matchState = matches[itemId];
    const isSelected = side === 'holiday' ? selectedHoliday === itemId : selectedMeaning === itemId;
    const isMatched = matchState === 'correct';
    const isIncorrect = matchState === 'incorrect';
    const isRecentMatch = recentCorrectMatches.has(itemId);

    return {
      isSelected,
      isMatched,
      isIncorrect,
      isRecentMatch
    };
  };

  const handleHolidaySelect = (holidayId: string) => {
    if (matches[holidayId] === 'correct') return;
    
    if (selectedHoliday === holidayId) {
      setSelectedHoliday(null);
    } else {
      setSelectedHoliday(holidayId);
      if (selectedMeaning) {
        checkMatch(holidayId, selectedMeaning);
      }
    }
  };

  const handleMeaningSelect = (meaningId: string) => {
    if (matches[meaningId] === 'correct') return;
    
    if (selectedMeaning === meaningId) {
      setSelectedMeaning(null);
    } else {
      setSelectedMeaning(meaningId);
      if (selectedHoliday) {
        checkMatch(selectedHoliday, meaningId);
      }
    }
  };

  const checkMatch = (holidayId: string, meaningId: string) => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = holidayId === meaningId;
    
    if (isCorrect) {
      // Celebrate individual correct match immediately
      celebrateWithTheme('holidays');
      
      setMatches(prev => ({
        ...prev,
        [holidayId]: 'correct'
      }));
      setScore(prev => {
        const newScore = prev + 1;
        // Check if game is complete  
        if (newScore === filteredData.length) {
          setTimeout(() => celebrateGameComplete(), 500);
        }
        return newScore;
      });
      
      // Add to recent matches for animation
      setRecentCorrectMatches(prev => new Set([...Array.from(prev), holidayId]));
      
      // Remove from recent matches after animation
      setTimeout(() => {
        setRecentCorrectMatches(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(holidayId);
          return newSet;
        });
      }, 1000);
      
      setFeedback({ holidayId, meaningId, correct: true });
    } else {
      setMatches(prev => ({
        ...prev,
        [holidayId]: 'incorrect',
        [meaningId]: 'incorrect'
      }));
      setFeedback({ holidayId, meaningId, correct: false });
      
      // Clear incorrect state after showing feedback
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          if (newMatches[holidayId] === 'incorrect') delete newMatches[holidayId];
          if (newMatches[meaningId] === 'incorrect') delete newMatches[meaningId];
          return newMatches;
        });
      }, 1500);
    }
    
    setSelectedHoliday(null);
    setSelectedMeaning(null);
    
    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetGame = () => {
    setSelectedHoliday(null);
    setSelectedMeaning(null);
    setMatches({});
    setFeedback(null);
    setScore(0);
    setAttempts(0);
    setShuffleSeed(Math.random());
    setRecentCorrectMatches(new Set());
  };

  const correctMatches = Object.values(matches).filter(match => match === 'correct').length;
  const isGameComplete = correctMatches === filteredData.length;
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  // Sort matched items to bottom
  const sortItems = (items: HolidayMeaningPair[]) => {
    const matched = items.filter(item => matches[item.id] === 'correct');
    const unmatched = items.filter(item => matches[item.id] !== 'correct');
    return [...unmatched, ...matched];
  };

  const sortedHolidays = sortItems(shuffledHolidays);
  const sortedMeanings = sortItems(shuffledMeanings);

  const getCategoryColor = (category: string) => {
    // Use only 4 base colors for better consistency and contrast
    switch (category) {
      case "Christian":
      case "Memorial":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700";
      case "Islamic":
      case "Hindu/Sikh":
      case "Sikh":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700";
      case "Jewish":
      case "Cultural":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700";
      case "British Historical":
      case "British Cultural":
      case "Scottish Cultural":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700";
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Holiday Meanings Matching Game
              </h3>
            </div>
            <Button onClick={resetGame} variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <RotateCcw className="h-4 w-4" />
              Reset Game
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Score: {score}/{filteredData.length}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Attempts: {attempts}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Accuracy: {accuracy}%
            </Badge>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by category:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${
                    selectedCategory === category 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Match each UK holiday with its meaning and significance. Learn about diverse cultural and religious celebrations.
          </p>
        </div>

        {feedback && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            feedback.correct 
              ? 'bg-green-50 text-green-900 border border-green-300 dark:bg-green-900/20 dark:text-green-100 dark:border-green-600' 
              : 'bg-red-50 text-red-900 border border-red-300 dark:bg-red-900/20 dark:text-red-100 dark:border-red-600'
          }`}>
            {feedback.correct ? (
              <span className="text-2xl">🎉</span>
            ) : (
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className="font-medium">
              {feedback.correct ? 'Perfect match! 🎯' : 'Incorrect match. Try again!'}
            </span>
          </div>
        )}

        {isGameComplete && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-600 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h4 className="text-xl font-bold text-green-900 dark:text-green-100">
                Congratulations!
              </h4>
            </div>
            <p className="text-green-800 dark:text-green-200">
              You've successfully matched all holidays with their meanings!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              Final Score: {score}/{filteredData.length} | Accuracy: {accuracy}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holidays Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-purple-700 dark:text-purple-300">
              UK Holidays ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedHolidays.map((item) => {
                const status = getButtonStatus(item.id, 'holiday');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleHolidaySelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative flex items-center
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-base truncate pr-2">{item.holiday}</div>
                        <Badge variant="outline" className={`text-xs shrink-0 ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    {status.isMatched && (
                      <Check className="absolute top-2 right-2 h-5 w-5 text-green-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Meanings Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-violet-700 dark:text-violet-300">  
              Holiday Meanings ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedMeanings.map((item) => {
                const status = getButtonStatus(item.id, 'meaning');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleMeaningSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative flex items-center text-wrap
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full h-full flex items-center pr-8">
                      <div className="font-medium text-sm leading-normal" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        hyphens: 'auto',
                        lineHeight: '1.4',
                        maxHeight: 'none'
                      }}>
                        {item.meaning}
                      </div>
                    </div>
                    {status.isMatched && (
                      <Check className="absolute top-2 right-2 h-5 w-5 text-green-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}