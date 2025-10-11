import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, RotateCcw, Info } from "lucide-react";
import confetti from 'canvas-confetti';

interface CountryTripleData {
  id: string;
  country: string;
  capital: string;
  patronSaint: string;
  saintsDay: string;
  symbol: string;
  flag: string;
  majorCities: string;
  category: string;
}

const countryData: CountryTripleData[] = [
  {
    id: "1",
    country: "England",
    capital: "London",
    patronSaint: "St. George",
    saintsDay: "23 April",
    symbol: "Rose",
    flag: "George's Cross",
    majorCities: "Birmingham, Liverpool, Manchester",
    category: "Country"
  },
  {
    id: "2",
    country: "Scotland",
    capital: "Edinburgh",
    patronSaint: "St. Andrew",
    saintsDay: "30 November",
    symbol: "Thistle",
    flag: "Andrew's Cross",
    majorCities: "Glasgow, Dundee, Aberdeen",
    category: "Country"
  },
  {
    id: "3",
    country: "Wales",
    capital: "Cardiff",
    patronSaint: "St. David",
    saintsDay: "1 March",
    symbol: "Daffodil",
    flag: "Not on Union Jack",
    majorCities: "Swansea, Newport",
    category: "Country"
  },
  {
    id: "4",
    country: "Northern Ireland",
    capital: "Belfast",
    patronSaint: "St. Patrick",
    saintsDay: "17 March (holiday)",
    symbol: "Shamrock",
    flag: "Patrick's Cross",
    majorCities: "Derry/Londonderry, Lisburn",
    category: "Country"
  },
  {
    id: "5",
    country: "London",
    capital: "England's Capital",
    patronSaint: "Political Center",
    saintsDay: "Seat of Westminster",
    symbol: "Big Ben & Tower",
    flag: "Houses Parliament",
    majorCities: "Greater London, City of London",
    category: "Capital City"
  },
  {
    id: "6",
    country: "Edinburgh",
    capital: "Scotland's Capital",
    patronSaint: "Historic Center",
    saintsDay: "Royal Mile & Castle",
    symbol: "Castle & Festival",
    flag: "Scottish Parliament",
    majorCities: "Old Town, New Town",
    category: "Capital City"
  },
  {
    id: "7",
    country: "Cardiff",
    capital: "Wales' Capital",
    patronSaint: "Cultural Hub",
    saintsDay: "Senedd & Bay",
    symbol: "Castle & Dragon",
    flag: "Welsh Assembly",
    majorCities: "Cardiff Bay, City Centre",
    category: "Capital City"
  },
  {
    id: "8",
    country: "Belfast",
    capital: "N. Ireland's Capital",
    patronSaint: "Peace Process",
    saintsDay: "Stormont Assembly",
    symbol: "Titanic Quarter",
    flag: "City Hall",
    majorCities: "Queen's Quarter, Titanic Quarter",
    category: "Capital City"
  },
  {
    id: "9",
    country: "St. George",
    capital: "England's Patron",
    patronSaint: "Dragon Slayer",
    saintsDay: "April 23rd",
    symbol: "Red Cross",
    flag: "White Background",
    majorCities: "Legendary Figure",
    category: "Patron Saint"
  },
  {
    id: "10",
    country: "St. Andrew",
    capital: "Scotland's Patron",
    patronSaint: "Fisherman Apostle",
    saintsDay: "November 30th",
    symbol: "X-Cross (Saltire)",
    flag: "Blue & White",
    majorCities: "Biblical Figure",
    category: "Patron Saint"
  },
  {
    id: "11",
    country: "St. David",
    capital: "Wales' Patron",
    patronSaint: "Welsh Bishop",
    saintsDay: "March 1st",
    symbol: "Daffodils Worn",
    flag: "Red Dragon",
    majorCities: "6th Century Saint",
    category: "Patron Saint"
  },
  {
    id: "12",
    country: "St. Patrick",
    capital: "Ireland's Patron",
    patronSaint: "Snake Banisher",
    saintsDay: "March 17th (Holiday)",
    symbol: "Shamrock & Green",
    flag: "Irish Heritage",
    majorCities: "5th Century Missionary",
    category: "Patron Saint"
  },
  {
    id: "13",
    country: "Rose",
    capital: "England's Symbol",
    patronSaint: "Tudor Dynasty",
    saintsDay: "Wars of Roses",
    symbol: "Red & White",
    flag: "Royal Emblem",
    majorCities: "National Flower",
    category: "National Symbol"
  },
  {
    id: "14",
    country: "Thistle",
    capital: "Scotland's Symbol",
    patronSaint: "Prickly Defense",
    saintsDay: "Highland Plant",
    symbol: "Purple Flower",
    flag: "Ancient Symbol",
    majorCities: "Protected Scotland",
    category: "National Symbol"
  },
  {
    id: "15",
    country: "Daffodil",
    capital: "Wales' Symbol",
    patronSaint: "Spring Flower",
    saintsDay: "March Blooming",
    symbol: "Yellow Trumpet",
    flag: "Welsh Pride",
    majorCities: "St. David's Day",
    category: "National Symbol"
  },
  {
    id: "16",
    country: "Shamrock",
    capital: "Ireland's Symbol",
    patronSaint: "Three Leaves",
    saintsDay: "Trinity Symbol",
    symbol: "Green Clover",
    flag: "St. Patrick's Teaching",
    majorCities: "Irish Identity",
    category: "National Symbol"
  },
  {
    id: "17",
    country: "George's Cross",
    capital: "England's Flag",
    patronSaint: "Red Cross",
    saintsDay: "White Field",
    symbol: "Simple Design",
    flag: "Crusader Origin",
    majorCities: "Part of Union Jack",
    category: "Flag Design"
  },
  {
    id: "18",
    country: "Andrew's Cross",
    capital: "Scotland's Flag",
    patronSaint: "White Saltire",
    saintsDay: "Blue Background",
    symbol: "X-Shape Cross",
    flag: "Ancient Banner",
    majorCities: "Part of Union Jack",
    category: "Flag Design"
  }
];

const categoryColors = {
  "Country": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Capital City": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Patron Saint": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  "National Symbol": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Flag Design": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
};

const celebrateWithTheme = (theme: string) => {
  const colors = ['#FF0000', '#FFFFFF', '#0000FF', '#FFFF00', '#008000'];
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors
  });
};

export default function UKConstituentCountriesMatching({ userId }: { userId: string }) {
  const [selectedCountry, setSelectedCountry] = useState<CountryTripleData | null>(null);
  const [selectedCapital, setSelectedCapital] = useState<CountryTripleData | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<CountryTripleData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showReference, setShowReference] = useState(false);

  const categories = ["All", ...Array.from(new Set(countryData.map(item => item.category)))];

  const getFilteredData = () => {
    if (categoryFilter === "All") return countryData;
    return countryData.filter(item => item.category === categoryFilter);
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

  const [shuffledCountries] = useState(() => shuffleArray(filteredData));
  const [shuffledCapitals] = useState(() => shuffleArray(filteredData));
  const [shuffledSymbols] = useState(() => shuffleArray(filteredData));

  const resetGame = () => {
    setSelectedCountry(null);
    setSelectedCapital(null);
    setSelectedSymbol(null);
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  const getButtonStatus = (itemId: string, type: 'country' | 'capital' | 'symbol') => {
    const isMatched = matchedItems.has(itemId);
    const isSelected = type === 'country' ? selectedCountry?.id === itemId 
                     : type === 'capital' ? selectedCapital?.id === itemId 
                     : selectedSymbol?.id === itemId;
    const isIncorrect = incorrectAttempts.has(itemId);
    const isRecentMatch = isMatched && matchedItems.has(itemId);
    
    return { isMatched, isSelected, isIncorrect, isRecentMatch };
  };

  const handleCountryClick = (country: CountryTripleData) => {
    if (matchedItems.has(country.id)) return;
    setSelectedCountry(country);
    setIncorrectAttempts(new Set());
  };

  const handleCapitalClick = (capital: CountryTripleData) => {
    if (matchedItems.has(capital.id)) return;
    setSelectedCapital(capital);
    setIncorrectAttempts(new Set());
  };

  const handleSymbolClick = (symbol: CountryTripleData) => {
    if (matchedItems.has(symbol.id)) return;
    setSelectedSymbol(symbol);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedCountry && selectedCapital && selectedSymbol) {
      setAttempts(prev => prev + 1);
      
      if (selectedCountry.id === selectedCapital.id && 
          selectedCapital.id === selectedSymbol.id) {
        // Correct match!
        celebrateWithTheme('uk');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedCountry.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('uk'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedCountry.id, selectedCapital.id, selectedSymbol.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedCountry(null);
        setSelectedCapital(null);
        setSelectedSymbol(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedCountry, selectedCapital, selectedSymbol, matchedItems.size, filteredData.length]);

  const sortedCountries = [...shuffledCountries.filter(item => !matchedItems.has(item.id)), 
                          ...shuffledCountries.filter(item => matchedItems.has(item.id))];
  const sortedCapitals = [...shuffledCapitals.filter(item => !matchedItems.has(item.id)), 
                         ...shuffledCapitals.filter(item => matchedItems.has(item.id))];
  const sortedSymbols = [...shuffledSymbols.filter(item => !matchedItems.has(item.id)), 
                        ...shuffledSymbols.filter(item => matchedItems.has(item.id))];

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-cyan-600 rounded-lg flex items-center justify-center">
            <Flag className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            UK Constituent Countries Triple Match Challenge
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Match countries with their capitals and symbols. Test your knowledge of UK geography, culture, and national identity.
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
            {showReference ? "Hide" : "Show"} Countries Reference
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
            <CardTitle className="text-lg">UK Constituent Countries Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {countryData.slice(0, 4).map((country) => (
                <div key={country.id} className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm">{country.country}</h4>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>Capital:</strong> {country.capital}</p>
                    <p><strong>Patron Saint:</strong> {country.patronSaint}</p>
                    <p><strong>Saint's Day:</strong> {country.saintsDay}</p>
                    <p><strong>Symbol:</strong> {country.symbol}</p>
                    <p><strong>Flag:</strong> {country.flag}</p>
                    <p><strong>Major Cities:</strong> {country.majorCities}</p>
                  </div>
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
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{score}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Correct Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attempts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{filteredData.length - matchedItems.size}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Complete Message */}
      {gameComplete && (
        <Card className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              🇬🇧 Congratulations! You've mastered UK Constituent Countries!
            </h3>
            <p className="text-emerald-700 dark:text-emerald-400">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Countries Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-cyan-600 rounded flex items-center justify-center">
                <Flag className="h-3 w-3 text-white" />
              </div>
              Countries/Elements ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedCountries.map((country) => (
              <div key={`country-${country.id}`} className="space-y-1">
                <button
                  onClick={() => handleCountryClick(country)}
                  className={`
                    w-full p-3 text-left rounded-lg border transition-all duration-200
                    ${getButtonStatus(country.id, 'country').isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                      : getButtonStatus(country.id, 'country').isSelected
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border-cyan-300'
                      : getButtonStatus(country.id, 'country').isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  disabled={matchedItems.has(country.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{country.country}</div>
                  <Badge className={`text-xs mt-1 ${categoryColors[country.category as keyof typeof categoryColors]}`}>
                    {country.category}
                  </Badge>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Capitals/Details Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Flag className="h-3 w-3 text-white" />
              </div>
              Capitals/Details ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedCapitals.map((capital) => (
              <div key={`capital-${capital.id}`} className="space-y-1">
                <button
                  onClick={() => handleCapitalClick(capital)}
                  className={`
                    w-full p-3 text-left rounded-lg border transition-all duration-200
                    ${getButtonStatus(capital.id, 'capital').isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                      : getButtonStatus(capital.id, 'capital').isSelected
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                      : getButtonStatus(capital.id, 'capital').isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  disabled={matchedItems.has(capital.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{capital.capital}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{capital.saintsDay}</div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Symbols/Flags Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Flag className="h-3 w-3 text-white" />
              </div>
              Symbols/Flags ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedSymbols.map((symbol) => (
              <div key={`symbol-${symbol.id}`} className="space-y-1">
                <button
                  onClick={() => handleSymbolClick(symbol)}
                  className={`
                    w-full p-3 text-left rounded-lg border transition-all duration-200
                    ${getButtonStatus(symbol.id, 'symbol').isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                      : getButtonStatus(symbol.id, 'symbol').isSelected
                      ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 border-violet-300'
                      : getButtonStatus(symbol.id, 'symbol').isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  disabled={matchedItems.has(symbol.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{symbol.symbol}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{symbol.flag}</div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 text-cyan-800 dark:text-cyan-300">How to Play:</h4>
          <ul className="text-sm text-cyan-700 dark:text-cyan-400 space-y-1">
            <li>• Select one item from each column (Countries/Elements, Capitals/Details, Symbols/Flags)</li>
            <li>• All three selections must match the same UK constituent country</li>
            <li>• Correct matches turn emerald and move to the bottom</li>
            <li>• Incorrect matches briefly turn red - try again!</li>
            <li>• Use category filters to focus on specific types of information</li>
            <li>• Check the reference panel to learn about each country's details</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}