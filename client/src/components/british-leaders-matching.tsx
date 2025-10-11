import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Crown, Check, X } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";

interface LeaderData {
  id: string;
  name: string;
  achievement: string;
  year: string;
  category: 'Medieval' | 'Tudor' | 'Stuart' | 'Hanoverian' | 'Modern' | 'Contemporary';
  era: string;
}

const leadersData: LeaderData[] = [
  {
    id: "1",
    name: "William the Conqueror",
    achievement: "Norman Conquest of England",
    year: "1066",
    category: "Medieval",
    era: "Norman"
  },
  {
    id: "2", 
    name: "King John",
    achievement: "Signed Magna Carta",
    year: "1215",
    category: "Medieval",
    era: "Plantagenet"
  },
  {
    id: "3",
    name: "Henry VIII",
    achievement: "English Reformation & Break from Rome",
    year: "1534",
    category: "Tudor",
    era: "Renaissance"
  },
  {
    id: "4",
    name: "Elizabeth I",
    achievement: "Defeated Spanish Armada",
    year: "1588",
    category: "Tudor",
    era: "Golden Age"
  },
  {
    id: "5",
    name: "James I (VI of Scotland)",
    achievement: "Union of English and Scottish Crowns",
    year: "1603",
    category: "Stuart",
    era: "Early Modern"
  },
  {
    id: "6",
    name: "Charles I",
    achievement: "English Civil War Execution",
    year: "1649",
    category: "Stuart",
    era: "Civil War"
  },
  {
    id: "7",
    name: "Oliver Cromwell",
    achievement: "Established Commonwealth Republic",
    year: "1649",
    category: "Stuart",
    era: "Commonwealth"
  },
  {
    id: "8",
    name: "George III",
    achievement: "American Revolutionary War Loss",
    year: "1783",
    category: "Hanoverian",
    era: "Georgian"
  },
  {
    id: "9",
    name: "Queen Victoria",
    achievement: "British Empire Peak & Industrial Revolution",
    year: "1837-1901",
    category: "Hanoverian",
    era: "Victorian"
  },
  {
    id: "10",
    name: "George VI",
    achievement: "Led Britain Through World War II",
    year: "1939-1945",
    category: "Modern",
    era: "20th Century"
  },
  {
    id: "11",
    name: "Winston Churchill",
    achievement: "Prime Minister During WWII Victory",
    year: "1940-1945",
    category: "Modern",
    era: "20th Century"
  },
  {
    id: "12",
    name: "Margaret Thatcher",
    achievement: "First Female Prime Minister",
    year: "1979",
    category: "Contemporary",
    era: "Modern"
  },
  {
    id: "13",
    name: "Elizabeth II",
    achievement: "Longest Reigning British Monarch",
    year: "1952-2022",
    category: "Contemporary",
    era: "Modern"
  },
  {
    id: "14",
    name: "Edward VII",
    achievement: "Edwardian Era & Entente Cordiale",
    year: "1904",
    category: "Modern",
    era: "Edwardian"
  },
  {
    id: "15",
    name: "Tony Blair",
    achievement: "Good Friday Agreement & Peace in Northern Ireland",
    year: "1998",
    category: "Contemporary",
    era: "Modern"
  }
];

interface BritishLeadersMatchingProps {
  userId: string;
}

export default function BritishLeadersMatching({ userId }: BritishLeadersMatchingProps) {
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ leaderId: string; achievementId: string; yearId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());

  const categories = ['all', 'Medieval', 'Tudor', 'Stuart', 'Hanoverian', 'Modern', 'Contemporary'];

  const filteredData = leadersData.filter(leader => {
    const categoryMatch = filterCategory === 'all' || leader.category === filterCategory;
    return categoryMatch;
  });

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: LeaderData[], seed: number) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const randomIndex = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  };

  // Create separate shuffled arrays for each column
  const shuffledLeaders = shuffleArray(filteredData, shuffleSeed * 1000);
  const shuffledAchievements = shuffleArray(filteredData, shuffleSeed * 7309 + 1234);
  const shuffledYears = shuffleArray(filteredData, shuffleSeed * 4567 + 7890);

  // Helper functions
  const getButtonStatus = (itemId: string, side: 'leader' | 'achievement' | 'year') => {
    const matchState = matches[itemId];
    const isSelected = side === 'leader' ? selectedLeader === itemId : 
                      side === 'achievement' ? selectedAchievement === itemId : 
                      selectedYear === itemId;
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

  const handleLeaderSelect = (leaderId: string) => {
    if (matches[leaderId] === 'correct') return;
    
    if (selectedLeader === leaderId) {
      setSelectedLeader(null);
    } else {
      setSelectedLeader(leaderId);
      if (selectedAchievement && selectedYear) {
        checkMatch(leaderId, selectedAchievement, selectedYear);
      }
    }
  };

  const handleAchievementSelect = (achievementId: string) => {
    if (matches[achievementId] === 'correct') return;
    
    if (selectedAchievement === achievementId) {
      setSelectedAchievement(null);
    } else {
      setSelectedAchievement(achievementId);
      if (selectedLeader && selectedYear) {
        checkMatch(selectedLeader, achievementId, selectedYear);
      }
    }
  };

  const handleYearSelect = (yearId: string) => {
    if (matches[yearId] === 'correct') return;
    
    if (selectedYear === yearId) {
      setSelectedYear(null);
    } else {
      setSelectedYear(yearId);
      if (selectedLeader && selectedAchievement) {
        checkMatch(selectedLeader, selectedAchievement, yearId);
      }
    }
  };

  const checkMatch = (leaderId: string, achievementId: string, yearId: string) => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = leaderId === achievementId && achievementId === yearId;
    
    if (isCorrect) {
      // Celebrate individual correct match immediately
      celebrateWithTheme('royal');
      
      setMatches(prev => ({
        ...prev,
        [leaderId]: 'correct'
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
      setRecentCorrectMatches(prev => new Set([...Array.from(prev), leaderId]));
      
      // Remove from recent matches after animation
      setTimeout(() => {
        setRecentCorrectMatches(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(leaderId);
          return newSet;
        });
      }, 1000);
      
      setFeedback({ leaderId, achievementId, yearId, correct: true });
    } else {
      setMatches(prev => ({
        ...prev,
        [leaderId]: 'incorrect',
        [achievementId]: 'incorrect',
        [yearId]: 'incorrect'
      }));
      setFeedback({ leaderId, achievementId, yearId, correct: false });
      
      // Clear incorrect state after showing feedback
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          if (newMatches[leaderId] === 'incorrect') delete newMatches[leaderId];
          if (newMatches[achievementId] === 'incorrect') delete newMatches[achievementId];
          if (newMatches[yearId] === 'incorrect') delete newMatches[yearId];
          return newMatches;
        });
      }, 1500);
    }
    
    setSelectedLeader(null);
    setSelectedAchievement(null);
    setSelectedYear(null);
    
    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetGame = () => {
    setSelectedLeader(null);
    setSelectedAchievement(null);
    setSelectedYear(null);
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
  const sortItems = (items: LeaderData[]) => {
    const matched = items.filter(item => matches[item.id] === 'correct');
    const unmatched = items.filter(item => matches[item.id] !== 'correct');
    return [...unmatched, ...matched];
  };

  const sortedLeaders = sortItems(shuffledLeaders);
  const sortedAchievements = sortItems(shuffledAchievements);
  const sortedYears = sortItems(shuffledYears);

  const getCategoryColor = (category: string) => {
    // Use only 4 base colors for better consistency and contrast
    switch (category) {
      case "Medieval":
      case "Tudor":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700";
      case "Stuart":
      case "Hanoverian":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700";
      case "Modern":
      case "Contemporary":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700";
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-600 rounded-lg flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                British Leaders Triple Match
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by era:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  variant={filterCategory === category ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${
                    filterCategory === category 
                      ? "bg-amber-600 hover:bg-amber-700 text-white" 
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  }`}
                >
                  {category === 'all' ? 'All Eras' : category}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Match each British leader with their achievement and year. Learn about the influential figures who shaped British history.
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
              {feedback.correct ? 'Royal match achieved! 👑🎯' : 'Not quite right. Try again!'}
            </span>
          </div>
        )}

        {isGameComplete && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check className="h-6 w-6 text-green-600" />
              <h4 className="text-xl font-bold text-green-800 dark:text-green-200">
                Royal Mastery Achieved!
              </h4>
            </div>
            <p className="text-green-700 dark:text-green-300">
              You've successfully matched all British leaders with their achievements and years!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Final Score: {score}/{filteredData.length} | Accuracy: {accuracy}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaders Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-amber-700 dark:text-amber-300">
              British Leaders ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedLeaders.map((item) => {
                const status = getButtonStatus(item.id, 'leader');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleLeaderSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative flex flex-col justify-center
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-base truncate pr-2">{item.name}</div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.era}
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

          {/* Achievements Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-yellow-700 dark:text-yellow-300">
              Achievements ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedAchievements.map((item) => {
                const status = getButtonStatus(item.id, 'achievement');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleAchievementSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative overflow-hidden
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full h-full flex flex-col justify-center pr-8">
                      <div className="font-semibold text-base mb-1">{item.achievement}</div>
                    </div>
                    {status.isMatched && (
                      <Check className="absolute top-2 right-2 h-5 w-5 text-green-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Years Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-lime-700 dark:text-lime-300">
              Years ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedYears.map((item) => {
                const status = getButtonStatus(item.id, 'year');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleYearSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative flex flex-col justify-center
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full text-center">
                      <div className="font-bold text-lg">{item.year}</div>
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