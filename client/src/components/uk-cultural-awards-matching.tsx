import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, RotateCcw, Info } from "lucide-react";
import confetti from 'canvas-confetti';

interface CulturalAwardPair {
  id: string;
  award: string;
  category: string;
  description: string;
  significance: string;
  frequency: string;
}

const culturalAwardData: CulturalAwardPair[] = [
  {
    id: "1",
    award: "Laurence Olivier Awards",
    category: "Theatre",
    description: "Prestigious awards recognizing excellence in London theatre",
    significance: "Highest honor in British theatre, named after legendary actor",
    frequency: "Annual"
  },
  {
    id: "2",
    award: "BRIT Awards",
    category: "Music",
    description: "Britain's premier music industry awards ceremony",
    significance: "Celebrates best of British and international music",
    frequency: "Annual"
  },
  {
    id: "3",
    award: "Turner Prize",
    category: "Art",
    description: "Award for outstanding contribution to contemporary art",
    significance: "Most prestigious art prize in Britain, named after J.M.W. Turner",
    frequency: "Annual"
  },
  {
    id: "4",
    award: "Booker Prize",
    category: "Literature",
    description: "Leading literary award for fiction written in English",
    significance: "Most prestigious fiction prize in the English-speaking world",
    frequency: "Annual"
  },
  {
    id: "5",
    award: "Mercury Prize",
    category: "Album",
    description: "Award for best album from the UK and Ireland",
    significance: "Recognizes artistic achievement regardless of commercial success",
    frequency: "Annual"
  },
  {
    id: "6",
    award: "Nobel Literature Prize",
    category: "Literature",
    description: "International prize for outstanding work in literature",
    significance: "Recent British winners include Seamus Heaney, Harold Pinter",
    frequency: "Annual"
  },
  {
    id: "7",
    award: "Edinburgh Festival Fringe",
    category: "Performance",
    description: "World's largest arts festival featuring comedy, theatre, and more",
    significance: "Launch pad for many successful careers in entertainment",
    frequency: "Annual"
  },
  {
    id: "8",
    award: "National Eisteddfod of Wales",
    category: "Welsh Culture",
    description: "Annual celebration of Welsh language, literature, music and performance",
    significance: "Most important cultural event in Wales, promotes Welsh heritage",
    frequency: "Annual"
  },
  {
    id: "9",
    award: "BAFTA Awards",
    category: "Film & Television",
    description: "British Academy Film and Television Arts awards",
    significance: "Britain's equivalent to the Oscars and Emmys",
    frequency: "Annual"
  },
  {
    id: "10",
    award: "Royal Television Society Awards",
    category: "Television",
    description: "Recognition of excellence in television production",
    significance: "Honors innovation and excellence in British broadcasting",
    frequency: "Annual"
  },
  {
    id: "11",
    award: "The Guardian First Book Award",
    category: "Literature",
    description: "Prize for debut novels by new British and Irish authors",
    significance: "Supports emerging literary talent",
    frequency: "Annual"
  },
  {
    id: "12",
    award: "Stirling Prize",
    category: "Architecture",
    description: "UK's most prestigious architecture award",
    significance: "Recognizes buildings that make greatest contribution to British architecture",
    frequency: "Annual"
  },
  {
    id: "13",
    award: "Critics' Circle Theatre Awards",
    category: "Theatre",
    description: "Awards from London theatre critics for excellence in drama",
    significance: "Professional recognition from theatre critics",
    frequency: "Annual"
  },
  {
    id: "14",
    award: "British Comedy Awards",
    category: "Comedy",
    description: "Celebration of the best in British comedy",
    significance: "Recognition of Britain's strong comedy tradition",
    frequency: "Annual"
  },
  {
    id: "15",
    award: "Royal Academy Summer Exhibition",
    category: "Art",
    description: "Annual open exhibition of contemporary art",
    significance: "World's largest open submission exhibition",
    frequency: "Annual"
  }
];

const categoryColors = {
  // Use only 4 base colors for better consistency and contrast
  "Theatre": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700",
  "Music": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700",
  "Art": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700",
  "Literature": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700",
  "Album": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700",
  "Performance": "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700",
  "Welsh Culture": "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700",
  "Film & Television": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700",
  "Television": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700",
  "Architecture": "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700",
  "Comedy": "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700"
};

const celebrateWithTheme = (theme: string) => {
  const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors
  });
};

export default function UKCulturalAwardsMatching({ userId }: { userId: string }) {
  const [selectedAward, setSelectedAward] = useState<CulturalAwardPair | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CulturalAwardPair | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showReference, setShowReference] = useState(false);

  const categories = ["All", ...Array.from(new Set(culturalAwardData.map(item => item.category)))];

  const getFilteredData = () => {
    if (categoryFilter === "All") return culturalAwardData;
    return culturalAwardData.filter(item => item.category === categoryFilter);
  };

  const filteredData = getFilteredData();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledAwards] = useState(() => shuffleArray(filteredData));
  const [shuffledCategories] = useState(() => shuffleArray(filteredData));

  const resetGame = () => {
    setSelectedAward(null);
    setSelectedCategory(null);
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  const getButtonStatus = (itemId: string, type: 'award' | 'category') => {
    const isMatched = matchedItems.has(itemId);
    const isSelected = type === 'award' ? selectedAward?.id === itemId : selectedCategory?.id === itemId;
    const isIncorrect = incorrectAttempts.has(itemId);
    const isRecentMatch = isMatched && matchedItems.has(itemId);
    
    return { isMatched, isSelected, isIncorrect, isRecentMatch };
  };

  const handleAwardSelect = (award: CulturalAwardPair) => {
    if (matchedItems.has(award.id)) return;
    setSelectedAward(award);
    setIncorrectAttempts(new Set());
  };

  const handleCategorySelect = (category: CulturalAwardPair) => {
    if (matchedItems.has(category.id)) return;
    setSelectedCategory(category);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedAward && selectedCategory) {
      setAttempts(prev => prev + 1);
      
      if (selectedAward.id === selectedCategory.id) {
        // Correct match!
        celebrateWithTheme('cultural');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedAward.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('cultural'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedAward.id, selectedCategory.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedAward(null);
        setSelectedCategory(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedAward, selectedCategory, matchedItems.size, filteredData.length]);

  const sortedAwards = [...shuffledAwards.filter(item => !matchedItems.has(item.id)), 
                      ...shuffledAwards.filter(item => matchedItems.has(item.id))];
  const sortedCategories = [...shuffledCategories.filter(item => !matchedItems.has(item.id)), 
                           ...shuffledCategories.filter(item => matchedItems.has(item.id))];

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
            <Award className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            UK Cultural Awards Matching Challenge
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Match British cultural awards with their categories. Learn about prestigious honors in theatre, music, literature, and the arts.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category:</label>
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setCategoryFilter(category)}
              variant={categoryFilter === category ? "default" : "outline"}
              size="sm"
              className={`text-xs ${
                categoryFilter === category 
                  ? "bg-violet-600 hover:bg-violet-700 text-white" 
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowReference(!showReference)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            {showReference ? "Hide" : "Show"} Awards Reference
          </Button>
          <Button
            onClick={resetGame}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Game
          </Button>
        </div>
      </div>

      {/* Reference Panel */}
      {showReference && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">UK Cultural Awards Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {culturalAwardData.map((award) => (
                <div key={award.id} className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm">{award.award}</h4>
                  <Badge className={`text-xs mb-2 ${categoryColors[award.category as keyof typeof categoryColors]}`}>
                    {award.category}
                  </Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{award.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{award.significance}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{score}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Correct Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{attempts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{accuracy}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{filteredData.length - matchedItems.size}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Complete Message */}
      {gameComplete && (
        <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
              🎉 Congratulations! You've mastered UK Cultural Awards!
            </h3>
            <p className="text-green-700 dark:text-green-400">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Awards Column */}
        <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-violet-700 dark:text-violet-300">
              British Cultural Awards ({filteredData.length})
            </h4>
          <div className="space-y-2">
            {sortedAwards.map((item) => {
              const status = getButtonStatus(item.id, 'award');
              return (
                <Button
                  key={item.id}
                  onClick={() => handleAwardSelect(item)}
                  disabled={status.isMatched}
                    className={`
                    w-full p-4 h-20 text-left transition-all duration-300 relative flex flex-col justify-center
                    ${status.isMatched 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-300 dark:border-green-600' 
                      : status.isSelected
                      ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700 shadow-lg'
                      : status.isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                    }
                    ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                  `}
                >
                  <div className="font-medium text-sm">{item.award}</div>
                  <div className="text-xs opacity-75">{item.frequency}</div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Categories Column */}
        <div>
            <h4 className="text-lg font-semibold mb-4 text-center text-fuchsia-700 dark:text-fuchsia-300">
              Award Categories ({filteredData.length})
            </h4>
          <div className="space-y-2">
            {sortedCategories.map((item) => {
              const status = getButtonStatus(item.id, 'category');
              return (
                <Button
                  key={item.id}
                  onClick={() => handleCategorySelect(item)}
                  disabled={status.isMatched}
                    className={`
                    w-full p-4 h-20 text-left transition-all duration-300 relative flex flex-col justify-center
                    ${status.isMatched 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-300 dark:border-green-600' 
                      : status.isSelected
                      ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700 shadow-lg'
                      : status.isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                    }
                    ${status.isRecentMatch ? 'animate-pulse ring-2 ring-green-400' : ''}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${categoryColors[item.category as keyof typeof categoryColors]}`}>
                      {item.category}
                    </Badge>
                  </div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">How to Play:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Click one award from the left column and one category from the right column</li>
            <li>• Correct matches turn green and move to the bottom</li>
            <li>• Incorrect matches briefly turn red - try again!</li>
            <li>• Use category filters to focus on specific types of awards</li>
            <li>• Check the reference panel to learn about each award's significance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}