import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, RotateCcw, Calendar } from "lucide-react";
import { celebrateGameComplete, celebrateWithTheme } from "@/lib/confetti";

interface UKAgeRule {
  id: string;
  activity: string;
  age: string;
  category: string;
  details: string;
}

const ukAgeRulesData: UKAgeRule[] = [
  {
    id: "1",
    activity: "Get National Insurance Number (NINO)",
    age: "16 years old",
    category: "Employment",
    details: "Automatically sent before 16th birthday for work eligibility"
  },
  {
    id: "2", 
    activity: "Drive a moped (up to 50cc)",
    age: "16 years old",
    category: "Transport",
    details: "With provisional licence and after passing CBT test"
  },
  {
    id: "3",
    activity: "Drive a car",
    age: "17 years old",
    category: "Transport", 
    details: "With provisional licence, must pass theory and practical tests"
  },
  {
    id: "4",
    activity: "Buy alcohol in shops/supermarkets",
    age: "18 years old",
    category: "Legal Rights",
    details: "Can buy beer/wine at 16 with meal in hotel/restaurant with adult"
  },
  {
    id: "5",
    activity: "Buy alcohol in hotel/restaurant with meal and adult",
    age: "16 years old", 
    category: "Legal Rights",
    details: "Only beer, wine or cider with meal when accompanied by adult"
  },
  {
    id: "6",
    activity: "Betting and National Lottery",
    age: "18 years old",
    category: "Gambling",
    details: "All forms of gambling including lottery tickets and scratch cards"
  },
  {
    id: "7",
    activity: "Vote in elections",
    age: "18 years old",
    category: "Civic Duties",
    details: "General elections, local elections, and referendums"
  },
  {
    id: "8",
    activity: "Stand for public office (general)",
    age: "18 years old",
    category: "Civic Duties", 
    details: "Most elected positions except certain restrictions"
  },
  {
    id: "9",
    activity: "Stand for office (armed forces exception)",
    age: "18 years old",
    category: "Civic Duties",
    details: "Active armed forces personnel cannot stand for Parliament"
  },
  {
    id: "10",
    activity: "Stand for office (criminal conviction exception)",
    age: "18 years old", 
    category: "Civic Duties",
    details: "Certain criminal convictions disqualify from standing"
  },
  {
    id: "11",
    activity: "Stand for office (civil servant exception)",
    age: "18 years old",
    category: "Civic Duties",
    details: "Senior civil servants must resign before standing"
  },
  {
    id: "12",
    activity: "Free TV licence",
    age: "Over 75 years old",
    category: "Benefits",
    details: "Free TV licence for households where everyone is over 75"
  }
];

interface UKAgesMatchingProps {
  userId: string;
}

export default function UKAgesMatching({ userId }: UKAgesMatchingProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [feedback, setFeedback] = useState<{ activityId: string; ageId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());

  const categories = ["All", ...Array.from(new Set(ukAgeRulesData.map(item => item.category)))];
  
  const filteredData = selectedCategory === "All" 
    ? ukAgeRulesData 
    : ukAgeRulesData.filter(item => item.category === selectedCategory);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: UKAgeRule[], seed: number) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const randomIndex = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledActivities = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed);
  }, [filteredData, shuffleSeed]);

  const shuffledAges = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 1337);
  }, [filteredData, shuffleSeed]);

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(selectedActivity === activityId ? null : activityId);
    if (selectedAge && selectedActivity !== activityId) {
      checkMatch(activityId, selectedAge);
    }
  };

  const handleAgeSelect = (ageId: string) => {
    setSelectedAge(selectedAge === ageId ? null : ageId);
    if (selectedActivity && selectedAge !== ageId) {
      checkMatch(selectedActivity, ageId);
    }
  };

  const checkMatch = (activityId: string, ageId: string) => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = activityId === ageId;
    
    if (isCorrect) {
      // Celebrate individual correct match immediately
      celebrateWithTheme('ages');
      
      setMatches(prev => ({
        ...prev,
        [activityId]: 'correct'
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
      setRecentCorrectMatches(prev => new Set([...Array.from(prev), activityId]));
      
      // Remove from recent matches after animation
      setTimeout(() => {
        setRecentCorrectMatches(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(activityId);
          return newSet;
        });
      }, 1000);
      
      setFeedback({ activityId, ageId, correct: true });
    } else {
      setMatches(prev => ({
        ...prev,
        [activityId]: 'incorrect',
        [ageId]: 'incorrect'
      }));
      setFeedback({ activityId, ageId, correct: false });
      
      // Clear incorrect state after showing feedback
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          if (newMatches[activityId] === 'incorrect') delete newMatches[activityId];
          if (newMatches[ageId] === 'incorrect') delete newMatches[ageId];
          return newMatches;
        });
      }, 1500);
    }
    
    setSelectedActivity(null);
    setSelectedAge(null);
    
    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetGame = () => {
    setSelectedActivity(null);  
    setSelectedAge(null);
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
  const sortItems = (items: UKAgeRule[]) => {
    const matched = items.filter(item => matches[item.id] === 'correct');
    const unmatched = items.filter(item => matches[item.id] !== 'correct');
    return [...unmatched, ...matched];
  };

  const sortedActivities = sortItems(shuffledActivities);
  const sortedAges = sortItems(shuffledAges);

  const getButtonStatus = (itemId: string, type: 'activity' | 'age') => {
    const matchStatus = matches[itemId];
    const isSelected = type === 'activity' ? selectedActivity === itemId : selectedAge === itemId;
    const isMatched = matchStatus === 'correct';
    const isIncorrect = matchStatus === 'incorrect';
    const isRecentMatch = recentCorrectMatches.has(itemId);
    
    return { isSelected, isMatched, isIncorrect, isRecentMatch };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Employment": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Transport": return "bg-green-100 text-green-800 border-green-200";
      case "Legal Rights": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Gambling": return "bg-red-100 text-red-800 border-red-200";
      case "Civic Duties": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Benefits": return "bg-teal-100 text-teal-800 border-teal-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-cyan-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                UK Age Requirements Matching Game
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
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Match each legal activity with the correct age requirement in the UK. Learn about important age milestones for citizenship and daily life.
          </p>
        </div>

        {feedback && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            feedback.correct 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {feedback.correct ? (
              <span className="text-2xl">🎉</span>
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">
              {feedback.correct ? 'Perfect age match! 📅🎯' : 'Incorrect age. Try again!'}
            </span>
          </div>
        )}

        {isGameComplete && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check className="h-6 w-6 text-green-600" />
              <h4 className="text-xl font-bold text-green-800 dark:text-green-200">
                Age Requirements Mastered!
              </h4>
            </div>
            <p className="text-green-700 dark:text-green-300">
              You've successfully matched all UK age requirements with their activities!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Final Score: {score}/{filteredData.length} | Accuracy: {accuracy}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activities Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-cyan-700 dark:text-cyan-300">
              Legal Activities ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedActivities.map((item) => {
                const status = getButtonStatus(item.id, 'activity');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleActivitySelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-auto text-left transition-all duration-300 relative flex flex-col justify-start
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full">
                      <div className="font-semibold text-base mb-2">{item.activity}</div>
                      <div className="text-sm opacity-75 mb-2 line-clamp-2">{item.details}</div>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    </div>
                    {status.isMatched && (
                      <Check className="absolute top-2 right-2 h-5 w-5 text-green-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Ages Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-teal-700 dark:text-teal-300">
              Age Requirements ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedAges.map((item) => {
                const status = getButtonStatus(item.id, 'age');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleAgeSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-auto text-left transition-all duration-300 relative flex flex-col justify-center
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        {item.age}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
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