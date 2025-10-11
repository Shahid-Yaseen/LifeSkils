import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MapControls from "./map-controls";
import MapInteractionHandler from "./map-interaction-handler";
import { useMapLocations } from "@/hooks/useMapLocations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Users, BookOpen, Landmark, Crown, Filter, Search, ZoomIn, ZoomOut } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-map.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocation {
  id: string;
  name: string;
  region: string;
  type: 'capital' | 'attraction' | 'historical' | 'artistic' | 'literary';
  coordinates: { lat: number; lng: number }; // Real geographic coordinates
  description: string;
  details: string;
  notablePeople?: string[];
  lifeInUKInfo?: {
    population?: string;
    government?: string;
    culture?: string;
    economy?: string;
    testRelevance?: string;
  };
}

// Real geographic coordinates for UK locations
const mapLocations: MapLocation[] = [
  // Capitals
  {
    id: "1",
    name: "London",
    region: "England",
    type: "capital",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    description: "Capital of England and the UK",
    details: "Seat of government, monarchy, and Parliament. Population over 9 million.",
    notablePeople: ["Charles Dickens", "William Shakespeare", "Virginia Woolf", "J.M.W. Turner", "David Hockney"],
    lifeInUKInfo: {
      population: "9.5 million (Greater London), largest city in UK",
      government: "Houses of Parliament, Prime Minister's residence at 10 Downing Street, Buckingham Palace",
      culture: "Financial center, West End theatres, numerous museums (British Museum, Tate Modern, National Gallery)",
      economy: "Major global financial center, contributes 22% of UK's GDP",
      testRelevance: "Essential for Life in UK test - seat of government, monarchy, Parliament, and cultural institutions"
    }
  },
  {
    id: "2",
    name: "Belfast",
    region: "Northern Ireland",
    type: "capital",
    coordinates: { lat: 54.5973, lng: -5.9301 },
    description: "Capital of Northern Ireland",
    details: "Major port city, shipbuilding heritage including RMS Titanic construction.",
    notablePeople: ["C.S. Lewis", "Seamus Heaney", "Van Morrison", "Kenneth Branagh"],
    lifeInUKInfo: {
      population: "345,000 (Belfast), 1.9 million (Northern Ireland)",
      government: "Northern Ireland Assembly at Stormont, power-sharing government",
      culture: "Titanic Belfast museum, Ulster Museum, strong Irish and British cultural traditions",
      economy: "Aerospace, shipbuilding, textiles, and tourism industries",
      testRelevance: "Important for understanding Northern Ireland's role in UK, history of Troubles, Good Friday Agreement"
    }
  },
  {
    id: "3",
    name: "Edinburgh",
    region: "Scotland",
    type: "capital",
    coordinates: { lat: 55.9533, lng: -3.1883 },
    description: "Capital of Scotland",
    details: "Historic Scottish capital with Edinburgh Castle and Royal Mile.",
    notablePeople: ["Sir Walter Scott", "Robert Louis Stevenson", "Sir Arthur Conan Doyle"],
    lifeInUKInfo: {
      population: "540,000 (Edinburgh), 5.5 million (Scotland)",
      government: "Scottish Parliament at Holyrood, devolved powers for Scotland",
      culture: "Edinburgh Festival, Royal Mile, Edinburgh Castle, Scottish traditions",
      economy: "Financial services, tourism, education, technology sector",
      testRelevance: "Key for Scottish devolution, history, culture, and role in the UK union"
    }
  },
  {
    id: "4",
    name: "Cardiff",
    region: "Wales",
    type: "capital",
    coordinates: { lat: 51.4816, lng: -3.1791 },
    description: "Capital of Wales",
    details: "Welsh capital with rich industrial heritage and modern cultural scene.",
    notablePeople: ["Dylan Thomas", "Roald Dahl", "Shirley Bassey"],
    lifeInUKInfo: {
      population: "370,000 (Cardiff), 3.1 million (Wales)",
      government: "Welsh Parliament (Senedd), devolved powers for Wales",
      culture: "Welsh language and culture, Cardiff Castle, Millennium Stadium",
      economy: "Financial services, media, tourism, and technology",
      testRelevance: "Important for understanding Welsh devolution and cultural identity"
    }
  },

  // Major Attractions
  {
    id: "5",
    name: "Stonehenge",
    region: "Wiltshire",
    type: "attraction",
    coordinates: { lat: 51.1789, lng: -1.8262 },
    description: "Prehistoric stone circle",
    details: "5,000-year-old Neolithic monument, UNESCO World Heritage Site."
  },
  {
    id: "6",
    name: "Lake District",
    region: "Cumbria",
    type: "attraction",
    coordinates: { lat: 54.4609, lng: -3.0886 },
    description: "National park with lakes and mountains",
    details: "UNESCO World Heritage cultural landscape, inspiration for Romantic poets.",
    notablePeople: ["William Wordsworth", "Samuel Taylor Coleridge", "Beatrix Potter"]
  },
  {
    id: "7",
    name: "Giant's Causeway",
    region: "County Antrim",
    type: "attraction",
    coordinates: { lat: 55.2408, lng: -6.5116 },
    description: "Hexagonal basalt columns",
    details: "40,000 interlocking columns formed by volcanic activity, UNESCO World Heritage Site."
  },

  // Historical Locations
  {
    id: "8",
    name: "Canterbury",
    region: "Kent",
    type: "historical",
    coordinates: { lat: 51.2802, lng: 1.0789 },
    description: "Historic cathedral city",
    details: "Canterbury Cathedral, seat of Archbishop, pilgrimage destination since medieval times.",
    notablePeople: ["Geoffrey Chaucer", "Thomas à Becket"]
  },
  {
    id: "9",
    name: "Bath",
    region: "Somerset",
    type: "historical",
    coordinates: { lat: 51.3811, lng: -2.3590 },
    description: "Roman spa town",
    details: "Roman Baths, Georgian architecture, UNESCO World Heritage Site.",
    notablePeople: ["Jane Austen", "Richard Brinsley Sheridan"],
    lifeInUKInfo: {
      population: "94,000 residents",
      government: "Local council, part of Somerset county",
      culture: "Roman heritage site, Georgian architecture, Jane Austen Centre",
      economy: "Tourism, education (University of Bath), technology",
      testRelevance: "Important for understanding Roman Britain, Georgian period, and World Heritage sites"
    }
  },
  {
    id: "10",
    name: "York",
    region: "Yorkshire",
    type: "historical",
    coordinates: { lat: 53.9590, lng: -1.0815 },
    description: "Medieval walled city",
    details: "York Minster, Viking heritage, well-preserved medieval walls."
  },

  // Artistic Regions
  {
    id: "11",
    name: "Cornwall",
    region: "Cornwall",
    type: "artistic",
    coordinates: { lat: 50.2660, lng: -5.0527 },
    description: "Artistic peninsula",
    details: "St Ives art colony, dramatic coastlines inspiring generations of artists.",
    notablePeople: ["Barbara Hepworth", "Ben Nicholson", "Patrick Heron", "Daphne du Maurier"]
  },
  {
    id: "12",
    name: "Glasgow",
    region: "Scotland",
    type: "artistic",
    coordinates: { lat: 55.8642, lng: -4.2518 },
    description: "Cultural powerhouse",
    details: "Glasgow School of Art, Charles Rennie Mackintosh architecture, vibrant arts scene.",
    notablePeople: ["Charles Rennie Mackintosh", "The Glasgow Boys", "Ken Currie"]
  },
  {
    id: "13",
    name: "Liverpool",
    region: "Merseyside",
    type: "artistic",
    coordinates: { lat: 53.4084, lng: -2.9916 },
    description: "Musical heritage city",
    details: "Birthplace of The Beatles, UNESCO World Heritage maritime mercantile city.",
    notablePeople: ["The Beatles", "Gerry Marsden", "Cilla Black"]
  },
  {
    id: "14",
    name: "Manchester",
    region: "Greater Manchester",
    type: "artistic",
    coordinates: { lat: 53.4808, lng: -2.2426 },
    description: "Industrial revolution city",
    details: "Cotton mills, music scene, vibrant cultural quarter.",
    notablePeople: ["L.S. Lowry", "The Smiths", "Oasis", "Joy Division"]
  },

  // Literary Locations
  {
    id: "15",
    name: "Stratford-upon-Avon",
    region: "Warwickshire",
    type: "literary",
    coordinates: { lat: 52.1936, lng: -1.7089 },
    description: "Shakespeare's birthplace",
    details: "Home of William Shakespeare, Royal Shakespeare Company theatre.",
    notablePeople: ["William Shakespeare"]
  },
  {
    id: "16",
    name: "Haworth",
    region: "West Yorkshire",
    type: "literary",
    coordinates: { lat: 53.8308, lng: -1.9576 },
    description: "Brontë sisters' home",
    details: "Parsonage home of the Brontë family, moorland setting for their novels.",
    notablePeople: ["Charlotte Brontë", "Emily Brontë", "Anne Brontë"]
  },
  {
    id: "17",
    name: "Oxford",
    region: "Oxfordshire",
    type: "literary",
    coordinates: { lat: 51.7520, lng: -1.2577 },
    description: "City of dreaming spires",
    details: "University city, oldest English-speaking university, literary heritage.",
    notablePeople: ["Lewis Carroll", "J.R.R. Tolkien", "C.S. Lewis", "Oscar Wilde", "Percy Shelley"]
  },
  {
    id: "18",
    name: "Cambridge",
    region: "Cambridgeshire",
    type: "literary",
    coordinates: { lat: 52.2053, lng: 0.1218 },
    description: "University city",
    details: "Cambridge University, scientific and literary achievements.",
    notablePeople: ["Lord Byron", "Sylvia Plath", "Stephen Hawking", "John Milton"]
  },
  {
    id: "19",
    name: "Birmingham",
    region: "West Midlands",
    type: "literary",
    coordinates: { lat: 52.4862, lng: -1.8904 },
    description: "Industrial heritage",
    details: "Second largest city, birthplace of heavy metal music, literary connections.",
    notablePeople: ["J.R.R. Tolkien", "Louis MacNeice", "David Lodge"]
  }
];

// Custom marker icons for different location types
const createCustomIcon = (type: string, isSelected: boolean = false) => {
  const colors = {
    capital: '#ef4444',
    attraction: '#22c55e',
    historical: '#3b82f6',
    artistic: '#8b5cf6',
    literary: '#f97316'
  };

  const size = isSelected ? 25 : 20;
  const color = colors[type as keyof typeof colors] || '#6b7280';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: ${size * 0.4}px;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Map bounds for UK and Northern Ireland
const ukBounds: [[number, number], [number, number]] = [
  [49.5, -8.5], // Southwest corner
  [61.0, 2.0]   // Northeast corner
];

interface UKInteractiveMapProps {
  userId: string;
}

export default function UKInteractiveMapReal({ userId }: UKInteractiveMapProps) {
  const { locations: apiLocations, loading, error } = useMapLocations();
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const types = ['all', 'capital', 'attraction', 'historical', 'artistic', 'literary'];

  const getFilteredLocations = () => {
    let filtered = apiLocations;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(location => location.type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      capital: 'bg-red-500',
      attraction: 'bg-green-500',
      historical: 'bg-blue-500',
      artistic: 'bg-purple-500',
      literary: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      capital: 'Capital',
      attraction: 'Attraction',
      historical: 'Historical',
      artistic: 'Artistic',
      literary: 'Literary'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredLocations = getFilteredLocations();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-2">Failed to load map locations</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Map className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interactive UK Map</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Explore the UK and Northern Ireland with real geographic data</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Quick Navigation */}
        {selectedLocation && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const currentIndex = filteredLocations.findIndex(l => l.id === selectedLocation.id);
                const prevLocation = filteredLocations[currentIndex - 1];
                if (prevLocation) setSelectedLocation(prevLocation);
              }}
              disabled={filteredLocations.findIndex(l => l.id === selectedLocation.id) === 0}
            >
              ← Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {filteredLocations.findIndex(l => l.id === selectedLocation.id) + 1} of {filteredLocations.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const currentIndex = filteredLocations.findIndex(l => l.id === selectedLocation.id);
                const nextLocation = filteredLocations[currentIndex + 1];
                if (nextLocation) setSelectedLocation(nextLocation);
              }}
              disabled={filteredLocations.findIndex(l => l.id === selectedLocation.id) === filteredLocations.length - 1}
            >
              Next →
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</span>
          {types.map(type => (
            <Badge
              key={type}
              variant={filterType === type ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-blue-100 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All Locations' : getTypeLabel(type)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Map Legend:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {types.slice(1).map(type => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${getTypeColor(type)}`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{getTypeLabel(type)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{apiLocations.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{apiLocations.filter(l => l.type === 'capital').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Capitals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{apiLocations.filter(l => l.type === 'attraction').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Attractions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{apiLocations.filter(l => l.type === 'historical').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Historical Sites</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full overflow-hidden">
        {/* Map Container */}
        <Card className="h-96 lg:h-[700px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <Map className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              UK & Northern Ireland Interactive Map
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-0 h-[calc(100%-4rem)]">
            <div className="w-full h-full rounded-lg overflow-hidden">
              <MapContainer
                center={[54.5, -2.5]} // Center of UK
                zoom={6}
                style={{ height: '100%', width: '100%', minHeight: '300px' }}
                bounds={ukBounds}
                boundsOptions={{ padding: [20, 20] }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Map Controls */}
                <MapControls 
                  onLocationSelect={setSelectedLocation}
                  selectedLocation={selectedLocation}
                  filteredLocations={filteredLocations}
                />
                
                {/* Map Interaction Handler */}
                <MapInteractionHandler 
                  selectedLocation={selectedLocation}
                  onLocationFocus={setSelectedLocation}
                />
                
                {/* Location Markers */}
                {filteredLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={[location.coordinates.lat, location.coordinates.lng]}
                    icon={createCustomIcon(location.type, selectedLocation?.id === location.id)}
                    eventHandlers={{
                      click: () => setSelectedLocation(location),
                    }}
                    data-location-id={location.id}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{location.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{location.region}</p>
                        <Badge className={`mt-1 text-xs ${getTypeColor(location.type)} text-white`}>
                          {getTypeLabel(location.type)}
                        </Badge>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{location.description}</p>
                        <Button 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => setSelectedLocation(location)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card className="h-96 lg:h-[700px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <Landmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Location Details
              {selectedLocation && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto text-xs"
                  onClick={() => {
                    // This will trigger the map to focus on the selected location
                    setSelectedLocation({...selectedLocation});
                  }}
                >
                  🗺️ Focus on Map
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto h-[calc(100%-4rem)] p-4">
            {selectedLocation ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${getTypeColor(selectedLocation.type)}`}></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedLocation.name}</h3>
                    <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{selectedLocation.region}</Badge>
                  </div>
                  <Badge className={`${getTypeColor(selectedLocation.type)} text-white`}>
                    {getTypeLabel(selectedLocation.type)}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Description:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedLocation.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Details:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedLocation.details}</p>
                </div>

                {selectedLocation.notablePeople && selectedLocation.notablePeople.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      {selectedLocation.type === 'artistic' ? (
                        <>
                          <Users className="h-4 w-4" />
                          Notable Artists & Musicians:
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4" />
                          Notable Writers & Literary Figures:
                        </>
                      )}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocation.notablePeople.map((person, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {person}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLocation.lifeInUKInfo && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Life in UK Test Information:
                    </h4>
                    <div className="space-y-3">
                      {selectedLocation.lifeInUKInfo.population && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Population:</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation.lifeInUKInfo.population}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.government && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Government:</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation.lifeInUKInfo.government}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.culture && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Culture:</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation.lifeInUKInfo.culture}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.economy && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Economy:</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation.lifeInUKInfo.economy}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.testRelevance && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">Test Relevance:</h5>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{selectedLocation.lifeInUKInfo.testRelevance}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <Map className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Click on any marker on the map to learn more about that location</p>
                <p className="text-sm mt-2">Use the search and filters to find specific locations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
            <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            All Locations ({filteredLocations.length})
            {selectedLocation && (
              <Badge variant="outline" className="ml-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                Selected: {selectedLocation.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`p-3 text-left rounded-lg border transition-all duration-200 hover:shadow-md group ${
                  selectedLocation?.id === location.id 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getTypeColor(location.type)} ${
                    selectedLocation?.id === location.id ? 'ring-2 ring-white shadow-lg' : ''
                  }`}>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${
                      selectedLocation?.id === location.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                    }`}>
                      {location.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{location.region}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getTypeColor(location.type)} text-white`}>
                        {getTypeLabel(location.type)}
                      </Badge>
                      {selectedLocation?.id === location.id && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600">
                          ✓ Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                      {location.description}
                    </p>
                  </div>
                </div>
                {selectedLocation?.id === location.id && (
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      📍 Click to view on map • 🗺️ Coordinates: {location.coordinates.lat.toFixed(3)}, {location.coordinates.lng.toFixed(3)}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {filteredLocations.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No locations found matching your search criteria</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions and UK Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Use the Interactive Map:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Click on markers to learn about specific locations</li>
              <li>• Use zoom and pan controls to explore different areas</li>
              <li>• Search for locations by name, region, or description</li>
              <li>• Filter by location type to focus on specific categories</li>
              <li>• Red markers = Capitals, Green = Attractions, Blue = Historical, Purple = Artistic, Orange = Literary</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">UK Key Facts for Life in UK Test:</h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• <strong>Total Population:</strong> 67 million (England: 56M, Scotland: 5.5M, Wales: 3.1M, N. Ireland: 1.9M)</li>
              <li>• <strong>Capital Cities:</strong> London (England/UK), Edinburgh (Scotland), Cardiff (Wales), Belfast (N. Ireland)</li>
              <li>• <strong>Official Languages:</strong> English, Welsh (Wales), Gaelic (Scotland), Ulster Scots (N. Ireland)</li>
              <li>• <strong>Government:</strong> Constitutional monarchy with devolved parliaments</li>
              <li>• <strong>Currency:</strong> Pound Sterling (£), divided into 100 pence</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
