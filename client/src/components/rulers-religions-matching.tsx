import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Crown, Filter, Cross } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface RulerData {
  id: string;
  ruler: string;
  reignStart: string;
  religion: string;
  dynasty: 'Norman' | 'Plantagenet' | 'Lancaster' | 'York' | 'Tudor' | 'Stuart' | 'Hanover' | 'Windsor';
  era: 'Medieval' | 'Early Modern' | 'Modern' | 'Contemporary';
  significance: 'Major' | 'Foundational' | 'Revolutionary' | 'Transformative' | 'Controversial';
  religiousImpact: string;
}

const rulersReligionsData: RulerData[] = [
  // Norman Dynasty
  {
    id: "1",
    ruler: "William the Conqueror",
    reignStart: "1066",
    religion: "Roman Catholic",
    dynasty: "Norman",
    era: "Medieval",
    significance: "Foundational",
    religiousImpact: "Established Norman Catholic rule in England, built numerous cathedrals"
  },

  // Plantagenet Dynasty
  {
    id: "2",
    ruler: "Henry II",
    reignStart: "1154",
    religion: "Roman Catholic",
    dynasty: "Plantagenet",
    era: "Medieval",
    significance: "Major",
    religiousImpact: "Conflict with Thomas Becket over church authority, legal reforms"
  },
  {
    id: "3",
    ruler: "Richard I (Lionheart)",
    reignStart: "1189",
    religion: "Roman Catholic",
    dynasty: "Plantagenet",
    era: "Medieval",
    significance: "Major",
    religiousImpact: "Led Third Crusade to Holy Land, defender of Christian faith"
  },
  {
    id: "4",
    ruler: "John",
    reignStart: "1199",
    religion: "Roman Catholic",
    dynasty: "Plantagenet",
    era: "Medieval",
    significance: "Revolutionary",
    religiousImpact: "Signed Magna Carta limiting royal power, conflicts with Pope"
  },
  {
    id: "5",
    ruler: "Edward I",
    reignStart: "1272",
    religion: "Roman Catholic",
    dynasty: "Plantagenet",
    era: "Medieval",
    significance: "Major",
    religiousImpact: "Expelled Jews from England, conquered Wales and Scotland"
  },

  // Lancaster Dynasty
  {
    id: "6",
    ruler: "Henry IV",
    reignStart: "1399",
    religion: "Roman Catholic",
    dynasty: "Lancaster",
    era: "Medieval",
    significance: "Major",
    religiousImpact: "Persecuted Lollards, maintained Catholic orthodoxy"
  },

  // York Dynasty
  {
    id: "7",
    ruler: "Edward IV",
    reignStart: "1461",
    religion: "Roman Catholic",
    dynasty: "York",
    era: "Medieval",
    significance: "Major",
    religiousImpact: "Wars of the Roses, maintained traditional Catholic practices"
  },

  // Tudor Dynasty
  {
    id: "8",
    ruler: "Henry VIII",
    reignStart: "1509",
    religion: "Anglican (Church of England)",
    dynasty: "Tudor",
    era: "Early Modern",
    significance: "Revolutionary",
    religiousImpact: "Break with Rome, established Church of England, Defender of the Faith"
  },
  {
    id: "9",
    ruler: "Mary I (Bloody Mary)",
    reignStart: "1553",
    religion: "Roman Catholic",
    dynasty: "Tudor",
    era: "Early Modern",
    significance: "Controversial",
    religiousImpact: "Attempted Catholic restoration, persecution of Protestants"
  },
  {
    id: "10",
    ruler: "Elizabeth I",
    reignStart: "1558",
    religion: "Anglican (Church of England)",
    dynasty: "Tudor",
    era: "Early Modern",
    significance: "Transformative",
    religiousImpact: "Elizabethan Religious Settlement, defeated Spanish Armada"
  },

  // Stuart Dynasty
  {
    id: "11",
    ruler: "James I (VI of Scotland)",
    reignStart: "1603",
    religion: "Anglican (Church of England)",
    dynasty: "Stuart",
    era: "Early Modern",
    significance: "Major",
    religiousImpact: "King James Bible, Gunpowder Plot, witch trials"
  },
  {
    id: "12",
    ruler: "Charles I",
    reignStart: "1625",
    religion: "Anglican (Church of England)",
    dynasty: "Stuart",
    era: "Early Modern",
    significance: "Revolutionary",
    religiousImpact: "High Church Anglicanism, conflicts with Puritans, executed"
  },
  {
    id: "13",
    ruler: "Charles II",
    reignStart: "1660",
    religion: "Anglican (Church of England)",
    dynasty: "Stuart",
    era: "Early Modern",
    significance: "Major",
    religiousImpact: "Restoration of monarchy and Church of England"
  },
  {
    id: "14",
    ruler: "James II",
    reignStart: "1685",
    religion: "Roman Catholic",
    dynasty: "Stuart",
    era: "Early Modern",
    significance: "Controversial",
    religiousImpact: "Catholic restoration attempts, deposed in Glorious Revolution"
  },

  // Hanover Dynasty
  {
    id: "15",
    ruler: "George I",
    reignStart: "1714",
    religion: "Anglican (Church of England)",
    dynasty: "Hanover",
    era: "Modern",
    significance: "Major",
    religiousImpact: "Protestant succession secured, limited involvement in religious affairs"
  },
  {
    id: "16",
    ruler: "George III",
    reignStart: "1760",
    religion: "Anglican (Church of England)",
    dynasty: "Hanover",
    era: "Modern",
    significance: "Major",
    religiousImpact: "American Independence, opposed Catholic emancipation"
  },
  {
    id: "17",
    ruler: "Victoria",
    reignStart: "1837",
    religion: "Anglican (Church of England)",
    dynasty: "Hanover",
    era: "Modern",
    significance: "Transformative",
    religiousImpact: "Empress of India, Victorian moral values, religious revival"
  },

  // Windsor Dynasty
  {
    id: "18",
    ruler: "George V",
    reignStart: "1910",
    religion: "Anglican (Church of England)",
    dynasty: "Windsor",
    era: "Modern",
    significance: "Major",
    religiousImpact: "World War I, Russian Revolution, changed royal house name"
  },
  {
    id: "19",
    ruler: "Edward VIII",
    reignStart: "1936",
    religion: "Anglican (Church of England)",
    dynasty: "Windsor",
    era: "Modern",
    significance: "Controversial",
    religiousImpact: "Abdication crisis over marriage to divorced woman"
  },
  {
    id: "20",
    ruler: "George VI",
    reignStart: "1936",
    religion: "Anglican (Church of England)",
    dynasty: "Windsor",
    era: "Modern",
    significance: "Major",
    religiousImpact: "World War II leadership, Commonwealth development"
  },
  {
    id: "21",
    ruler: "Elizabeth II",
    reignStart: "1952",
    religion: "Anglican (Church of England)",
    dynasty: "Windsor",
    era: "Contemporary",
    significance: "Transformative",
    religiousImpact: "Longest reign, Defender of Faith, multicultural Britain"
  }
];

interface RulersReligionsMatchingProps {
  userId: string;
}

export default function RulersReligionsMatching({ userId }: RulersReligionsMatchingProps) {
  const [rulers, setRulers] = useState<RulerData[]>([]);
  const [reigns, setReigns] = useState<RulerData[]>([]);
  const [religions, setReligions] = useState<RulerData[]>([]);
  const [selectedRuler, setSelectedRuler] = useState<RulerData | null>(null);
  const [selectedReign, setSelectedReign] = useState<RulerData | null>(null);
  const [selectedReligion, setSelectedReligion] = useState<RulerData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterDynasty, setFilterDynasty] = useState<string>('all');
  const [filterEra, setFilterEra] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const dynasties = ['all', 'Norman', 'Plantagenet', 'Lancaster', 'York', 'Tudor', 'Stuart', 'Hanover', 'Windsor'];
  const eras = ['all', 'Medieval', 'Early Modern', 'Modern', 'Contemporary'];

  const getFilteredData = () => {
    let filtered = rulersReligionsData;
    
    if (filterDynasty !== 'all') {
      filtered = filtered.filter(item => item.dynasty === filterDynasty);
    }
    
    if (filterEra !== 'all') {
      filtered = filtered.filter(item => item.era === filterEra);
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
    setRulers(shuffleArray(filteredData));
    setReigns(shuffleArray(filteredData));
    setReligions(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedRuler(null);
    setSelectedReign(null);
    setSelectedReligion(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterDynasty, filterEra]);

  const handleRulerClick = (ruler: RulerData) => {
    if (matchedItems.has(ruler.id)) return;
    setSelectedRuler(ruler);
    setIncorrectAttempts(new Set());
  };

  const handleReignClick = (reign: RulerData) => {
    if (matchedItems.has(reign.id)) return;
    setSelectedReign(reign);
    setIncorrectAttempts(new Set());
  };

  const handleReligionClick = (religion: RulerData) => {
    if (matchedItems.has(religion.id)) return;
    setSelectedReligion(religion);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedRuler && selectedReign && selectedReligion) {
      setAttempts(prev => prev + 1);
      
      if (selectedRuler.id === selectedReign.id && 
          selectedReign.id === selectedReligion.id) {
        // Correct match!
        celebrateWithTheme('royal');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedRuler.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('royal'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedRuler.id, selectedReign.id, selectedReligion.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedRuler(null);
        setSelectedReign(null);
        setSelectedReligion(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedRuler, selectedReign, selectedReligion, matchedItems.size]);

  const getButtonStyle = (item: RulerData, isSelected: boolean) => {
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
      return `${baseClasses} bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`;
  };

  const getDynastyColor = (dynasty: string) => {
    const colors = {
      Norman: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300',
      Plantagenet: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Lancaster: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      York: 'bg-white text-gray-800 border dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
      Tudor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      Stuart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Hanover: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Windsor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
    };
    return colors[dynasty as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getReligionColor = (religion: string) => {
    const colors = {
      'Roman Catholic': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Anglican (Church of England)': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return colors[religion as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-amber-600 rounded-lg flex items-center justify-center">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">British Rulers & Religions Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match rulers with their reign start dates and religious affiliations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{score}/{filteredData.length}</div>
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
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Dynasty:</span>
          {dynasties.map(dynasty => (
            <Badge
              key={dynasty}
              variant={filterDynasty === dynasty ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterDynasty === dynasty 
                  ? 'bg-amber-600 text-white' 
                  : 'hover:bg-amber-100'
              }`}
              onClick={() => setFilterDynasty(dynasty)}
            >
              {dynasty === 'all' ? 'All Dynasties' : dynasty}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Era:</span>
          {eras.map(era => (
            <Badge
              key={era}
              variant={filterEra === era ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterEra === era 
                  ? 'bg-violet-600 text-white' 
                  : 'hover:bg-violet-100'
              }`}
              onClick={() => setFilterEra(era)}
            >
              {era === 'all' ? 'All Eras' : era}
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
          className="flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
        <Button
          onClick={initializeGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          onClick={() => setShowReference(!showReference)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Cross className="h-4 w-4" />
          {showReference ? 'Hide' : 'Show'} Royal Reference
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">👑 Royal Mastery Achieved!</h3>
            <p className="text-emerald-700 dark:text-emerald-400">
              You've successfully matched all {filteredData.length} British rulers with their reigns and religions!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Royal Reference Card */}
      {showReference && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <div className="w-4 h-4 bg-amber-600 rounded flex items-center justify-center">
                <Cross className="h-3 w-3 text-white" />
              </div>
              British Royal History & Religious Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {filteredData.map((ruler) => (
                <div key={`ref-${ruler.id}`} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="font-semibold text-amber-800 dark:text-amber-300">{ruler.ruler}</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs leading-relaxed">{ruler.religiousImpact}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getDynastyColor(ruler.dynasty)}`}>
                      {ruler.dynasty}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {ruler.reignStart}
                    </Badge>
                    <Badge className={`text-xs ${getReligionColor(ruler.religion)}`}>
                      {ruler.religion}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rulers Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-amber-600 rounded flex items-center justify-center">
                <Crown className="h-3 w-3 text-white" />
              </div>
              British Rulers ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rulers.map((ruler) => (
              <div key={`ruler-${ruler.id}`} className="space-y-1">
                <button
                  onClick={() => handleRulerClick(ruler)}
                  className={getButtonStyle(ruler, selectedRuler?.id === ruler.id)}
                  disabled={matchedItems.has(ruler.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{ruler.ruler}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getDynastyColor(ruler.dynasty)}`}>
                      {ruler.dynasty}
                    </Badge>
                    <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {ruler.era}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reign Start Dates Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Crown className="h-3 w-3 text-white" />
              </div>
              Reign Start ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reigns.map((reign) => (
              <button
                key={`reign-${reign.id}`}
                onClick={() => handleReignClick(reign)}
                className={getButtonStyle(reign, selectedReign?.id === reign.id)}
                disabled={matchedItems.has(reign.id)}
              >
                <div className="font-bold text-xl text-center">
                  {reign.reignStart}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getDynastyColor(reign.dynasty)}`}>
                  {reign.dynasty} Dynasty
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Religions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Cross className="h-3 w-3 text-white" />
              </div>
              Religious Affiliation ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {religions.map((religion) => (
              <button
                key={`religion-${religion.id}`}
                onClick={() => handleReligionClick(religion)}
                className={getButtonStyle(religion, selectedReligion?.id === religion.id)}
                disabled={matchedItems.has(religion.id)}
              >
                <div className="font-medium text-sm leading-relaxed text-center">
                  {religion.religion}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getReligionColor(religion.religion)}`}>
                  {religion.religion.includes('Anglican') ? 'Protestant' : 'Catholic'}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">How to Play:</h4>
          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
            <li>• Select one ruler, one reign start date, and one religious affiliation that all belong together</li>
            <li>• All three selections must match the same British monarch</li>
            <li>• Correct matches turn emerald and celebrate with confetti</li>
            <li>• Use dynasty and era filters to focus on specific periods</li>
            <li>• Click "Show Royal Reference" for comprehensive information about each ruler's religious impact</li>
            <li>• Learn about British religious history from Catholic Norman conquest to Anglican reformation!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}