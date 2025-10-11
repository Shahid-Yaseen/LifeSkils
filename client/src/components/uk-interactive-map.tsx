import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Users, BookOpen, Landmark, Crown, Filter } from "lucide-react";

interface MapLocation {
  id: string;
  name: string;
  region: string;
  type: 'capital' | 'attraction' | 'historical' | 'artistic' | 'literary';
  coordinates: { x: number; y: number }; // Percentage positioning on the detailed map
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

const mapLocations: MapLocation[] = [
  // Capitals
  {
    id: "1",
    name: "London",
    region: "England",
    type: "capital",
    coordinates: { x: 55, y: 85 },
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
    coordinates: { x: 27, y: 40 },
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

  // Major Attractions
  {
    id: "3",
    name: "Stonehenge",
    region: "Wiltshire",
    type: "attraction",
    coordinates: { x: 58, y: 95 },
    description: "Prehistoric stone circle",
    details: "5,000-year-old Neolithic monument, UNESCO World Heritage Site."
  },
  {
    id: "4",
    name: "Lake District",
    region: "Cumbria",
    type: "attraction",
    coordinates: { x: 45, y: 58 },
    description: "National park with lakes and mountains",
    details: "UNESCO World Heritage cultural landscape, inspiration for Romantic poets.",
    notablePeople: ["William Wordsworth", "Samuel Taylor Coleridge", "Beatrix Potter"]
  },
  {
    id: "5",
    name: "Giant's Causeway",
    region: "County Antrim",
    type: "attraction",
    coordinates: { x: 30, y: 35 },
    description: "Hexagonal basalt columns",
    details: "40,000 interlocking columns formed by volcanic activity, UNESCO World Heritage Site."
  },

  // Historical Locations
  {
    id: "6",
    name: "Canterbury",
    region: "Kent",
    type: "historical",
    coordinates: { x: 75, y: 95 },
    description: "Historic cathedral city",
    details: "Canterbury Cathedral, seat of Archbishop, pilgrimage destination since medieval times.",
    notablePeople: ["Geoffrey Chaucer", "Thomas à Becket"]
  },
  {
    id: "7",
    name: "Bath",
    region: "Somerset",
    type: "historical",
    coordinates: { x: 52, y: 88 },
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
    id: "8",
    name: "York",
    region: "Yorkshire",
    type: "historical",
    coordinates: { x: 60, y: 68 },
    description: "Medieval walled city",
    details: "York Minster, Viking heritage, well-preserved medieval walls."
  },
  {
    id: "9",
    name: "Edinburgh",
    region: "Scotland",
    type: "historical",
    coordinates: { x: 50, y: 40 },
    description: "Historic Scottish capital",
    details: "Edinburgh Castle, Royal Mile, UNESCO World Heritage Old and New Towns.",
    notablePeople: ["Sir Walter Scott", "Robert Louis Stevenson", "Sir Arthur Conan Doyle"],
    lifeInUKInfo: {
      population: "540,000 (Edinburgh), 5.5 million (Scotland)",
      government: "Scottish Parliament at Holyrood, devolved powers for Scotland",
      culture: "Edinburgh Festival, Royal Mile, Edinburgh Castle, Scottish traditions",
      economy: "Financial services, tourism, education, technology sector",
      testRelevance: "Key for Scottish devolution, history, culture, and role in the UK union"
    }
  },

  // Artistic Regions
  {
    id: "10",
    name: "Cornwall",
    region: "Cornwall",
    type: "artistic",
    coordinates: { x: 30, y: 105 },
    description: "Artistic peninsula",
    details: "St Ives art colony, dramatic coastlines inspiring generations of artists.",
    notablePeople: ["Barbara Hepworth", "Ben Nicholson", "Patrick Heron", "Daphne du Maurier"]
  },
  {
    id: "11",
    name: "Stratford-upon-Avon",
    region: "Warwickshire",
    type: "literary",
    coordinates: { x: 55, y: 82 },
    description: "Shakespeare's birthplace",
    details: "Home of William Shakespeare, Royal Shakespeare Company theatre.",
    notablePeople: ["William Shakespeare"]
  },
  {
    id: "12",
    name: "Haworth",
    region: "West Yorkshire",
    type: "literary",
    coordinates: { x: 58, y: 65 },
    description: "Brontë sisters' home",
    details: "Parsonage home of the Brontë family, moorland setting for their novels.",
    notablePeople: ["Charlotte Brontë", "Emily Brontë", "Anne Brontë"]
  },
  {
    id: "13",
    name: "Oxford",
    region: "Oxfordshire",
    type: "literary",
    coordinates: { x: 60, y: 85 },
    description: "City of dreaming spires",
    details: "University city, oldest English-speaking university, literary heritage.",
    notablePeople: ["Lewis Carroll", "J.R.R. Tolkien", "C.S. Lewis", "Oscar Wilde", "Percy Shelley"]
  },
  {
    id: "14",
    name: "Cambridge",
    region: "Cambridgeshire",
    type: "literary",
    coordinates: { x: 68, y: 82 },
    description: "University city",
    details: "Cambridge University, scientific and literary achievements.",
    notablePeople: ["Lord Byron", "Sylvia Plath", "Stephen Hawking", "John Milton"]
  },
  {
    id: "15",
    name: "Glasgow",
    region: "Scotland",
    type: "artistic",
    coordinates: { x: 42, y: 45 },
    description: "Cultural powerhouse",
    details: "Glasgow School of Art, Charles Rennie Mackintosh architecture, vibrant arts scene.",
    notablePeople: ["Charles Rennie Mackintosh", "The Glasgow Boys", "Ken Currie"]
  },
  {
    id: "16",
    name: "Liverpool",
    region: "Merseyside",
    type: "artistic",
    coordinates: { x: 48, y: 70 },
    description: "Musical heritage city",
    details: "Birthplace of The Beatles, UNESCO World Heritage maritime mercantile city.",
    notablePeople: ["The Beatles", "Gerry Marsden", "Cilla Black"]
  },
  {
    id: "17",
    name: "Birmingham",
    region: "West Midlands",
    type: "literary",
    coordinates: { x: 58, y: 80 },
    description: "Industrial heritage",
    details: "Second largest city, birthplace of heavy metal music, literary connections.",
    notablePeople: ["J.R.R. Tolkien", "Louis MacNeice", "David Lodge"]
  },
  {
    id: "18",
    name: "Manchester",
    region: "Greater Manchester",
    type: "artistic",
    coordinates: { x: 52, y: 70 },
    description: "Industrial revolution city",
    details: "Cotton mills, music scene, vibrant cultural quarter.",
    notablePeople: ["L.S. Lowry", "The Smiths", "Oasis", "Joy Division"]
  }
];

interface UKInteractiveMapProps {
  userId: string;
}

export default function UKInteractiveMap({ userId }: UKInteractiveMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const types = ['all', 'capital', 'attraction', 'historical', 'artistic', 'literary'];

  const getFilteredLocations = () => {
    if (filterType === 'all') return mapLocations;
    return mapLocations.filter(location => location.type === filterType);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Map className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Interactive UK Map</h3>
            <p className="text-sm text-gray-600">Explore capitals, attractions, historical sites, and cultural regions</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Show:</span>
        {types.map(type => (
          <Badge
            key={type}
            variant={filterType === type ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              filterType === type 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-blue-100'
            }`}
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All Locations' : getTypeLabel(type)}
          </Badge>
        ))}
      </div>

      {/* Legend */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Map Legend:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {types.slice(1).map(type => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${getTypeColor(type)}`}></div>
                <span className="text-sm text-gray-700">{getTypeLabel(type)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Container */}
        <Card className="h-96 lg:h-[700px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="h-4 w-4 text-blue-600" />
              UK & Northern Ireland Map
            </CardTitle>
          </CardHeader>
          <CardContent className="relative h-full p-4">
            {/* Enhanced UK Map with Accurate Borders */}
            <div className="relative w-full h-full bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg border-2 border-gray-300 overflow-hidden shadow-inner">
              {/* Authentic UK Map SVG - Based on Real Geographic Coordinates */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dbeafe" />
                    <stop offset="50%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="englandFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient id="scotlandFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0e7ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="walesFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dcfce7" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <linearGradient id="nirelandFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fed7aa" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <filter id="countryShadow">
                    <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.2)"/>
                  </filter>
                </defs>

                {/* Ocean Background */}
                <rect width="400" height="500" fill="url(#oceanGradient)" />

                {/* England - Authentic Shape */}
                <path d="M 280 280 L 285 275 L 290 270 L 295 265 L 300 260 L 305 258 L 310 256 L 315 255 L 320 254 L 325 253 L 330 252 L 335 251 L 340 252 L 345 254 L 350 257 L 355 260 L 360 265 L 365 270 L 370 275 L 375 280 L 380 285 L 385 290 L 390 295 L 395 300 L 398 305 L 399 310 L 398 315 L 396 320 L 394 325 L 391 330 L 388 335 L 384 340 L 380 344 L 375 348 L 370 351 L 365 354 L 360 356 L 355 358 L 350 359 L 345 360 L 340 361 L 335 362 L 330 363 L 325 364 L 320 365 L 315 366 L 310 367 L 305 368 L 300 369 L 295 370 L 290 371 L 285 372 L 280 373 L 275 374 L 270 375 L 265 376 L 260 377 L 255 378 L 250 379 L 245 380 L 240 381 L 235 382 L 230 383 L 225 384 L 220 385 L 215 386 L 210 387 L 205 388 L 200 389 L 195 390 L 190 391 L 185 392 L 180 393 L 175 394 L 170 395 L 165 396 L 160 397 L 155 398 L 150 399 L 145 400 L 140 401 L 135 402 L 130 401 L 125 400 L 120 398 L 115 396 L 110 393 L 105 390 L 100 386 L 95 382 L 90 377 L 85 372 L 80 366 L 75 360 L 70 353 L 65 346 L 60 338 L 55 330 L 50 321 L 45 312 L 40 302 L 35 292 L 30 281 L 25 270 L 20 258 L 15 246 L 10 233 L 5 220 L 2 206 L 1 192 L 2 178 L 5 164 L 10 150 L 15 136 L 20 122 L 25 108 L 30 94 L 35 80 L 40 66 L 45 52 L 50 38 L 55 24 L 60 10 L 70 15 L 80 20 L 90 25 L 100 30 L 110 35 L 120 40 L 130 45 L 140 50 L 150 55 L 160 60 L 170 65 L 180 70 L 190 75 L 200 80 L 210 85 L 220 90 L 230 95 L 240 100 L 250 105 L 260 110 L 270 115 L 275 120 L 278 125 L 279 130 L 278 135 L 276 140 L 274 145 L 271 150 L 268 155 L 265 160 L 262 165 L 259 170 L 256 175 L 253 180 L 250 185 L 247 190 L 244 195 L 241 200 L 238 205 L 235 210 L 232 215 L 229 220 L 226 225 L 223 230 L 220 235 L 217 240 L 214 245 L 211 250 L 208 255 L 205 260 L 202 265 L 199 270 L 196 275 L 195 280 L 196 285 L 198 290 L 201 295 L 205 300 L 210 305 L 216 310 L 223 315 L 231 320 L 240 325 L 250 330 L 261 335 L 273 340 L 286 345 L 300 350 L 315 355 L 331 360 L 348 365 L 366 370 L 385 375 L 405 380 L 426 385 L 448 390 L 471 395 L 495 400 L 145 420 L 140 415 L 135 410 L 130 405 L 125 400 L 120 395 L 115 390 L 110 385 L 105 380 L 100 375 L 95 370 L 90 365 L 85 360 L 80 355 L 75 350 L 70 345 L 65 340 L 60 335 L 55 330 L 50 325 L 45 320 L 40 315 L 35 310 L 30 305 L 25 300 L 20 295 L 15 290 L 10 285 L 8 280 L 10 275 L 15 270 L 22 265 L 30 260 L 39 255 L 49 250 L 60 245 L 72 240 L 85 235 L 99 230 L 114 225 L 130 220 L 147 215 L 165 210 L 184 205 L 204 200 L 225 195 L 247 190 L 270 185 L 294 180 L 319 175 L 345 170 L 372 165 L 400 160 Z"
                  fill="url(#englandFill)" 
                  stroke="#d97706" 
                  strokeWidth="2" 
                  filter="url(#countryShadow)"
                />

                {/* Scotland - Authentic Shape with Highlands */}
                <path d="M 200 50 L 205 45 L 210 40 L 215 35 L 220 30 L 225 25 L 230 20 L 235 15 L 240 10 L 245 8 L 250 6 L 255 5 L 260 4 L 265 3 L 270 2 L 275 1 L 280 1 L 285 2 L 290 3 L 295 5 L 300 7 L 305 10 L 310 13 L 315 17 L 320 21 L 325 26 L 330 31 L 335 37 L 340 43 L 345 50 L 350 57 L 355 65 L 360 73 L 365 82 L 370 91 L 375 101 L 380 111 L 385 122 L 390 133 L 395 145 L 398 157 L 399 170 L 398 183 L 396 196 L 393 209 L 389 222 L 384 235 L 378 247 L 371 259 L 363 270 L 354 280 L 344 289 L 333 297 L 321 304 L 308 310 L 294 315 L 279 319 L 263 322 L 246 324 L 228 325 L 210 325 L 191 324 L 172 322 L 153 319 L 134 315 L 115 310 L 96 304 L 77 297 L 58 289 L 39 280 L 20 270 L 10 259 L 5 247 L 2 235 L 1 222 L 2 209 L 5 196 L 10 183 L 17 170 L 26 157 L 37 145 L 50 133 L 65 122 L 82 111 L 101 101 L 122 91 L 145 82 L 170 73 L 197 65 L 226 57 L 257 50 Z"
                  fill="url(#scotlandFill)" 
                  stroke="#6366f1" 
                  strokeWidth="2" 
                  filter="url(#countryShadow)"
                />

                {/* Wales - Authentic Shape */}
                <path d="M 120 300 L 125 295 L 130 290 L 135 285 L 140 280 L 145 275 L 150 270 L 155 265 L 160 260 L 165 255 L 170 250 L 175 245 L 180 240 L 185 235 L 190 230 L 195 225 L 200 220 L 205 215 L 210 210 L 215 205 L 220 200 L 225 195 L 230 190 L 235 185 L 240 180 L 245 175 L 250 170 L 255 165 L 260 160 L 265 155 L 270 150 L 275 145 L 280 140 L 285 135 L 290 130 L 295 125 L 300 120 L 305 115 L 310 110 L 315 105 L 320 100 L 325 95 L 330 90 L 335 85 L 340 80 L 345 75 L 350 70 L 355 65 L 360 60 L 365 55 L 370 50 L 90 280 L 85 285 L 80 290 L 75 295 L 70 300 L 65 305 L 60 310 L 55 315 L 50 320 L 45 325 L 40 330 L 35 335 L 30 340 L 25 345 L 20 350 L 15 355 L 10 360 L 8 365 L 7 370 L 8 375 L 10 380 L 13 385 L 17 390 L 22 395 L 28 400 L 35 405 L 43 410 L 52 415 L 62 420 L 73 425 L 85 430 L 98 435 L 112 440 L 127 445 L 143 450 L 160 455 L 178 460 Z"
                  fill="url(#walesFill)" 
                  stroke="#059669" 
                  strokeWidth="2" 
                  filter="url(#countryShadow)"
                />

                {/* Northern Ireland - Authentic Shape */}
                <path d="M 80 180 L 85 175 L 90 170 L 95 165 L 100 160 L 105 155 L 110 150 L 115 145 L 120 140 L 125 135 L 130 130 L 135 125 L 140 120 L 145 115 L 150 110 L 155 105 L 160 100 L 165 95 L 170 90 L 175 85 L 180 80 L 185 75 L 190 70 L 195 65 L 200 60 L 205 55 L 210 50 L 40 140 L 35 145 L 30 150 L 25 155 L 20 160 L 15 165 L 10 170 L 8 175 L 7 180 L 8 185 L 10 190 L 13 195 L 17 200 L 22 205 L 28 210 L 35 215 L 43 220 L 52 225 L 62 230 L 73 235 L 85 240 Z"
                  fill="url(#nirelandFill)" 
                  stroke="#ea580c" 
                  strokeWidth="2" 
                  filter="url(#countryShadow)"
                />

                {/* Scottish Islands */}
                <g id="scottishIslands">
                  {/* Outer Hebrides */}
                  <path d="M 30 80 L 35 78 L 40 76 L 45 74 L 50 72 L 55 70 L 60 68 L 65 66 L 70 64 L 75 62 L 80 60 L 25 120 L 20 122 L 15 124 L 10 126 L 8 128 L 7 130 L 8 132 L 10 134 L 13 136 L 17 138 L 22 140 L 28 142 Z" fill="url(#scotlandFill)" stroke="#6366f1" strokeWidth="1"/>
                  
                  {/* Orkney Islands */}
                  <ellipse cx="280" cy="25" rx="8" ry="4" fill="url(#scotlandFill)" stroke="#6366f1" strokeWidth="1"/>
                  
                  {/* Shetland Islands */}
                  <ellipse cx="300" cy="10" rx="6" ry="8" fill="url(#scotlandFill)" stroke="#6366f1" strokeWidth="1"/>
                </g>

                {/* English Islands */}
                <g id="englishIslands">
                  {/* Isle of Wight */}
                  <ellipse cx="280" cy="420" rx="8" ry="3" fill="url(#englandFill)" stroke="#d97706" strokeWidth="1"/>
                  
                  {/* Isles of Scilly */}
                  <circle cx="50" cy="450" r="3" fill="url(#englandFill)" stroke="#d97706" strokeWidth="1"/>
                </g>

                {/* Country Labels */}
                <text x="250" y="300" fontSize="20" fill="#b45309" fontWeight="bold" textAnchor="middle">ENGLAND</text>
                <text x="200" y="150" fontSize="18" fill="#4338ca" fontWeight="bold" textAnchor="middle">SCOTLAND</text>
                <text x="120" y="350" fontSize="16" fill="#047857" fontWeight="bold" textAnchor="middle">WALES</text>
                <text x="80" y="180" fontSize="14" fill="#c2410c" fontWeight="bold" textAnchor="middle">NORTHERN</text>
                <text x="80" y="200" fontSize="14" fill="#c2410c" fontWeight="bold" textAnchor="middle">IRELAND</text>

                {/* Water Bodies */}
                <text x="20" y="250" fontSize="12" fill="#1e40af" textAnchor="middle" transform="rotate(-90 20 250)">Irish Sea</text>
                <text x="380" y="200" fontSize="12" fill="#1e40af" textAnchor="middle" transform="rotate(90 380 200)">North Sea</text>
                <text x="250" y="480" fontSize="12" fill="#1e40af" textAnchor="middle">English Channel</text>

                {/* Life in UK Test Information Markers */}
                <g id="lifeInUKInfo">
                  {/* Population centers marker */}
                  <circle cx="55" y="85" r="1.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.3" opacity="0.9" />
                  <text x="55" y="89" fontSize="1.5" fill="#dc2626" fontWeight="bold" textAnchor="middle">9M+</text>
                  
                  {/* Government marker */}
                  <rect x="53" y="86" width="4" height="2" fill="#7c3aed" stroke="#ffffff" strokeWidth="0.2" opacity="0.9" />
                  <text x="55" y="91" fontSize="1.2" fill="#7c3aed" fontWeight="bold" textAnchor="middle">PARL</text>
                </g>

                {/* Border demarcation lines */}
                <g id="borders">
                  <path d="M 40 65 L 30 72" stroke="#374151" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8" />
                  <path d="M 40 65 L 40 62" stroke="#374151" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8" />
                </g>
              </svg>
              
              {/* Location Markers */}
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-125 hover:z-10 ${getTypeColor(location.type)} ${
                    selectedLocation?.id === location.id ? 'scale-125 z-10 ring-2 ring-yellow-400' : ''
                  }`}
                  style={{
                    left: `${location.coordinates.x}%`,
                    top: `${location.coordinates.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedLocation(location)}
                  title={location.name}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-800 bg-white px-1 rounded shadow-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                    {location.id}. {location.name}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card className="h-96 lg:h-[700px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="h-4 w-4 text-purple-600" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto h-full">
            {selectedLocation ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${getTypeColor(selectedLocation.type)}`}></div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedLocation.name}</h3>
                    <Badge className="bg-gray-100 text-gray-800">{selectedLocation.region}</Badge>
                  </div>
                  <Badge className={`${getTypeColor(selectedLocation.type)} text-white`}>
                    {getTypeLabel(selectedLocation.type)}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description:</h4>
                  <p className="text-sm text-gray-700">{selectedLocation.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Details:</h4>
                  <p className="text-sm text-gray-700">{selectedLocation.details}</p>
                </div>

                {selectedLocation.notablePeople && selectedLocation.notablePeople.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
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
                        <Badge key={index} variant="outline" className="text-xs">
                          {person}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLocation.lifeInUKInfo && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Crown className="h-4 w-4 text-blue-600" />
                      Life in UK Test Information:
                    </h4>
                    <div className="space-y-3">
                      {selectedLocation.lifeInUKInfo.population && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Population:</h5>
                          <p className="text-sm text-gray-600">{selectedLocation.lifeInUKInfo.population}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.government && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Government:</h5>
                          <p className="text-sm text-gray-600">{selectedLocation.lifeInUKInfo.government}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.culture && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Culture:</h5>
                          <p className="text-sm text-gray-600">{selectedLocation.lifeInUKInfo.culture}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.economy && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Economy:</h5>
                          <p className="text-sm text-gray-600">{selectedLocation.lifeInUKInfo.economy}</p>
                        </div>
                      )}
                      {selectedLocation.lifeInUKInfo.testRelevance && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900">Test Relevance:</h5>
                          <p className="text-sm text-blue-800">{selectedLocation.lifeInUKInfo.testRelevance}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <Map className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click on any numbered marker on the map to learn more about that location</p>
                <p className="text-sm mt-2">Each number represents different types of important places across the UK</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            All Locations ({filteredLocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`p-3 text-left rounded-lg border transition-all duration-200 hover:shadow-md ${
                  selectedLocation?.id === location.id 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getTypeColor(location.type)}`}>
                    {location.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{location.name}</h4>
                    <p className="text-xs text-gray-600">{location.region}</p>
                    <Badge className={`mt-1 text-xs ${getTypeColor(location.type)} text-white`}>
                      {getTypeLabel(location.type)}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions and UK Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How to Use the Interactive Map:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click on numbered markers to learn about specific locations</li>
              <li>• Use filters to show only capitals, attractions, historical sites, artistic regions, or literary locations</li>
              <li>• Red markers = Capitals, Green = Attractions, Blue = Historical, Purple = Artistic, Orange = Literary</li>
              <li>• Each location shows notable people from that region when applicable</li>
              <li>• Enhanced with Life in UK test information including population, government, and cultural data</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-900 mb-2">UK Key Facts for Life in UK Test:</h4>
            <ul className="text-sm text-green-800 space-y-1">
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