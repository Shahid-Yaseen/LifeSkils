import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import BrowserTTSNarration from "@/components/browser-tts-narration";
import MobileNav from "@/components/mobile-nav";
import FloatingChatbot from "@/components/floating-chatbot";
import { 
  Calendar, 
  Crown, 
  FileText, 
  Vote, 
  Map, 
  ShoppingCart,
  ArrowLeft,
  Clock,
  Users,
  Star,
  Volume2,
  VolumeX,
  Trophy,
  Music,
  Palette,
  BookOpen,
  PartyPopper,
  Lightbulb,
  Church,
  Play,
  Video,
  ExternalLink,
  Languages,
  User,
  Pause
} from "lucide-react";

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  details?: string;
  category: string;
  importance: number;
  keyFigures?: string;
  timelineTopic?: string;
  significance?: string;
  videoLink?: string;
  accomplishment?: string;
  sport?: string;
}

const TIMELINE_TOPICS = [
  {
    id: "parliament",
    title: "Evolution of Parliament",
    description: "Major parliamentary events, reforms, and the development of the UK's democratic system",
    icon: Crown,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    bgColor: "from-purple-50 to-purple-100"
  },
  {
    id: "documents",
    title: "Important Historical Documents",
    description: "Key documents that shaped British law, governance, and society",
    icon: FileText,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    bgColor: "from-blue-50 to-blue-100"
  },
  {
    id: "voting_rights",
    title: "Evolution of Voting Rights",
    description: "The expansion of suffrage and democratic participation throughout British history",
    icon: Vote,
    color: "bg-green-100 text-green-800 border-green-200",
    bgColor: "from-green-50 to-green-100"
  },
  {
    id: "territories",
    title: "Territorial Evolution",
    description: "The formation and expansion of the United Kingdom and its territories",
    icon: Map,
    color: "bg-red-100 text-red-800 border-red-200",
    bgColor: "from-red-50 to-red-100"
  },
  {
    id: "trades",
    title: "Trade and Economic History",
    description: "Development of trade, commerce, and economic systems in British history",
    icon: ShoppingCart,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    bgColor: "from-orange-50 to-orange-100"
  },
  {
    id: "population-migration",
    title: "Population & Migration",
    description: "Migration waves from Norman Conquest to modern Commonwealth immigration, including Windrush Generation",
    icon: Users,
    color: "bg-teal-100 text-teal-800 border-teal-200",
    bgColor: "from-teal-50 to-teal-100"
  },
  {
    id: "sports-athletics",
    title: "Sports & Athletics", 
    description: "Development of British sports from Football Association founding to Olympic achievements",
    icon: Trophy,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    bgColor: "from-yellow-50 to-yellow-100"
  },

  {
    id: "inventions",
    title: "Inventions & Discoveries",
    description: "British inventors and scientists whose innovations shaped the modern world",
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    bgColor: "from-amber-50 to-amber-100"
  },
  {
    id: "arts",
    title: "Arts & Visual Culture",
    description: "British artists, movements, and innovations that shaped visual arts and cultural expression",
    icon: Palette,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    bgColor: "from-indigo-50 to-indigo-100"
  },
  {
    id: "literature", 
    title: "Literature & Writers",
    description: "Literary development from Beowulf and Shakespeare to Harry Potter phenomenon",
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    bgColor: "from-emerald-50 to-emerald-100"
  },
  {
    id: "british-holidays",
    title: "British Holidays & Traditions",
    description: "Evolution of British celebrations from Guy Fawkes Night to modern bank holidays",
    icon: PartyPopper,
    color: "bg-rose-100 text-rose-800 border-rose-200",
    bgColor: "from-rose-50 to-rose-100"
  },
  {
    id: "church",
    title: "Church Evolution",
    description: "Development of Christianity and religious institutions across all UK regions from ancient times to present",
    icon: Church,
    color: "bg-slate-100 text-slate-800 border-slate-200",
    bgColor: "from-slate-50 to-slate-100"
  },
  {
    id: "historical",
    title: "Historical Timeline",
    description: "Key British historical events from prehistoric times to 1746 AD based on Life in UK test content",
    icon: Clock,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    bgColor: "from-gray-50 to-gray-100"
  },
  {
    id: "british-sports",
    title: "British Sports Heritage",
    description: "Sporting heritage from rugby invention at Rugby School to England's World Cup victory",
    icon: Trophy,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    bgColor: "from-emerald-50 to-emerald-100"
  }
];

interface Language {
  code: string;
  name: string;
}

export default function TimelinePage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [speaking, setSpeaking] = useState<string | null>(null);
  
  // Enhanced AI voice state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female'>('female');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: allEvents, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/timeline"],
    queryFn: () => fetch('/api/timeline').then(res => res.json()),
  });

  // Filter events by selected topic
  const events = allEvents?.filter(event => 
    (event.timelineTopic || event.significance) === selectedTopic
  ) || [];

  const selectedTopicData = TIMELINE_TOPICS.find(t => t.id === selectedTopic);

  // Load available languages
  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/tts/languages');
      const data = await response.json();
      setLanguages(data.languages || []);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const generateAINarration = async (event: TimelineEvent) => {
    if (!event.description) return;

    setIsGeneratingAudio(event.id);
    try {
      const response = await fetch('/api/tts/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${event.title}. ${event.description}${event.details ? ` ${event.details}` : ''}`,
          language: selectedLanguage,
          voiceGender: selectedVoice,
          eventId: event.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate narration');
      }

      const data = await response.json();
      setCurrentAudio(data.audioUrl);
      
      // Auto-play the generated audio
      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.load();
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('AI narration generation failed:', error);
      // Fallback to browser TTS
      speakText(`${event.title}. ${event.description}${event.details ? ` ${event.details}` : ''}`, event.id);
    } finally {
      setIsGeneratingAudio(null);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const getImportanceColor = (importance: number) => {
    switch (importance) {
      case 5: return "bg-red-100 text-red-800 border-red-200";
      case 4: return "bg-orange-100 text-orange-800 border-orange-200";
      case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2: return "bg-blue-100 text-blue-800 border-blue-200";
      case 1: return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImportanceStars = (importance: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < importance ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  const speakText = (text: string, eventId: string) => {
    // Stop any currently speaking text
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech functionality');
      return;
    }

    // Ensure voices are loaded
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Priority order for selecting female voices only
      const preferredVoices = [
        // Look for explicitly named female British voices
        voices.find(voice => 
          voice.lang.includes('en-GB') && 
          (voice.name.toLowerCase().includes('kate') || 
           voice.name.toLowerCase().includes('emma') ||
           voice.name.toLowerCase().includes('serena') ||
           voice.name.toLowerCase().includes('fiona') ||
           voice.name.toLowerCase().includes('victoria'))
        ),
        // Look for voices explicitly marked as female
        voices.find(voice => 
          voice.lang.includes('en-GB') && 
          voice.name.toLowerCase().includes('female')
        ),
        // Look for common female voice names in any English variant
        voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('kate') || 
           voice.name.toLowerCase().includes('emma') ||
           voice.name.toLowerCase().includes('serena') ||
           voice.name.toLowerCase().includes('samantha') ||
           voice.name.toLowerCase().includes('susan') ||
           voice.name.toLowerCase().includes('fiona') ||
           voice.name.toLowerCase().includes('victoria') ||
           voice.name.toLowerCase().includes('zira') ||
           voice.name.toLowerCase().includes('hazel'))
        ),
        // Look for any voice marked as female
        voices.find(voice => 
          voice.lang.startsWith('en') && 
          voice.name.toLowerCase().includes('female')
        ),
        // Filter British voices to exclude obviously male names
        voices.find(voice => 
          voice.lang.includes('en-GB') && 
          !voice.name.toLowerCase().includes('daniel') &&
          !voice.name.toLowerCase().includes('david') &&
          !voice.name.toLowerCase().includes('george') &&
          !voice.name.toLowerCase().includes('male')
        ),
        // Last resort: any English voice that doesn't sound male
        voices.find(voice => 
          voice.lang.startsWith('en') && 
          !voice.name.toLowerCase().includes('daniel') &&
          !voice.name.toLowerCase().includes('david') &&
          !voice.name.toLowerCase().includes('george') &&
          !voice.name.toLowerCase().includes('male')
        )
      ];

      // Use the first available preferred voice
      const selectedVoice = preferredVoices.find(voice => voice !== undefined);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
      } else {
        console.log('No female voice found, using default');
      }
      
      // Enhanced natural speech settings for female voice
      utterance.rate = 0.85; // Natural speaking pace
      utterance.pitch = 1.2; // Higher pitch to ensure female sound
      utterance.volume = 0.9; // Comfortable volume level
      
      // Force female characteristics if no female voice was found
      if (!selectedVoice || !selectedVoice.name.toLowerCase().match(/(female|kate|emma|serena|samantha|susan|fiona|victoria|zira|hazel)/)) {
        utterance.pitch = 1.3; // Even higher pitch to simulate female voice
      }
      
      // Add natural pauses by preprocessing text
      const naturalText = text
        .replace(/\./g, '... ') // Longer pause after periods
        .replace(/,/g, ', ') // Short pause after commas
        .replace(/:/g, ': ') // Pause after colons
        .replace(/;/g, '; ') // Pause after semicolons
        .replace(/Year (\d+)/g, 'In the year $1') // More natural year reading
        .replace(/Key figures:/g, 'The key figures involved were:'); // More conversational
      
      utterance.text = naturalText;

      // Set up event handlers
      utterance.onstart = () => setSpeaking(eventId);
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);

      // Start speaking
      speechSynthesis.speak(utterance);
    };

    // Load voices if not already loaded
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
    } else {
      loadVoices();
    }
  };

  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-3xl font-bold text-gray-900 dark:text-white">Interactive Historical Timeline</h1>
                <p className="text-base sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Explore key moments in British history by topic</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/dashboard")}
                className="w-full sm:w-auto border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Topic Selection */}
        <div className="container mx-auto max-w-6xl p-4">
          <div className="mb-6 sm:mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-800 dark:text-blue-200 mr-2 mt-0.5 flex-shrink-0 font-bold" />
                <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-base sm:text-base">Choose Your Historical Journey</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-sm">
                  Select a timeline topic to explore major events, key figures, and important developments
                  that shaped the United Kingdom throughout history.
                </p>
                </div>
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full mt-2 sm:mt-0 sm:ml-4">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Female Voice Available
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {TIMELINE_TOPICS.map((topic) => {
              const IconComponent = topic.icon;
              return (
                <Card 
                  key={topic.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 group bg-white dark:bg-gray-800"
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg font-bold" />
                    </div>
                    <CardTitle className="text-lg sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-white line-clamp-2">
                      {topic.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <Button 
                        className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-sm" 
                        variant="outline"
                      >
                        Explore Timeline
                      </Button>
                      <Button 
                        className="w-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800 text-sm sm:text-sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/timeline-test/${topic.id}`);
                        }}
                      >
                        Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedTopic(null)}
                className="w-full sm:w-auto border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Topics
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{selectedTopicData?.title}</h1>
                <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400 truncate">{selectedTopicData?.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-end sm:justify-start">
              <Badge className={`${selectedTopicData?.color} text-xs sm:text-sm`}>
                {events?.length || 0} Events
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="container mx-auto max-w-4xl p-4">
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-base sm:text-base text-gray-600 dark:text-gray-400">Loading timeline events...</p>
          </div>
        ) : (
          <div className="relative max-w-6xl mx-auto">
            {/* Central Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-red-600 transform -translate-x-1/2 shadow-sm"></div>
            
            <div className="space-y-8 sm:space-y-12">
              {events?.sort((a, b) => a.year - b.year).map((event, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={event.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute left-1/2 w-12 h-12 sm:w-16 sm:h-16 ${selectedTopicData?.bgColor || 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center transform -translate-x-1/2 z-10`}>
                      <span className="font-bold text-xs sm:text-sm text-white">{event.year}</span>
                    </div>
                    
                    {/* Event Content */}
                    <div className={`flex flex-col lg:flex-row lg:items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} mt-6 sm:mt-8`}>
                      {/* Event Card */}
                      <div className={`w-full lg:w-5/12 ${isEven ? 'lg:pr-8' : 'lg:pl-8'}`}>
                        <Card className="shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-3">
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 mb-2">
                                  <Badge className={`${getImportanceColor(event.importance)} text-xs w-fit`}>
                                    Level {event.importance}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    {getImportanceStars(event.importance)}
                                  </div>
                                </div>
                                <CardTitle className="text-lg sm:text-lg text-gray-900 dark:text-white line-clamp-2">{event.title}</CardTitle>
                                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 text-sm sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span>{event.year}</span>
                                  </div>
                                  {event.keyFigures && (
                                    <div className="flex items-center">
                                      <span className="hidden sm:inline mx-2">•</span>
                                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      <span>Key Figures</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generateAINarration(event)}
                                  disabled={isGeneratingAudio === event.id}
                                  className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Generate AI narration"
                                >
                                  {isGeneratingAudio === event.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                                  ) : (
                                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                  )}
                                </Button>
                                
                                {currentAudio && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={togglePlayPause}
                                      className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                      title={isPlaying ? "Pause" : "Play"}
                                    >
                                      {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={toggleMute}
                                      className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                      title={isMuted ? "Unmute" : "Mute"}
                                    >
                                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-base sm:text-base text-gray-700 dark:text-gray-300 mb-3">{event.description}</p>
                            
                            {event.keyFigures && (
                              <div className="mb-3">
                                <p className="text-sm sm:text-sm font-medium text-gray-900 dark:text-white mb-1">Key Figures:</p>
                                <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400">{event.keyFigures}</p>
                              </div>
                            )}
                            
                            {event.details && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                                <p className="text-sm sm:text-sm text-gray-700 dark:text-gray-300">{event.details}</p>
                              </div>
                            )}

                            {/* Browser TTS Voice Narration */}
                            <div className="mt-4">
                              <BrowserTTSNarration
                                eventId={event.id}
                                title={event.title}
                                description={event.description}
                                details={event.details}
                              />
                            </div>
                            
                            {selectedTopic === 'british_sportsmen' && (
                              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:gap-4">
                                  <div className="flex-1 min-w-0">
                                    {event.sport && (
                                      <div className="mb-2">
                                        <Badge className="bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
                                          {event.sport}
                                        </Badge>
                                      </div>
                                    )}
                                    {event.accomplishment && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-emerald-900 dark:text-emerald-100 mb-1 text-sm sm:text-sm">Achievement:</h5>
                                        <p className="text-sm sm:text-sm text-emerald-800 dark:text-emerald-200">{event.accomplishment}</p>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Video className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-sm sm:text-sm font-medium text-emerald-900 dark:text-emerald-100">Video Link:</span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {event.videoLink ? (
                                      <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-sm"
                                        onClick={() => window.open(event.videoLink, '_blank')}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Watch
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </Button>
                                    ) : (
                                      <div className="p-2 border-2 border-dashed border-emerald-300 rounded-lg text-center min-w-[80px] sm:min-w-[100px]">
                                        <Video className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400 mx-auto mb-1" />
                                        <p className="text-sm text-emerald-600">Video link space</p>
                                        <p className="text-sm text-emerald-500">To be added</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {events && events.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-700 dark:text-gray-300 mx-auto mb-3 sm:mb-4 font-bold" />
                <h3 className="text-lg sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No Events Found</h3>
                <p className="text-base sm:text-base text-gray-600 dark:text-gray-400">This timeline topic is being prepared. Please check back soon.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onVolumeChange={() => {
          if (audioRef.current) {
            setVolume(audioRef.current.volume);
            setIsMuted(audioRef.current.muted);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <MobileNav />
      <FloatingChatbot />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
    </div>
  );
}