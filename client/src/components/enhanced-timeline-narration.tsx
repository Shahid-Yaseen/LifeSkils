import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Mic,
  MicOff,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Globe,
  BookOpen
} from 'lucide-react';

interface VoiceOption {
  key: string;
  name: string;
  description: string;
  characteristics: string;
  accent: string;
  gender: string;
  speed: number;
  pitch: number;
}

interface NarrationState {
  isGenerating: boolean;
  isPlaying: boolean;
  currentAudio: string | null;
  selectedVoice: string;
  availableVoices: VoiceOption[];
  error: string | null;
  duration: number | null;
  progress: number;
}

interface EnhancedTimelineNarrationProps {
  eventId: string;
  title: string;
  description: string;
  details?: string;
  onNarrationComplete?: (audioUrl: string) => void;
}

export function EnhancedTimelineNarration({
  eventId,
  title,
  description,
  details,
  onNarrationComplete
}: EnhancedTimelineNarrationProps) {
  const [state, setState] = useState<NarrationState>({
    isGenerating: false,
    isPlaying: false,
    currentAudio: null,
    selectedVoice: 'british_female',
    availableVoices: [],
    error: null,
    duration: null,
    progress: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load available voices on component mount
  useEffect(() => {
    loadAvailableVoices();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const loadAvailableVoices = async () => {
    try {
      const response = await fetch('/api/tts-enhanced/voices');
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        availableVoices: data.voices || []
      }));
    } catch (error) {
      console.error('Error loading voices:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load voice options'
      }));
    }
  };

  const generateNarration = async () => {
    if (state.isGenerating) return;

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }));

    try {
      const fullText = `${title}. ${description}${details ? ` ${details}` : ''}`;
      
      const response = await fetch('/api/tts-enhanced/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fullText,
          voiceKey: state.selectedVoice,
          eventId,
          enhanceForHistory: true,
          addEmphasis: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate narration');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        currentAudio: data.audioUrl,
        duration: data.duration,
        isGenerating: false
      }));

      // Auto-play the generated audio
      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.load();
        audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
        startProgressTracking();
      }

      // Notify parent component
      if (onNarrationComplete) {
        onNarrationComplete(data.audioUrl);
      }

    } catch (error) {
      console.error('Error generating narration:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate narration'
      }));
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
      startProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setState(prev => ({ ...prev, progress: isNaN(progress) ? 0 : progress }));
      }
    }, 100);
  };

  const stopNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState(prev => ({ ...prev, isPlaying: false, progress: 0 }));
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const previewVoice = async () => {
    try {
      const response = await fetch('/api/tts-enhanced/preview-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceKey: state.selectedVoice
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to preview voice');
      }

      const data = await response.json();
      
      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.load();
        audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
        startProgressTracking();
      }

    } catch (error) {
      console.error('Error previewing voice:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to preview voice'
      }));
    }
  };

  const selectedVoiceInfo = state.availableVoices.find(v => v.key === state.selectedVoice);

  return (
    <Card className="w-full !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
          <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          AI Voice Narration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Voice
          </label>
          <div className="flex gap-2">
            <Select value={state.selectedVoice} onValueChange={(value) => 
              setState(prev => ({ ...prev, selectedVoice: value }))
            }>
              <SelectTrigger className="flex-1 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                <SelectValue placeholder="Choose a voice" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {state.availableVoices.map((voice) => (
                  <SelectItem key={voice.key} value={voice.key} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{voice.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {voice.accent}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={previewVoice}
              disabled={state.isGenerating}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Voice Info */}
          {selectedVoiceInfo && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">{selectedVoiceInfo.name}</span>
                <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{selectedVoiceInfo.accent}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {selectedVoiceInfo.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {selectedVoiceInfo.characteristics}
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-400">{state.error}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={generateNarration}
            disabled={state.isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Generate Narration
              </>
            )}
          </Button>

          {state.currentAudio && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                disabled={state.isGenerating}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {state.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={stopNarration}
                disabled={state.isGenerating}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {state.isPlaying && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Playing...</span>
              <span>{Math.round(state.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Audio Element */}
        <audio
          ref={audioRef}
          onEnded={() => {
            setState(prev => ({ ...prev, isPlaying: false, progress: 0 }));
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
          }}
          onPlay={() => setState(prev => ({ ...prev, isPlaying: true }))}
          onPause={() => setState(prev => ({ ...prev, isPlaying: false }))}
        />

        {/* Status */}
        {state.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Duration: {Math.round(state.duration)}s</span>
            {state.currentAudio && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Ready to play</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
