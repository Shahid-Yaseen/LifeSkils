import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, RotateCcw, Info } from "lucide-react";
import confetti from 'canvas-confetti';

interface ParliamentTripleData {
  id: string;
  region: string;
  parliament: string;
  members: string;
  elections: string;
  powers: string;
  details: string;
  category: string;
}

const parliamentData: ParliamentTripleData[] = [
  {
    id: "1",
    region: "England (UK-wide)",
    parliament: "Westminster",
    members: "MPs (650)",
    elections: "Every 5 years, FPTP",
    powers: "Reserved matters UK-wide",
    details: "Houses of Commons and Lords, Prime Minister, UK Government",
    category: "UK Parliament"
  },
  {
    id: "2",
    region: "Scotland",
    parliament: "Holyrood",
    members: "MSPs (129)",
    elections: "Since 1999, proportional representation",
    powers: "Education, justice, tax, health, etc.",
    details: "Scottish Parliament building in Edinburgh",
    category: "Devolved Parliament"
  },
  {
    id: "3",
    region: "Wales",
    parliament: "Senedd (Cardiff)",
    members: "MSs (60)",
    elections: "Since 1999, proportional representation",
    powers: "Education, health, services",
    details: "Welsh Parliament in Cardiff Bay",
    category: "Devolved Parliament"
  },
  {
    id: "4",
    region: "Northern Ireland",
    parliament: "Stormont Assembly",
    members: "MLAs (90)",
    elections: "Since 1998, proportional representation",
    powers: "Power-sharing executive, devolved matters",
    details: "Belfast, power-sharing between unionists and nationalists",
    category: "Devolved Assembly"
  },
  {
    id: "5",
    region: "Westminster",
    parliament: "Houses of Parliament",
    members: "650 MPs + Lords",
    elections: "First Past The Post",
    powers: "UK sovereignty, defense, foreign policy",
    details: "Palace of Westminster, Big Ben, Thames location",
    category: "Central Government"
  },
  {
    id: "6",
    region: "Holyrood",
    parliament: "Scottish Parliament",
    members: "129 elected MSPs",
    elections: "Additional Member System",
    powers: "Scottish law, education, NHS Scotland",
    details: "Opened 2004, modern architecture, Royal Mile",
    category: "National Parliament"
  },
  {
    id: "7",
    region: "Senedd",
    parliament: "Welsh Parliament",
    members: "60 Members of Senedd",
    elections: "Mixed electoral system",
    powers: "Welsh language, culture, local government",
    details: "Cardiff Bay, sustainable building, public gallery",
    category: "National Assembly"
  },
  {
    id: "8",
    region: "Stormont",
    parliament: "Northern Ireland Assembly",
    members: "90 Assembly Members",
    elections: "Single Transferable Vote",
    powers: "Justice, policing, welfare (conditional)",
    details: "Stormont Castle, Belfast hills, peace process",
    category: "Regional Assembly"
  },
  {
    id: "9",
    region: "House of Commons",
    parliament: "Lower House",
    members: "650 elected MPs",
    elections: "5-year maximum terms",
    powers: "Passes laws, controls taxation",
    details: "Green benches, Speaker, government front bench",
    category: "Parliamentary Chamber"
  },
  {
    id: "10",
    region: "House of Lords",
    parliament: "Upper House",
    members: "~800 appointed peers",
    elections: "Appointed for life",
    powers: "Reviews legislation, delays bills",
    details: "Red benches, Lord Speaker, revising chamber",
    category: "Parliamentary Chamber"
  },
  {
    id: "11",
    region: "Prime Minister",
    parliament: "Head of Government",
    members: "Leader of majority party",
    elections: "Appointed by monarch",
    powers: "Executive power, cabinet appointments",
    details: "10 Downing Street, First Lord of Treasury",
    category: "Executive Office"
  },
  {
    id: "12",
    region: "First Minister (Scotland)",
    parliament: "Scottish Government Head",
    members: "Leader of Scottish Executive",
    elections: "Elected by Scottish Parliament",
    powers: "Scottish domestic policy",
    details: "Bute House, Edinburgh, SNP/other parties",
    category: "Devolved Executive"
  },
  {
    id: "13",
    region: "First Minister (Wales)",
    parliament: "Welsh Government Head",
    members: "Leader of Welsh Government",
    elections: "Elected by Senedd",
    powers: "Welsh domestic affairs",
    details: "Cardiff, Labour/other parties",
    category: "Devolved Executive"
  },
  {
    id: "14",
    region: "First/Deputy Ministers (NI)",
    parliament: "Power-sharing Executive",
    members: "Joint First Ministers",
    elections: "Largest parties from each community",
    powers: "Shared executive authority",
    details: "DUP/Sinn Fein or other arrangements",
    category: "Shared Executive"
  },
  {
    id: "15",
    region: "FPTP Electoral System",
    parliament: "First Past The Post",
    members: "Winner takes constituency",
    elections: "Simple majority in seat",
    powers: "Used for Westminster elections",
    details: "Single-member constituencies, tactical voting",
    category: "Electoral System"
  },
  {
    id: "16",
    region: "Proportional Representation",
    parliament: "PR Systems",
    members: "Seats match vote share",
    elections: "Multiple representation methods",
    powers: "Used in devolved parliaments",
    details: "AMS in Scotland/Wales, STV in Northern Ireland",
    category: "Electoral System"
  },
  {
    id: "17",
    region: "Devolution Settlement",
    parliament: "Power Distribution",
    members: "Reserved vs Devolved",
    elections: "1997 referendums",
    powers: "Different powers to each nation",
    details: "Asymmetric devolution, English question",
    category: "Constitutional Framework"
  },
  {
    id: "18",
    region: "Reserved Powers",
    parliament: "UK Government Only",
    members: "Defense, Foreign Policy",
    elections: "Immigration, Currency",
    powers: "Constitution, National Security",
    details: "Cannot be devolved without constitutional change",
    category: "Constitutional Framework"
  }
];

const categoryColors = {
  "UK Parliament": "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300",
  "Devolved Parliament": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Devolved Assembly": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Central Government": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  "National Parliament": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "National Assembly": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Regional Assembly": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "Parliamentary Chamber": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Executive Office": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "Devolved Executive": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Shared Executive": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Electoral System": "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  "Constitutional Framework": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
};

const celebrateWithTheme = (theme: string) => {
  const colors = ['#0066CC', '#FFFFFF', '#CC0000', '#00AA00', '#FFD700'];
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors
  });
};

export default function UKParliamentDevolutionMatching({ userId }: { userId: string }) {
  const [selectedRegion, setSelectedRegion] = useState<ParliamentTripleData | null>(null);
  const [selectedParliament, setSelectedParliament] = useState<ParliamentTripleData | null>(null);
  const [selectedPowers, setSelectedPowers] = useState<ParliamentTripleData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showReference, setShowReference] = useState(false);

  const categories = ["All", ...Array.from(new Set(parliamentData.map(item => item.category)))];

  const getFilteredData = () => {
    if (categoryFilter === "All") return parliamentData;
    return parliamentData.filter(item => item.category === categoryFilter);
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

  const [shuffledRegions] = useState(() => shuffleArray(filteredData));
  const [shuffledParliaments] = useState(() => shuffleArray(filteredData));
  const [shuffledPowers] = useState(() => shuffleArray(filteredData));

  const resetGame = () => {
    setSelectedRegion(null);
    setSelectedParliament(null);
    setSelectedPowers(null);
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  const getButtonStatus = (itemId: string, type: 'region' | 'parliament' | 'powers') => {
    const isMatched = matchedItems.has(itemId);
    const isSelected = type === 'region' ? selectedRegion?.id === itemId 
                     : type === 'parliament' ? selectedParliament?.id === itemId 
                     : selectedPowers?.id === itemId;
    const isIncorrect = incorrectAttempts.has(itemId);
    const isRecentMatch = isMatched && matchedItems.has(itemId);
    
    return { isMatched, isSelected, isIncorrect, isRecentMatch };
  };

  const handleRegionClick = (region: ParliamentTripleData) => {
    if (matchedItems.has(region.id)) return;
    setSelectedRegion(region);
    setIncorrectAttempts(new Set());
  };

  const handleParliamentClick = (parliament: ParliamentTripleData) => {
    if (matchedItems.has(parliament.id)) return;
    setSelectedParliament(parliament);
    setIncorrectAttempts(new Set());
  };

  const handlePowersClick = (powers: ParliamentTripleData) => {
    if (matchedItems.has(powers.id)) return;
    setSelectedPowers(powers);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedRegion && selectedParliament && selectedPowers) {
      setAttempts(prev => prev + 1);
      
      if (selectedRegion.id === selectedParliament.id && 
          selectedParliament.id === selectedPowers.id) {
        // Correct match!
        celebrateWithTheme('parliament');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedRegion.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('parliament'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedRegion.id, selectedParliament.id, selectedPowers.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedRegion(null);
        setSelectedParliament(null);
        setSelectedPowers(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedRegion, selectedParliament, selectedPowers, matchedItems.size, filteredData.length]);

  const sortedRegions = [...shuffledRegions.filter(item => !matchedItems.has(item.id)), 
                        ...shuffledRegions.filter(item => matchedItems.has(item.id))];
  const sortedParliaments = [...shuffledParliaments.filter(item => !matchedItems.has(item.id)), 
                            ...shuffledParliaments.filter(item => matchedItems.has(item.id))];
  const sortedPowers = [...shuffledPowers.filter(item => !matchedItems.has(item.id)), 
                       ...shuffledPowers.filter(item => matchedItems.has(item.id))];

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-stone-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            UK Parliament & Devolution Triple Match Challenge
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Match regions with their parliaments and powers. Learn about UK government structure, devolution, and democratic institutions.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category:</label>
          {categories.slice(0, 6).map(category => (
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
            {showReference ? "Hide" : "Show"} Parliament Reference
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
            <CardTitle className="text-lg">UK Parliament & Devolution Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {parliamentData.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm">{item.region}</h4>
                  <Badge className={`text-xs mb-2 ${categoryColors[item.category as keyof typeof categoryColors]}`}>
                    {item.category}
                  </Badge>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>Parliament:</strong> {item.parliament}</p>
                    <p><strong>Members:</strong> {item.members}</p>
                    <p><strong>Elections:</strong> {item.elections}</p>
                    <p><strong>Powers:</strong> {item.powers}</p>
                    <p><strong>Details:</strong> {item.details}</p>
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
            <p className="text-2xl font-bold text-stone-600 dark:text-stone-400">{score}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Correct Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{attempts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{accuracy}%</p>
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
              🏛️ Congratulations! You've mastered UK Parliament & Devolution!
            </h3>
            <p className="text-emerald-700 dark:text-emerald-400">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-stone-600 rounded flex items-center justify-center">
                <Building2 className="h-3 w-3 text-white" />
              </div>
              Regions/Bodies ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedRegions.map((region) => (
              <div key={`region-${region.id}`} className="space-y-1">
                <button
                  onClick={() => handleRegionClick(region)}
                  className={`
                    w-full p-3 text-left rounded-lg border transition-all duration-200
                    ${getButtonStatus(region.id, 'region').isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                      : getButtonStatus(region.id, 'region').isSelected
                      ? 'bg-stone-100 dark:bg-stone-900/30 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
                      : getButtonStatus(region.id, 'region').isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  disabled={matchedItems.has(region.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{region.region}</div>
                  <Badge className={`text-xs mt-1 ${categoryColors[region.category as keyof typeof categoryColors]}`}>
                    {region.category}
                  </Badge>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Parliaments Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Building2 className="h-3 w-3 text-white" />
              </div>
              Parliaments/Bodies ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedParliaments.map((parliament) => (
              <div key={`parliament-${parliament.id}`} className="space-y-1">
                <button
                  onClick={() => handleParliamentClick(parliament)}
                  className={`
                    w-full p-3 text-left rounded-lg border transition-all duration-200
                    ${getButtonStatus(parliament.id, 'parliament').isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                      : getButtonStatus(parliament.id, 'parliament').isSelected
                      ? 'bg-stone-100 dark:bg-stone-900/30 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
                      : getButtonStatus(parliament.id, 'parliament').isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  disabled={matchedItems.has(parliament.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{parliament.parliament}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{parliament.members}</div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Powers Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Building2 className="h-3 w-3 text-white" />
              </div>
              Powers/Details ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedPowers.map((powers) => (
              <div key={`powers-${powers.id}`} className="space-y-1">
                <button
                  onClick={() => handlePowersClick(powers)}
                  className={`
                    w-full p-3 text-left rounded-lg border transition-all duration-200
                    ${getButtonStatus(powers.id, 'powers').isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                      : getButtonStatus(powers.id, 'powers').isSelected
                      ? 'bg-stone-100 dark:bg-stone-900/30 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
                      : getButtonStatus(powers.id, 'powers').isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  disabled={matchedItems.has(powers.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{powers.powers}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{powers.elections}</div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">How to Play:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Select one item from each column (Regions/Bodies, Parliaments/Bodies, Powers/Details)</li>
            <li>• All three selections must match the same UK governmental institution</li>
            <li>• Correct matches turn green and move to the bottom</li>
            <li>• Incorrect matches briefly turn red - try again!</li>
            <li>• Use category filters to focus on specific types of institutions</li>
            <li>• Check the reference panel to learn about each parliament's structure and powers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}