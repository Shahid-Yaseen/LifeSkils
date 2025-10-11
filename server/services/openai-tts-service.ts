import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface NarrationOptions {
  text: string;
  language: string;
  voiceGender: 'male' | 'female';
  eventId: string;
}

class OpenAITTSService {
  private openai: OpenAI;
  private audioCacheDir: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key',
    });
    this.audioCacheDir = path.join(process.cwd(), 'uploads', 'audio_cache');
    this.ensureCacheDirExists();
  }

  private async ensureCacheDirExists() {
    try {
      await fs.mkdir(this.audioCacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  private getCacheFilePath(hash: string, language: string): string {
    return path.join(this.audioCacheDir, `${hash}-${language}.mp3`);
  }

  private generateHash(text: string, language: string, voiceGender: string): string {
    return crypto.createHash('md5').update(`${text}-${language}-${voiceGender}`).digest('hex');
  }

  async generateNarration({ text, language, voiceGender, eventId }: NarrationOptions): Promise<string> {
    const hash = this.generateHash(text, language, voiceGender);
    const cacheFilePath = this.getCacheFilePath(hash, language);
    const publicAudioUrl = `/uploads/audio_cache/${path.basename(cacheFilePath)}`;

    // Check cache first
    try {
      await fs.access(cacheFilePath);
      console.log(`Serving audio from cache: ${publicAudioUrl}`);
      return publicAudioUrl;
    } catch (error) {
      // Not in cache, generate new audio
    }

    // Map language codes to OpenAI voice names
    const voiceMap: { [key: string]: { male: string; female: string } } = {
      'en': { male: 'onyx', female: 'nova' },
      'es': { male: 'onyx', female: 'nova' }, // OpenAI doesn't have Spanish-specific voices yet
      'fr': { male: 'onyx', female: 'nova' },
      'de': { male: 'onyx', female: 'nova' },
      'it': { male: 'onyx', female: 'nova' },
      'pt': { male: 'onyx', female: 'nova' },
      'ar': { male: 'onyx', female: 'nova' },
      'hi': { male: 'onyx', female: 'nova' },
      'zh': { male: 'onyx', female: 'nova' },
    };

    const voiceName = voiceMap[language]?.[voiceGender] || voiceMap['en'][voiceGender];

    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voiceName as any,
        input: text,
        response_format: 'mp3',
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(cacheFilePath, buffer);
      console.log(`Audio content written to file: ${publicAudioUrl}`);
      return publicAudioUrl;
    } catch (error) {
      console.error('Error generating speech:', error);
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
}

export const openaiTtsService = new OpenAITTSService();
