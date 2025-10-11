import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Languages, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface Language {
  code: string;
  name: string;
}

interface AudioControlsProps {
  eventId: string;
  eventText: string;
  eventTitle: string;
  defaultLanguage?: string;
}

export default function TimelineAudioControls({ eventId, eventText, eventTitle, defaultLanguage = 'en' }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female'>('female');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load available languages on mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  // Update language when defaultLanguage changes
  useEffect(() => {
    setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/tts/languages');
      const data = await response.json();
      setLanguages(data.languages || []);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const generateNarration = async () => {
    if (!eventText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tts/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${eventTitle}. ${eventText}`,
          language: selectedLanguage,
          voiceGender: selectedVoice,
          eventId,
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
      console.error('Narration generation failed:', error);
    } finally {
      setIsLoading(false);
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

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    // Regenerate narration with new language
    if (currentAudio) {
      generateNarration();
    }
  };

  const handleVoiceChange = (voice: 'male' | 'female') => {
    setSelectedVoice(voice);
    // Regenerate narration with new voice
    if (currentAudio) {
      generateNarration();
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentAudio]);

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Audio Narration
          </h4>
          <div className="flex items-center gap-2">
            <Button
              onClick={generateNarration}
              disabled={isLoading || !eventText.trim()}
              size="sm"
              variant="outline"
            >
              {isLoading ? 'Generating...' : 'Generate Audio'}
            </Button>
          </div>
        </div>

        {currentAudio && (
          <div className="space-y-4">
            {/* Audio Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={togglePlayPause}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                onClick={toggleMute}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400">Volume:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>

            {/* Language and Voice Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Languages className="h-3 w-3" />
                  Language
                </label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Voice
                </label>
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female Voice</SelectItem>
                    <SelectItem value="male">Male Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Audio Element */}
            <audio
              ref={audioRef}
              preload="none"
              className="hidden"
            />
          </div>
        )}

        {!currentAudio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
            Click "Generate Audio" to create narration for this timeline event
          </p>
        )}
      </CardContent>
    </Card>
  );
}
