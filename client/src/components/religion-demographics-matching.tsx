import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Church, Filter } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface ReligionData {
  id: string;
  religion: string;
  percentage: string;
  ethnicity: string;
  category: 'Christian' | 'Muslim' | 'Hindu' | 'Sikh' | 'Jewish' | 'Buddhist' | 'Non-Religious' | 'Other';
  region: 'England' | 'Wales' | 'Scotland' | 'Northern Ireland' | 'UK Overall';
}

const religionDemographicsData: ReligionData[] = [
  // UK Overall - Major Religions
  {
    id: "1",
    religion: "Christianity (All Denominations)",
    percentage: "59.5%",
    ethnicity: "White British majority, diverse ethnic representation",
    category: "Christian",
    region: "UK Overall"
  },
  {
    id: "2",
    religion: "No Religion/Non-Religious",
    percentage: "25.7%",
    ethnicity: "Predominantly White British, growing across all ethnicities",
    category: "Non-Religious",
    region: "UK Overall"
  },
  {
    id: "3",
    religion: "Islam",
    percentage: "4.4%",
    ethnicity: "Pakistani (43%), Bangladeshi (15%), Other Asian (12%), Arab (6%)",
    category: "Muslim",
    region: "UK Overall"
  },
  {
    id: "4",
    religion: "Hinduism",
    percentage: "1.3%",
    ethnicity: "Indian (87%), Other Asian (8%), Mixed heritage (3%)",
    category: "Hindu",
    region: "UK Overall"
  },
  {
    id: "5",
    religion: "Sikhism",
    percentage: "0.7%",
    ethnicity: "Indian Punjabi (95%), Other Asian (3%), Mixed heritage (2%)",
    category: "Sikh",
    region: "UK Overall"
  },
  {
    id: "6",
    religion: "Judaism",
    percentage: "0.4%",
    ethnicity: "White British/European (85%), Mixed heritage (10%), Other (5%)",
    category: "Jewish",
    region: "UK Overall"
  },
  {
    id: "7",
    religion: "Buddhism",
    percentage: "0.4%",
    ethnicity: "Chinese (35%), White British (30%), Other Asian (20%), Mixed (15%)",
    category: "Buddhist",
    region: "UK Overall"
  },

  // England Specific
  {
    id: "8",
    religion: "Church of England (Anglican)",
    percentage: "20.7%",
    ethnicity: "White British (88%), White Other (7%), Mixed heritage (3%)",
    category: "Christian",
    region: "England"
  },
  {
    id: "9",
    religion: "Roman Catholic",
    percentage: "8.6%",
    ethnicity: "White British (65%), White Irish (15%), Polish (8%), Other (12%)",
    category: "Christian",
    region: "England"
  },
  {
    id: "10",
    religion: "Methodist",
    percentage: "1.2%",
    ethnicity: "White British (92%), Caribbean (4%), Other (4%)",
    category: "Christian",
    region: "England"
  },

  // Wales Specific
  {
    id: "11",
    religion: "Church in Wales",
    percentage: "13.8%",
    ethnicity: "White Welsh (95%), White Other (3%), Mixed heritage (2%)",
    category: "Christian",
    region: "Wales"
  },
  {
    id: "12",
    religion: "Presbyterian Church of Wales",
    percentage: "0.8%",
    ethnicity: "White Welsh (96%), White Other (3%), Mixed heritage (1%)",
    category: "Christian",
    region: "Wales"
  },

  // Scotland Specific
  {
    id: "13",
    religion: "Church of Scotland (Presbyterian)",
    percentage: "20.4%",
    ethnicity: "White Scottish (94%), White Other (4%), Mixed heritage (2%)",
    category: "Christian",
    region: "Scotland"
  },
  {
    id: "14",
    religion: "Roman Catholic (Scotland)",
    percentage: "15.9%",
    ethnicity: "White Scottish (80%), White Irish (12%), Polish (5%), Other (3%)",
    category: "Christian",
    region: "Scotland"
  },

  // Northern Ireland Specific
  {
    id: "15",
    religion: "Presbyterian Church in Ireland",
    percentage: "19.0%",
    ethnicity: "White British/Ulster (96%), White Other (3%), Mixed heritage (1%)",
    category: "Christian",
    region: "Northern Ireland"
  },
  {
    id: "16",
    religion: "Roman Catholic (Northern Ireland)",
    percentage: "40.8%",
    ethnicity: "White Irish/Catholic (94%), White Other (4%), Mixed heritage (2%)",
    category: "Christian",
    region: "Northern Ireland"
  },
  {
    id: "17",
    religion: "Church of Ireland (Anglican)",
    percentage: "13.7%",
    ethnicity: "White British/Protestant (95%), White Other (3%), Mixed heritage (2%)",
    category: "Christian",
    region: "Northern Ireland"
  },

  // Ethnic-Specific Religious Concentrations
  {
    id: "18",
    religion: "Caribbean Christian Churches",
    percentage: "2.1% of Christians",
    ethnicity: "Black Caribbean (85%), Black African (10%), Mixed Caribbean (5%)",
    category: "Christian",
    region: "England"
  },
  {
    id: "19",
    religion: "African Christian Churches",
    percentage: "1.8% of Christians",
    ethnicity: "Black African (90%), Black Caribbean (5%), Mixed heritage (5%)",
    category: "Christian",
    region: "England"
  },
  {
    id: "20",
    religion: "Orthodox Christianity",
    percentage: "0.5%",
    ethnicity: "White Other European (70%), Greek (15%), Russian (10%), Other (5%)",
    category: "Christian",
    region: "UK Overall"
  },

  // Non-Religious by Ethnicity
  {
    id: "21",
    religion: "Secular/Atheist/Agnostic",
    percentage: "25.7%",
    ethnicity: "White British (78%), White Other (12%), Mixed heritage (6%), Other (4%)",
    category: "Non-Religious",
    region: "UK Overall"
  }
];

interface ReligionDemographicsMatchingProps {
  userId: string;
}

export default function ReligionDemographicsMatching({ userId }: ReligionDemographicsMatchingProps) {
  const [religions, setReligions] = useState<ReligionData[]>([]);
  const [percentages, setPercentages] = useState<ReligionData[]>([]);
  const [ethnicities, setEthnicities] = useState<ReligionData[]>([]);
  const [selectedReligion, setSelectedReligion] = useState<ReligionData | null>(null);
  const [selectedPercentage, setSelectedPercentage] = useState<ReligionData | null>(null);
  const [selectedEthnicity, setSelectedEthnicity] = useState<ReligionData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);

  const categories = ['all', 'Christian', 'Muslim', 'Hindu', 'Sikh', 'Jewish', 'Buddhist', 'Non-Religious', 'Other'];
  const regionFilters = ['all', 'UK Overall', 'England', 'Wales', 'Scotland', 'Northern Ireland'];

  const getFilteredData = () => {
    let filtered = religionDemographicsData;
    
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
    setReligions(shuffleArray(filteredData));
    setPercentages(shuffleArray(filteredData));
    setEthnicities(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedReligion(null);
    setSelectedPercentage(null);
    setSelectedEthnicity(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterCategory, filterRegion]);

  const handleReligionClick = (religion: ReligionData) => {
    if (matchedItems.has(religion.id)) return;
    setSelectedReligion(religion);
    setIncorrectAttempts(new Set());
  };

  const handlePercentageClick = (percentage: ReligionData) => {
    if (matchedItems.has(percentage.id)) return;
    setSelectedPercentage(percentage);
    setIncorrectAttempts(new Set());
  };

  const handleEthnicityClick = (ethnicity: ReligionData) => {
    if (matchedItems.has(ethnicity.id)) return;
    setSelectedEthnicity(ethnicity);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedReligion && selectedPercentage && selectedEthnicity) {
      setAttempts(prev => prev + 1);
      
      if (selectedReligion.id === selectedPercentage.id && 
          selectedPercentage.id === selectedEthnicity.id) {
        // Correct match!
        celebrateWithTheme('religious');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedReligion.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('religious'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedReligion.id, selectedPercentage.id, selectedEthnicity.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedReligion(null);
        setSelectedPercentage(null);
        setSelectedEthnicity(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedReligion, selectedPercentage, selectedEthnicity, matchedItems.size]);

  const getButtonStyle = (item: ReligionData, isSelected: boolean) => {
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
      return `${baseClasses} bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Christian: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Muslim: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      Hindu: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Sikh: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Jewish: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      Buddhist: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Non-Religious': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      Other: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getRegionColor = (region: string) => {
    const colors = {
      'UK Overall': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      'England': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      'Wales': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Scotland': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Northern Ireland': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
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
          <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
            <Church className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UK Religion & Demographics Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match religions with their percentages and ethnic compositions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{score}/{filteredData.length}</div>
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
          <span className="text-sm font-medium text-gray-700">Religion:</span>
          {categories.map(category => (
            <Badge
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterCategory === category 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? 'All Religions' : category}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Region:</span>
          {regionFilters.map(region => (
            <Badge
              key={region}
              variant={filterRegion === region ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterRegion === region 
                  ? 'bg-violet-600 text-white' 
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
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">🎉 Congratulations!</h3>
            <p className="text-emerald-700 dark:text-emerald-400">
              You've successfully matched all {filteredData.length} religions with their demographics!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Religions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center">
                <Church className="h-3 w-3 text-white" />
              </div>
              Religions ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {religions.map((religion) => (
              <div key={`religion-${religion.id}`} className="space-y-1">
                <button
                  onClick={() => handleReligionClick(religion)}
                  className={getButtonStyle(religion, selectedReligion?.id === religion.id)}
                  disabled={matchedItems.has(religion.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{religion.religion}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getCategoryColor(religion.category)}`}>
                      {religion.category}
                    </Badge>
                    <Badge className={`text-xs ${getRegionColor(religion.region)}`}>
                      {religion.region}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Percentages Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Church className="h-3 w-3 text-white" />
              </div>
              Percentages ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {percentages.map((percentage) => (
              <button
                key={`percentage-${percentage.id}`}
                onClick={() => handlePercentageClick(percentage)}
                className={getButtonStyle(percentage, selectedPercentage?.id === percentage.id)}
                disabled={matchedItems.has(percentage.id)}
              >
                <div className="font-bold text-lg text-center">
                  {percentage.percentage}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getRegionColor(percentage.region)}`}>
                  {percentage.region}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Ethnicities Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Church className="h-3 w-3 text-white" />
              </div>
              Ethnic Composition ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ethnicities.map((ethnicity) => (
              <button
                key={`ethnicity-${ethnicity.id}`}
                onClick={() => handleEthnicityClick(ethnicity)}
                className={getButtonStyle(ethnicity, selectedEthnicity?.id === ethnicity.id)}
                disabled={matchedItems.has(ethnicity.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {ethnicity.ethnicity}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">How to Play:</h4>
          <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
            <li>• Select one religion, one percentage, and one ethnic composition that all belong together</li>
            <li>• All three selections must match the same religious demographic data</li>
            <li>• Correct matches turn emerald and celebrate with confetti</li>
            <li>• Use religion and region filters to focus on specific demographics</li>
            <li>• Learn about UK's religious diversity and ethnic composition!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}