import { Router } from 'express';
import { openaiEnhancedTTS } from '../services/openai-tts-enhanced';
import * as path from 'path';
import * as fs from 'fs/promises';

const router = Router();

// Get available voice options
router.get('/voices', async (req, res) => {
  try {
    const voices = openaiEnhancedTTS.getVoiceOptions();
    res.json({
      voices,
      totalVoices: voices.length,
      categories: {
        british: voices.filter(v => v.accent === 'British').length,
        american: voices.filter(v => v.accent === 'American').length,
        male: voices.filter(v => v.gender === 'male').length,
        female: voices.filter(v => v.gender === 'female').length
      }
    });
  } catch (error) {
    console.error('Error fetching voice options:', error);
    res.status(500).json({ error: 'Failed to fetch voice options' });
  }
});

// Generate humanized speech for timeline events
router.post('/narrate', async (req, res) => {
  try {
    const { 
      text, 
      voiceKey = 'british_female',
      eventId,
      enhanceForHistory = true,
      addEmphasis = true
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Validate voice key
    const voiceConfig = openaiEnhancedTTS.getVoiceConfig(voiceKey as any);
    
    if (!voiceConfig) {
      // Get available voice keys for debugging
      const availableVoices = openaiEnhancedTTS.getVoiceOptions();
      const availableKeys = availableVoices.map(v => v.key);
      console.log(`❌ Invalid voice key: "${voiceKey}". Available keys:`, availableKeys.slice(0, 10), '...');
      return res.status(400).json({ 
        error: 'Invalid voice selection',
        providedVoiceKey: voiceKey,
        availableVoiceKeys: availableKeys
      });
    }

    console.log(`🎤 Generating narration for event ${eventId} with ${voiceConfig.name}`);

    const result = await openaiEnhancedTTS.generateHumanizedSpeech(
      text,
      voiceKey as any,
      {
        eventId,
        enhanceForHistory,
        addEmphasis
      }
    );

    res.json({
      success: true,
      audioUrl: result.audioUrl,
      voiceInfo: result.voiceInfo,
      duration: result.duration,
      eventId,
      textLength: text.length
    });

  } catch (error) {
    console.error('Error generating narration:', error);
    res.status(500).json({ 
      error: 'Failed to generate narration',
      details: error.message 
    });
  }
});

// Generate multiple voice narrations for comparison
router.post('/narrate-multiple', async (req, res) => {
  try {
    const { 
      text, 
      eventId,
      voiceKeys = ['british_female', 'british_male', 'historian_male']
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`🎤 Generating multiple narrations for event ${eventId}`);

    const narrations = await Promise.all(
      voiceKeys.map(async (voiceKey: string) => {
        try {
          const result = await openaiEnhancedTTS.generateHumanizedSpeech(
            text,
            voiceKey as any,
            {
              eventId: `${eventId}_${voiceKey}`,
              enhanceForHistory: true,
              addEmphasis: true
            }
          );
          return {
            voiceKey,
            ...result
          };
        } catch (error) {
          console.error(`Error generating narration for ${voiceKey}:`, error);
          return {
            voiceKey,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      narrations,
      eventId,
      textLength: text.length
    });

  } catch (error) {
    console.error('Error generating multiple narrations:', error);
    res.status(500).json({ 
      error: 'Failed to generate multiple narrations',
      details: error.message 
    });
  }
});

// Serve audio files
router.get('/audio/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'audio_cache', filename);
    
    console.log(`🎵 Serving audio file: ${filename}`);
    console.log(`📁 File path: ${filePath}`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
      console.log(`✅ Audio file exists: ${filename}`);
    } catch (error) {
      console.error(`❌ Audio file not found: ${filename}`, error);
      return res.status(404).json({ error: 'Audio file not found' });
    }

    // Set appropriate headers for MP3 files
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming audio file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream audio file' });
      }
    });
    
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({ error: 'Failed to serve audio file' });
  }
});

// Get cache statistics
router.get('/cache-stats', async (req, res) => {
  try {
    const stats = openaiEnhancedTTS.getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

// Clear cache
router.delete('/cache', async (req, res) => {
  try {
    await openaiEnhancedTTS.clearCache();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Preview voice characteristics
router.post('/preview-voice', async (req, res) => {
  try {
    const { voiceKey, sampleText } = req.body;

    if (!voiceKey) {
      return res.status(400).json({ error: 'Voice key is required' });
    }

    const voiceConfig = openaiEnhancedTTS.getVoiceConfig(voiceKey as any);
    if (!voiceConfig) {
      return res.status(400).json({ error: 'Invalid voice selection' });
    }

    const previewText = sampleText || 
      `Hello! I'm ${voiceConfig.name}, your ${voiceConfig.characteristics} narrator. 
       I'll be guiding you through this historical timeline with my ${voiceConfig.accent} accent. 
       Let's explore the fascinating history of the United Kingdom together!`;

    const result = await openaiEnhancedTTS.generateHumanizedSpeech(
      previewText,
      voiceKey as any,
      {
        eventId: 'preview',
        enhanceForHistory: false,
        addEmphasis: false
      }
    );

    res.json({
      success: true,
      audioUrl: result.audioUrl,
      voiceInfo: result.voiceInfo,
      previewText
    });

  } catch (error) {
    console.error('Error generating voice preview:', error);
    res.status(500).json({ 
      error: 'Failed to generate voice preview',
      details: error.message 
    });
  }
});

export default router;
