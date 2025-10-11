import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Building, Filter, Users } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface PrimeMinisterData {
  id: string;
  primeMinister: string;
  termStart: string;
  period: string;
  party: 'Conservative' | 'Labour' | 'Liberal' | 'Whig' | 'Tory' | 'Coalition' | 'Liberal Democrat';
  era: 'Georgian' | 'Victorian' | 'Edwardian' | 'Interwar' | 'Post-War' | 'Modern' | 'Contemporary';
  significance: 'Foundational' | 'Major' | 'Transformative' | 'Wartime' | 'Reformist' | 'Revolutionary';
  keyAchievements: string;
}

const primeMinistersData: PrimeMinisterData[] = [
  // Early Prime Ministers
  {
    id: "1",
    primeMinister: "Robert Walpole",
    termStart: "1721",
    period: "First Prime Minister (1721-1742)",
    party: "Whig",
    era: "Georgian",
    significance: "Foundational",
    keyAchievements: "Established role of Prime Minister, longest serving PM, financial stability"
  },
  {
    id: "2",
    primeMinister: "William Pitt the Elder",
    termStart: "1766",
    period: "Seven Years' War Leadership (1766-1768)",
    party: "Whig",
    era: "Georgian",
    significance: "Major",
    keyAchievements: "Led Britain to victory in Seven Years' War, expanded British Empire"
  },
  {
    id: "3",
    primeMinister: "William Pitt the Younger",
    termStart: "1783",
    period: "Napoleonic Wars Era (1783-1801, 1804-1806)",
    party: "Tory",
    era: "Georgian",
    significance: "Major",
    keyAchievements: "Youngest PM at 24, led Britain during Napoleonic Wars, financial reforms"
  },

  // 19th Century Prime Ministers
  {
    id: "4",
    primeMinister: "Duke of Wellington",
    termStart: "1828",
    period: "Post-Napoleonic Era (1828-1830)",
    party: "Tory",
    era: "Georgian",
    significance: "Major",
    keyAchievements: "Hero of Waterloo, Catholic Emancipation, opposed Reform Bill"
  },
  {
    id: "5",
    primeMinister: "Earl Grey",
    termStart: "1830",
    period: "Reform Era (1830-1834)",
    party: "Whig",
    era: "Victorian",
    significance: "Revolutionary",
    keyAchievements: "Great Reform Act 1832, Slavery Abolition Act 1833"
  },
  {
    id: "6",
    primeMinister: "Robert Peel",
    termStart: "1841",
    period: "Free Trade Era (1841-1846)",
    party: "Conservative",
    era: "Victorian",
    significance: "Transformative",
    keyAchievements: "Repealed Corn Laws, established modern police force, Conservative Party founder"
  },
  {
    id: "7",
    primeMinister: "Benjamin Disraeli",
    termStart: "1874",
    period: "Imperial Expansion (1874-1880)",
    party: "Conservative",
    era: "Victorian",
    significance: "Major",
    keyAchievements: "Made Victoria Empress of India, social reforms, One Nation Conservatism"
  },
  {
    id: "8",
    primeMinister: "William Gladstone",
    termStart: "1868",
    period: "Liberal Reforms (1868-1874, 1880-1885, 1886, 1892-1894)",
    party: "Liberal",
    era: "Victorian",
    significance: "Transformative",
    keyAchievements: "Education Act 1870, Irish Home Rule, electoral reforms"
  },

  // 20th Century Prime Ministers
  {
    id: "9",
    primeMinister: "David Lloyd George",
    termStart: "1916",
    period: "World War I Victory (1916-1922)",
    party: "Liberal",
    era: "Edwardian",
    significance: "Wartime",
    keyAchievements: "Led Britain to WWI victory, welfare state foundations, Treaty of Versailles"
  },
  {
    id: "10",
    primeMinister: "Stanley Baldwin",
    termStart: "1923",
    period: "Interwar Stability (1923-1924, 1924-1929, 1935-1937)",
    party: "Conservative",
    era: "Interwar",
    significance: "Major",
    keyAchievements: "General Strike 1926, abdication crisis, rearmament program"
  },
  {
    id: "11",
    primeMinister: "Neville Chamberlain",
    termStart: "1937",
    period: "Appeasement Era (1937-1940)",
    party: "Conservative",
    era: "Interwar",
    significance: "Major",
    keyAchievements: "Munich Agreement, declaration of WWII, social reforms"
  },
  {
    id: "12",
    primeMinister: "Winston Churchill",
    termStart: "1940",
    period: "World War II Leadership (1940-1945, 1951-1955)",
    party: "Conservative",
    era: "Post-War",
    significance: "Wartime",
    keyAchievements: "Led Britain to WWII victory, 'We shall never surrender', Nobel Prize Literature"
  },
  {
    id: "13",
    primeMinister: "Clement Attlee",
    termStart: "1945",
    period: "Welfare State Creation (1945-1951)",
    party: "Labour",
    era: "Post-War",
    significance: "Revolutionary",
    keyAchievements: "Created NHS, welfare state, nationalization program, NATO founder"
  },
  {
    id: "14",
    primeMinister: "Harold Macmillan",
    termStart: "1957",
    period: "Never Had It So Good (1957-1963)",
    party: "Conservative",
    era: "Post-War",
    significance: "Major",
    keyAchievements: "Economic prosperity, decolonization, Profumo affair"
  },
  {
    id: "15",
    primeMinister: "Harold Wilson",
    termStart: "1964",
    period: "Swinging Sixties (1964-1970, 1974-1976)",
    party: "Labour",
    era: "Modern",
    significance: "Transformative",
    keyAchievements: "Social liberalization, Open University, technological revolution"
  },
  {
    id: "16",
    primeMinister: "Edward Heath",
    termStart: "1970",
    period: "European Integration (1970-1974)",
    party: "Conservative",
    era: "Modern",
    significance: "Major",
    keyAchievements: "Joined EEC 1973, three-day week, miners' strikes"
  },
  {
    id: "17",
    primeMinister: "James Callaghan",
    termStart: "1976",
    period: "Winter of Discontent (1976-1979)",
    party: "Labour",
    era: "Modern",
    significance: "Major",
    keyAchievements: "IMF crisis, devolution referendums, industrial unrest"
  },
  {
    id: "18",
    primeMinister: "Margaret Thatcher",
    termStart: "1979",
    period: "Thatcher Revolution (1979-1990)",
    party: "Conservative",
    era: "Modern",
    significance: "Revolutionary",
    keyAchievements: "Privatization, Falklands War, broke trade union power, Iron Lady"
  },
  {
    id: "19",
    primeMinister: "John Major",
    termStart: "1990",
    period: "Post-Cold War (1990-1997)",
    party: "Conservative",
    era: "Modern",
    significance: "Major",
    keyAchievements: "Gulf War, ERM exit, Maastricht Treaty, peace process"
  },
  {
    id: "20",
    primeMinister: "Tony Blair",
    termStart: "1997",
    period: "New Labour Era (1997-2007)",
    party: "Labour",
    era: "Contemporary",
    significance: "Transformative",
    keyAchievements: "Devolution, Good Friday Agreement, Iraq War, constitutional reform"
  },
  {
    id: "21",
    primeMinister: "David Cameron",
    termStart: "2010",
    period: "Austerity & Brexit (2010-2016)",
    party: "Conservative",
    era: "Contemporary",
    significance: "Major",
    keyAchievements: "Coalition government, Scottish referendum, Brexit referendum"
  }
];

interface PrimeMinistersMatchingProps {
  userId: string;
}

export default function PrimeMinistersMatching({ userId }: PrimeMinistersMatchingProps) {
  const [primeMinister, setPrimeMinister] = useState<PrimeMinisterData[]>([]);
  const [termStarts, setTermStarts] = useState<PrimeMinisterData[]>([]);
  const [periods, setPeriods] = useState<PrimeMinisterData[]>([]);
  const [selectedPM, setSelectedPM] = useState<PrimeMinisterData | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<PrimeMinisterData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PrimeMinisterData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterParty, setFilterParty] = useState<string>('all');
  const [filterEra, setFilterEra] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const parties = ['all', 'Conservative', 'Labour', 'Liberal', 'Whig', 'Tory', 'Coalition'];
  const eras = ['all', 'Georgian', 'Victorian', 'Edwardian', 'Interwar', 'Post-War', 'Modern', 'Contemporary'];

  const getFilteredData = () => {
    let filtered = primeMinistersData;
    
    if (filterParty !== 'all') {
      filtered = filtered.filter(item => item.party === filterParty);
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
    setPrimeMinister(shuffleArray(filteredData));
    setTermStarts(shuffleArray(filteredData));
    setPeriods(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedPM(null);
    setSelectedTerm(null);
    setSelectedPeriod(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterParty, filterEra]);

  const handlePMClick = (pm: PrimeMinisterData) => {
    if (matchedItems.has(pm.id)) return;
    setSelectedPM(pm);
    setIncorrectAttempts(new Set());
  };

  const handleTermClick = (term: PrimeMinisterData) => {
    if (matchedItems.has(term.id)) return;
    setSelectedTerm(term);
    setIncorrectAttempts(new Set());
  };

  const handlePeriodClick = (period: PrimeMinisterData) => {
    if (matchedItems.has(period.id)) return;
    setSelectedPeriod(period);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedPM && selectedTerm && selectedPeriod) {
      setAttempts(prev => prev + 1);
      
      if (selectedPM.id === selectedTerm.id && 
          selectedTerm.id === selectedPeriod.id) {
        // Correct match!
        celebrateWithTheme('political');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedPM.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('political'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedPM.id, selectedTerm.id, selectedPeriod.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedPM(null);
        setSelectedTerm(null);
        setSelectedPeriod(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedPM, selectedTerm, selectedPeriod, matchedItems.size]);

  const getButtonStyle = (item: PrimeMinisterData, isSelected: boolean) => {
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
      return `${baseClasses} bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`;
  };

  const getPartyColor = (party: string) => {
    const colors = {
      Conservative: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Labour: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Liberal: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Whig: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Tory: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      Coalition: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
    };
    return colors[party as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getSignificanceColor = (significance: string) => {
    const colors = {
      Foundational: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      Major: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Transformative: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      Wartime: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Reformist: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Revolutionary: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[significance as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Building className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">British Prime Ministers Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match Prime Ministers with their term starts and historical periods</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{score}/{filteredData.length}</div>
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
          <span className="text-sm font-medium text-gray-700">Political Party:</span>
          {parties.map(party => (
            <Badge
              key={party}
              variant={filterParty === party ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterParty === party 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-indigo-100'
              }`}
              onClick={() => setFilterParty(party)}
            >
              {party === 'all' ? 'All Parties' : party}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Historical Era:</span>
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
          <Users className="h-4 w-4" />
          {showReference ? 'Hide' : 'Show'} PM Reference
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">🏛️ Political Mastery Achieved!</h3>
            <p className="text-emerald-700 dark:text-emerald-400">
              You've successfully matched all {filteredData.length} Prime Ministers with their terms and periods!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prime Ministers Reference Card */}
      {showReference && (
        <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
              <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              British Prime Ministers Historical Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {filteredData.map((pm) => (
                <div key={`ref-${pm.id}`} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="font-semibold text-indigo-800 dark:text-indigo-300">{pm.primeMinister}</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs leading-relaxed">{pm.keyAchievements}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getPartyColor(pm.party)}`}>
                      {pm.party}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {pm.termStart}
                    </Badge>
                    <Badge className={`text-xs ${getSignificanceColor(pm.significance)}`}>
                      {pm.significance}
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
        {/* Prime Ministers Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                <Building className="h-3 w-3 text-white" />
              </div>
              Prime Ministers ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {primeMinister.map((pm) => (
              <div key={`pm-${pm.id}`} className="space-y-1">
                <button
                  onClick={() => handlePMClick(pm)}
                  className={getButtonStyle(pm, selectedPM?.id === pm.id)}
                  disabled={matchedItems.has(pm.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{pm.primeMinister}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getPartyColor(pm.party)}`}>
                      {pm.party}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {pm.era}
                    </Badge>
                    <Badge className={`text-xs ${getSignificanceColor(pm.significance)}`}>
                      {pm.significance}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Term Start Dates Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Building className="h-3 w-3 text-white" />
              </div>
              Term Start ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {termStarts.map((term) => (
              <button
                key={`term-${term.id}`}
                onClick={() => handleTermClick(term)}
                className={getButtonStyle(term, selectedTerm?.id === term.id)}
                disabled={matchedItems.has(term.id)}
              >
                <div className="font-bold text-xl text-center">
                  {term.termStart}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getPartyColor(term.party)}`}>
                  {term.party}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Historical Periods Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              Historical Period ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {periods.map((period) => (
              <button
                key={`period-${period.id}`}
                onClick={() => handlePeriodClick(period)}
                className={getButtonStyle(period, selectedPeriod?.id === period.id)}
                disabled={matchedItems.has(period.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {period.period}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">How to Play:</h4>
          <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1">
            <li>• Select one Prime Minister, one term start date, and one historical period that all belong together</li>
            <li>• All three selections must match the same political leader</li>
            <li>• Correct matches turn emerald and celebrate with confetti</li>
            <li>• Use party and era filters to focus on specific political periods</li>
            <li>• Click "Show PM Reference" for comprehensive information about each Prime Minister's achievements</li>
            <li>• Learn about British political history from Walpole to Cameron!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}