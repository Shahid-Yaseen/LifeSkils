import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Sword, Filter, Users } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface BattleData {
  id: string;
  battle: string;
  year: string;
  participants: string;
  era: 'Medieval' | 'Tudor' | 'Civil War' | 'Imperial' | 'Napoleonic' | 'World Wars' | 'Modern';
  type: 'Land Battle' | 'Naval Battle' | 'Siege' | 'Campaign' | 'Air Battle';
  location: string;
  outcome: 'British Victory' | 'British Defeat' | 'Decisive' | 'Pyrrhic Victory' | 'Draw';
}

const battlesWarsData: BattleData[] = [
  // Medieval Period
  {
    id: "1",
    battle: "Battle of Hastings",
    year: "1066",
    participants: "Norman forces vs Anglo-Saxon England (Harold II)",
    era: "Medieval",
    type: "Land Battle",
    location: "Hastings, England",
    outcome: "British Defeat"
  },
  {
    id: "2",
    battle: "Battle of Bannockburn",
    year: "1314",
    participants: "Scotland (Robert the Bruce) vs England (Edward II)",
    era: "Medieval",
    type: "Land Battle",
    location: "Stirling, Scotland",
    outcome: "British Defeat"
  },
  {
    id: "3",
    battle: "Battle of Agincourt",
    year: "1415",
    participants: "England (Henry V) vs France (Charles VI)",
    era: "Medieval",
    type: "Land Battle",
    location: "Agincourt, France",
    outcome: "British Victory"
  },
  {
    id: "4",
    battle: "Battle of Bosworth Field",
    year: "1485",
    participants: "Henry Tudor vs Richard III (Wars of the Roses)",
    era: "Medieval",
    type: "Land Battle",
    location: "Leicestershire, England",
    outcome: "Decisive"
  },

  // Tudor Period
  {
    id: "5",
    battle: "Spanish Armada",
    year: "1588",
    participants: "English Fleet (Francis Drake) vs Spanish Armada (Philip II)",
    era: "Tudor",
    type: "Naval Battle",
    location: "English Channel",
    outcome: "British Victory"
  },

  // English Civil War
  {
    id: "6",
    battle: "Battle of Marston Moor",
    year: "1644",
    participants: "Parliamentarians & Scots vs Royalists (Charles I)",
    era: "Civil War",
    type: "Land Battle",
    location: "Yorkshire, England",
    outcome: "Decisive"
  },
  {
    id: "7",
    battle: "Battle of Naseby",
    year: "1645",
    participants: "New Model Army (Cromwell) vs Royalist Army (Charles I)",
    era: "Civil War",
    type: "Land Battle",
    location: "Northamptonshire, England",
    outcome: "Decisive"
  },

  // Imperial Period
  {
    id: "8",
    battle: "Battle of Plassey",
    year: "1757",
    participants: "British East India Company (Robert Clive) vs Bengal (Siraj ud-Daulah)",
    era: "Imperial",
    type: "Land Battle", 
    location: "Bengal, India",
    outcome: "British Victory"
  },
  {
    id: "9",
    battle: "Battle of Culloden",
    year: "1746",
    participants: "British Government forces vs Jacobite Army (Bonnie Prince Charlie)",
    era: "Imperial",
    type: "Land Battle",
    location: "Scottish Highlands",
    outcome: "British Victory"
  },

  // Napoleonic Wars
  {
    id: "10",
    battle: "Battle of Trafalgar",
    year: "1805",
    participants: "Royal Navy (Admiral Nelson) vs French & Spanish fleets",
    era: "Napoleonic",
    type: "Naval Battle",
    location: "Cape Trafalgar, Spain",
    outcome: "British Victory"
  },
  {
    id: "11",
    battle: "Battle of Waterloo",
    year: "1815",
    participants: "British-Prussian Alliance (Wellington) vs French Empire (Napoleon)",
    era: "Napoleonic",
    type: "Land Battle",
    location: "Waterloo, Belgium",
    outcome: "British Victory"
  },
  {
    id: "12",
    battle: "Peninsula War",
    year: "1808-1814",
    participants: "British-Portuguese-Spanish vs French Empire (Napoleon)",
    era: "Napoleonic",
    type: "Campaign",
    location: "Iberian Peninsula",
    outcome: "British Victory"
  },

  // World War I
  {
    id: "13",
    battle: "Battle of the Somme",
    year: "1916",
    participants: "British Empire forces vs German Empire",
    era: "World Wars",
    type: "Land Battle",
    location: "Somme, France",
    outcome: "Pyrrhic Victory"
  },
  {
    id: "14",
    battle: "Battle of Passchendaele",
    year: "1917",
    participants: "British Empire & Canadian Corps vs German Empire",
    era: "World Wars",
    type: "Land Battle",
    location: "Ypres, Belgium",
    outcome: "Pyrrhic Victory"
  },
  {
    id: "15",
    battle: "Battle of Jutland",
    year: "1916",
    participants: "Royal Navy (Admiral Jellicoe) vs German High Seas Fleet",
    era: "World Wars",
    type: "Naval Battle",
    location: "North Sea",
    outcome: "Draw"
  },

  // World War II
  {
    id: "16",
    battle: "Battle of Britain",
    year: "1940",
    participants: "RAF (Fighter Command) vs German Luftwaffe",
    era: "World Wars",
    type: "Air Battle",
    location: "United Kingdom airspace",
    outcome: "British Victory"
  },
  {
    id: "17",
    battle: "D-Day (Operation Overlord)",
    year: "1944",
    participants: "Allied forces (UK, US, Canada) vs German Wehrmacht",
    era: "World Wars",
    type: "Land Battle",
    location: "Normandy, France",
    outcome: "British Victory"
  },
  {
    id: "18",
    battle: "Battle of El Alamein",
    year: "1942",
    participants: "British 8th Army (Montgomery) vs German Afrika Korps (Rommel)",
    era: "World Wars",
    type: "Land Battle",
    location: "Egypt, North Africa",
    outcome: "British Victory"
  },
  {
    id: "19",
    battle: "Battle of the Atlantic",
    year: "1939-1945",
    participants: "Royal Navy & Allied convoys vs German U-boats",
    era: "World Wars",
    type: "Naval Battle",
    location: "Atlantic Ocean",
    outcome: "British Victory"
  },

  // Modern Conflicts
  {
    id: "20",
    battle: "Falklands War",
    year: "1982",
    participants: "British Task Force vs Argentine forces",
    era: "Modern",
    type: "Campaign",
    location: "Falkland Islands, South Atlantic",
    outcome: "British Victory"
  },
  {
    id: "21",
    battle: "Gulf War",
    year: "1991",
    participants: "Coalition forces (UK, US, allies) vs Iraqi forces",
    era: "Modern",
    type: "Campaign",
    location: "Kuwait & Iraq",
    outcome: "British Victory"
  }
];

interface BattlesWarsMatchingProps {
  userId: string;
}

export default function BattlesWarsMatching({ userId }: BattlesWarsMatchingProps) {
  const [battles, setBattles] = useState<BattleData[]>([]);
  const [years, setYears] = useState<BattleData[]>([]);
  const [participants, setParticipants] = useState<BattleData[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<BattleData | null>(null);
  const [selectedYear, setSelectedYear] = useState<BattleData | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<BattleData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterEra, setFilterEra] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const eras = ['all', 'Medieval', 'Tudor', 'Civil War', 'Imperial', 'Napoleonic', 'World Wars', 'Modern'];
  const types = ['all', 'Land Battle', 'Naval Battle', 'Siege', 'Campaign', 'Air Battle'];

  const getFilteredData = () => {
    let filtered = battlesWarsData;
    
    if (filterEra !== 'all') {
      filtered = filtered.filter(item => item.era === filterEra);
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
    setBattles(shuffleArray(filteredData));
    setYears(shuffleArray(filteredData));
    setParticipants(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedBattle(null);
    setSelectedYear(null);
    setSelectedParticipant(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterEra, filterType]);

  const handleBattleClick = (battle: BattleData) => {
    if (matchedItems.has(battle.id)) return;
    setSelectedBattle(battle);
    setIncorrectAttempts(new Set());
  };

  const handleYearClick = (year: BattleData) => {
    if (matchedItems.has(year.id)) return;
    setSelectedYear(year);
    setIncorrectAttempts(new Set());
  };

  const handleParticipantClick = (participant: BattleData) => {
    if (matchedItems.has(participant.id)) return;
    setSelectedParticipant(participant);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedBattle && selectedYear && selectedParticipant) {
      setAttempts(prev => prev + 1);
      
      if (selectedBattle.id === selectedYear.id && 
          selectedYear.id === selectedParticipant.id) {
        // Correct match!
        celebrateWithTheme('military');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedBattle.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('military'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedBattle.id, selectedYear.id, selectedParticipant.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedBattle(null);
        setSelectedYear(null);
        setSelectedParticipant(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedBattle, selectedYear, selectedParticipant, matchedItems.size]);

  const getButtonStyle = (item: BattleData, isSelected: boolean) => {
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
      return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer`;
  };

  const getEraColor = (era: string) => {
    // Use only 4 base colors for better consistency and contrast
    switch (era) {
      case "Medieval":
      case "Tudor":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700";
      case "Civil War":
      case "Imperial":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700";
      case "Napoleonic":
      case "World Wars":
        return "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-700";
      case "Modern":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getOutcomeColor = (outcome: string) => {
    // Use only 4 base colors for better consistency and contrast
    switch (outcome) {
      case "British Victory":
      case "Decisive":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700";
      case "British Defeat":
      case "Pyrrhic Victory":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700";
      case "Draw":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center">
            <Sword className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">British Battles & Wars Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match battles with their years and participants throughout British history</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{score}/{filteredData.length}</div>
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Historical Era:</span>
          {eras.map(era => (
            <Badge
              key={era}
              variant={filterEra === era ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterEra === era 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setFilterEra(era)}
            >
              {era === 'all' ? 'All Eras' : era}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Battle Type:</span>
          {types.map(type => (
            <Badge
              key={type}
              variant={filterType === type ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterType === type 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
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
          onClick={() => setShowParticipants(!showParticipants)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Users className="h-4 w-4" />
          {showParticipants ? 'Hide' : 'Show'} All Participants
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">🎉 Victory Achieved!</h3>
            <p className="text-emerald-700 dark:text-emerald-300">
              You've successfully matched all {filteredData.length} battles with their years and participants!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Participants Reference Card */}
      {showParticipants && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <div className="w-4 h-4 bg-amber-600 rounded flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              Battle Participants Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {filteredData.map((battle) => (
                <div key={`ref-${battle.id}`} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="font-semibold text-amber-800 dark:text-amber-200">{battle.battle}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1 text-xs leading-relaxed">{battle.participants}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getEraColor(battle.era)}`}>
                      {battle.era}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {battle.year}
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
        {/* Battles Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center">
                <Sword className="h-3 w-3 text-white" />
              </div>
              Battles & Wars ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {battles.map((battle) => (
              <div key={`battle-${battle.id}`} className="space-y-1">
                <button
                  onClick={() => handleBattleClick(battle)}
                  className={getButtonStyle(battle, selectedBattle?.id === battle.id)}
                  disabled={matchedItems.has(battle.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{battle.battle}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getEraColor(battle.era)}`}>
                      {battle.era}
                    </Badge>
                    <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {battle.type}
                    </Badge>
                    <Badge className={`text-xs ${getOutcomeColor(battle.outcome)}`}>
                      {battle.outcome}
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
                <Sword className="h-3 w-3 text-white" />
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
                <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {year.location}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getEraColor(year.era)}`}>
                  {year.era}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Participants Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              Participants ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {participants.map((participant) => (
              <button
                key={`participant-${participant.id}`}
                onClick={() => handleParticipantClick(participant)}
                className={getButtonStyle(participant, selectedParticipant?.id === participant.id)}
                disabled={matchedItems.has(participant.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {participant.participants}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">How to Play:</h4>
          <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
            <li>• Select one battle, one year, and one set of participants that all belong together</li>
            <li>• All three selections must match the same historical conflict</li>
            <li>• Correct matches turn green and celebrate with confetti</li>
            <li>• Use era and type filters to focus on specific periods or battle types</li>
            <li>• Click "Show All Participants" for a reference guide to help with matching</li>
            <li>• Learn about British military history from medieval times to modern conflicts!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}