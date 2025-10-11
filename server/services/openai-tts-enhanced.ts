import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

// OpenAI TTS Voice Options with humanized characteristics
export const VOICE_OPTIONS = {
  // English voices
  british_male: {
    voice: 'onyx' as const,
    name: 'James (British Male)',
    description: 'Deep, authoritative British male voice',
    characteristics: 'Formal, educational, historical narrator',
    accent: 'British',
    gender: 'male',
    speed: 0.9,
    pitch: 0.8,
    language: 'English',
    languageCode: 'en'
  },
  british_female: {
    voice: 'nova' as const,
    name: 'Emma (British Female)',
    description: 'Clear, articulate British female voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'British',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'English',
    languageCode: 'en'
  },
  american_male: {
    voice: 'echo' as const,
    name: 'Michael (American Male)',
    description: 'Warm, conversational American male voice',
    characteristics: 'Friendly, approachable, modern',
    accent: 'American',
    gender: 'male',
    speed: 1.0,
    pitch: 0.9,
    language: 'English',
    languageCode: 'en'
  },
  american_female: {
    voice: 'alloy' as const,
    name: 'Sarah (American Female)',
    description: 'Bright, energetic American female voice',
    characteristics: 'Enthusiastic, clear, engaging',
    accent: 'American',
    gender: 'female',
    speed: 1.05,
    pitch: 1.2,
    language: 'English',
    languageCode: 'en'
  },
  historian_male: {
    voice: 'fable' as const,
    name: 'Professor Williams (Historian)',
    description: 'Scholarly, distinguished male voice',
    characteristics: 'Academic, knowledgeable, authoritative',
    accent: 'British',
    gender: 'male',
    speed: 0.85,
    pitch: 0.75,
    language: 'English',
    languageCode: 'en'
  },
  storyteller_female: {
    voice: 'shimmer' as const,
    name: 'Lady Catherine (Storyteller)',
    description: 'Elegant, storytelling female voice',
    characteristics: 'Narrative, dramatic, engaging',
    accent: 'British',
    gender: 'female',
    speed: 0.9,
    pitch: 1.0,
    language: 'English',
    languageCode: 'en'
  },
  // Spanish voices
  spanish_male: {
    voice: 'onyx' as const,
    name: 'Carlos (Spanish Male)',
    description: 'Warm, expressive Spanish male voice',
    characteristics: 'Passionate, clear, educational',
    accent: 'Spanish',
    gender: 'male',
    speed: 0.95,
    pitch: 0.9,
    language: 'Spanish',
    languageCode: 'es'
  },
  spanish_female: {
    voice: 'nova' as const,
    name: 'Isabella (Spanish Female)',
    description: 'Melodious, articulate Spanish female voice',
    characteristics: 'Elegant, engaging, professional',
    accent: 'Spanish',
    gender: 'female',
    speed: 1.0,
    pitch: 1.1,
    language: 'Spanish',
    languageCode: 'es'
  },
  // French voices
  french_male: {
    voice: 'echo' as const,
    name: 'Pierre (French Male)',
    description: 'Sophisticated French male voice',
    characteristics: 'Refined, intellectual, charming',
    accent: 'French',
    gender: 'male',
    speed: 0.9,
    pitch: 0.85,
    language: 'French',
    languageCode: 'fr'
  },
  french_female: {
    voice: 'alloy' as const,
    name: 'Marie (French Female)',
    description: 'Graceful French female voice',
    characteristics: 'Elegant, expressive, cultured',
    accent: 'French',
    gender: 'female',
    speed: 0.95,
    pitch: 1.05,
    language: 'French',
    languageCode: 'fr'
  },
  // German voices
  german_male: {
    voice: 'fable' as const,
    name: 'Hans (German Male)',
    description: 'Precise, authoritative German male voice',
    characteristics: 'Clear, methodical, professional',
    accent: 'German',
    gender: 'male',
    speed: 0.9,
    pitch: 0.8,
    language: 'German',
    languageCode: 'de'
  },
  german_female: {
    voice: 'shimmer' as const,
    name: 'Greta (German Female)',
    description: 'Clear, articulate German female voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'German',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'German',
    languageCode: 'de'
  },
  // Italian voices
  italian_male: {
    voice: 'onyx' as const,
    name: 'Marco (Italian Male)',
    description: 'Expressive Italian male voice',
    characteristics: 'Passionate, artistic, engaging',
    accent: 'Italian',
    gender: 'male',
    speed: 1.0,
    pitch: 0.9,
    language: 'Italian',
    languageCode: 'it'
  },
  italian_female: {
    voice: 'nova' as const,
    name: 'Sofia (Italian Female)',
    description: 'Melodious Italian female voice',
    characteristics: 'Warm, expressive, charming',
    accent: 'Italian',
    gender: 'female',
    speed: 1.05,
    pitch: 1.1,
    language: 'Italian',
    languageCode: 'it'
  },
  // Portuguese voices
  portuguese_male: {
    voice: 'echo' as const,
    name: 'João (Portuguese Male)',
    description: 'Warm Portuguese male voice',
    characteristics: 'Friendly, engaging, educational',
    accent: 'Portuguese',
    gender: 'male',
    speed: 0.95,
    pitch: 0.9,
    language: 'Portuguese',
    languageCode: 'pt'
  },
  portuguese_female: {
    voice: 'alloy' as const,
    name: 'Ana (Portuguese Female)',
    description: 'Clear Portuguese female voice',
    characteristics: 'Professional, articulate, engaging',
    accent: 'Portuguese',
    gender: 'female',
    speed: 1.0,
    pitch: 1.1,
    language: 'Portuguese',
    languageCode: 'pt'
  },
  // Russian voices
  russian_male: {
    voice: 'fable' as const,
    name: 'Dmitri (Russian Male)',
    description: 'Deep Russian male voice',
    characteristics: 'Authoritative, scholarly, engaging',
    accent: 'Russian',
    gender: 'male',
    speed: 0.9,
    pitch: 0.8,
    language: 'Russian',
    languageCode: 'ru'
  },
  russian_female: {
    voice: 'shimmer' as const,
    name: 'Natasha (Russian Female)',
    description: 'Elegant Russian female voice',
    characteristics: 'Sophisticated, clear, professional',
    accent: 'Russian',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Russian',
    languageCode: 'ru'
  },
  // Chinese voices
  chinese_male: {
    voice: 'onyx' as const,
    name: 'Wei (Chinese Male)',
    description: 'Clear Chinese male voice',
    characteristics: 'Precise, educational, professional',
    accent: 'Chinese',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Chinese',
    languageCode: 'zh'
  },
  chinese_female: {
    voice: 'nova' as const,
    name: 'Li (Chinese Female)',
    description: 'Melodious Chinese female voice',
    characteristics: 'Clear, engaging, educational',
    accent: 'Chinese',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Chinese',
    languageCode: 'zh'
  },
  // Japanese voices
  japanese_male: {
    voice: 'echo' as const,
    name: 'Hiroshi (Japanese Male)',
    description: 'Respectful Japanese male voice',
    characteristics: 'Polite, clear, educational',
    accent: 'Japanese',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Japanese',
    languageCode: 'ja'
  },
  japanese_female: {
    voice: 'alloy' as const,
    name: 'Yuki (Japanese Female)',
    description: 'Gentle Japanese female voice',
    characteristics: 'Soft, clear, engaging',
    accent: 'Japanese',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Japanese',
    languageCode: 'ja'
  },
  // Korean voices
  korean_male: {
    voice: 'fable' as const,
    name: 'Min (Korean Male)',
    description: 'Clear Korean male voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'Korean',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Korean',
    languageCode: 'ko'
  },
  korean_female: {
    voice: 'shimmer' as const,
    name: 'Ji (Korean Female)',
    description: 'Melodious Korean female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Korean',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Korean',
    languageCode: 'ko'
  },
  // Arabic voices
  arabic_male: {
    voice: 'onyx' as const,
    name: 'Ahmed (Arabic Male)',
    description: 'Authoritative Arabic male voice',
    characteristics: 'Respectful, clear, educational',
    accent: 'Arabic',
    gender: 'male',
    speed: 0.9,
    pitch: 0.8,
    language: 'Arabic',
    languageCode: 'ar'
  },
  arabic_female: {
    voice: 'nova' as const,
    name: 'Fatima (Arabic Female)',
    description: 'Elegant Arabic female voice',
    characteristics: 'Clear, professional, engaging',
    accent: 'Arabic',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Arabic',
    languageCode: 'ar'
  },
  // Hindi voices
  hindi_male: {
    voice: 'echo' as const,
    name: 'Raj (Hindi Male)',
    description: 'Warm Hindi male voice',
    characteristics: 'Friendly, engaging, educational',
    accent: 'Hindi',
    gender: 'male',
    speed: 0.95,
    pitch: 0.9,
    language: 'Hindi',
    languageCode: 'hi'
  },
  hindi_female: {
    voice: 'alloy' as const,
    name: 'Priya (Hindi Female)',
    description: 'Melodious Hindi female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Hindi',
    gender: 'female',
    speed: 1.0,
    pitch: 1.1,
    language: 'Hindi',
    languageCode: 'hi'
  },
  // Urdu voices
  urdu_male: {
    voice: 'fable' as const,
    name: 'Ali (Urdu Male)',
    description: 'Respectful Urdu male voice',
    characteristics: 'Polite, clear, educational',
    accent: 'Urdu',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Urdu',
    languageCode: 'ur'
  },
  urdu_female: {
    voice: 'shimmer' as const,
    name: 'Aisha (Urdu Female)',
    description: 'Elegant Urdu female voice',
    characteristics: 'Clear, professional, engaging',
    accent: 'Urdu',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Urdu',
    languageCode: 'ur'
  },
  // Bengali voices
  bengali_male: {
    voice: 'onyx' as const,
    name: 'Rahul (Bengali Male)',
    description: 'Warm Bengali male voice',
    characteristics: 'Friendly, engaging, educational',
    accent: 'Bengali',
    gender: 'male',
    speed: 0.95,
    pitch: 0.9,
    language: 'Bengali',
    languageCode: 'bn'
  },
  bengali_female: {
    voice: 'nova' as const,
    name: 'Maya (Bengali Female)',
    description: 'Melodious Bengali female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Bengali',
    gender: 'female',
    speed: 1.0,
    pitch: 1.1,
    language: 'Bengali',
    languageCode: 'bn'
  },
  // Turkish voices
  turkish_male: {
    voice: 'echo' as const,
    name: 'Mehmet (Turkish Male)',
    description: 'Strong Turkish male voice',
    characteristics: 'Authoritative, clear, engaging',
    accent: 'Turkish',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Turkish',
    languageCode: 'tr'
  },
  turkish_female: {
    voice: 'alloy' as const,
    name: 'Ayşe (Turkish Female)',
    description: 'Clear Turkish female voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'Turkish',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Turkish',
    languageCode: 'tr'
  },
  // Polish voices
  polish_male: {
    voice: 'fable' as const,
    name: 'Piotr (Polish Male)',
    description: 'Clear Polish male voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'Polish',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Polish',
    languageCode: 'pl'
  },
  polish_female: {
    voice: 'shimmer' as const,
    name: 'Anna (Polish Female)',
    description: 'Melodious Polish female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Polish',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Polish',
    languageCode: 'pl'
  },
  // Dutch voices
  dutch_male: {
    voice: 'onyx' as const,
    name: 'Jan (Dutch Male)',
    description: 'Clear Dutch male voice',
    characteristics: 'Direct, professional, educational',
    accent: 'Dutch',
    gender: 'male',
    speed: 0.95,
    pitch: 0.9,
    language: 'Dutch',
    languageCode: 'nl'
  },
  dutch_female: {
    voice: 'nova' as const,
    name: 'Emma (Dutch Female)',
    description: 'Friendly Dutch female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Dutch',
    gender: 'female',
    speed: 1.0,
    pitch: 1.1,
    language: 'Dutch',
    languageCode: 'nl'
  },
  // Swedish voices
  swedish_male: {
    voice: 'echo' as const,
    name: 'Erik (Swedish Male)',
    description: 'Clear Swedish male voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'Swedish',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Swedish',
    languageCode: 'sv'
  },
  swedish_female: {
    voice: 'alloy' as const,
    name: 'Astrid (Swedish Female)',
    description: 'Melodious Swedish female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Swedish',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Swedish',
    languageCode: 'sv'
  },
  // Norwegian voices
  norwegian_male: {
    voice: 'fable' as const,
    name: 'Lars (Norwegian Male)',
    description: 'Clear Norwegian male voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'Norwegian',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Norwegian',
    languageCode: 'no'
  },
  norwegian_female: {
    voice: 'shimmer' as const,
    name: 'Ingrid (Norwegian Female)',
    description: 'Melodious Norwegian female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Norwegian',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Norwegian',
    languageCode: 'no'
  },
  // Danish voices
  danish_male: {
    voice: 'onyx' as const,
    name: 'Søren (Danish Male)',
    description: 'Clear Danish male voice',
    characteristics: 'Professional, engaging, educational',
    accent: 'Danish',
    gender: 'male',
    speed: 0.9,
    pitch: 0.9,
    language: 'Danish',
    languageCode: 'da'
  },
  danish_female: {
    voice: 'nova' as const,
    name: 'Freja (Danish Female)',
    description: 'Melodious Danish female voice',
    characteristics: 'Clear, engaging, professional',
    accent: 'Danish',
    gender: 'female',
    speed: 0.95,
    pitch: 1.1,
    language: 'Danish',
    languageCode: 'da'
  }
};

export class OpenAIEnhancedTTS {
  private openai: OpenAI;
  private audioCache: Map<string, string> = new Map();
  private cacheDir: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.cacheDir = path.join(process.cwd(), 'uploads', 'audio_cache');
    this.ensureCacheDir();
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  // Generate humanized speech with enhanced characteristics
  async generateHumanizedSpeech(
    text: string,
    voiceKey: keyof typeof VOICE_OPTIONS,
    options: {
      eventId?: string;
      enhanceForHistory?: boolean;
      addEmphasis?: boolean;
    } = {}
  ): Promise<{ audioUrl: string; voiceInfo: any; duration?: number }> {
    try {
      const voiceConfig = VOICE_OPTIONS[voiceKey];
      const { eventId, enhanceForHistory = true, addEmphasis = false } = options;

      // Create cache key
      const cacheKey = this.createCacheKey(text, voiceKey, options);
      
      // Check cache first
      if (this.audioCache.has(cacheKey)) {
        const cachedUrl = this.audioCache.get(cacheKey)!;
        return {
          audioUrl: cachedUrl,
          voiceInfo: voiceConfig
        };
      }

      // Enhance text for better speech
      const enhancedText = this.enhanceTextForSpeech(text, voiceConfig, {
        enhanceForHistory,
        addEmphasis
      });

      console.log(`🎤 Generating speech with ${voiceConfig.name} (${voiceConfig.voice})`);
      console.log(`📝 Enhanced text: ${enhancedText.substring(0, 100)}...`);

      // Generate speech using OpenAI TTS
      const response = await this.openai.audio.speech.create({
        model: 'tts-1-hd', // High definition for better quality
        voice: voiceConfig.voice,
        input: enhancedText,
        response_format: 'mp3',
        speed: voiceConfig.speed
      });

      // Save audio file
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const fileName = `${eventId || 'timeline'}_${voiceKey}_${Date.now()}.mp3`;
      const filePath = path.join(this.cacheDir, fileName);
      
      await fs.writeFile(filePath, audioBuffer);
      
      // Create accessible URL - use uploads path for static serving
      const audioUrl = `/uploads/audio_cache/${fileName}`;
      
      // Cache the result
      this.audioCache.set(cacheKey, audioUrl);

      return {
        audioUrl,
        voiceInfo: voiceConfig,
        duration: this.estimateDuration(enhancedText, voiceConfig.speed)
      };

    } catch (error) {
      console.error('Error generating humanized speech:', error);
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Enhance text for more natural speech
  private enhanceTextForSpeech(
    text: string,
    voiceConfig: any,
    options: { enhanceForHistory: boolean; addEmphasis: boolean }
  ): string {
    let enhanced = text;

    // Add natural pauses and emphasis for historical content
    if (options.enhanceForHistory) {
      enhanced = this.addHistoricalEmphasis(enhanced);
    }

    // Add conversational elements based on voice characteristics
    enhanced = this.addVoiceCharacteristics(enhanced, voiceConfig);

    // Add emphasis markers if requested
    if (options.addEmphasis) {
      enhanced = this.addEmphasisMarkers(enhanced);
    }

    // Clean up any problematic characters for TTS
    enhanced = this.cleanTextForTTS(enhanced);

    return enhanced;
  }

  private addHistoricalEmphasis(text: string): string {
    return text
      // Add pauses after important dates
      .replace(/(\d{4})/g, '$1... ')
      // Emphasize key historical terms
      .replace(/\b(Conquest|Revolution|War|Treaty|Act|Charter)\b/g, '<emphasis level="strong">$1</emphasis>')
      // Add natural pauses after periods
      .replace(/\./g, '... ')
      // Emphasize important figures
      .replace(/\b(King|Queen|Emperor|Prime Minister|Duke|Earl)\b/g, '<emphasis level="moderate">$1</emphasis>')
      // Add breathing space
      .replace(/,/g, ', ');
  }

  private addVoiceCharacteristics(text: string, voiceConfig: any): string {
    const { characteristics, accent } = voiceConfig;

    // Add voice-specific enhancements
    if (characteristics.includes('academic') || characteristics.includes('scholarly')) {
      text = `Let me explain: ${text}`;
    }

    if (characteristics.includes('narrative') || characteristics.includes('storytelling')) {
      text = `Once upon a time in history: ${text}`;
    }

    if (characteristics.includes('authoritative')) {
      text = `It is important to note that ${text.toLowerCase()}`;
    }

    // Add accent-appropriate enhancements
    if (accent === 'British') {
      text = text.replace(/\b(history|historical)\b/g, 'hist\'ry');
    }

    return text;
  }

  private addEmphasisMarkers(text: string): string {
    return text
      .replace(/\b(first|last|only|major|important|significant)\b/g, '<emphasis level="strong">$1</emphasis>')
      .replace(/\b(established|founded|created|invented|discovered)\b/g, '<emphasis level="moderate">$1</emphasis>');
  }

  private cleanTextForTTS(text: string): string {
    return text
      // Remove HTML tags that might cause issues
      .replace(/<[^>]*>/g, '')
      // Clean up excessive punctuation
      .replace(/\.{3,}/g, '...')
      // Ensure proper spacing
      .replace(/\s+/g, ' ')
      .trim();
  }

  private createCacheKey(text: string, voiceKey: string, options: any): string {
    const textHash = this.hashString(text);
    const optionsHash = this.hashString(JSON.stringify(options));
    return `${voiceKey}_${textHash}_${optionsHash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private estimateDuration(text: string, speed: number): number {
    // Rough estimation: average speaking rate is 150-160 words per minute
    const wordsPerMinute = 150 * speed;
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / wordsPerMinute) * 60); // Duration in seconds
  }

  // Get available voice options
  getVoiceOptions() {
    return Object.entries(VOICE_OPTIONS).map(([key, config]) => ({
      key,
      ...config
    }));
  }

  // Get voice by key
  getVoiceConfig(voiceKey: string) {
    return VOICE_OPTIONS[voiceKey as keyof typeof VOICE_OPTIONS];
  }

  // Clear cache
  async clearCache() {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
      this.audioCache.clear();
      console.log('🗑️ Audio cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedItems: this.audioCache.size,
      cacheDir: this.cacheDir
    };
  }
}

export const openaiEnhancedTTS = new OpenAIEnhancedTTS();
