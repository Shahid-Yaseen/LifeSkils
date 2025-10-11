import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, FileText, Filter, BookOpen } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface LegislationData {
  id: string;
  document: string;
  year: string;
  significance: string;
  category: 'Constitutional' | 'Social Reform' | 'International Treaty' | 'Religious' | 'Economic' | 'Legal Reform' | 'Human Rights';
  type: 'Act' | 'Treaty' | 'Bill' | 'Charter' | 'Agreement';
  impact: 'Major' | 'Foundational' | 'Revolutionary' | 'Historic' | 'Modern';
}

const actsTreeatiesBillsData: LegislationData[] = [
  // Constitutional Documents
  {
    id: "1",
    document: "Magna Carta",
    year: "1215",
    significance: "Limited royal power, established rule of law, foundation of constitutional monarchy",
    category: "Constitutional",
    type: "Charter",
    impact: "Foundational"
  },
  {
    id: "2",
    document: "Bill of Rights",
    year: "1689",
    significance: "Established parliamentary supremacy, limited monarch's power, guaranteed civil liberties",
    category: "Constitutional",
    type: "Bill",
    impact: "Foundational"
  },
  {
    id: "3",
    document: "Act of Union (England and Scotland)",
    year: "1707",
    significance: "United England and Scotland into Kingdom of Great Britain, created UK Parliament",
    category: "Constitutional",
    type: "Act",
    impact: "Major"
  },
  {
    id: "4",
    document: "Act of Union (Great Britain and Ireland)",
    year: "1800",
    significance: "United Great Britain and Ireland into United Kingdom, dissolved Irish Parliament",
    category: "Constitutional",
    type: "Act",
    impact: "Major"
  },
  {
    id: "5",
    document: "Parliament Act",
    year: "1911",
    significance: "Limited House of Lords power, established Commons supremacy over legislation",
    category: "Constitutional",
    type: "Act",
    impact: "Revolutionary"
  },

  // Social and Legal Reforms
  {
    id: "6",
    document: "Great Reform Act",
    year: "1832",
    significance: "Extended voting rights to middle class, reformed electoral system, reduced rotten boroughs",
    category: "Social Reform",
    type: "Act",
    impact: "Revolutionary"
  },
  {
    id: "7",
    document: "Representation of the People Act",
    year: "1918",
    significance: "Extended vote to all men over 21 and women over 30, major democratic expansion",
    category: "Social Reform",
    type: "Act",
    impact: "Revolutionary"
  },
  {
    id: "8",
    document: "Representation of the People Act",
    year: "1928",
    significance: "Extended vote to all women over 21, achieved full adult suffrage equality",
    category: "Social Reform",
    type: "Act",
    impact: "Revolutionary"
  },
  {
    id: "9",
    document: "Race Relations Act",
    year: "1965",
    significance: "Outlawed racial discrimination in public places, first comprehensive race equality law",
    category: "Human Rights",
    type: "Act",
    impact: "Major"
  },
  {
    id: "10",
    document: "Equal Pay Act",
    year: "1970",
    significance: "Required equal pay for equal work regardless of gender, landmark gender equality legislation",
    category: "Human Rights",
    type: "Act",
    impact: "Major"
  },

  // Religious Legislation
  {
    id: "11",
    document: "Act of Supremacy",
    year: "1534",
    significance: "Made Henry VIII head of Church of England, broke with Roman Catholic Church",
    category: "Religious",
    type: "Act",
    impact: "Revolutionary"
  },
  {
    id: "12",
    document: "Catholic Emancipation Act",
    year: "1829",
    significance: "Allowed Catholics to sit in Parliament and hold most public offices",
    category: "Religious",
    type: "Act",
    impact: "Major"
  },

  // Economic Legislation
  {
    id: "13",
    document: "Abolition of Slave Trade Act",
    year: "1807",
    significance: "Outlawed slave trade in British Empire, major humanitarian and economic reform",
    category: "Economic",
    type: "Act",
    impact: "Revolutionary"
  },
  {
    id: "14",
    document: "Slavery Abolition Act",
    year: "1833",
    significance: "Abolished slavery throughout British Empire, freed 800,000 enslaved people",
    category: "Human Rights",
    type: "Act",
    impact: "Revolutionary"
  },
  {
    id: "15",
    document: "Factory Act",
    year: "1833",
    significance: "Limited child labor, established factory inspections, improved working conditions",
    category: "Social Reform",
    type: "Act",
    impact: "Major"
  },

  // International Treaties
  {
    id: "16",
    document: "Treaty of Versailles",
    year: "1919",
    significance: "Ended World War I, established League of Nations, redrew European map",
    category: "International Treaty",
    type: "Treaty",
    impact: "Historic"
  },
  {
    id: "17",
    document: "North Atlantic Treaty",
    year: "1949",
    significance: "Established NATO alliance, collective defense against Soviet threat during Cold War",
    category: "International Treaty",
    type: "Treaty",
    impact: "Major"
  },
  {
    id: "18",
    document: "European Communities Act",
    year: "1972",
    significance: "Enabled UK membership of EEC, incorporated European law into UK legal system",
    category: "International Treaty",
    type: "Act",
    impact: "Major"
  },

  // Modern Legislation
  {
    id: "19",
    document: "Human Rights Act",
    year: "1998",
    significance: "Incorporated European Convention on Human Rights into UK law, enhanced civil liberties",
    category: "Human Rights",
    type: "Act",
    impact: "Major"
  },
  {
    id: "20",
    document: "Scotland Act",
    year: "1998",
    significance: "Established Scottish Parliament and devolved government, major constitutional change",
    category: "Constitutional",
    type: "Act",
    impact: "Major"
  },
  {
    id: "21",
    document: "European Union (Withdrawal) Act",
    year: "2018",
    significance: "Repealed European Communities Act, enabled Brexit transition, ended EU law supremacy",
    category: "Constitutional",
    type: "Act",
    impact: "Major"
  }
];

interface ActsTreatiesBillsMatchingProps {
  userId: string;
}

export default function ActsTreatiesBillsMatching({ userId }: ActsTreatiesBillsMatchingProps) {
  const [documents, setDocuments] = useState<LegislationData[]>([]);
  const [years, setYears] = useState<LegislationData[]>([]);
  const [significances, setSignificances] = useState<LegislationData[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LegislationData | null>(null);
  const [selectedYear, setSelectedYear] = useState<LegislationData | null>(null);
  const [selectedSignificance, setSelectedSignificance] = useState<LegislationData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const categories = ['all', 'Constitutional', 'Social Reform', 'International Treaty', 'Religious', 'Economic', 'Legal Reform', 'Human Rights'];
  const types = ['all', 'Act', 'Treaty', 'Bill', 'Charter', 'Agreement'];

  const getFilteredData = () => {
    let filtered = actsTreeatiesBillsData;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
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
    setDocuments(shuffleArray(filteredData));
    setYears(shuffleArray(filteredData));
    setSignificances(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedDocument(null);
    setSelectedYear(null);
    setSelectedSignificance(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterCategory, filterType]);

  const handleDocumentClick = (doc: LegislationData) => {
    if (matchedItems.has(doc.id)) return;
    setSelectedDocument(doc);
    setIncorrectAttempts(new Set());
  };

  const handleYearClick = (year: LegislationData) => {
    if (matchedItems.has(year.id)) return;
    setSelectedYear(year);
    setIncorrectAttempts(new Set());
  };

  const handleSignificanceClick = (significance: LegislationData) => {
    if (matchedItems.has(significance.id)) return;
    setSelectedSignificance(significance);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedDocument && selectedYear && selectedSignificance) {
      setAttempts(prev => prev + 1);
      
      if (selectedDocument.id === selectedYear.id && 
          selectedYear.id === selectedSignificance.id) {
        // Correct match!
        celebrateWithTheme('legislative');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedDocument.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('legislative'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedDocument.id, selectedYear.id, selectedSignificance.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedDocument(null);
        setSelectedYear(null);
        setSelectedSignificance(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedDocument, selectedYear, selectedSignificance, matchedItems.size]);

  const getButtonStyle = (item: LegislationData, isSelected: boolean) => {
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
      return `${baseClasses} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Constitutional: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Social Reform': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'International Treaty': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      Religious: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      Economic: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Legal Reform': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      'Human Rights': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      Major: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Foundational: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      Revolutionary: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Historic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Modern: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    };
    return colors[impact as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acts, Treaties & Bills Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match British legislation with their years and historical significance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{score}/{filteredData.length}</div>
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
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
          {types.map(type => (
            <Badge
              key={type}
              variant={filterType === type ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterType === type 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All Types' : type}
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
        <Button
          onClick={() => setShowReference(!showReference)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <BookOpen className="h-4 w-4" />
          {showReference ? 'Hide' : 'Show'} Legislative Reference
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">🎉 Legislative Mastery Achieved!</h3>
            <p className="text-emerald-700 dark:text-emerald-300">
              You've successfully matched all {filteredData.length} Acts, Treaties, and Bills!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legislative Reference Card */}
      {showReference && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <div className="w-4 h-4 bg-amber-600 rounded flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              British Legislative History Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {filteredData.map((doc) => (
                <div key={`ref-${doc.id}`} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="font-semibold text-amber-800 dark:text-amber-200">{doc.document}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1 text-xs leading-relaxed">{doc.significance}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {doc.year}
                    </Badge>
                    <Badge className={`text-xs ${getImpactColor(doc.impact)}`}>
                      {doc.impact}
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
        {/* Documents Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-amber-600 rounded flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              Acts, Treaties & Bills ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((doc) => (
              <div key={`doc-${doc.id}`} className="space-y-1">
                <button
                  onClick={() => handleDocumentClick(doc)}
                  className={getButtonStyle(doc, selectedDocument?.id === doc.id)}
                  disabled={matchedItems.has(doc.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{doc.document}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </Badge>
                    <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {doc.type}
                    </Badge>
                    <Badge className={`text-xs ${getImpactColor(doc.impact)}`}>
                      {doc.impact}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Years Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              Years ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {years.map((year) => (
              <button
                key={`year-${year.id}`}
                onClick={() => handleYearClick(year)}
                className={getButtonStyle(year, selectedYear?.id === year.id)}
                disabled={matchedItems.has(year.id)}
              >
                <div className="font-bold text-xl text-center">
                  {year.year}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getCategoryColor(year.category)}`}>
                  {year.category}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Significance Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              Historical Significance ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {significances.map((significance) => (
              <button
                key={`significance-${significance.id}`}
                onClick={() => handleSignificanceClick(significance)}
                className={getButtonStyle(significance, selectedSignificance?.id === significance.id)}
                disabled={matchedItems.has(significance.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {significance.significance}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">How to Play:</h4>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <li>• Select one document, one year, and one historical significance that all belong together</li>
            <li>• All three selections must match the same piece of legislation</li>
            <li>• Correct matches turn green and celebrate with confetti</li>
            <li>• Use category and type filters to focus on specific legislation types</li>
            <li>• Click "Show Legislative Reference" for a comprehensive guide to all documents</li>
            <li>• Learn about British constitutional, social, and legal history from Magna Carta to Brexit!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}