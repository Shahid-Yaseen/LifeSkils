import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import path from 'path';

interface VoiceOptions {
  languageCode: string;
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

interface NarrationRequest {
  text: string;
  language: string;
  voiceGender: 'male' | 'female';
  eventId: string;
}

class TTSService {
  private client: TextToSpeechClient;
  private voices: { [key: string]: VoiceOptions[] } = {};

  constructor() {
    this.client = new TextToSpeechClient({
      // Use default credentials or set GOOGLE_APPLICATION_CREDENTIALS
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    this.initializeVoices();
  }

  private initializeVoices() {
    this.voices = {
      'en': [
        { languageCode: 'en-US', name: 'en-US-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'en-US', name: 'en-US-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'en-US', name: 'en-US-Wavenet-D', ssmlGender: 'MALE' },
        { languageCode: 'en-US', name: 'en-US-Wavenet-E', ssmlGender: 'FEMALE' },
        { languageCode: 'en-GB', name: 'en-GB-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'en-GB', name: 'en-GB-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'en-GB', name: 'en-GB-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'en-GB', name: 'en-GB-Wavenet-D', ssmlGender: 'MALE' },
      ],
      'es': [
        { languageCode: 'es-ES', name: 'es-ES-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'es-ES', name: 'es-ES-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'es-ES', name: 'es-ES-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'es-ES', name: 'es-ES-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
      'fr': [
        { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
      'de': [
        { languageCode: 'de-DE', name: 'de-DE-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'de-DE', name: 'de-DE-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'de-DE', name: 'de-DE-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'de-DE', name: 'de-DE-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
      'it': [
        { languageCode: 'it-IT', name: 'it-IT-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'it-IT', name: 'it-IT-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'it-IT', name: 'it-IT-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'it-IT', name: 'it-IT-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
      'pt': [
        { languageCode: 'pt-PT', name: 'pt-PT-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'pt-PT', name: 'pt-PT-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'pt-PT', name: 'pt-PT-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'pt-PT', name: 'pt-PT-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
      'ar': [
        { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
      'hi': [
        { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
      'zh': [
        { languageCode: 'zh-CN', name: 'zh-CN-Wavenet-A', ssmlGender: 'MALE' },
        { languageCode: 'zh-CN', name: 'zh-CN-Wavenet-B', ssmlGender: 'MALE' },
        { languageCode: 'zh-CN', name: 'zh-CN-Wavenet-C', ssmlGender: 'FEMALE' },
        { languageCode: 'zh-CN', name: 'zh-CN-Wavenet-D', ssmlGender: 'FEMALE' },
      ],
    };
  }

  async generateNarration(request: NarrationRequest): Promise<string> {
    try {
      const { text, language, voiceGender, eventId } = request;
      
      // Get available voices for the language
      const availableVoices = this.voices[language] || this.voices['en'];
      
      // Filter by gender preference
      const genderFilteredVoices = availableVoices.filter(voice => 
        voiceGender === 'male' ? voice.ssmlGender === 'MALE' : voice.ssmlGender === 'FEMALE'
      );
      
      // Select a voice (prefer Wavenet for better quality)
      const selectedVoice = genderFilteredVoices[0] || availableVoices[0];
      
      // Prepare the request
      const ttsRequest = {
        input: { text },
        voice: {
          languageCode: selectedVoice.languageCode,
          name: selectedVoice.name,
          ssmlGender: selectedVoice.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 0.9, // Slightly slower for better comprehension
          pitch: 0, // Neutral pitch
          volumeGainDb: 0,
        },
      };

      // Generate the audio
      const [response] = await this.client.synthesizeSpeech(ttsRequest);
      
      if (!response.audioContent) {
        throw new Error('No audio content generated');
      }

      // Save the audio file
      const audioDir = path.join(process.cwd(), 'uploads', 'audio');
      await fs.mkdir(audioDir, { recursive: true });
      
      const filename = `timeline_${eventId}_${language}_${voiceGender}_${Date.now()}.mp3`;
      const filepath = path.join(audioDir, filename);
      
      await fs.writeFile(filepath, response.audioContent, 'binary');
      
      return `/uploads/audio/${filename}`;
    } catch (error) {
      console.error('TTS generation error:', error);
      throw new Error('Failed to generate narration');
    }
  }

  async getAvailableLanguages(): Promise<{ code: string; name: string }[]> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Português' },
      { code: 'ar', name: 'العربية' },
      { code: 'hi', name: 'हिन्दी' },
      { code: 'zh', name: '中文' },
    ];
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      // For now, we'll use a simple approach
      // In production, you'd want to use Google Translate API or similar
      const translations: { [key: string]: string } = {
        'es': `[Translated to Spanish] ${text}`,
        'fr': `[Translated to French] ${text}`,
        'de': `[Translated to German] ${text}`,
        'it': `[Translated to Italian] ${text}`,
        'pt': `[Translated to Portuguese] ${text}`,
        'ar': `[Translated to Arabic] ${text}`,
        'hi': `[Translated to Hindi] ${text}`,
        'zh': `[Translated to Chinese] ${text}`,
      };
      
      return translations[targetLanguage] || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }
}

export const ttsService = new TTSService();
