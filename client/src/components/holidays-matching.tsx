import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X, Calendar } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";

interface HolidayPair {
  id: string;
  holiday: string;
  date: string;
  description: string;
}

const holidayData: HolidayPair[] = [
  {
    id: "1",
    holiday: "Lent",
    date: "February/March (46 days before Easter)",
    description: "Christian period of fasting and reflection"
  },
  {
    id: "2", 
    holiday: "Easter",
    date: "March/April (First Sunday after first full moon after spring equinox)",
    description: "Christian celebration of Jesus Christ's resurrection"
  },
  {
    id: "3",
    holiday: "Vaisakhi",
    date: "April 13th or 14th",
    description: "Sikh New Year and harvest festival"
  },
  {
    id: "4",
    holiday: "Diwali",
    date: "October/November (5-day festival)",
    description: "Hindu and Sikh festival of lights"
  },
  {
    id: "5",
    holiday: "Hanukkah",
    date: "November/December (8-day festival)",
    description: "Jewish festival of lights"
  },
  {
    id: "6",
    holiday: "Eid al-Fitr",
    date: "End of Ramadan (Date varies each year)",
    description: "Islamic celebration marking end of fasting month"
  },
  {
    id: "7",
    holiday: "Eid al-Adha",
    date: "70 days after Eid al-Fitr (Date varies each year)",
    description: "Islamic festival of sacrifice"
  },
  {
    id: "8",
    holiday: "Valentine's Day",
    date: "February 14th",
    description: "Day of romance and love"
  },
  {
    id: "9",
    holiday: "April Fool's Day",
    date: "April 1st", 
    description: "Day of practical jokes and pranks"
  },
  {
    id: "10",
    holiday: "Mother's Day",
    date: "Fourth Sunday of Lent (March/April)",
    description: "Day to honor mothers and maternal figures"
  },
  {
    id: "11",
    holiday: "Father's Day",
    date: "Third Sunday in June",
    description: "Day to honor fathers and paternal figures"
  },
  {
    id: "12",
    holiday: "Halloween",
    date: "October 31st",
    description: "Ancient Celtic festival, now celebration with costumes"
  },
  {
    id: "13",
    holiday: "Bonfire Night",
    date: "November 5th",
    description: "Commemorates Guy Fawkes and Gunpowder Plot of 1605"
  },
  {
    id: "14",
    holiday: "Remembrance Day",
    date: "November 11th",
    description: "Honors those who died in military service"
  },
  {
    id: "15",
    holiday: "Christmas Eve",
    date: "December 24th",
    description: "Day before Christmas Day"
  },
  {
    id: "16",
    holiday: "Christmas Day",
    date: "December 25th",
    description: "Christian celebration of Jesus Christ's birth"
  },
  {
    id: "17",
    holiday: "Boxing Day",
    date: "December 26th",
    description: "Traditional day for giving gifts to service workers"
  },
  {
    id: "18",
    holiday: "Hogmanay",
    date: "December 31st",
    description: "Scottish New Year's Eve celebration"
  }
];

interface HolidaysMatchingProps {
  userId: string;
}

export default function HolidaysMatching({ userId }: HolidaysMatchingProps) {
  const [selectedHoliday, setSelectedHoliday] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [feedback, setFeedback] = useState<{ holidayId: string; dateId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: HolidayPair[], seed: number) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const randomIndex = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  };

  // Create separate shuffled arrays for holidays and dates columns
  const shuffledHolidays = useMemo(() => {
    return shuffleArray(holidayData, shuffleSeed * 1000);
  }, [shuffleSeed]);

  const shuffledDates = useMemo(() => {
    return shuffleArray(holidayData, shuffleSeed * 7309 + 1234);
  }, [shuffleSeed]);

  // Helper functions
  const getButtonStatus = (itemId: string, side: 'holiday' | 'date') => {
    const matchState = matches[itemId];
    const isSelected = side === 'holiday' ? selectedHoliday === itemId : selectedDate === itemId;
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
      if (selectedDate) {
        checkMatch(holidayId, selectedDate);
      }
    }
  };

  const handleDateSelect = (dateId: string) => {
    if (matches[dateId] === 'correct') return;
    
    if (selectedDate === dateId) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateId);
      if (selectedHoliday) {
        checkMatch(selectedHoliday, dateId);
      }
    }
  };

  const checkMatch = (holidayId: string, dateId: string) => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = holidayId === dateId;
    
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
        if (newScore === holidayData.length) {
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
      
      setFeedback({ holidayId, dateId, correct: true });
    } else {
      setMatches(prev => ({
        ...prev,
        [holidayId]: 'incorrect',
        [dateId]: 'incorrect'
      }));
      setFeedback({ holidayId, dateId, correct: false });
      
      // Clear incorrect state after showing feedback
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          if (newMatches[holidayId] === 'incorrect') delete newMatches[holidayId];
          if (newMatches[dateId] === 'incorrect') delete newMatches[dateId];
          return newMatches;
        });
      }, 1500);
    }
    
    setSelectedHoliday(null);
    setSelectedDate(null);
    
    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetGame = () => {
    setSelectedHoliday(null);
    setSelectedDate(null);
    setMatches({});
    setFeedback(null);
    setScore(0);
    setAttempts(0);
    setShuffleSeed(Math.random());
    setRecentCorrectMatches(new Set());
  };

  const correctMatches = Object.values(matches).filter(match => match === 'correct').length;
  const isGameComplete = correctMatches === holidayData.length;
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  // Sort matched items to bottom
  const sortItems = (items: HolidayPair[]) => {
    const matched = items.filter(item => matches[item.id] === 'correct');
    const unmatched = items.filter(item => matches[item.id] !== 'correct');
    return [...unmatched, ...matched];
  };

  const sortedHolidays = sortItems(shuffledHolidays);
  const sortedDates = sortItems(shuffledDates);

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                UK Holidays Matching Game
              </h3>
            </div>
            <Button onClick={resetGame} variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <RotateCcw className="h-4 w-4" />
              Reset Game
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Score: {score}/{holidayData.length}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Attempts: {attempts}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Accuracy: {accuracy}%
            </Badge>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Match each UK holiday with its correct celebration date. Click one holiday and one date to make a match.
          </p>
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
              {feedback.correct ? 'Perfect match! 🎯' : 'Incorrect match. Try again!'}
            </span>
          </div>
        )}

        {isGameComplete && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check className="h-6 w-6 text-green-600" />
              <h4 className="text-xl font-bold text-green-800 dark:text-green-200">
                Congratulations!
              </h4>
            </div>
            <p className="text-green-700 dark:text-green-300">
              You've successfully matched all UK holidays with their celebration dates!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Final Score: {score}/{holidayData.length} | Accuracy: {accuracy}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holidays Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-green-700 dark:text-green-300">
              UK Holidays ({holidayData.length})
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
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-base">{item.holiday}</div>
                      <div className="text-sm opacity-75 mt-1 line-clamp-2">{item.description}</div>
                    </div>
                    {status.isMatched && (
                      <Check className="absolute top-2 right-2 h-5 w-5 text-green-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Dates Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-emerald-700 dark:text-emerald-300">
              Celebration Dates ({holidayData.length})
            </h4>
            <div className="space-y-2">
              {sortedDates.map((item) => {
                const status = getButtonStatus(item.id, 'date');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleDateSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative flex items-center
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm leading-5 overflow-hidden h-16" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        hyphens: 'auto'
                      }}>
                        {item.date}
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