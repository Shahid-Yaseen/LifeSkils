import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X, Trophy } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";

interface SportsAchievementPair {
  id: string;
  athlete: string;
  achievement: string;
  sport: string;
  era: string;
}

const sportsAchievementData: SportsAchievementPair[] = [
  {
    id: "1",
    athlete: "Sir Mo Farah",
    achievement: "Four-time Olympic gold medalist in long-distance running (5000m and 10000m)",
    sport: "Athletics",
    era: "Modern"
  },
  {
    id: "2",
    athlete: "Sir Andy Murray",
    achievement: "Three-time Grand Slam champion and two-time Olympic tennis gold medalist",
    sport: "Tennis",
    era: "Modern"
  },
  {
    id: "3",
    athlete: "Dame Jessica Ennis-Hill",
    achievement: "Olympic heptathlon champion and three-time world champion",
    sport: "Athletics",
    era: "Modern"
  },
  {
    id: "4",
    athlete: "Sir Chris Hoy",
    achievement: "Six-time Olympic cycling gold medalist, most successful British Olympian",
    sport: "Cycling",
    era: "Modern"
  },
  {
    id: "5",
    athlete: "Dame Kelly Holmes",
    achievement: "Double Olympic gold medalist in 800m and 1500m at Athens 2004",
    sport: "Athletics",
    era: "Modern"
  },
  {
    id: "6",
    athlete: "Sir Steve Redgrave",
    achievement: "Five consecutive Olympic rowing gold medals from 1984 to 2000",
    sport: "Rowing",
    era: "Modern"
  },
  {
    id: "7",
    athlete: "Sir Bobby Charlton",
    achievement: "1966 World Cup winner and Manchester United legend with 249 goals",
    sport: "Football",
    era: "Classic"
  },
  {
    id: "8",
    athlete: "Sir Geoff Hurst",
    achievement: "Only player to score hat-trick in World Cup final (1966 vs West Germany)",
    sport: "Football",
    era: "Classic"
  },
  {
    id: "9",
    athlete: "Dame Laura Kenny",
    achievement: "Most successful female British Olympian with five cycling gold medals",
    sport: "Cycling",
    era: "Modern"
  },
  {
    id: "10",
    athlete: "Sir Bradley Wiggins",
    achievement: "First Briton to win Tour de France and eight-time Olympic medalist",
    sport: "Cycling",
    era: "Modern"
  },
  {
    id: "11",
    athlete: "Dame Sarah Storey",
    achievement: "Britain's most successful Paralympian with 17 gold medals in swimming and cycling",
    sport: "Paralympics",
    era: "Modern"
  },
  {
    id: "12",
    athlete: "Sir Lewis Hamilton",
    achievement: "Seven-time Formula 1 World Champion, joint-record with Michael Schumacher",
    sport: "Formula 1",
    era: "Modern"
  },
  {
    id: "13",
    athlete: "Dame Virginia Wade",
    achievement: "Wimbledon singles champion 1977 and three-time Grand Slam winner",
    sport: "Tennis",
    era: "Classic"
  },
  {
    id: "14",
    athlete: "Sir Nick Faldo",
    achievement: "Six-time major golf champion including three Masters and three Open Championships",
    sport: "Golf",
    era: "Classic"
  },
  {
    id: "15",
    athlete: "Dame Tanni Grey-Thompson",
    achievement: "Eleven Paralympic gold medals in wheelchair racing and marathon world record holder",
    sport: "Paralympics",
    era: "Modern"
  },
  {
    id: "16",
    athlete: "Sir Ian Botham",
    achievement: "Cricket all-rounder with 5,200 runs and 383 wickets in Test matches",
    sport: "Cricket",
    era: "Classic"
  },
  {
    id: "17",
    athlete: "Jonny Wilkinson",
    achievement: "Scored winning drop goal in 2003 Rugby World Cup final for England",
    sport: "Rugby",
    era: "Modern"
  },
  {
    id: "18",
    athlete: "Sir AP McCoy",
    achievement: "Champion jockey 20 consecutive times with over 4,300 career wins",
    sport: "Horse Racing",
    era: "Modern"
  }
];

interface SportsAchievementsMatchingProps {
  userId: string;
}

export default function SportsAchievementsMatching({ userId }: SportsAchievementsMatchingProps) {
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [selectedEra, setSelectedEra] = useState<string>("All");
  const [feedback, setFeedback] = useState<{ athleteId: string; achievementId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());

  const sports = ["All", ...Array.from(new Set(sportsAchievementData.map(item => item.sport)))];
  const eras = ["All", ...Array.from(new Set(sportsAchievementData.map(item => item.era)))];
  
  const filteredData = sportsAchievementData.filter(item => {
    const sportMatch = selectedSport === "All" || item.sport === selectedSport;
    const eraMatch = selectedEra === "All" || item.era === selectedEra;
    return sportMatch && eraMatch;
  });

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: SportsAchievementPair[], seed: number) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const randomIndex = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  };

  // Create separate shuffled arrays for athletes and achievements columns
  const shuffledAthletes = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 1000);
  }, [filteredData, shuffleSeed]);

  const shuffledAchievements = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 7309 + 1234);
  }, [filteredData, shuffleSeed]);

  // Helper functions
  const getButtonStatus = (itemId: string, side: 'athlete' | 'achievement') => {
    const matchState = matches[itemId];
    const isSelected = side === 'athlete' ? selectedAthlete === itemId : selectedAchievement === itemId;
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

  const handleAthleteSelect = (athleteId: string) => {
    if (matches[athleteId] === 'correct') return;
    
    if (selectedAthlete === athleteId) {
      setSelectedAthlete(null);
    } else {
      setSelectedAthlete(athleteId);
      if (selectedAchievement) {
        checkMatch(athleteId, selectedAchievement);
      }
    }
  };

  const handleAchievementSelect = (achievementId: string) => {
    if (matches[achievementId] === 'correct') return;
    
    if (selectedAchievement === achievementId) {
      setSelectedAchievement(null);
    } else {
      setSelectedAchievement(achievementId);
      if (selectedAthlete) {
        checkMatch(selectedAthlete, achievementId);
      }
    }
  };

  const checkMatch = (athleteId: string, achievementId: string) => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = athleteId === achievementId;
    
    if (isCorrect) {
      // Celebrate individual correct match immediately
      celebrateWithTheme('sports');
      
      setMatches(prev => ({
        ...prev,
        [athleteId]: 'correct'
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
      setRecentCorrectMatches(prev => new Set([...Array.from(prev), athleteId]));
      
      // Remove from recent matches after animation
      setTimeout(() => {
        setRecentCorrectMatches(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(athleteId);
          return newSet;
        });
      }, 1000);
      
      setFeedback({ athleteId, achievementId, correct: true });
    } else {
      setMatches(prev => ({
        ...prev,
        [athleteId]: 'incorrect',
        [achievementId]: 'incorrect'
      }));
      setFeedback({ athleteId, achievementId, correct: false });
      
      // Clear incorrect state after showing feedback
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          if (newMatches[athleteId] === 'incorrect') delete newMatches[athleteId];
          if (newMatches[achievementId] === 'incorrect') delete newMatches[achievementId];
          return newMatches;
        });
      }, 1500);
    }
    
    setSelectedAthlete(null);
    setSelectedAchievement(null);
    
    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetGame = () => {
    setSelectedAthlete(null);
    setSelectedAchievement(null);
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
  const sortItems = (items: SportsAchievementPair[]) => {
    const matched = items.filter(item => matches[item.id] === 'correct');
    const unmatched = items.filter(item => matches[item.id] !== 'correct');
    return [...unmatched, ...matched];
  };

  const sortedAthletes = sortItems(shuffledAthletes);
  const sortedAchievements = sortItems(shuffledAchievements);

  const getSportColor = (sport: string) => {
    // Use only 3 base colors for better consistency and contrast
    switch (sport) {
      case "Athletics":
      case "Cycling":
      case "Rowing":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700";
      case "Tennis":
      case "Golf":
      case "Cricket":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700";
      case "Football":
      case "Rugby":
      case "Formula 1":
      case "Horse Racing":
        return "bg-slate-100  text-slate-300 border-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-700";
      case "Paralympics":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getEraColor = (era: string) => {
    // Use neutral colors for better contrast and consistency
    switch (era) {
      case "Modern": return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-700";
      case "Classic": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700";
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sports Achievements Matching Game
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

          {/* Filters */}
          <div className="mb-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by sport:</p>
              <div className="flex flex-wrap gap-2">
                {sports.map(sport => (
                  <Button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    variant={selectedSport === sport ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${
                      selectedSport === sport 
                        ? "bg-orange-600 hover:bg-orange-700 text-white" 
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    {sport}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by era:</p>
              <div className="flex flex-wrap gap-2">
                {eras.map(era => (
                  <Button
                    key={era}
                    onClick={() => setSelectedEra(era)}
                    variant={selectedEra === era ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${
                      selectedEra === era 
                        ? "bg-orange-600 hover:bg-orange-700 text-white" 
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    {era}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Match each British sports champion with their greatest achievement. Learn about legendary athletes who have made Britain proud.
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
              {feedback.correct ? 'Outstanding achievement match! 🏆🎯' : 'Incorrect match. Try again!'}
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
              You've successfully matched all British sports champions with their achievements!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              Final Score: {score}/{filteredData.length} | Accuracy: {accuracy}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Athletes Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-orange-700 dark:text-orange-300">
              British Sports Champions ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedAthletes.map((item) => {
                const status = getButtonStatus(item.id, 'athlete');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleAthleteSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-28 text-left text-white transition-all duration-300 relative flex flex-col justify-center
                      ${status.isMatched 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-300 dark:border-green-600' 
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
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-base truncate pr-2">{item.athlete}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={`text-xs ${getSportColor(item.sport)}`}>
                          {item.sport}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getEraColor(item.era)}`}>
                          {item.era}
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

          {/* Achievements Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-amber-700 dark:text-amber-300">
              Sports Achievements ({filteredData.length})
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
                      w-full p-4 h-28 text-left transition-all text-white duration-300 relative overflow-hidden
                      ${status.isMatched 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-300 dark:border-green-600' 
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
                        {item.achievement}
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