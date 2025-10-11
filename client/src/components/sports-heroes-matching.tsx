import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X, Trophy } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";

interface SportsHero {
  id: string;
  name: string;
  sport: string;
  achievement: string;
}

const sportsHeroesData: SportsHero[] = [
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
    achievement: "Five consecutive Olympic gold medals (1984-2000)"
  },
  {
    id: "12",
    name: "Dame Sarah Storey",
    sport: "Paralympic Cycling",
    achievement: "Britain's most successful Paralympian with 17 gold medals"
  },
  {
    id: "13",
    name: "David Weir",
    sport: "Paralympic Athletics",
    achievement: "Six Paralympic gold medals in wheelchair racing"
  },
  {
    id: "14",
    name: "Ellie Simmonds",
    sport: "Paralympic Swimming",
    achievement: "Five Paralympic gold medals in swimming"
  },
  {
    id: "15",
    name: "Sir Francis Chichester",
    sport: "Sailing",
    achievement: "First person to sail solo around the world via Cape Horn"
  },
  {
    id: "16",
    name: "Sir Robin Knox-Johnston",
    sport: "Sailing",
    achievement: "First person to sail solo non-stop around the world"
  },
  {
    id: "17",
    name: "Dame Ellen MacArthur",
    sport: "Sailing",
    achievement: "Held world record for fastest solo sailing around the world"
  },
  {
    id: "18",
    name: "Sir Chris Hoy",
    sport: "Cycling",
    achievement: "Six-time Olympic cycling gold medalist"
  },
  {
    id: "19",
    name: "Sir Bradley Wiggins",
    sport: "Cycling",
    achievement: "First Briton to win Tour de France and eight Olympic medals"
  },
  {
    id: "20",
    name: "Dame Jessica Ennis-Hill",
    sport: "Athletics",
    achievement: "Olympic heptathlon champion and three-time world champion"
  },
  {
    id: "21",
    name: "Sir Andy Murray",
    sport: "Tennis",
    achievement: "Three-time Grand Slam champion and two-time Olympic gold medalist"
  }
];

interface SportsHeroesMatchingProps {
  userId: string;
}

export default function SportsHeroesMatching({ userId }: SportsHeroesMatchingProps) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [feedback, setFeedback] = useState<{ heroId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: SportsHero[], seed: number) => {
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
  const shuffledNames = useMemo(() => {
    return shuffleArray(sportsHeroesData, shuffleSeed * 1000);
  }, [shuffleSeed]);

  const shuffledSports = useMemo(() => {
    return shuffleArray(sportsHeroesData, shuffleSeed * 7309 + 1234);
  }, [shuffleSeed]);

  const shuffledAchievements = useMemo(() => {
    return shuffleArray(sportsHeroesData, shuffleSeed * 3141 + 5678);
  }, [shuffleSeed]);

  // Helper functions
  const getButtonStatus = (itemId: string, column: 'name' | 'sport' | 'achievement') => {
    const matchState = matches[itemId];
    const isSelected = 
      column === 'name' ? selectedName === itemId :
      column === 'sport' ? selectedSport === itemId :
      selectedAchievement === itemId;
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

  const handleNameSelect = (heroId: string) => {
    if (matches[heroId] === 'correct') return;
    
    if (selectedName === heroId) {
      setSelectedName(null);
    } else {
      setSelectedName(heroId);
      if (selectedSport && selectedAchievement) {
        checkMatch(heroId, selectedSport, selectedAchievement);
      }
    }
  };

  const handleSportSelect = (heroId: string) => {
    if (matches[heroId] === 'correct') return;
    
    if (selectedSport === heroId) {
      setSelectedSport(null);
    } else {
      setSelectedSport(heroId);
      if (selectedName && selectedAchievement) {
        checkMatch(selectedName, heroId, selectedAchievement);
      }
    }
  };

  const handleAchievementSelect = (heroId: string) => {
    if (matches[heroId] === 'correct') return;
    
    if (selectedAchievement === heroId) {
      setSelectedAchievement(null);
    } else {
      setSelectedAchievement(heroId);
      if (selectedName && selectedSport) {
        checkMatch(selectedName, selectedSport, heroId);
      }
    }
  };

  const checkMatch = (nameId: string, sportId: string, achievementId: string) => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = nameId === sportId && sportId === achievementId;
    
    if (isCorrect) {
      // Celebrate individual correct match immediately
      celebrateWithTheme('sports');
      
      setMatches(prev => ({
        ...prev,
        [nameId]: 'correct'
      }));
      setScore(prev => {
        const newScore = prev + 1;
        // Check if game is complete
        if (newScore === sportsHeroesData.length) {
          setTimeout(() => celebrateGameComplete(), 500);
        }
        return newScore;
      });
      
      // Add to recent matches for animation
      setRecentCorrectMatches(prev => new Set([...Array.from(prev), nameId]));
      
      // Remove from recent matches after animation
      setTimeout(() => {
        setRecentCorrectMatches(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(nameId);
          return newSet;
        });
      }, 1000);
      
      setFeedback({ heroId: nameId, correct: true });
    } else {
      setMatches(prev => ({
        ...prev,
        [nameId]: 'incorrect',
        [sportId]: 'incorrect',
        [achievementId]: 'incorrect'
      }));
      setFeedback({ heroId: nameId, correct: false });
      
      // Clear incorrect state after showing feedback
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          if (newMatches[nameId] === 'incorrect') delete newMatches[nameId];
          if (newMatches[sportId] === 'incorrect') delete newMatches[sportId];
          if (newMatches[achievementId] === 'incorrect') delete newMatches[achievementId];
          return newMatches;
        });
      }, 1500);
    }
    
    setSelectedName(null);
    setSelectedSport(null);
    setSelectedAchievement(null);
    
    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetGame = () => {
    setSelectedName(null);
    setSelectedSport(null);
    setSelectedAchievement(null);
    setMatches({});
    setFeedback(null);
    setScore(0);
    setAttempts(0);
    setShuffleSeed(Math.random());
    setRecentCorrectMatches(new Set());
  };

  const correctMatches = Object.values(matches).filter(match => match === 'correct').length;
  const isGameComplete = correctMatches === sportsHeroesData.length;
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  // Sort matched items to bottom
  const sortItems = (items: SportsHero[]) => {
    const matched = items.filter(item => matches[item.id] === 'correct');
    const unmatched = items.filter(item => matches[item.id] !== 'correct');
    return [...unmatched, ...matched];
  };

  const sortedNames = sortItems(shuffledNames);
  const sortedSports = sortItems(shuffledSports);
  const sortedAchievements = sortItems(shuffledAchievements);

  const getSportColor = (sport: string) => {
    switch (sport) {
      case "Athletics": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
      case "Tennis": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
      case "Cycling": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";
      case "Football": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      case "Cricket": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
      case "Formula 1": return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700";
      case "Rowing": return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700";
      case "Ice Skating": return "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700";
      case "Sailing": return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700";
      case "Paralympic Cycling": return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700";
      case "Paralympic Athletics": return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700";
      case "Paralympic Swimming": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600";
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardContent className="p-6 dark:bg-gray-800 bg-gray-200">
        <div className="mb-6 ">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sports Heroes Triple Match Challenge
              </h3>
            </div>
            <Button onClick={resetGame} variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <RotateCcw className="h-4 w-4" />
              Reset Game
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Score: {score}/{sportsHeroesData.length}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Attempts: {attempts}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Accuracy: {accuracy}%
            </Badge>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Match each British sports hero with their sport and greatest achievement. Select one item from each column to make a complete match. All three must be correct!
          </p>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">How to Play:</h4>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Select one name from the first column</li>
              <li>• Select the matching sport from the second column</li>
              <li>• Select the matching achievement from the third column</li>
              <li>• All three selections must match the same person to be correct</li>
              <li>• Correct matches turn green and move to the bottom</li>
            </ul>
          </div>
        </div>

        {feedback && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            feedback.correct 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {feedback.correct ? (
              <span className="text-2xl">🎉</span>
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">
              {feedback.correct ? 'Amazing triple match! 🏆🎯' : 'Not a complete match. Try again!'}
            </span>
          </div>
        )}

        {isGameComplete && (
          <div className="mb-6 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check className="h-6 w-6 text-emerald-600" />
              <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                Outstanding Performance!
              </h4>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300">
              You've successfully matched all British sports heroes with their sports and achievements!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              Final Score: {score}/{sportsHeroesData.length} | Accuracy: {accuracy}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Names Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-orange-700 dark:text-orange-300">
              Sports Heroes ({sportsHeroesData.length})
            </h4>
            <div className="space-y-2">
              {sortedNames.map((hero) => {
                const status = getButtonStatus(hero.id, 'name');
                return (
                  <Button
                    key={hero.id}
                    onClick={() => handleNameSelect(hero.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-16 text-left transition-all duration-300 relative flex items-center
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="font-semibold text-base pr-8">{hero.name}</div>
                    {status.isMatched && (
                      <Check className="absolute right-2 h-5 w-5 text-green-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sports Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-amber-700 dark:text-amber-300">
              Sports ({sportsHeroesData.length})
            </h4>
            <div className="space-y-2">
              {sortedSports.map((hero) => {
                const status = getButtonStatus(hero.id, 'sport');
                return (
                  <Button
                    key={hero.id}
                    onClick={() => handleSportSelect(hero.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-16 text-left transition-all duration-300 relative flex items-center justify-between
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-base">{hero.sport}</div>
                      <Badge variant="outline" className={`text-xs ${getSportColor(hero.sport)}`}>
                        Sport
                      </Badge>
                    </div>
                    {status.isMatched && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Achievements Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-emerald-700 dark:text-emerald-300">
              Achievements ({sportsHeroesData.length})
            </h4>
            <div className="space-y-2">
              {sortedAchievements.map((hero) => {
                const status = getButtonStatus(hero.id, 'achievement');
                return (
                  <Button
                    key={hero.id}
                    onClick={() => handleAchievementSelect(hero.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-16 text-left transition-all duration-300 relative overflow-hidden
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full h-full flex items-center pr-8">
                      <div className="font-medium text-sm leading-tight" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        hyphens: 'auto',
                        lineHeight: '1.3'
                      }}>
                        {hero.achievement}
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