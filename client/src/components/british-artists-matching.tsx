import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X, Palette } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";

interface BritishArtist {
  id: string;
  artist: string;
  artForm: string;
  period: string;
  details: string;
}

const britishArtistsData: BritishArtist[] = [
  {
    id: "1",
    artist: "Thomas Gainsborough",
    artForm: "Portrait and Landscape Painting",
    period: "18th Century",
    details: "Famous for elegant portraits and romantic landscapes like 'The Blue Boy'"
  },
  {
    id: "2",
    artist: "David Allan",
    artForm: "Genre and Historical Painting",
    period: "18th Century", 
    details: "Scottish painter known for scenes of everyday life and historical subjects"
  },
  {
    id: "3",
    artist: "J.M.W. Turner",
    artForm: "Romantic Landscape Painting",
    period: "19th Century",
    details: "Master of light and atmosphere, precursor to Impressionism"
  },
  {
    id: "4",
    artist: "John Constable",
    artForm: "Naturalist Landscape Painting",
    period: "19th Century",
    details: "Famous for countryside scenes like 'The Hay Wain' and cloud studies"
  },
  {
    id: "5",
    artist: "Pre-Raphaelites",
    artForm: "Romantic Revival Painting",
    period: "19th Century",
    details: "Brotherhood rejecting academic art, focusing on medieval and literary themes"
  },
  {
    id: "6",
    artist: "John Lavery",
    artForm: "Portrait and Society Painting",
    period: "Late 19th/Early 20th Century",
    details: "Belfast-born painter famous for society portraits and tennis scenes"
  },
  {
    id: "7",
    artist: "Henry Moore",
    artForm: "Modern Sculpture",
    period: "20th Century",
    details: "Known for abstract bronze sculptures and reclining figures"
  },
  {
    id: "8",
    artist: "John Petts",
    artForm: "Stained Glass and Printmaking",
    period: "20th Century",
    details: "Welsh artist renowned for church stained glass windows and wood engravings"
  },
  {
    id: "9",
    artist: "Lucian Freud",
    artForm: "Figurative Painting",
    period: "20th/21st Century",
    details: "Known for psychologically intense portraits and nude studies"
  },
  {
    id: "10",
    artist: "David Hockney",
    artForm: "Pop Art and Digital Art",
    period: "Contemporary",
    details: "Famous for pool paintings, photo collages, and iPad art"
  }
];

interface BritishArtistsMatchingProps {
  userId: string;
}

export default function BritishArtistsMatching({ userId }: BritishArtistsMatchingProps) {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedArtForm, setSelectedArtForm] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [feedback, setFeedback] = useState<{ artistId: string; artFormId: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(Math.random());
  const [recentCorrectMatches, setRecentCorrectMatches] = useState<Set<string>>(new Set());

  const periods = ["All", ...Array.from(new Set(britishArtistsData.map(item => item.period)))];
  
  const filteredData = britishArtistsData.filter(item => {
    const periodMatch = selectedPeriod === "All" || item.period === selectedPeriod;
    return periodMatch;
  });

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: BritishArtist[], seed: number) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const randomIndex = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  };

  // Create separate shuffled arrays for artists and art forms columns
  const shuffledArtists = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 1000);
  }, [filteredData, shuffleSeed]);

  const shuffledArtForms = useMemo(() => {
    return shuffleArray(filteredData, shuffleSeed * 7309 + 1234);
  }, [filteredData, shuffleSeed]);

  // Helper functions
  const getButtonStatus = (itemId: string, side: 'artist' | 'artForm') => {
    const matchState = matches[itemId];
    const isSelected = side === 'artist' ? selectedArtist === itemId : selectedArtForm === itemId;
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

  const handleArtistSelect = (artistId: string) => {
    if (matches[artistId] === 'correct') return;
    
    if (selectedArtist === artistId) {
      setSelectedArtist(null);
    } else {
      setSelectedArtist(artistId);
      if (selectedArtForm) {
        checkMatch(artistId, selectedArtForm);
      }
    }
  };

  const handleArtFormSelect = (artFormId: string) => {
    if (matches[artFormId] === 'correct') return;
    
    if (selectedArtForm === artFormId) {
      setSelectedArtForm(null);
    } else {
      setSelectedArtForm(artFormId);
      if (selectedArtist) {
        checkMatch(selectedArtist, artFormId);
      }
    }
  };

  const checkMatch = (artistId: string, artFormId: string) => {
    setAttempts(prev => prev + 1);
    
    const isCorrect = artistId === artFormId;
    
    if (isCorrect) {
      // Celebrate individual correct match immediately
      celebrateWithTheme('art');
      
      setMatches(prev => ({
        ...prev,
        [artistId]: 'correct'
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
      setRecentCorrectMatches(prev => new Set([...Array.from(prev), artistId]));
      
      // Remove from recent matches after animation
      setTimeout(() => {
        setRecentCorrectMatches(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(artistId);
          return newSet;
        });
      }, 1000);
      
      setFeedback({ artistId, artFormId, correct: true });
    } else {
      setMatches(prev => ({
        ...prev,
        [artistId]: 'incorrect',
        [artFormId]: 'incorrect'
      }));
      setFeedback({ artistId, artFormId, correct: false });
      
      // Clear incorrect state after showing feedback
      setTimeout(() => {
        setMatches(prev => {
          const newMatches = { ...prev };
          if (newMatches[artistId] === 'incorrect') delete newMatches[artistId];
          if (newMatches[artFormId] === 'incorrect') delete newMatches[artFormId];
          return newMatches;
        });
      }, 1500);
    }
    
    setSelectedArtist(null);
    setSelectedArtForm(null);
    
    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetGame = () => {
    setSelectedArtist(null);
    setSelectedArtForm(null);
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
  const sortItems = (items: BritishArtist[]) => {
    const matched = items.filter(item => matches[item.id] === 'correct');
    const unmatched = items.filter(item => matches[item.id] !== 'correct');
    return [...unmatched, ...matched];
  };

  const sortedArtists = sortItems(shuffledArtists);
  const sortedArtForms = sortItems(shuffledArtForms);

  const getPeriodColor = (period: string) => {
    // Use only 4 base colors for better consistency and contrast
    switch (period) {
      case "18th Century":
      case "19th Century":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700";
      case "Late 19th/Early 20th Century":
      case "20th Century":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700";
      case "20th/21st Century":
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
              <div className="w-6 h-6 bg-pink-600 rounded-lg flex items-center justify-center">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                British Artists Matching Game
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

          {/* Period Filter */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by period:</p>
            <div className="flex flex-wrap gap-2">
              {periods.map(period => (
                <Button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${
                    selectedPeriod === period 
                      ? "bg-pink-600 hover:bg-pink-700 text-white" 
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  }`}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Match each British artist with their primary art form. Learn about the rich artistic heritage that has shaped British culture.
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
              {feedback.correct ? 'Beautiful artistic match! 🎨🎯' : 'Not quite right. Try again!'}
            </span>
          </div>
        )}

        {isGameComplete && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check className="h-6 w-6 text-green-600" />
              <h4 className="text-xl font-bold text-green-800 dark:text-green-200">
                Artistic Mastery Achieved!
              </h4>
            </div>
            <p className="text-green-700 dark:text-green-300">
              You've successfully matched all British artists with their art forms!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Final Score: {score}/{filteredData.length} | Accuracy: {accuracy}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artists Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-pink-700 dark:text-pink-300">
              British Artists ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedArtists.map((item) => {
                const status = getButtonStatus(item.id, 'artist');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleArtistSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative flex flex-col justify-center
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700'
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
                        <div className="font-semibold text-base truncate pr-2">{item.artist}</div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPeriodColor(item.period)}`}>
                        {item.period}
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

          {/* Art Forms Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-rose-700 dark:text-rose-300">
              Art Forms ({filteredData.length})
            </h4>
            <div className="space-y-2">
              {sortedArtForms.map((item) => {
                const status = getButtonStatus(item.id, 'artForm');
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleArtFormSelect(item.id)}
                    disabled={status.isMatched}
                    className={`
                      w-full p-4 h-24 text-left transition-all duration-300 relative overflow-hidden
                      ${status.isMatched 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                        : status.isSelected
                        ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700'
                        : status.isIncorrect
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                      }
                      ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                    `}
                    variant="outline"
                  >
                    <div className="w-full h-full flex flex-col justify-center pr-8">
                      <div className="font-semibold text-base mb-1">{item.artForm}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                        {item.details}
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