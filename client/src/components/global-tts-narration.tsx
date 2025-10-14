import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Volume2, VolumeX, Play, Pause, User, Settings, Cloud, Wifi, WifiOff, Globe, Languages, SkipForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTTS } from '@/contexts/TTSContext';

interface VoiceOption {
  key: string;
  name: string;
  description: string;
  accent: string;
  gender: string;
  characteristics: string;
  speed: number;
  pitch: number;
  language: string;
  languageCode: string;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voices: string[];
}

export default function GlobalTTSNarration() {
  const {
    currentEventId,
    currentTitle,
    currentDescription,
    currentDetails,
    isPlaying,
    isGenerating,
    isTranslating,
    selectedLanguage,
    selectedVoice,
    speed,
    pitch,
    volume,
    useAITTS,
    isMuted,
    autoPlayNext,
    autoPlayTriggered,
    audioEndedNaturally,
    eventQueue,
    playNarration,
    pauseNarration,
    stopNarration,
    setAutoPlayNext,
    setAutoPlayTriggered,
    setAudioEndedNaturally,
    refillQueueFromCurrentEvent,
    updateSettings,
  } = useTTS();

  const [showSettings, setShowSettings] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioError, setAudioError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string>('');
  const [translationError, setTranslationError] = useState<string>('');
  const [currentText, setCurrentText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  
  // Debug wrapper for setLocalIsGenerating
  const setLocalIsGeneratingDebug = (value: boolean) => {
    console.log('🔧 setLocalIsGenerating called with:', value, 'from:', new Error().stack?.split('\n')[2]);
    setLocalIsGenerating(value);
  };
  const [isUsingAITTS, setIsUsingAITTS] = useState(false);
  const [isStartingPlayback, setIsStartingPlayback] = useState(false);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializingPlayback = useRef(false);

  // Global audio cleanup function
  const cleanupAllAudio = () => {
    console.log('🧹 Cleaning up all audio...');
    
    // Stop AI TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    
    // Stop browser TTS
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Reset all audio state
    setIsUsingAITTS(false);
    setAudioUrl('');
    setCachedAudioUrl('');
    setAudioError('');
    setLocalIsGeneratingDebug(false);
    setIsStartingPlayback(false);
  };

  // Language options with flags and native names
  const languageOptions: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', voices: ['british_male', 'british_female', 'american_male', 'american_female', 'historian_male', 'storyteller_female'] },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', voices: ['spanish_male', 'spanish_female'] },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', voices: ['french_male', 'french_female'] },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', voices: ['german_male', 'german_female'] },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', voices: ['italian_male', 'italian_female'] },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', voices: ['portuguese_male', 'portuguese_female'] },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', voices: ['russian_male', 'russian_female'] },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', voices: ['chinese_male', 'chinese_female'] },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', voices: ['japanese_male', 'japanese_female'] },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', voices: ['korean_male', 'korean_female'] },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', voices: ['arabic_male', 'arabic_female'] },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', voices: ['hindi_male', 'hindi_female'] },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', voices: ['urdu_male', 'urdu_female'] }
  ];

  // Enhanced voice options with multilingual support
  const voiceOptions: VoiceOption[] = [
    // English voices
    {
      key: 'british_male',
      name: 'James (British Male)',
      description: 'Deep, authoritative British male voice',
      accent: 'British',
      gender: 'male',
      characteristics: 'Formal, educational, historical narrator',
      speed: 0.9,
      pitch: 0.8,
      language: 'English',
      languageCode: 'en'
    },
    {
      key: 'british_female',
      name: 'Emma (British Female)',
      description: 'Clear, articulate British female voice',
      accent: 'British',
      gender: 'female',
      characteristics: 'Professional, engaging, educational',
      speed: 0.95,
      pitch: 1.1,
      language: 'English',
      languageCode: 'en'
    },
    {
      key: 'american_male',
      name: 'Michael (American Male)',
      description: 'Warm, conversational American male voice',
      accent: 'American',
      gender: 'male',
      characteristics: 'Friendly, approachable, modern',
      speed: 1,
      pitch: 0.9,
      language: 'English',
      languageCode: 'en'
    },
    {
      key: 'american_female',
      name: 'Sarah (American Female)',
      description: 'Bright, energetic American female voice',
      accent: 'American',
      gender: 'female',
      characteristics: 'Enthusiastic, clear, engaging',
      speed: 1.05,
      pitch: 1.2,
      language: 'English',
      languageCode: 'en'
    },
    {
      key: 'historian_male',
      name: 'Professor Williams (Historian)',
      description: 'Scholarly, distinguished male voice',
      accent: 'British',
      gender: 'male',
      characteristics: 'Academic, knowledgeable, authoritative',
      speed: 0.85,
      pitch: 0.75,
      language: 'English',
      languageCode: 'en'
    },
    {
      key: 'storyteller_female',
      name: 'Lady Catherine (Storyteller)',
      description: 'Elegant, storytelling female voice',
      accent: 'British',
      gender: 'female',
      characteristics: 'Narrative, dramatic, engaging',
      speed: 0.9,
      pitch: 1,
      language: 'English',
      languageCode: 'en'
    },
    // Spanish voices
    {
      key: 'spanish_male',
      name: 'Carlos (Spanish Male)',
      description: 'Warm, expressive Spanish male voice',
      accent: 'Spanish',
      gender: 'male',
      characteristics: 'Passionate, clear, educational',
      speed: 0.95,
      pitch: 0.9,
      language: 'Spanish',
      languageCode: 'es'
    },
    {
      key: 'spanish_female',
      name: 'Isabella (Spanish Female)',
      description: 'Melodious, articulate Spanish female voice',
      accent: 'Spanish',
      gender: 'female',
      characteristics: 'Elegant, engaging, professional',
      speed: 1,
      pitch: 1.1,
      language: 'Spanish',
      languageCode: 'es'
    },
    // French voices
    {
      key: 'french_male',
      name: 'Pierre (French Male)',
      description: 'Sophisticated French male voice',
      accent: 'French',
      gender: 'male',
      characteristics: 'Refined, intellectual, charming',
      speed: 0.9,
      pitch: 0.85,
      language: 'French',
      languageCode: 'fr'
    },
    {
      key: 'french_female',
      name: 'Marie (French Female)',
      description: 'Graceful French female voice',
      accent: 'French',
      gender: 'female',
      characteristics: 'Elegant, expressive, cultured',
      speed: 0.95,
      pitch: 1.05,
      language: 'French',
      languageCode: 'fr'
    },
    // German voices
    {
      key: 'german_male',
      name: 'Hans (German Male)',
      description: 'Precise, authoritative German male voice',
      accent: 'German',
      gender: 'male',
      characteristics: 'Clear, methodical, professional',
      speed: 0.9,
      pitch: 0.8,
      language: 'German',
      languageCode: 'de'
    },
    {
      key: 'german_female',
      name: 'Greta (German Female)',
      description: 'Clear, articulate German female voice',
      accent: 'German',
      gender: 'female',
      characteristics: 'Professional, engaging, educational',
      speed: 0.95,
      pitch: 1.1,
      language: 'German',
      languageCode: 'de'
    },
    // Italian voices
    {
      key: 'italian_male',
      name: 'Marco (Italian Male)',
      description: 'Expressive Italian male voice',
      accent: 'Italian',
      gender: 'male',
      characteristics: 'Passionate, artistic, engaging',
      speed: 1,
      pitch: 0.9,
      language: 'Italian',
      languageCode: 'it'
    },
    {
      key: 'italian_female',
      name: 'Sofia (Italian Female)',
      description: 'Melodious Italian female voice',
      accent: 'Italian',
      gender: 'female',
      characteristics: 'Warm, expressive, charming',
      speed: 1.05,
      pitch: 1.1,
      language: 'Italian',
      languageCode: 'it'
    },
    // Portuguese voices
    {
      key: 'portuguese_male',
      name: 'João (Portuguese Male)',
      description: 'Warm Portuguese male voice',
      accent: 'Portuguese',
      gender: 'male',
      characteristics: 'Friendly, engaging, educational',
      speed: 0.95,
      pitch: 0.9,
      language: 'Portuguese',
      languageCode: 'pt'
    },
    {
      key: 'portuguese_female',
      name: 'Ana (Portuguese Female)',
      description: 'Clear Portuguese female voice',
      accent: 'Portuguese',
      gender: 'female',
      characteristics: 'Professional, articulate, engaging',
      speed: 1,
      pitch: 1.1,
      language: 'Portuguese',
      languageCode: 'pt'
    },
    // Russian voices
    {
      key: 'russian_male',
      name: 'Dmitri (Russian Male)',
      description: 'Deep Russian male voice',
      accent: 'Russian',
      gender: 'male',
      characteristics: 'Authoritative, scholarly, engaging',
      speed: 0.9,
      pitch: 0.8,
      language: 'Russian',
      languageCode: 'ru'
    },
    {
      key: 'russian_female',
      name: 'Natasha (Russian Female)',
      description: 'Elegant Russian female voice',
      accent: 'Russian',
      gender: 'female',
      characteristics: 'Sophisticated, clear, professional',
      speed: 0.95,
      pitch: 1.1,
      language: 'Russian',
      languageCode: 'ru'
    },
    // Chinese voices
    {
      key: 'chinese_male',
      name: 'Wei (Chinese Male)',
      description: 'Clear Chinese male voice',
      accent: 'Chinese',
      gender: 'male',
      characteristics: 'Precise, educational, professional',
      speed: 0.9,
      pitch: 0.9,
      language: 'Chinese',
      languageCode: 'zh'
    },
    {
      key: 'chinese_female',
      name: 'Li (Chinese Female)',
      description: 'Melodious Chinese female voice',
      accent: 'Chinese',
      gender: 'female',
      characteristics: 'Clear, engaging, educational',
      speed: 0.95,
      pitch: 1.1,
      language: 'Chinese',
      languageCode: 'zh'
    },
    // Japanese voices
    {
      key: 'japanese_male',
      name: 'Hiroshi (Japanese Male)',
      description: 'Respectful Japanese male voice',
      accent: 'Japanese',
      gender: 'male',
      characteristics: 'Polite, clear, educational',
      speed: 0.9,
      pitch: 0.9,
      language: 'Japanese',
      languageCode: 'ja'
    },
    {
      key: 'japanese_female',
      name: 'Yuki (Japanese Female)',
      description: 'Gentle Japanese female voice',
      accent: 'Japanese',
      gender: 'female',
      characteristics: 'Soft, clear, engaging',
      speed: 0.95,
      pitch: 1.1,
      language: 'Japanese',
      languageCode: 'ja'
    },
    // Korean voices
    {
      key: 'korean_male',
      name: 'Min (Korean Male)',
      description: 'Clear Korean male voice',
      accent: 'Korean',
      gender: 'male',
      characteristics: 'Professional, engaging, educational',
      speed: 0.9,
      pitch: 0.9,
      language: 'Korean',
      languageCode: 'ko'
    },
    {
      key: 'korean_female',
      name: 'Ji (Korean Female)',
      description: 'Melodious Korean female voice',
      accent: 'Korean',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 0.95,
      pitch: 1.1,
      language: 'Korean',
      languageCode: 'ko'
    },
    // Arabic voices
    {
      key: 'arabic_male',
      name: 'Ahmed (Arabic Male)',
      description: 'Authoritative Arabic male voice',
      accent: 'Arabic',
      gender: 'male',
      characteristics: 'Respectful, clear, educational',
      speed: 0.9,
      pitch: 0.8,
      language: 'Arabic',
      languageCode: 'ar'
    },
    {
      key: 'arabic_female',
      name: 'Fatima (Arabic Female)',
      description: 'Elegant Arabic female voice',
      accent: 'Arabic',
      gender: 'female',
      characteristics: 'Clear, professional, engaging',
      speed: 0.95,
      pitch: 1.1,
      language: 'Arabic',
      languageCode: 'ar'
    },
    // Hindi voices
    {
      key: 'hindi_male',
      name: 'Raj (Hindi Male)',
      description: 'Warm Hindi male voice',
      accent: 'Hindi',
      gender: 'male',
      characteristics: 'Friendly, engaging, educational',
      speed: 0.95,
      pitch: 0.9,
      language: 'Hindi',
      languageCode: 'hi'
    },
    {
      key: 'hindi_female',
      name: 'Priya (Hindi Female)',
      description: 'Melodious Hindi female voice',
      accent: 'Hindi',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 1,
      pitch: 1.1,
      language: 'Hindi',
      languageCode: 'hi'
    },
    // Urdu voices
    {
      key: 'urdu_male',
      name: 'Ali (Urdu Male)',
      description: 'Respectful Urdu male voice',
      accent: 'Urdu',
      gender: 'male',
      characteristics: 'Polite, clear, educational',
      speed: 0.9,
      pitch: 0.9,
      language: 'Urdu',
      languageCode: 'ur'
    },
    {
      key: 'urdu_female',
      name: 'Aisha (Urdu Female)',
      description: 'Elegant Urdu female voice',
      accent: 'Urdu',
      gender: 'female',
      characteristics: 'Clear, professional, engaging',
      speed: 0.95,
      pitch: 1.1,
      language: 'Urdu',
      languageCode: 'ur'
    },
  ];

  const selectedVoiceOption = voiceOptions.find(v => v.key === selectedVoice);
  const selectedLanguageOption = languageOptions.find(l => l.code === selectedLanguage);

  // Get available voices for selected language
  const availableVoices = voiceOptions.filter(v => v.languageCode === selectedLanguage);

  // Check if browser supports speech synthesis
  const isSupported = 'speechSynthesis' in window;

  // Check server availability
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkServerAvailability = async () => {
      try {
        const response = await fetch('/api/tts-enhanced/voices');
        setServerAvailable(response.ok);
        if (!response.ok) {
          console.log('⚠️ TTS Enhanced service not available, will use browser TTS');
        }
      } catch (error) {
        console.log('⚠️ TTS Enhanced service not available, will use browser TTS');
        setServerAvailable(false);
      }
    };
    
    checkServerAvailability();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch all events for continuous auto-play
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/timeline');
        if (response.ok) {
          const events = await response.json();
          setAllEvents(events);
          console.log(`🎵 Loaded ${events.length} events for continuous auto-play`);
        }
      } catch (error) {
        console.error('Failed to fetch events for auto-play:', error);
      }
    };
    
    fetchEvents();
  }, []);

  // Auto-play next event when triggered
  useEffect(() => {
    if (autoPlayTriggered && currentEventId && !isPlaying && !localIsGenerating && !isStartingPlayback) {
      console.log('🎵 Auto-play triggered for next event:', currentEventId, currentTitle);
      setAutoPlayTriggered(false); // Reset the trigger
      
      // Stop any existing audio first
      cleanupAllAudio();
      
      // Small delay to ensure state is properly updated
      setTimeout(() => {
        handlePlay();
      }, 300);
    }
  }, [autoPlayTriggered, currentEventId, isPlaying, localIsGenerating, isStartingPlayback]);

  // Handle continuous auto-play when queue is empty
  useEffect(() => {
    if (!isPlaying && autoPlayNext && eventQueue.length === 0 && currentEventId && allEvents.length > 0 && !localIsGenerating && !isStartingPlayback) {
      console.log('🎵 Queue empty, refilling for continuous auto-play...');
      refillQueueFromCurrentEvent(allEvents);
    }
  }, [isPlaying, autoPlayNext, eventQueue.length, currentEventId, allEvents, localIsGenerating, isStartingPlayback, refillQueueFromCurrentEvent]);

  // Track previous voice and language to detect changes
  const prevVoiceRef = useRef(selectedVoice);
  const prevLanguageRef = useRef(selectedLanguage);
  
  // Stop playback when voice or language changes (but not during initialization)
  useEffect(() => {
    const voiceChanged = prevVoiceRef.current !== selectedVoice;
    const languageChanged = prevLanguageRef.current !== selectedLanguage;
    
    console.log('🔍 useEffect triggered - voiceChanged:', voiceChanged, 'languageChanged:', languageChanged, 'isPlaying:', isPlaying, 'isInitializingPlayback:', isInitializingPlayback.current);
    
    if ((voiceChanged || languageChanged) && isPlaying && !isInitializingPlayback.current) {
      console.log('🔄 Voice/language changed, stopping current playback');
      
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      setIsUsingAITTS(false); // Reset TTS type flag
      pauseNarration();
    }
    
    // Update refs
    prevVoiceRef.current = selectedVoice;
    prevLanguageRef.current = selectedLanguage;
  }, [selectedVoice, selectedLanguage, isPlaying]);

  // Check for cached audio
  const getCachedAudioKey = (text: string, voiceKey: string) => {
    // Create a more specific cache key that includes voice and language
    const textHash = text.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '');
    return `tts_${currentEventId}_${voiceKey}_${selectedLanguage}_${textHash}`;
  };

  // Check if audio is cached in localStorage
  const getCachedAudio = (text: string, voiceKey: string) => {
    const cacheKey = getCachedAudioKey(text, voiceKey);
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  };

  // Save audio to cache
  const saveCachedAudio = (text: string, voiceKey: string, audioUrl: string, duration: number) => {
    const cacheKey = getCachedAudioKey(text, voiceKey);
    const cacheData = {
      audioUrl,
      duration,
      timestamp: Date.now(),
      text: text.substring(0, 100) // Store first 100 chars for reference
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  };

  // AI TTS API call
  const generateAITTS = async (text: string, voiceKey: string) => {
    try {
      setAudioError('');
      setIsAudioLoading(true);

      // Check cache first
      const cached = getCachedAudio(text, voiceKey);
      if (cached && cached.audioUrl) {
        console.log('🎵 Using cached audio:', cached.audioUrl);
        setCachedAudioUrl(cached.audioUrl);
        setIsAudioLoading(false);
        return cached.audioUrl;
      }

      console.log('🎤 Generating new AI narration...');
      console.log('🔍 Sending voice key:', voiceKey);
      console.log('🔍 Current language:', selectedLanguage);
      console.log('🔍 Available voices for current language:', availableVoices.map(v => v.key));
      console.log('🔍 Selected voice option:', selectedVoiceOption);
      
      const response = await fetch('/api/tts-enhanced/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceKey,
          eventId: currentEventId,
          enhanceForHistory: true,
          addEmphasis: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ AI TTS API error:', errorData);
        
        // Check if it's a server availability issue
        if (response.status === 404 || response.status === 500) {
          console.log('🔄 Server not available, falling back to browser TTS');
          updateSettings({ useAITTS: false });
          throw new Error('AI TTS service not available, using browser TTS instead');
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ AI narration generated:', result.audioUrl);
      
      // Cache the result
      saveCachedAudio(text, voiceKey, result.audioUrl, result.duration || 0);
      setCachedAudioUrl(result.audioUrl);
      setIsAudioLoading(false);
      
      return result.audioUrl;
    } catch (error) {
      console.error('AI TTS generation error:', error);
      setAudioError(`AI narration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsAudioLoading(false);
      throw error;
    }
  };

  // AI Translation function (same as original)
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
      setTranslationError('');

      // Check cache first
      const cacheKey = `translation_${currentEventId}_${targetLanguage}_${text.length}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          console.log('🌍 Using cached translation');
          return cachedData.translation;
        }
      }

      console.log('🌍 Translating text to', targetLanguage);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage: 'en',
          context: 'historical_education',
          preserveFormatting: true
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Translation service not available. Please use English or contact support.');
        }
        throw new Error(`Translation failed: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Translation failed');
      }
      console.log('✅ Translation completed:', result.translation);
      
      // Cache the translation
      const cacheData = {
        translation: result.translation,
        timestamp: Date.now(),
        sourceText: text.substring(0, 100)
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      return result.translation;
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return text; // Return original text if translation fails
    }
  };

  // Generate narration text (without narrator introduction)
  const generateNarrationText = async (): Promise<string> => {
    // Generate main content without narrator introduction
    const mainContent = `${currentTitle}. ${currentDescription}${currentDetails ? ` ${currentDetails}` : ''}`;

    // If not English, translate the content
    if (selectedLanguage !== 'en') {
      try {
        const translatedText = await translateText(mainContent, selectedLanguage);
        return translatedText;
      } catch (error) {
        console.error('Translation failed, using original text:', error);
        return mainContent;
      }
    }

    return mainContent;
  };

  // Handle play/pause
  const handlePlay = async () => {
    if (isPlaying) {
      // Pause current playback (don't reset time)
      console.log('⏸️ Pausing current playback...');
      setAudioEndedNaturally(false); // Mark as manually paused
      
      // Pause AI TTS audio if it exists (keep position)
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Pause browser TTS speech synthesis
      if (speechSynthesis.speaking) {
        speechSynthesis.pause();
      }
      
      pauseNarration();
      return;
    }

    // If paused, resume from current position (only for AI TTS)
    if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0 && isUsingAITTS) {
      console.log('▶️ Resuming AI TTS from paused position');
      audioRef.current.play();
      playNarration();
      return;
    }

    // If browser TTS is paused, resume it (only if not using AI TTS)
    if (speechSynthesis.paused && !isUsingAITTS) {
      console.log('▶️ Resuming browser TTS from paused position');
      speechSynthesis.resume();
      playNarration();
      return;
    }

    if (!currentEventId) return;

    // Stop ALL audio before starting new narration
    console.log('🛑 Stopping all audio before starting new narration...');
    cleanupAllAudio();

    setLocalIsGeneratingDebug(true);
    setAudioError('');
    isInitializingPlayback.current = true;
    console.log('🔧 Set isInitializingPlayback to true');

    try {
      console.log('🎬 Starting event narration...');
      console.log('📋 Current event ID:', currentEventId);
      console.log('🎤 Selected voice:', selectedVoice);
      console.log('🌍 Selected language:', selectedLanguage);
      console.log('🤖 Using AI TTS:', useAITTS);
      console.log('🌐 Online status:', isOnline);
      
      const text = await generateNarrationText();
      console.log('📝 Generated narration text length:', text.length);
      setCurrentText(text);
      setTranslatedText(text);

      // Try AI TTS first if enabled and online
      if (useAITTS && isOnline) {
        try {
          let audioUrl = '';
          
          // Validate that the selected voice exists and is available for the current language
          const voiceExists = voiceOptions.some(v => v.key === selectedVoice && v.languageCode === selectedLanguage);
          if (!voiceExists) {
            console.error(`❌ Voice validation failed: ${selectedVoice} not available for ${selectedLanguage}`);
            console.log('Available voices for current language:', availableVoices.map(v => v.key));
            
            // Try to find a fallback voice
            const fallbackVoice = availableVoices[0];
            if (fallbackVoice) {
              console.log(`🔄 Using fallback voice: ${fallbackVoice.key}`);
              updateSettings({ selectedVoice: fallbackVoice.key });
              audioUrl = await generateAITTS(text, fallbackVoice.key);
            } else {
              throw new Error(`No voices available for language ${selectedLanguage}`);
            }
          } else {
            console.log(`✅ Voice validation passed: ${selectedVoice} for ${selectedLanguage}`);
            console.log(`🎤 Selected voice details:`, selectedVoiceOption);
            console.log(`🔑 Voice key being sent to API:`, selectedVoice);
            audioUrl = await generateAITTS(text, selectedVoice);
          }
          
          // Validate that we have a valid audio URL
          if (!audioUrl || audioUrl.trim() === '') {
            throw new Error('No audio URL received from TTS service');
          }
          
          setAudioUrl(audioUrl);
          
          // Create audio element for playback
          const audio = new Audio();
          audio.autoplay = false; // Prevent auto-play
          audio.preload = 'auto'; // Preload the audio
          audioRef.current = audio;
          console.log('🎵 Created new audio element');
          
          // Set up simple event handlers
          audio.onplay = () => {
            console.log('🎵 AI TTS Audio started playing');
            console.log('🔧 About to set localIsGenerating to false in onplay');
            setLocalIsGeneratingDebug(false);
            setIsStartingPlayback(false);
            playNarration(); // Set the playing state when audio actually starts
            
            // Clear the initialization flag after a small delay to ensure audio is fully started
            setTimeout(() => {
              isInitializingPlayback.current = false;
              console.log('🔧 Set isInitializingPlayback to false (delayed)');
            }, 500);
          };
          
          audio.onloadstart = () => {
            console.log('🎵 Audio loading started');
          };
          
          audio.oncanplay = () => {
            console.log('🎵 Audio can start playing');
          };
          
          audio.onpause = () => {
            console.log('🎵 AI TTS Audio paused');
            pauseNarration(); // This updates the context state
          };
          
          audio.onended = () => {
            console.log('🎵 AI TTS Audio ended naturally - triggering auto-play check');
            setAudioEndedNaturally(true); // Mark as naturally ended in context
            pauseNarration(); // This updates the context state
            // The auto-play logic in TTSContext will handle the next event
          };
          
          audio.onerror = (event) => {
            console.error('Audio playback error:', event);
            setAudioError(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`);
            setLocalIsGeneratingDebug(false);
            isInitializingPlayback.current = false;
            console.log('🔧 Set isInitializingPlayback to false (error)');
            pauseNarration();
          };
          
          audio.volume = isMuted ? 0 : volume;
          
          // Set the source and play
          console.log('🎵 Setting audio source:', audioUrl);
          
          // Validate audio URL before proceeding
          if (!audioUrl || audioUrl.trim() === '') {
            throw new Error('Invalid audio URL: empty or undefined');
          }
          
          // Ensure the audio URL is absolute
          const absoluteAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${window.location.origin}${audioUrl}`;
          console.log('🎵 Absolute audio URL:', absoluteAudioUrl);
          
          // Additional validation for absolute URL
          if (absoluteAudioUrl === window.location.origin || absoluteAudioUrl === window.location.origin + '/') {
            throw new Error('Invalid audio URL: URL resolves to root path only');
          }
          
          audio.src = absoluteAudioUrl;
          
          // Play the audio
          try {
            console.log('🎵 Starting AI TTS audio playback');
            setIsUsingAITTS(true); // Mark that we're using AI TTS
            setIsStartingPlayback(true); // Mark that we're starting playback
            
            // Add a small delay to prevent race conditions
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if we're still supposed to be playing (not interrupted)
            // Since we're generating, we should continue
            console.log('🔍 Checking state before play:', { localIsGenerating, isPlaying, isStartingPlayback });
            
            await audio.play();
            console.log('🎵 Audio play() called successfully');
            return; // Success! Exit the function
          } catch (playError) {
            console.error('Audio play() failed:', playError);
            setIsStartingPlayback(false); // Clear the starting flag
            setLocalIsGeneratingDebug(false);
            isInitializingPlayback.current = false;
            console.log('🔧 Set isInitializingPlayback to false (play error)');
            
            // Don't show error for interrupted play requests
            if ((playError as any)?.name === 'AbortError' || (playError as any)?.message?.includes('interrupted')) {
              console.log('🎵 Audio play was interrupted (expected)');
              return;
            }
            
            setAudioError(`Failed to start audio playback: ${playError instanceof Error ? playError.message : 'Unknown error'}`);
            setIsUsingAITTS(false); // Reset flag on failure
            throw playError; // Re-throw to trigger fallback
          }
          
        } catch (error) {
          console.error('AI TTS failed, falling back to browser TTS:', error);
          setAudioError(`AI TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setLocalIsGeneratingDebug(false);
          setIsStartingPlayback(false);
          isInitializingPlayback.current = false;
          console.log('🔧 Set isInitializingPlayback to false (AI TTS error)');
          setIsUsingAITTS(false); // Reset flag since we're falling back
          // Continue to browser TTS fallback
        }
      }
      
      // Fallback to browser TTS if AI TTS failed or is disabled
      if ((!useAITTS || !isOnline) && !isUsingAITTS) {
        console.log('🔄 Using browser TTS fallback');
        // Use browser TTS
        if (!isSupported) {
          alert('Your browser does not support text-to-speech. Please use a modern browser like Chrome, Firefox, or Safari.');
          setLocalIsGeneratingDebug(false);
          return;
        }

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Set voice properties
        utterance.rate = speed;
        utterance.pitch = pitch;
        utterance.volume = isMuted ? 0 : volume;

        // Try to find a matching voice
        const voices = speechSynthesis.getVoices();
        let selectedVoiceObj = null;

        if (selectedVoiceOption?.gender === 'male' && selectedVoiceOption?.accent === 'British') {
          selectedVoiceObj = voices.find(v => 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('british') ||
            v.name.toLowerCase().includes('uk')
          );
        } else if (selectedVoiceOption?.gender === 'female' && selectedVoiceOption?.accent === 'British') {
          selectedVoiceObj = voices.find(v => 
            v.name.toLowerCase().includes('female') || 
            v.name.toLowerCase().includes('british') ||
            v.name.toLowerCase().includes('uk')
          );
        }

        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
        }

        // Set up event handlers - Call playNarration to update context state
        utterance.onstart = () => {
          console.log('🎵 Browser TTS started playing');
          setLocalIsGeneratingDebug(false);
          isInitializingPlayback.current = false;
          setIsUsingAITTS(false); // Mark that we're using browser TTS
          playNarration(); // This updates the context state
        };

        utterance.onend = () => {
          console.log('🎵 Browser TTS ended naturally - triggering auto-play check');
          setAudioEndedNaturally(true); // Mark as naturally ended in context
          pauseNarration(); // This updates the context state
          // The auto-play logic in TTSContext will handle the next event
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          // Don't show error for "interrupted" as it's expected when changing voices
          if (event.error !== 'interrupted') {
            setAudioError(`Speech synthesis error: ${event.error}`);
          }
          setLocalIsGeneratingDebug(false);
          isInitializingPlayback.current = false;
          setIsUsingAITTS(false); // Reset flag on error
          pauseNarration();
        };

        // Start speaking
        console.log('🎵 Starting browser TTS with selected voice:', selectedVoiceObj?.name || 'default');
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Error generating narration:', error);
      setAudioError('Failed to generate narration');
      setLocalIsGeneratingDebug(false);
      setIsStartingPlayback(false);
      isInitializingPlayback.current = false;
      console.log('🔧 Set isInitializingPlayback to false (general error)');
    }
  };

  const handleMute = () => {
    updateSettings({ isMuted: !isMuted });
    if (useAITTS && audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    } else if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? volume : 0;
    }
  };

  const handleSkipNext = () => {
    if (eventQueue.length > 0) {
      const nextEvent = eventQueue[0];
      // This will be handled by the context
    }
  };

  if (!isSupported) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-900 dark:text-white">
            🎤 Voice Narration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your browser doesn't support text-to-speech. Please use Chrome, Firefox, or Safari for voice narration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-white">
            {useAITTS ? (
              <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className="truncate">Global Voice Narration</span>
            {!isOnline && (
              <WifiOff className="h-4 w-4 text-red-500 flex-shrink-0" />
            )}
            {isOnline && useAITTS && serverAvailable === true && (
              <Wifi className="h-4 w-4 text-green-500 flex-shrink-0" />
            )}
            {isOnline && useAITTS && serverAvailable === false && (
              <WifiOff className="h-4 w-4 text-orange-500 flex-shrink-0" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSettings({ useAITTS: !useAITTS })}
              className="text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-2"
              disabled={!isOnline}
            >
              {useAITTS ? 'Browser' : 'AI'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {/* Current Content Display */}
        {currentEventId ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Now Playing:</div>
            <div className="text-sm text-blue-800 dark:text-blue-200 font-medium truncate">{currentTitle}</div>
            {eventQueue.length > 0 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {eventQueue.length} chronological events queued automatically
              </div>
            )}
            {autoPlayNext && eventQueue.length === 0 && currentEventId && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Continuous auto-play enabled - will continue through all events
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ready to Play:</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {autoPlayNext ? (
                <>Click any "Narrate" button to start continuous chronological playback</>
              ) : (
                <>Click any "Narrate" button to play individual events</>
              )}
            </div>
            {autoPlayNext && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Auto-play enabled - will continue through all events automatically
              </div>
            )}
          </div>
        )}

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Globe className="h-3 w-3" />
            Language
          </label>
          <Select value={selectedLanguage} onValueChange={(value) => updateSettings({ selectedLanguage: value })}>
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-60">
              {languageOptions.map((language) => (
                <SelectItem key={language.code} value={language.code} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{language.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{language.nativeName}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Languages className="h-3 w-3" />
            Voice
          </label>
          <Select value={selectedVoice} onValueChange={(value) => updateSettings({ selectedVoice: value })}>
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {availableVoices.map((voice) => (
                <SelectItem key={voice.key} value={voice.key} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{voice.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto-play Toggle */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <SkipForward className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-play next</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">chronological events</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className={`text-xs px-2 ${autoPlayNext ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {autoPlayNext ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Advanced Settings */}
        {showSettings && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Speed: {speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
                  className="w-full mt-1 accent-blue-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Pitch: {pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
                  className="w-full mt-1 accent-blue-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full mt-1 accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handlePlay}
            disabled={localIsGenerating || isTranslating || !currentEventId}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-sm"
            size="sm"
          >
            {localIsGenerating || isAudioLoading || isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isTranslating ? 'Translating...' : localIsGenerating || isAudioLoading ? 'Preparing...' : isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMute}
              variant="outline"
              size="sm"
              disabled={!isPlaying}
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              {isMuted ? <VolumeX className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            
            {eventQueue.length > 0 && (
              <Button
                onClick={handleSkipNext}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 p-2"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
          </div>
          
        </div>

       

        {/* Translation Error */}
        {translationError && (
          <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
            <strong className="text-orange-900 dark:text-orange-300">⚠️ Translation:</strong> {translationError}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
