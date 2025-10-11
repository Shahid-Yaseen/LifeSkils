import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  context?: string;
  preserveFormatting?: boolean;
}

export interface TranslationResponse {
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

export class TranslationService {
  private static instance: TranslationService;
  
  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  // Language code mapping for better translation quality
  private readonly languageMap: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese (Simplified)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'tr': 'Turkish',
    'pl': 'Polish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'no': 'Norwegian',
    'da': 'Danish'
  };

  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const { text, targetLanguage, sourceLanguage = 'en', context = 'general', preserveFormatting = true } = request;
      
      if (!text || !targetLanguage) {
        throw new Error('Text and target language are required');
      }

      const sourceLangName = this.languageMap[sourceLanguage] || sourceLanguage;
      const targetLangName = this.languageMap[targetLanguage] || targetLanguage;

      // Create context-aware prompt for better translation quality
      const systemPrompt = this.createSystemPrompt(context, sourceLangName, targetLangName, preserveFormatting);
      
      console.log(`🌍 Translating from ${sourceLangName} to ${targetLangName}`);
      console.log(`📝 Text length: ${text.length} characters`);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: Math.min(4000, text.length * 3), // Estimate token usage
      });

      const translation = completion.choices[0]?.message?.content?.trim();
      
      if (!translation) {
        throw new Error('No translation received from OpenAI');
      }

      console.log(`✅ Translation completed: ${translation.length} characters`);

      return {
        translation,
        sourceLanguage,
        targetLanguage,
        confidence: 0.95 // High confidence for GPT-4 translations
      };

    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createSystemPrompt(context: string, sourceLang: string, targetLang: string, preserveFormatting: boolean): string {
    const basePrompt = `You are a professional translator specializing in ${context} content. 
Translate the following text from ${sourceLang} to ${targetLang}.`;

    const contextSpecificInstructions = this.getContextSpecificInstructions(context);
    const formattingInstructions = preserveFormatting 
      ? 'Preserve all formatting, punctuation, and structure of the original text.'
      : 'Focus on natural, fluent translation while maintaining the core meaning.';

    return `${basePrompt}

${contextSpecificInstructions}

${formattingInstructions}

Requirements:
- Provide accurate, natural-sounding translation
- Maintain the tone and style of the original
- Keep proper nouns and technical terms appropriate for the target language
- Ensure cultural appropriateness for ${targetLang} speakers
- Return only the translated text, no explanations or additional text

Translate the following:`;
  }

  private getContextSpecificInstructions(context: string): string {
    switch (context.toLowerCase()) {
      case 'historical_education':
        return `This is educational content about history and culture. 
- Use formal, educational language appropriate for learning
- Maintain historical accuracy in terminology
- Ensure names and dates are properly localized
- Use respectful, academic tone`;

      case 'general':
        return `This is general content. 
- Use natural, conversational language
- Maintain the original tone and style
- Ensure cultural appropriateness`;

      case 'technical':
        return `This is technical content. 
- Preserve technical terminology accurately
- Use precise, clear language
- Maintain technical accuracy`;

      case 'literary':
        return `This is literary content. 
- Preserve the artistic and emotional qualities
- Maintain literary devices and metaphors
- Use rich, expressive language`;

      default:
        return `This is ${context} content. 
- Use appropriate language for this context
- Maintain the original intent and meaning`;
    }
  }

  // Get available languages
  getAvailableLanguages(): { code: string; name: string; nativeName: string }[] {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'pl', name: 'Polish', nativeName: 'Polski' },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
      { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
      { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
      { code: 'da', name: 'Danish', nativeName: 'Dansk' }
    ];
  }

  // Detect language of text
  async detectLanguage(text: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a language detection expert. Identify the language of the given text and return only the ISO 639-1 language code (e.g., 'en', 'es', 'fr', etc.). Return only the two-letter code, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const detectedLang = completion.choices[0]?.message?.content?.trim().toLowerCase();
      return detectedLang || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }

  // Batch translation for multiple texts
  async translateBatch(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    const results: TranslationResponse[] = [];
    
    // Process in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => this.translateText(request));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < requests.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Batch translation error for batch ${i / batchSize + 1}:`, error);
        // Add error results for failed batch
        batch.forEach(() => {
          results.push({
            translation: '',
            sourceLanguage: 'en',
            targetLanguage: 'en',
            confidence: 0
          });
        });
      }
    }
    
    return results;
  }
}

export const translationService = TranslationService.getInstance();
