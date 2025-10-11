import { Router } from 'express';
import { translationService } from '../services/translation-service';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for translation endpoints
const translationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 translation requests per windowMs
  message: {
    error: 'Too many translation requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all translation routes
router.use(translationLimiter);

// Get available languages
router.get('/languages', async (req, res) => {
  try {
    const languages = translationService.getAvailableLanguages();
    res.json({
      success: true,
      languages,
      totalLanguages: languages.length
    });
  } catch (error) {
    console.error('Error fetching available languages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available languages',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Translate text
router.post('/', async (req, res) => {
  try {
    const { 
      text, 
      targetLanguage, 
      sourceLanguage = 'en',
      context = 'historical_education',
      preserveFormatting = true
    } = req.body;

    // Validation
    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Text and targetLanguage are required' 
      });
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text must be a non-empty string' 
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({ 
        error: 'Text is too long. Maximum 10,000 characters allowed.' 
      });
    }

    console.log(`🌍 Translation request: ${sourceLanguage} → ${targetLanguage}`);
    console.log(`📝 Text length: ${text.length} characters`);

    const result = await translationService.translateText({
      text: text.trim(),
      targetLanguage,
      sourceLanguage,
      context,
      preserveFormatting
    });

    res.json({
      success: true,
      ...result,
      textLength: text.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Detect language
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text is required for language detection' 
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({ 
        error: 'Text is too long for language detection. Maximum 5,000 characters allowed.' 
      });
    }

    console.log(`🔍 Language detection request for ${text.length} characters`);

    const detectedLanguage = await translationService.detectLanguage(text.trim());
    const languages = translationService.getAvailableLanguages();
    const languageInfo = languages.find(lang => lang.code === detectedLanguage);

    res.json({
      success: true,
      detectedLanguage,
      languageInfo: languageInfo || { code: detectedLanguage, name: detectedLanguage, nativeName: detectedLanguage },
      confidence: 0.9, // High confidence for GPT-4 detection
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ 
      error: 'Language detection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Batch translation
router.post('/batch', async (req, res) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ 
        error: 'Requests array is required and must not be empty' 
      });
    }

    if (requests.length > 20) {
      return res.status(400).json({ 
        error: 'Maximum 20 translation requests allowed per batch' 
      });
    }

    // Validate each request
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if (!request.text || !request.targetLanguage) {
        return res.status(400).json({ 
          error: `Request ${i + 1}: Text and targetLanguage are required` 
        });
      }
      if (typeof request.text !== 'string' || request.text.trim().length === 0) {
        return res.status(400).json({ 
          error: `Request ${i + 1}: Text must be a non-empty string` 
        });
      }
      if (request.text.length > 5000) {
        return res.status(400).json({ 
          error: `Request ${i + 1}: Text is too long. Maximum 5,000 characters allowed.` 
        });
      }
    }

    console.log(`🌍 Batch translation request: ${requests.length} texts`);

    const results = await translationService.translateBatch(requests);

    res.json({
      success: true,
      results,
      totalRequests: requests.length,
      successfulTranslations: results.filter(r => r.translation.length > 0).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ 
      error: 'Batch translation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    // Simple health check - try to get available languages
    const languages = translationService.getAvailableLanguages();
    
    res.json({
      success: true,
      status: 'healthy',
      availableLanguages: languages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Translation service health check failed:', error);
    res.status(500).json({ 
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
