import { useQuery } from "@tanstack/react-query";
import { Clock, ChevronRight, Plus, Search, X, Languages, User, Pause, Volume2, VolumeX, Loader2, Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo, useRef, useEffect } from "react";
import BrowserTTSNarration from "@/components/browser-tts-narration";

const getCategoryColor = (category: string | undefined | null) => {
  if (!category) {
    return "bg-gray-600";
  }
  
  switch (category.toLowerCase()) {
    case "medieval":
      return "bg-blue-600";
    case "legal":
      return "bg-red-600";
    case "political":
      return "bg-purple-600";
    case "royal":
      return "bg-green-600";
    default:
      return "bg-gray-600";
  }
};

export default function TimelineSection() {
  const [useBookContent, setUseBookContent] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female'>('female');
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/timeline", useBookContent],
    queryFn: async () => {
      const url = useBookContent ? '/api/timeline?useBookContent=true' : '/api/timeline';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      return response.json();
    },
  });

  // Get unique topics from events
  const availableTopics = useMemo(() => {
    const topics = new Set(events.map((event: any) => event.significance || event.timelineTopic).filter(Boolean));
    return Array.from(topics).sort() as string[];
  }, [events]);

  // Filter events by selected topic
  const filteredEvents = useMemo(() => {
    if (selectedTopic === 'all') return events;
    return events.filter((event: any) => 
      (event.significance || event.timelineTopic) === selectedTopic
    );
  }, [events, selectedTopic]);

  // Load available languages
  const { data: languagesData } = useQuery({
    queryKey: ["/api/tts/languages"],
    queryFn: async () => {
      const response = await fetch('/api/tts/languages');
      if (!response.ok) throw new Error('Failed to fetch languages');
      return response.json();
    },
  });

  // Update languages when data is loaded
  useEffect(() => {
    if (languagesData?.languages) {
      setLanguages(languagesData.languages);
    }
  }, [languagesData]);

  // TTS Functions
  const speakText = (text: string, language: string = 'en') => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = isMuted ? 0 : volume;
      
      // Try to find a voice that matches the selected gender
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => {
        if (selectedVoice === 'female') {
          return voice.name.includes('Female') || voice.name.includes('Woman') || 
                 voice.name.includes('Samantha') || voice.name.includes('Karen');
        } else {
          return voice.name.includes('Male') || voice.name.includes('Man') || 
                 voice.name.includes('Alex') || voice.name.includes('Daniel');
        }
      });
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlayPause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (window.speechSynthesis.speaking) {
      // Update volume for current speech
      const utterance = new SpeechSynthesisUtterance();
      utterance.volume = isMuted ? volume : 0;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (window.speechSynthesis.speaking) {
      // Update volume for current speech
      const utterance = new SpeechSynthesisUtterance();
      utterance.volume = isMuted ? 0 : newVolume;
    }
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Sort events chronologically
  const sortedEvents = (filteredEvents as any[]).sort((a: any, b: any) => a.year - b.year);

  // Search functionality - computed directly without state
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const results = (filteredEvents as any[]).filter((event: any) => {
      return (
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.details?.toLowerCase().includes(query) ||
        event.keyFigures?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query) ||
        event.year?.toString().includes(query) ||
        event.timelineTopic?.toLowerCase().includes(query)
      );
    });

    return results.sort((a: any, b: any) => a.year - b.year);
  }, [searchQuery, filteredEvents]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  // Scroll to specific event
  const scrollToEvent = (eventId: string) => {
    const element = eventRefs.current[eventId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Highlight the event briefly
      element.style.transform = 'scale(1.02)';
      element.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 1000);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-1/2 pr-8">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full mx-4"></div>
                  <div className="w-1/2 pl-8">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section id="timeline">
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Clock className="text-purple-600 dark:text-purple-400 mr-2 sm:mr-3" size={20} />
            Historical Timeline
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Interactive chronology of key British historical events</p>
          
          {/* Controls */}
          <div className="mt-4 space-y-3 sm:space-y-4">
            {/* Book Content Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useBookContent"
                  checked={useBookContent}
                  onChange={(e) => setUseBookContent(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="useBookContent" className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  Enhance with uploaded book content
                </label>
              </div>
              {useBookContent && (
                <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  📚 Using book content
                </span>
              )}
            </div>

            {/* Topic Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="topicFilter" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by topic:
              </label>
              <select
                id="topicFilter"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Topics ({events.length})</option>
                {availableTopics.map((topic: string) => {
                  const count = events.filter((event: any) => 
                    (event.significance || event.timelineTopic) === topic
                  ).length;
                  return (
                    <option key={topic} value={topic}>
                      {topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ')} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter Status */}
            {selectedTopic !== 'all' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>📊 Showing {filteredEvents.length} events from</span>
                <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1).replace('_', ' ')}
                </Badge>
                <button
                  onClick={() => setSelectedTopic('all')}
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Show all topics
                </button>
              </div>
            )}

          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <Input
                type="text"
                placeholder="Search events, years, personalities, documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9 sm:h-10 text-sm"
                data-testid="timeline-search-input"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="clear-search-button"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Fixed Search Results Bar */}
        {hasSearchQuery && searchResults.length > 0 && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-4 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-3">
                {/* Search Bar in Results */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="text"
                    placeholder="Continue searching timeline..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-8 text-sm bg-white border-blue-300 focus:border-blue-500"
                    data-testid="timeline-search-input-fixed"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      data-testid="clear-search-button-fixed"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                <div className="text-sm text-blue-900 dark:text-blue-100 font-medium whitespace-nowrap">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="text-blue-700 hover:text-blue-900 h-8 w-8 p-0"
                  data-testid="close-search-results"
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {searchResults.map((result: any) => (
                  <Button
                    key={result.id}
                    variant="outline"
                    size="sm"
                    onClick={() => scrollToEvent(result.id)}
                    className="text-xs bg-white hover:bg-blue-100 border-blue-300 text-blue-800 h-7"
                    data-testid={`search-result-${result.id}`}
                  >
                    {result.year} - {result.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {hasSearchQuery && searchResults.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-6 py-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No events found for "{searchQuery}". Try searching for years, names, or keywords.
            </p>
          </div>
        )}
        
        <CardContent className={`p-4 sm:p-6 lg:p-8 ${hasSearchQuery && searchResults.length > 0 ? "pt-24 sm:pt-32" : ""}`}>
          <div className="relative max-w-6xl mx-auto">
            {/* Central Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-red-600 transform -translate-x-1/2 shadow-sm"></div>
            
            {/* Timeline Events */}
            <div className="space-y-8 sm:space-y-12">
              {sortedEvents.map((event: any, index: number) => {
                const isEven = index % 2 === 0;
                return (
                  <div 
                    key={event.id} 
                    ref={(el) => eventRefs.current[event.id] = el}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-1/2 w-12 h-12 ${getCategoryColor(event.category)} rounded-full border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 z-10`}>
                      <span className="text-white font-bold text-xs">{event.year}</span>
                    </div>
                    
                    {/* Event Content */}
                    <div className={`flex flex-col lg:flex-row lg:items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                      {/* Content Side */}
                      <div className={`w-full lg:w-1/2 ${isEven ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'} mb-4 lg:mb-0`}>
                        <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${getCategoryColor(event.category).replace('bg-', 'border-')} group`}>
                          <div className={`flex items-center ${isEven ? 'justify-end' : 'justify-start'} mb-3`}>
                            <Badge 
                              className={`${getCategoryColor(event.category)} text-white text-sm font-medium px-3 py-1`}
                            >
                              {event.year} • {event.category}
                            </Badge>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h3>
                          
                          {/* Event Image */}
                          {event.eventImage && (
                            <div className="mb-4">
                              <img 
                                src={event.eventImage} 
                                alt={event.imageDescription || event.title}
                                className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                              />
                              {event.imageDescription && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                  {event.imageDescription}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                            {event.description}
                          </p>
                          
                          {event.details && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Key Details:</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{event.details}</p>
                            </div>
                          )}
                          
                          {event.keyFigures && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <span className="font-medium">Key Figures:</span>
                              <span className="ml-2">{event.keyFigures}</span>
                            </div>
                          )}

                          {/* Enhanced AI Voice Narration */}
                          <div className="mb-4">
                            <BrowserTTSNarration
                              eventId={event.id}
                              title={event.title}
                              description={event.description}
                              details={event.details}
                            />
                          </div>
                          
                          {/* Book Content Attribution */}
                          {event.enhanced && event.sourceBook && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3 border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center text-sm text-blue-700 dark:text-blue-300 mb-1">
                                <span className="font-medium">📚 Enhanced with book content:</span>
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                Source: {event.sourceBook}
                                {event.chapterReference && ` - ${event.chapterReference}`}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Importance Level: {event.importance}/5</span>
                            {event.enhanced && (
                              <span className="ml-2 text-blue-500">• Enhanced</span>
                            )}
                          </div>
                        </div>
                        
                     
                      </div>
                      
                      {/* Image Side */}
                      <div className={`w-full lg:w-1/2 ${isEven ? 'lg:pl-8' : 'lg:pr-8'}`}>
                        <div className="relative">
                          {event.eventImage ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group">
                              <img 
                                src={event.eventImage} 
                                alt={event.imageDescription || event.title}
                                className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {event.imageDescription && (
                                <div className="p-3 sm:p-4">
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{event.imageDescription}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Fallback historical illustration
                            <div className="bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-600 rounded-xl h-48 sm:h-56 flex items-center justify-center shadow-lg">
                              <div className="text-center">
                                <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2 sm:mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">{event.year}</p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">{event.category}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Timeline End Marker */}
            <div className="absolute left-1/2 bottom-0 w-6 h-6 bg-gradient-to-r from-blue-600 to-red-600 rounded-full border-4 border-white dark:border-gray-800 shadow-lg transform -translate-x-1/2"></div>
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 font-medium">
              <Plus className="mr-2" size={16} />
              View Full Interactive Timeline
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}