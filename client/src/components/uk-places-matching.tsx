import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, MapPin, Filter, Landmark } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface PlaceData {
  id: string;
  place: string;
  region: string;
  description: string;
  category: 'Historic Site' | 'Natural Landmark' | 'Cultural Site' | 'Royal Palace' | 'Religious Site' | 'Museum' | 'University' | 'Modern Attraction';
  country: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';
  significance: 'World Heritage' | 'National Importance' | 'Royal Connection' | 'Cultural Icon' | 'Natural Wonder' | 'Educational' | 'Religious';
  details: string;
}

const ukPlacesData: PlaceData[] = [
  // England - London
  {
    id: "1",
    place: "Tower of London",
    region: "London",
    description: "Historic royal fortress and Crown Jewels location",
    category: "Historic Site",
    country: "England",
    significance: "World Heritage",
    details: "Norman castle, Crown Jewels, Yeoman Warders (Beefeaters), 1,000 years of history"
  },
  {
    id: "2",
    place: "Buckingham Palace",
    region: "London",
    description: "Official London residence of British monarch",
    category: "Royal Palace",
    country: "England",
    significance: "Royal Connection",
    details: "State rooms, Changing of Guard ceremony, official royal events"
  },
  {
    id: "3",
    place: "Westminster Abbey",
    region: "London",
    description: "Gothic abbey where monarchs are crowned and buried",
    category: "Religious Site",
    country: "England",
    significance: "Royal Connection",
    details: "Coronations, royal weddings, Poets' Corner, Henry VII Chapel"
  },
  {
    id: "4",
    place: "British Museum",
    region: "London",
    description: "World's largest collection of cultural artifacts",
    category: "Museum",
    country: "England",
    significance: "Cultural Icon",
    details: "Rosetta Stone, Egyptian mummies, Greek sculptures, free admission"
  },
  {
    id: "5",
    place: "Houses of Parliament",
    region: "London",
    description: "Seat of UK government with Big Ben clock tower",
    category: "Historic Site",
    country: "England",
    significance: "National Importance",
    details: "House of Commons, House of Lords, Westminster Hall, democratic heritage"
  },

  // England - Other Regions
  {
    id: "6",
    place: "Stonehenge",
    region: "Wiltshire",
    description: "Prehistoric stone circle monument",
    category: "Historic Site",
    country: "England",
    significance: "World Heritage",
    details: "5,000 years old, astronomical alignments, Neolithic monument"
  },
  {
    id: "7",
    place: "Bath",
    region: "Somerset",
    description: "Roman spa town with Georgian architecture",
    category: "Historic Site",
    country: "England",
    significance: "World Heritage",
    details: "Roman Baths, Royal Crescent, Georgian terraces, natural hot springs"
  },
  {
    id: "8",
    place: "Canterbury Cathedral",
    region: "Kent",
    description: "Mother church of Anglican Communion",
    category: "Religious Site",
    country: "England",
    significance: "World Heritage",
    details: "Archbishop of Canterbury seat, Thomas Becket murder site, pilgrimage destination"
  },
  {
    id: "9",
    place: "University of Cambridge",
    region: "Cambridgeshire",
    description: "World-renowned university founded in 1209",
    category: "University",
    country: "England",
    significance: "Educational",
    details: "31 colleges, King's College Chapel, famous alumni, rowing tradition"
  },
  {
    id: "10",
    place: "University of Oxford",
    region: "Oxfordshire",
    description: "Oldest English-speaking university in the world",
    category: "University",
    country: "England",
    significance: "Educational",
    details: "38 colleges, Bodleian Library, Christ Church, tutorial system"
  },
  {
    id: "11",
    place: "Lake District",
    region: "Cumbria",
    description: "Mountainous region with lakes and fells",
    category: "Natural Landmark",
    country: "England",
    significance: "World Heritage",
    details: "16 major lakes, highest peak Scafell Pike, Wordsworth country, national park"
  },

  // Scotland
  {
    id: "12",
    place: "Edinburgh Castle",
    region: "Edinburgh",
    description: "Historic fortress dominating Edinburgh skyline",
    category: "Historic Site",
    country: "Scotland",
    significance: "National Importance",
    details: "Crown Jewels of Scotland, Stone of Destiny, Military Tattoo venue"
  },
  {
    id: "13",
    place: "Loch Ness",
    region: "Scottish Highlands",
    description: "Famous deep freshwater loch",
    category: "Natural Landmark",
    country: "Scotland",
    significance: "Cultural Icon",
    details: "Largest loch by volume, Nessie legend, Urquhart Castle ruins"
  },
  {
    id: "14",
    place: "St. Andrews",
    region: "Fife",
    description: "Historic university town and golf's spiritual home",
    category: "University",
    country: "Scotland",
    significance: "Educational",
    details: "University of St Andrews, Old Course golf, royal connections"
  },
  {
    id: "15",
    place: "Isle of Skye",
    region: "Scottish Highlands",
    description: "Dramatic island with rugged landscapes",
    category: "Natural Landmark",
    country: "Scotland",
    significance: "Natural Wonder",
    details: "Cuillin mountains, Old Man of Storr, fairy pools, clan castles"
  },
  {
    id: "16",
    place: "Stirling Castle",
    region: "Stirling",
    description: "Renaissance palace and strategic fortress",
    category: "Historic Site",
    country: "Scotland",
    significance: "National Importance",
    details: "Mary Queen of Scots coronation, William Wallace monument nearby"
  },

  // Wales
  {
    id: "17",
    place: "Caerphilly Castle",
    region: "Caerphilly",
    description: "Medieval fortress with leaning tower",
    category: "Historic Site",
    country: "Wales",
    significance: "National Importance",
    details: "Second largest castle in Britain, water defenses, 13th century"
  },
  {
    id: "18",
    place: "Snowdonia",
    region: "Gwynedd",
    description: "Mountainous national park with highest Welsh peak",
    category: "Natural Landmark",
    country: "Wales",
    significance: "Natural Wonder",
    details: "Mount Snowdon, Welsh language stronghold, slate quarries"
  },
  {
    id: "19",
    place: "Cardiff Castle",
    region: "Cardiff",
    description: "Victorian Gothic revival castle in capital city",
    category: "Historic Site",
    country: "Wales",
    significance: "National Importance",
    details: "Roman fort origins, Victorian transformation, Welsh capital landmark"
  },
  {
    id: "20",
    place: "Pembrokeshire Coast",
    region: "Pembrokeshire",
    description: "Dramatic coastline with cliffs and beaches",
    category: "Natural Landmark",
    country: "Wales",
    significance: "Natural Wonder",
    details: "National park, coastal path, puffins, prehistoric sites"
  },

  // Northern Ireland
  {
    id: "21",
    place: "Giant's Causeway",
    region: "County Antrim",
    description: "Unique hexagonal basalt column formation",
    category: "Natural Landmark",
    country: "Northern Ireland",
    significance: "World Heritage",
    details: "40,000 interlocking columns, volcanic activity, Finn MacCool legend"
  }
];

interface UKPlacesMatchingProps {
  userId: string;
}

export default function UKPlacesMatching({ userId }: UKPlacesMatchingProps) {
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [regions, setRegions] = useState<PlaceData[]>([]);
  const [descriptions, setDescriptions] = useState<PlaceData[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<PlaceData | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<PlaceData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const countries = ['all', 'England', 'Scotland', 'Wales', 'Northern Ireland'];
  const categories = ['all', 'Historic Site', 'Natural Landmark', 'Cultural Site', 'Royal Palace', 'Religious Site', 'Museum', 'University', 'Modern Attraction'];

  const getFilteredData = () => {
    let filtered = ukPlacesData;
    
    if (filterCountry !== 'all') {
      filtered = filtered.filter(item => item.country === filterCountry);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
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
    setPlaces(shuffleArray(filteredData));
    setRegions(shuffleArray(filteredData));
    setDescriptions(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedPlace(null);
    setSelectedRegion(null);
    setSelectedDescription(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterCountry, filterCategory]);

  const handlePlaceClick = (place: PlaceData) => {
    if (matchedItems.has(place.id)) return;
    setSelectedPlace(place);
    setIncorrectAttempts(new Set());
  };

  const handleRegionClick = (region: PlaceData) => {
    if (matchedItems.has(region.id)) return;
    setSelectedRegion(region);
    setIncorrectAttempts(new Set());
  };

  const handleDescriptionClick = (description: PlaceData) => {
    if (matchedItems.has(description.id)) return;
    setSelectedDescription(description);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedPlace && selectedRegion && selectedDescription) {
      setAttempts(prev => prev + 1);
      
      if (selectedPlace.id === selectedRegion.id && 
          selectedRegion.id === selectedDescription.id) {
        // Correct match!
        celebrateWithTheme('general');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedPlace.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('general'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedPlace.id, selectedRegion.id, selectedDescription.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedPlace(null);
        setSelectedRegion(null);
        setSelectedDescription(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedPlace, selectedRegion, selectedDescription, matchedItems.size]);

  const getButtonStyle = (item: PlaceData, isSelected: boolean) => {
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
      return `${baseClasses} bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`;
  };

  const getCountryColor = (country: string) => {
    const colors = {
      England: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Scotland: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Wales: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Northern Ireland': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[country as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Historic Site': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Natural Landmark': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Cultural Site': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      'Royal Palace': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Religious Site': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Museum': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'University': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Modern Attraction': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UK Places of Interest Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match places with their regions and descriptions across the UK</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{score}/{filteredData.length}</div>
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
          <span className="text-sm font-medium text-gray-700">Country:</span>
          {countries.map(country => (
            <Badge
              key={country}
              variant={filterCountry === country ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterCountry === country 
                  ? 'bg-teal-600 text-white' 
                  : 'hover:bg-teal-100'
              }`}
              onClick={() => setFilterCountry(country)}
            >
              {country === 'all' ? 'All Countries' : country}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Category:</span>
          {categories.map(category => (
            <Badge
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterCategory === category 
                  ? 'bg-violet-600 text-white' 
                  : 'hover:bg-violet-100'
              }`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
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
          <Landmark className="h-4 w-4" />
          {showReference ? 'Hide' : 'Show'} Places Reference
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">🗺️ Geographic Mastery Achieved!</h3>
            <p className="text-emerald-700 dark:text-emerald-400">
              You've successfully matched all {filteredData.length} places of interest with their regions!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Places Reference Card */}
      {showReference && (
        <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-teal-800 dark:text-teal-300">
              <div className="w-4 h-4 bg-teal-600 rounded flex items-center justify-center">
                <Landmark className="h-3 w-3 text-white" />
              </div>
              UK Places of Interest Reference Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {filteredData.map((place) => (
                <div key={`ref-${place.id}`} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="font-semibold text-teal-800 dark:text-teal-300">{place.place}</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs leading-relaxed">{place.details}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getCountryColor(place.country)}`}>
                      {place.country}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {place.region}
                    </Badge>
                    <Badge className={`text-xs ${getCategoryColor(place.category)}`}>
                      {place.category}
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
        {/* Places Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-teal-600 rounded flex items-center justify-center">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              Places of Interest ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {places.map((place) => (
              <div key={`place-${place.id}`} className="space-y-1">
                <button
                  onClick={() => handlePlaceClick(place)}
                  className={getButtonStyle(place, selectedPlace?.id === place.id)}
                  disabled={matchedItems.has(place.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{place.place}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getCountryColor(place.country)}`}>
                      {place.country}
                    </Badge>
                    <Badge className={`text-xs ${getCategoryColor(place.category)}`}>
                      {place.category}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <MapPin className="h-3 w-3 text-white" />
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
                <div className="font-bold text-center text-sm">
                  {region.region}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getCountryColor(region.country)}`}>
                  {region.country}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Descriptions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Landmark className="h-3 w-3 text-white" />
              </div>
              Descriptions ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {descriptions.map((description) => (
              <button
                key={`description-${description.id}`}
                onClick={() => handleDescriptionClick(description)}
                className={getButtonStyle(description, selectedDescription?.id === description.id)}
                disabled={matchedItems.has(description.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {description.description}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">How to Play:</h4>
          <ul className="text-sm text-teal-700 dark:text-teal-400 space-y-1">
            <li>• Select one place, one region, and one description that all belong together</li>
            <li>• All three selections must match the same location of interest</li>
            <li>• Correct matches turn emerald and celebrate with confetti</li>
            <li>• Use country and category filters to focus on specific areas or types of places</li>
            <li>• Click "Show Places Reference" for comprehensive information about each location</li>
            <li>• Learn about UK geography from London landmarks to Scottish highlands!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}