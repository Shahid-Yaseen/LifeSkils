import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Volume2, VolumeX, Play, Pause, User, Settings, Cloud, Wifi, WifiOff, Globe, Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BrowserTTSNarrationProps {
  eventId: string;
  title: string;
  description: string;
  details?: string;
  onAudioGenerated?: (audioUrl: string) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

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

export default function BrowserTTSNarration({ 
  eventId, 
  title, 
  description, 
  details,
  onAudioGenerated, 
  onPlaybackChange 
}: BrowserTTSNarrationProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedVoice, setSelectedVoice] = useState<string>('british_female');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [useAITTS, setUseAITTS] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioError, setAudioError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string>('');
  const [translationError, setTranslationError] = useState<string>('');
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', voices: ['urdu_male', 'urdu_female'] },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', voices: ['bengali_male', 'bengali_female'] },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', voices: ['turkish_male', 'turkish_female'] },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', voices: ['polish_male', 'polish_female'] },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', voices: ['dutch_male', 'dutch_female'] },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', voices: ['swedish_male', 'swedish_female'] },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', voices: ['norwegian_male', 'norwegian_female'] },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', voices: ['danish_male', 'danish_female'] }
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
    // Bengali voices
    {
      key: 'bengali_male',
      name: 'Rahul (Bengali Male)',
      description: 'Warm Bengali male voice',
      accent: 'Bengali',
      gender: 'male',
      characteristics: 'Friendly, engaging, educational',
      speed: 0.95,
      pitch: 0.9,
      language: 'Bengali',
      languageCode: 'bn'
    },
    {
      key: 'bengali_female',
      name: 'Maya (Bengali Female)',
      description: 'Melodious Bengali female voice',
      accent: 'Bengali',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 1,
      pitch: 1.1,
      language: 'Bengali',
      languageCode: 'bn'
    },
    // Turkish voices
    {
      key: 'turkish_male',
      name: 'Mehmet (Turkish Male)',
      description: 'Strong Turkish male voice',
      accent: 'Turkish',
      gender: 'male',
      characteristics: 'Authoritative, clear, engaging',
      speed: 0.9,
      pitch: 0.9,
      language: 'Turkish',
      languageCode: 'tr'
    },
    {
      key: 'turkish_female',
      name: 'Ayşe (Turkish Female)',
      description: 'Clear Turkish female voice',
      accent: 'Turkish',
      gender: 'female',
      characteristics: 'Professional, engaging, educational',
      speed: 0.95,
      pitch: 1.1,
      language: 'Turkish',
      languageCode: 'tr'
    },
    // Polish voices
    {
      key: 'polish_male',
      name: 'Piotr (Polish Male)',
      description: 'Clear Polish male voice',
      accent: 'Polish',
      gender: 'male',
      characteristics: 'Professional, engaging, educational',
      speed: 0.9,
      pitch: 0.9,
      language: 'Polish',
      languageCode: 'pl'
    },
    {
      key: 'polish_female',
      name: 'Anna (Polish Female)',
      description: 'Melodious Polish female voice',
      accent: 'Polish',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 0.95,
      pitch: 1.1,
      language: 'Polish',
      languageCode: 'pl'
    },
    // Dutch voices
    {
      key: 'dutch_male',
      name: 'Jan (Dutch Male)',
      description: 'Clear Dutch male voice',
      accent: 'Dutch',
      gender: 'male',
      characteristics: 'Direct, professional, educational',
      speed: 0.95,
      pitch: 0.9,
      language: 'Dutch',
      languageCode: 'nl'
    },
    {
      key: 'dutch_female',
      name: 'Emma (Dutch Female)',
      description: 'Friendly Dutch female voice',
      accent: 'Dutch',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 1,
      pitch: 1.1,
      language: 'Dutch',
      languageCode: 'nl'
    },
    // Swedish voices
    {
      key: 'swedish_male',
      name: 'Erik (Swedish Male)',
      description: 'Clear Swedish male voice',
      accent: 'Swedish',
      gender: 'male',
      characteristics: 'Professional, engaging, educational',
      speed: 0.9,
      pitch: 0.9,
      language: 'Swedish',
      languageCode: 'sv'
    },
    {
      key: 'swedish_female',
      name: 'Astrid (Swedish Female)',
      description: 'Melodious Swedish female voice',
      accent: 'Swedish',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 0.95,
      pitch: 1.1,
      language: 'Swedish',
      languageCode: 'sv'
    },
    // Norwegian voices
    {
      key: 'norwegian_male',
      name: 'Lars (Norwegian Male)',
      description: 'Clear Norwegian male voice',
      accent: 'Norwegian',
      gender: 'male',
      characteristics: 'Professional, engaging, educational',
      speed: 0.9,
      pitch: 0.9,
      language: 'Norwegian',
      languageCode: 'no'
    },
    {
      key: 'norwegian_female',
      name: 'Ingrid (Norwegian Female)',
      description: 'Melodious Norwegian female voice',
      accent: 'Norwegian',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 0.95,
      pitch: 1.1,
      language: 'Norwegian',
      languageCode: 'no'
    },
    // Danish voices
    {
      key: 'danish_male',
      name: 'Søren (Danish Male)',
      description: 'Clear Danish male voice',
      accent: 'Danish',
      gender: 'male',
      characteristics: 'Professional, engaging, educational',
      speed: 0.9,
      pitch: 0.9,
      language: 'Danish',
      languageCode: 'da'
    },
    {
      key: 'danish_female',
      name: 'Freja (Danish Female)',
      description: 'Melodious Danish female voice',
      accent: 'Danish',
      gender: 'female',
      characteristics: 'Clear, engaging, professional',
      speed: 0.95,
      pitch: 1.1,
      language: 'Danish',
      languageCode: 'da'
    }
  ];

  const selectedVoiceOption = voiceOptions.find(v => v.key === selectedVoice);
  const selectedLanguageOption = languageOptions.find(l => l.code === selectedLanguage);

  // Get available voices for selected language
  const availableVoices = voiceOptions.filter(v => v.languageCode === selectedLanguage);
  
  // Debug logging (can be removed in production)
  // console.log('🔍 Component state:', {
  //   selectedVoice,
  //   selectedLanguage,
  //   selectedVoiceOption: selectedVoiceOption?.name || 'Not found',
  //   availableVoicesCount: availableVoices.length,
  //   availableVoiceKeys: availableVoices.map(v => v.key)
  // });

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

  // AI Translation function
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
      setIsTranslating(true);
      setTranslationError('');

      // Check cache first
      const cacheKey = `translation_${eventId}_${targetLanguage}_${text.length}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          console.log('🌍 Using cached translation');
          setIsTranslating(false);
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
          sourceLanguage: 'en', // Assuming source is English
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
      
      setIsTranslating(false);
      return result.translation;
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsTranslating(false);
      return text; // Return original text if translation fails
    }
  };

  // Initialize voice selection on mount and handle language changes
  useEffect(() => {
    const availableVoicesForLanguage = voiceOptions.filter(v => v.languageCode === selectedLanguage);
    if (availableVoicesForLanguage.length > 0) {
      const firstVoice = availableVoicesForLanguage[0];
      // Only update if current voice is not available for the selected language
      const currentVoiceAvailable = availableVoicesForLanguage.some(v => v.key === selectedVoice);
      if (!currentVoiceAvailable) {
        console.log(`🔄 Switching voice from ${selectedVoice} to ${firstVoice.key} for language ${selectedLanguage}`);
        setSelectedVoice(firstVoice.key);
      }
    }
  }, [selectedLanguage]); // Removed selectedVoice from dependencies to prevent infinite loop

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

  useEffect(() => {
    if (!isSupported) return;

    const handleEnd = () => {
      setIsPlaying(false);
      onPlaybackChange?.(false);
    };

    const handleStart = () => {
      setIsPlaying(true);
      onPlaybackChange?.(true);
    };

    const handleError = () => {
      setIsPlaying(false);
      onPlaybackChange?.(false);
    };

    // Set up event listeners
    if (utteranceRef.current) {
      utteranceRef.current.onend = handleEnd;
      utteranceRef.current.onstart = handleStart;
      utteranceRef.current.onerror = handleError;
    }

    return () => {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onstart = null;
        utteranceRef.current.onerror = null;
      }
    };
  }, [isSupported, onPlaybackChange]);

  // Cleanup effect - stop any playing audio when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up audio...');
      
      // Stop AI TTS audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Stop browser TTS
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Check for cached audio
  const getCachedAudioKey = (text: string, voiceKey: string) => {
    return `tts_${eventId}_${voiceKey}_${text.length}`;
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
      console.log('🔍 Available voices for current language:', availableVoices.map(v => v.key));
      
      const response = await fetch('/api/tts-enhanced/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceKey,
          eventId,
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
          setUseAITTS(false);
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

  const generateNarrationText = async (): Promise<string> => {
    const voice = selectedVoiceOption;
    const language = selectedLanguageOption;
    let intro = '';
    
    // Generate language-specific introductions
    const introductions: { [key: string]: { [key: string]: string } } = {
      en: {
        british_male: "Good day! I'm James, your British narrator. ",
        british_female: "Hello! I'm Emma, your British guide. ",
        american_male: "Hey there! I'm Michael, your American narrator. ",
        american_female: "Hi! I'm Sarah, your American guide. ",
        historian_male: "Greetings. I am Professor Williams, your scholarly guide. ",
        storyteller_female: "Welcome, dear listener. I am Lady Catherine, your storyteller. ",
        default: "Hello! I'm your narrator. "
      },
      es: {
        spanish_male: "¡Buenos días! Soy Carlos, su narrador español. ",
        spanish_female: "¡Hola! Soy Isabella, su guía española. ",
        default: "¡Hola! Soy su narrador. "
      },
      fr: {
        french_male: "Bonjour! Je suis Pierre, votre narrateur français. ",
        french_female: "Bonjour! Je suis Marie, votre guide française. ",
        default: "Bonjour! Je suis votre narrateur. "
      },
      de: {
        german_male: "Guten Tag! Ich bin Hans, Ihr deutscher Erzähler. ",
        german_female: "Hallo! Ich bin Greta, Ihre deutsche Führerin. ",
        default: "Hallo! Ich bin Ihr Erzähler. "
      },
      it: {
        italian_male: "Buongiorno! Sono Marco, il vostro narratore italiano. ",
        italian_female: "Ciao! Sono Sofia, la vostra guida italiana. ",
        default: "Ciao! Sono il vostro narratore. "
      },
      pt: {
        portuguese_male: "Bom dia! Sou João, seu narrador português. ",
        portuguese_female: "Olá! Sou Ana, sua guia portuguesa. ",
        default: "Olá! Sou seu narrador. "
      },
      ru: {
        russian_male: "Добрый день! Я Дмитрий, ваш русский рассказчик. ",
        russian_female: "Привет! Я Наташа, ваш русский гид. ",
        default: "Привет! Я ваш рассказчик. "
      },
      zh: {
        chinese_male: "你好！我是伟，您的中文叙述者。",
        chinese_female: "你好！我是李，您的中文导游。",
        default: "你好！我是您的叙述者。"
      },
      ja: {
        japanese_male: "こんにちは！私は広志、あなたの日本語ナレーターです。",
        japanese_female: "こんにちは！私は雪、あなたの日本語ガイドです。",
        default: "こんにちは！私はあなたのナレーターです。"
      },
      ko: {
        korean_male: "안녕하세요! 저는 민, 당신의 한국어 내레이터입니다.",
        korean_female: "안녕하세요! 저는 지, 당신의 한국어 가이드입니다.",
        default: "안녕하세요! 저는 당신의 내레이터입니다."
      },
      ar: {
        arabic_male: "مرحباً! أنا أحمد، راويك العربي.",
        arabic_female: "مرحباً! أنا فاطمة، مرشدتك العربية.",
        default: "مرحباً! أنا راويك."
      },
      hi: {
        hindi_male: "नमस्ते! मैं राज, आपका हिंदी वर्णनकर्ता हूँ।",
        hindi_female: "नमस्ते! मैं प्रिया, आपकी हिंदी गाइड हूँ।",
        default: "नमस्ते! मैं आपका वर्णनकर्ता हूँ।"
      },
      ur: {
        urdu_male: "السلام علیکم! میں علی، آپ کا اردو راوی ہوں۔",
        urdu_female: "السلام علیکم! میں عائشہ، آپ کی اردو گائیڈ ہوں۔",
        default: "السلام علیکم! میں آپ کا راوی ہوں۔"
      },
      bn: {
        bengali_male: "নমস্কার! আমি রাহুল, আপনার বাংলা বর্ণনাকারী।",
        bengali_female: "নমস্কার! আমি মায়া, আপনার বাংলা গাইড।",
        default: "নমস্কার! আমি আপনার বর্ণনাকারী।"
      },
      tr: {
        turkish_male: "Merhaba! Ben Mehmet, Türkçe anlatıcınız.",
        turkish_female: "Merhaba! Ben Ayşe, Türkçe rehberiniz.",
        default: "Merhaba! Ben anlatıcınız."
      },
      pl: {
        polish_male: "Dzień dobry! Jestem Piotr, wasz polski narrator.",
        polish_female: "Cześć! Jestem Anna, wasza polska przewodniczka.",
        default: "Cześć! Jestem waszym narratorem."
      },
      nl: {
        dutch_male: "Goedendag! Ik ben Jan, uw Nederlandse verteller.",
        dutch_female: "Hallo! Ik ben Emma, uw Nederlandse gids.",
        default: "Hallo! Ik ben uw verteller."
      },
      sv: {
        swedish_male: "God dag! Jag är Erik, er svenska berättare.",
        swedish_female: "Hej! Jag är Astrid, er svenska guide.",
        default: "Hej! Jag är er berättare."
      },
      no: {
        norwegian_male: "God dag! Jeg er Lars, deres norske forteller.",
        norwegian_female: "Hei! Jeg er Ingrid, deres norske guide.",
        default: "Hei! Jeg er deres forteller."
      },
      da: {
        danish_male: "God dag! Jeg er Søren, jeres danske fortæller.",
        danish_female: "Hej! Jeg er Freja, jeres danske guide.",
        default: "Hej! Jeg er jeres fortæller."
      }
    };

    // Get introduction for current voice and language
    const langIntros = introductions[selectedLanguage] || introductions.en;
    intro = langIntros[selectedVoice] || langIntros.default;

    // Generate main content
    const mainContent = `Let me tell you about "${title}". ${description}${details ? ` ${details}` : ''}`;
    const fullText = `${intro}${mainContent}`;

    // If not English, translate the content
    if (selectedLanguage !== 'en') {
      try {
        const translatedText = await translateText(fullText, selectedLanguage);
        return translatedText;
      } catch (error) {
        console.error('Translation failed, using original text:', error);
        return fullText;
      }
    }

    return fullText;
  };

  const handlePlay = async () => {
    if (isPlaying) {
      // Pause current playback
      console.log('⏸️ Pausing current playback...');
      
      // Pause AI TTS audio if it exists
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Stop browser TTS speech synthesis
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      setIsPlaying(false);
      onPlaybackChange?.(false);
      return;
    }

    setIsGenerating(true);
    setAudioError('');
    
    try {
      const text = await generateNarrationText();
      setCurrentText(text);
      setTranslatedText(text);

      if (useAITTS && isOnline) {
        // Use AI TTS
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
              setSelectedVoice(fallbackVoice.key);
              audioUrl = await generateAITTS(text, fallbackVoice.key);
            } else {
              throw new Error(`No voices available for language ${selectedLanguage}`);
            }
          } else {
            console.log(`✅ Voice validation passed: ${selectedVoice} for ${selectedLanguage}`);
            audioUrl = await generateAITTS(text, selectedVoice);
          }
          
          // Validate that we have a valid audio URL
          if (!audioUrl || audioUrl.trim() === '') {
            throw new Error('No audio URL received from TTS service');
          }
          
          setAudioUrl(audioUrl);
          onAudioGenerated?.(audioUrl);
          
          // Create audio element for playback
          const audio = new Audio();
          audioRef.current = audio;
          console.log('🎵 Created new audio element');
          
          // Set up simple event handlers
          audio.onplay = () => {
            console.log('🎵 Audio started playing');
            setIsPlaying(true);
            setIsGenerating(false);
            onPlaybackChange?.(true);
          };
          
          audio.onpause = () => {
            console.log('🎵 Audio paused');
            setIsPlaying(false);
            onPlaybackChange?.(false);
          };
          
          audio.onended = () => {
            console.log('🎵 Audio ended');
            setIsPlaying(false);
            onPlaybackChange?.(false);
          };
          
          audio.onerror = (event) => {
            console.error('Audio playback error:', event);
            setAudioError(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`);
            setIsPlaying(false);
            setIsGenerating(false);
            onPlaybackChange?.(false);
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
            console.log('🎵 Starting audio playback');
            await audio.play();
            console.log('🎵 Audio play() called successfully');
          } catch (playError) {
            console.error('Audio play() failed:', playError);
            setAudioError(`Failed to start audio playback: ${playError instanceof Error ? playError.message : 'Unknown error'}`);
            setIsGenerating(false);
          }
          
        } catch (error) {
          console.error('AI TTS failed, falling back to browser TTS:', error);
          setAudioError(`AI TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setUseAITTS(false);
          // Fall through to browser TTS
        }
      }
      
      if (!useAITTS || !isOnline) {
        // Use browser TTS
        if (!isSupported) {
          alert('Your browser does not support text-to-speech. Please use a modern browser like Chrome, Firefox, or Safari.');
          setIsGenerating(false);
          return;
        }

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Set voice properties based on selection
        const voice = selectedVoiceOption;
        utterance.rate = speed;
        utterance.pitch = pitch;
        utterance.volume = isMuted ? 0 : volume;

        // Try to find a matching voice
        const voices = speechSynthesis.getVoices();
        let selectedVoiceObj = null;

        // Look for voices that match our criteria
        if (voice?.gender === 'male' && voice?.accent === 'British') {
          selectedVoiceObj = voices.find(v => 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('british') ||
            v.name.toLowerCase().includes('uk')
          );
        } else if (voice?.gender === 'female' && voice?.accent === 'British') {
          selectedVoiceObj = voices.find(v => 
            v.name.toLowerCase().includes('female') || 
            v.name.toLowerCase().includes('british') ||
            v.name.toLowerCase().includes('uk')
          );
        } else if (voice?.gender === 'male' && voice?.accent === 'American') {
          selectedVoiceObj = voices.find(v => 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('american') ||
            v.name.toLowerCase().includes('us')
          );
        } else if (voice?.gender === 'female' && voice?.accent === 'American') {
          selectedVoiceObj = voices.find(v => 
            v.name.toLowerCase().includes('female') || 
            v.name.toLowerCase().includes('american') ||
            v.name.toLowerCase().includes('us')
          );
        }

        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
        }

        // Set up event handlers
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsGenerating(false);
          onPlaybackChange?.(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          onPlaybackChange?.(false);
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          setIsPlaying(false);
          setIsGenerating(false);
          onPlaybackChange?.(false);
        };

        // Start speaking
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Error generating narration:', error);
      setIsGenerating(false);
      setAudioError('Failed to generate narration');
    }
  };

  const handleStop = () => {
    console.log('🛑 Stopping audio playback...');
    
    // Stop AI TTS audio if it exists
    if (audioRef.current) {
      console.log('🛑 Stopping AI TTS audio');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop browser TTS speech synthesis
    if (speechSynthesis.speaking) {
      console.log('🛑 Stopping browser TTS speech synthesis');
      speechSynthesis.cancel();
    }
    
    // Reset all states
    setIsPlaying(false);
    setIsGenerating(false);
    setIsAudioLoading(false);
    onPlaybackChange?.(false);
    
    console.log('✅ Audio playback stopped');
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (useAITTS && audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    } else if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? volume : 0;
    }
  };

  if (!isSupported) {
    return (
      <Card className="mt-3 sm:mt-4 !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-sm text-gray-900 dark:text-white">
            🎤 Voice Narration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400">
            Your browser doesn't support text-to-speech. Please use Chrome, Firefox, or Safari for voice narration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-3 sm:mt-4 !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-sm sm:text-sm flex items-center gap-2 text-gray-900 dark:text-white">
            {useAITTS ? (
              <Cloud className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className="truncate">{useAITTS ? 'AI Voice Narration' : 'Browser Voice Narration'}</span>
            {!isOnline && (
              <WifiOff className="h-3 w-3 text-red-500 flex-shrink-0" />
            )}
            {isOnline && useAITTS && serverAvailable === true && (
              <Wifi className="h-3 w-3 text-green-500 flex-shrink-0" />
            )}
            {isOnline && useAITTS && serverAvailable === false && (
              <WifiOff className="h-3 w-3 text-orange-500 flex-shrink-0" />
            )}
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseAITTS(!useAITTS)}
              className="text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 sm:px-3"
              disabled={!isOnline}
            >
              {useAITTS ? 'Browser' : 'AI'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 sm:p-2"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pt-0">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Globe className="h-3 w-3" />
            Choose Language
          </label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-sm">
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
            Choose Your Narrator
          </label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {availableVoices.map((voice) => (
                <SelectItem key={voice.key} value={voice.key} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm sm:text-sm">{voice.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Settings */}
        {showSettings && (
          <div className="space-y-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
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
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
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
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full mt-1 accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Voice Info */}
        {selectedVoiceOption && (
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <strong className="text-gray-900 dark:text-white">{selectedVoiceOption.name}:</strong> {selectedVoiceOption.characteristics}
          </div>
        )}

        {/* Translation Status */}
        {isTranslating && (
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <strong className="text-blue-900 dark:text-blue-300">🌍 Translating:</strong> Converting to {selectedLanguageOption?.nativeName}...
          </div>
        )}

        {/* Translation Error */}
        {translationError && (
          <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
            <strong className="text-orange-900 dark:text-orange-300">⚠️ Translation:</strong> {translationError}
          </div>
        )}

        {/* Server Status */}
        {serverAvailable === false && (
          <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
            <strong className="text-orange-900 dark:text-orange-300">⚠️ Server:</strong> AI TTS service not available, using browser TTS
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:gap-2">
          <Button
            onClick={handlePlay}
            disabled={isGenerating || isTranslating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-sm sm:text-sm"
            size="sm"
          >
            {isGenerating || isAudioLoading || isTranslating ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
            ) : isPlaying ? (
              <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            ) : (
              <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            )}
            {isTranslating ? 'Translating...' : isGenerating || isAudioLoading ? 'Preparing...' : isPlaying ? 'Pause' : 'Listen'}
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              onClick={handleStop}
              variant="outline"
              size="sm"
              disabled={!isPlaying}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-sm"
            >
              Stop
            </Button>
            
            <Button
              onClick={handleMute}
              variant="outline"
              size="sm"
              disabled={!isPlaying}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 sm:p-2"
            >
              {isMuted ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          </div>
        </div>

       

        {/* Audio URL Display */}
        {audioUrl && useAITTS && (
          <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
            <strong className="text-green-900 dark:text-green-300">AI Audio:</strong> 
            {cachedAudioUrl === audioUrl ? 'Loaded from cache' : 'Generated successfully'}
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          </div>
        )}

        {/* Loading State */}
        {isAudioLoading && useAITTS && (
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <strong className="text-blue-900 dark:text-blue-300">AI Processing:</strong> Generating high-quality audio...
          </div>
        )}

        {/* Current Text Preview */}
        {currentText && (
          <div className="space-y-2">
            {selectedLanguage !== 'en' && translatedText && translatedText !== currentText && (
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-2 rounded max-h-16 sm:max-h-20 overflow-y-auto border border-green-200 dark:border-green-800">
                <strong className="text-green-900 dark:text-green-300">🌍 {selectedLanguageOption?.nativeName}:</strong> {translatedText.substring(0, 150)}
                {translatedText.length > 150 && '...'}
              </div>
            )}
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded max-h-16 sm:max-h-20 overflow-y-auto border border-gray-200 dark:border-gray-700">
              <strong className="text-gray-900 dark:text-white">📝 {selectedLanguage === 'en' ? 'Narration' : 'Original'}:</strong> {currentText.substring(0, 150)}
            {currentText.length > 150 && '...'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
