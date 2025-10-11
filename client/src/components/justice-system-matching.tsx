import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Scale, Filter } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface JusticeData {
  id: string;
  region: string;
  court: string;
  jurisdiction: string;
  category: 'Criminal' | 'Civil' | 'Family' | 'Appeal' | 'Supreme' | 'Tribunal';
  level: 'Magistrates' | 'Crown' | 'County' | 'High' | 'Sheriff' | 'Court of Session' | 'Supreme Court' | 'Tribunal';
}

const justiceSystemData: JusticeData[] = [
  // England & Wales - Criminal Courts
  {
    id: "1",
    region: "England & Wales",
    court: "Magistrates' Court",
    jurisdiction: "Minor criminal offences, youth cases, preliminary hearings",
    category: "Criminal",
    level: "Magistrates"
  },
  {
    id: "2",
    region: "England & Wales", 
    court: "Crown Court",
    jurisdiction: "Serious criminal offences, appeals from Magistrates' Court",
    category: "Criminal",
    level: "Crown"
  },
  {
    id: "3",
    region: "England & Wales",
    court: "Court of Appeal (Criminal Division)",
    jurisdiction: "Appeals from Crown Court criminal cases",
    category: "Appeal",
    level: "High"
  },

  // England & Wales - Civil Courts
  {
    id: "4",
    region: "England & Wales",
    court: "County Court",
    jurisdiction: "Civil disputes, debt recovery, housing, personal injury under £100k",
    category: "Civil",
    level: "County"
  },
  {
    id: "5",
    region: "England & Wales",
    court: "High Court (Queen's Bench Division)",
    jurisdiction: "High-value civil claims, judicial review, commercial disputes",
    category: "Civil",
    level: "High"
  },
  {
    id: "6",
    region: "England & Wales",
    court: "High Court (Chancery Division)",
    jurisdiction: "Business law, insolvency, intellectual property, probate",
    category: "Civil",
    level: "High"
  },
  {
    id: "7",
    region: "England & Wales",
    court: "High Court (Family Division)",
    jurisdiction: "Complex family matters, child protection, international family law",
    category: "Family",
    level: "High"
  },
  {
    id: "8",
    region: "England & Wales",
    court: "Court of Appeal (Civil Division)",
    jurisdiction: "Appeals from High Court and County Court civil cases",
    category: "Appeal",
    level: "High"
  },

  // Scotland - Criminal Courts
  {
    id: "9",
    region: "Scotland",
    court: "Justice of the Peace Court",
    jurisdiction: "Minor criminal offences, traffic violations, breach of peace",
    category: "Criminal",
    level: "Magistrates"
  },
  {
    id: "10",
    region: "Scotland",
    court: "Sheriff Court (Summary)",
    jurisdiction: "Criminal cases, less serious offences tried by Sheriff alone",
    category: "Criminal",
    level: "Sheriff"
  },
  {
    id: "11",
    region: "Scotland",
    court: "Sheriff Court (Solemn)",
    jurisdiction: "Serious criminal cases tried by Sheriff with jury",
    category: "Criminal",
    level: "Sheriff"
  },
  {
    id: "12",
    region: "Scotland",
    court: "High Court of Justiciary",
    jurisdiction: "Most serious crimes (murder, rape), appeals from Sheriff Courts",
    category: "Criminal",
    level: "High"
  },

  // Scotland - Civil Courts
  {
    id: "13",
    region: "Scotland",
    court: "Sheriff Court (Civil)",
    jurisdiction: "Civil disputes, debt recovery, family matters, housing disputes",
    category: "Civil",
    level: "Sheriff"
  },
  {
    id: "14",
    region: "Scotland",
    court: "Court of Session (Outer House)",
    jurisdiction: "High-value civil cases, judicial review, commercial disputes",
    category: "Civil",
    level: "Court of Session"
  },
  {
    id: "15",
    region: "Scotland",
    court: "Court of Session (Inner House)",
    jurisdiction: "Appeals from Sheriff Court and Outer House civil cases",
    category: "Appeal",
    level: "Court of Session"
  },

  // Northern Ireland - Criminal Courts
  {
    id: "16",
    region: "Northern Ireland",
    court: "Magistrates' Court",
    jurisdiction: "Summary criminal offences, preliminary hearings, youth court",
    category: "Criminal",
    level: "Magistrates"
  },
  {
    id: "17",
    region: "Northern Ireland",
    court: "Crown Court",
    jurisdiction: "Serious criminal offences on indictment, appeals from Magistrates",
    category: "Criminal",
    level: "Crown"
  },
  {
    id: "18",
    region: "Northern Ireland",
    court: "Court of Appeal",
    jurisdiction: "Criminal and civil appeals from Crown Court and High Court",
    category: "Appeal",
    level: "High"
  },

  // Northern Ireland - Civil Courts
  {
    id: "19",
    region: "Northern Ireland",
    court: "County Court",
    jurisdiction: "Civil disputes, debt recovery, family matters under £30k",
    category: "Civil",
    level: "County"
  },
  {
    id: "20",
    region: "Northern Ireland",
    court: "High Court",
    jurisdiction: "High-value civil claims, judicial review, family division",
    category: "Civil",
    level: "High"
  },

  // UK-wide Supreme Court
  {
    id: "21",
    region: "United Kingdom",
    court: "UK Supreme Court",
    jurisdiction: "Final court of appeal for civil cases, devolution issues, human rights",
    category: "Supreme",
    level: "Supreme Court"
  }
];

interface JusticeSystemMatchingProps {
  userId: string;
}

export default function JusticeSystemMatching({ userId }: JusticeSystemMatchingProps) {
  const [courts, setCourts] = useState<JusticeData[]>([]);
  const [jurisdictions, setJurisdictions] = useState<JusticeData[]>([]);
  const [regions, setRegions] = useState<JusticeData[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<JusticeData | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JusticeData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<JusticeData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);

  const categories = ['all', 'Criminal', 'Civil', 'Family', 'Appeal', 'Supreme', 'Tribunal'];
  const regionFilters = ['all', 'England & Wales', 'Scotland', 'Northern Ireland', 'United Kingdom'];

  const getFilteredData = () => {
    let filtered = justiceSystemData;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    if (filterRegion !== 'all') {
      filtered = filtered.filter(item => item.region === filterRegion);
    }
    
    return filtered;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const filteredData = getFilteredData();
    setCourts(shuffleArray(filteredData));
    setJurisdictions(shuffleArray(filteredData));
    setRegions(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedCourt(null);
    setSelectedJurisdiction(null);
    setSelectedRegion(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterCategory, filterRegion]);

  const handleCourtClick = (court: JusticeData) => {
    if (matchedItems.has(court.id)) return;
    setSelectedCourt(court);
    setIncorrectAttempts(new Set());
  };

  const handleJurisdictionClick = (jurisdiction: JusticeData) => {
    if (matchedItems.has(jurisdiction.id)) return;
    setSelectedJurisdiction(jurisdiction);
    setIncorrectAttempts(new Set());
  };

  const handleRegionClick = (region: JusticeData) => {
    if (matchedItems.has(region.id)) return;
    setSelectedRegion(region);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedCourt && selectedJurisdiction && selectedRegion) {
      setAttempts(prev => prev + 1);
      
      if (selectedCourt.id === selectedJurisdiction.id && 
          selectedJurisdiction.id === selectedRegion.id) {
        // Correct match!
        celebrateWithTheme('justice');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedCourt.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('justice'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedCourt.id, selectedJurisdiction.id, selectedRegion.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedCourt(null);
        setSelectedJurisdiction(null);
        setSelectedRegion(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedCourt, selectedJurisdiction, selectedRegion, matchedItems.size]);

  const getButtonStyle = (item: JusticeData, isSelected: boolean) => {
    const baseClasses = "w-full text-left p-3 rounded-lg border transition-all duration-300 hover:shadow-md";
    const isMatched = matchedItems.has(item.id);
    const isIncorrect = incorrectAttempts.has(item.id);
    
    if (isMatched) {
      return `${baseClasses} bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 cursor-default shadow-sm`;
    }
    
    if (isIncorrect) {
      return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 animate-pulse cursor-pointer`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Criminal: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Civil: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Family: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      Appeal: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      Supreme: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Tribunal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getRegionColor = (region: string) => {
    const colors = {
      'England & Wales': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      'Scotland': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Northern Ireland': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'United Kingdom': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
    };
    return colors[region as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UK Justice System Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match courts with their jurisdictions and regions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{score}/{filteredData.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
          {categories.map(category => (
            <Badge
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterCategory === category 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Region:</span>
          {regionFilters.map(region => (
            <Badge
              key={region}
              variant={filterRegion === region ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterRegion === region 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setFilterRegion(region)}
            >
              {region === 'all' ? 'All Regions' : region}
            </Badge>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2">
        <Button
          onClick={initializeGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
        <Button
          onClick={initializeGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">🎉 Congratulations!</h3>
            <p className="text-emerald-700 dark:text-emerald-300">
              You've successfully matched all {filteredData.length} courts with their jurisdictions and regions!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courts Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
                <Scale className="h-3 w-3 text-white" />
              </div>
              Courts ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {courts.map((court) => (
              <div key={`court-${court.id}`} className="space-y-1">
                <button
                  onClick={() => handleCourtClick(court)}
                  className={getButtonStyle(court, selectedCourt?.id === court.id)}
                  disabled={matchedItems.has(court.id)}
                >
                  <div className="font-medium text-sm">{court.court}</div>
                  <div className="flex gap-1 mt-1">
                    <Badge className={`text-xs ${getCategoryColor(court.category)}`}>
                      {court.category}
                    </Badge>
                    <Badge className={`text-xs ${getRegionColor(court.region)}`}>
                      {court.region}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Jurisdictions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Scale className="h-3 w-3 text-white" />
              </div>
              Jurisdictions ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jurisdictions.map((jurisdiction) => (
              <button
                key={`jurisdiction-${jurisdiction.id}`}
                onClick={() => handleJurisdictionClick(jurisdiction)}
                className={getButtonStyle(jurisdiction, selectedJurisdiction?.id === jurisdiction.id)}
                disabled={matchedItems.has(jurisdiction.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {jurisdiction.jurisdiction}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Regions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Scale className="h-3 w-3 text-white" />
              </div>
              Regions ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {regions.map((region) => (
              <button
                key={`region-${region.id}`}
                onClick={() => handleRegionClick(region)}
                className={getButtonStyle(region, selectedRegion?.id === region.id)}
                disabled={matchedItems.has(region.id)}
              >
                <div className="font-bold text-center">
                  {region.region}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getCategoryColor(region.category)}`}>
                  {region.level}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">How to Play:</h4>
          <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
            <li>• Select one court, one jurisdiction, and one region that all belong together</li>
            <li>• All three selections must match the same court system</li>
            <li>• Correct matches turn green and celebrate with confetti</li>
            <li>• Use category and region filters to focus on specific court types</li>
            <li>• Master the complex UK justice system across all regions!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}