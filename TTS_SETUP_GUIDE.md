# TTS (Text-to-Speech) Setup Guide

## Overview
This guide explains how to set up AI-powered text-to-speech narration for the LifeSkillsPrep application.

## What You Need for AI Narration

### 1. OpenAI API Key
- **Required**: Set up an OpenAI API key
- **Environment Variable**: `OPENAI_API_KEY=your_openai_api_key_here`
- **Cost**: OpenAI TTS charges per character (very affordable for educational content)

### 2. Server Configuration
The following TTS services are already implemented:

#### Available Services:
- **OpenAI Enhanced TTS** (`/server/services/openai-tts-enhanced.ts`)
  - High-quality AI voices with personality
  - Multiple voice options (British, American, Historian, Storyteller)
  - Text enhancement for historical content
  - Audio caching for performance

- **Basic OpenAI TTS** (`/server/services/openai-tts-service.ts`)
  - Simple TTS with language support
  - Multiple language options

#### API Endpoints:
- `GET /api/tts-enhanced/voices` - Get available voice options
- `POST /api/tts-enhanced/narrate` - Generate AI narration
- `POST /api/tts-enhanced/narrate-multiple` - Generate multiple voice options
- `GET /api/tts-enhanced/audio/:filename` - Serve audio files
- `GET /api/tts-enhanced/cache-stats` - Get cache statistics
- `DELETE /api/tts-enhanced/cache` - Clear audio cache

### 3. Frontend Integration
The enhanced TTS component (`browser-tts-narration.tsx`) now supports:

#### Features:
- **Dual Mode**: AI TTS (when online) + Browser TTS (fallback)
- **Network Detection**: Automatically switches to browser TTS when offline
- **Voice Selection**: Multiple AI voice personalities
- **Audio Caching**: Server-side caching for performance
- **Error Handling**: Graceful fallback to browser TTS
- **Real-time Controls**: Play, pause, stop, mute, volume control

#### Voice Options:
1. **James (British Male)** - Deep, authoritative, historical narrator
2. **Emma (British Female)** - Clear, articulate, professional
3. **Michael (American Male)** - Warm, conversational, modern
4. **Sarah (American Female)** - Bright, energetic, engaging
5. **Professor Williams (Historian)** - Scholarly, distinguished, academic
6. **Lady Catherine (Storyteller)** - Elegant, narrative, dramatic

## Setup Instructions

### 1. Environment Setup
```bash
# Add to your .env file
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Install Dependencies
All required dependencies are already in `package.json`:
- `openai` - OpenAI API client
- `express` - Server framework
- `fs/promises` - File system operations

### 3. Start the Server
```bash
npm run dev
```

### 4. Test the TTS System
```bash
# Test voice options
curl http://localhost:5000/api/tts-enhanced/voices

# Test narration generation
curl -X POST http://localhost:5000/api/tts-enhanced/narrate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the AI narration system.",
    "voiceKey": "british_female",
    "eventId": "test-123"
  }'
```

## How It Works

### 1. AI TTS Process:
1. User clicks "Listen" button
2. Component checks if online and AI TTS is enabled
3. Sends text to `/api/tts-enhanced/narrate` endpoint
4. Server enhances text for better speech (adds pauses, emphasis)
5. OpenAI generates high-quality audio using selected voice
6. Audio is cached on server for future use
7. Audio URL is returned to frontend
8. Frontend plays audio using HTML5 Audio API

### 2. Fallback Process:
1. If AI TTS fails or user is offline
2. Component automatically falls back to browser TTS
3. Uses browser's built-in `speechSynthesis` API
4. Matches voice selection to available browser voices

### 3. Caching System:
- Audio files are cached in `/uploads/audio_cache/`
- Cache key based on text content, voice, and options
- Prevents regenerating identical audio
- Improves performance and reduces API costs

## Troubleshooting

### Common Issues:

1. **"AI narration failed" error**
   - Check if `OPENAI_API_KEY` is set correctly
   - Verify OpenAI API key is valid and has credits
   - Check server logs for detailed error messages

2. **Audio not playing**
   - Check browser console for audio errors
   - Verify audio file URL is accessible
   - Try refreshing the page

3. **Fallback to browser TTS**
   - This is normal behavior when offline
   - AI TTS requires internet connection
   - Browser TTS works offline but with limited voice options

### Debug Steps:
1. Check server logs for TTS generation errors
2. Test API endpoints directly with curl
3. Verify audio files are being created in `/uploads/audio_cache/`
4. Check browser network tab for failed requests

## Performance Considerations

### Optimization:
- Audio files are cached to avoid regeneration
- Server-side text enhancement improves speech quality
- Fallback to browser TTS reduces server load
- Network detection prevents unnecessary API calls

### Cost Management:
- OpenAI TTS charges per character
- Caching reduces duplicate API calls
- Browser TTS fallback reduces API usage
- Consider implementing usage limits for production

## Future Enhancements

### Potential Improvements:
1. **Voice Cloning**: Custom voice training
2. **Emotion Detection**: Adjust voice based on content emotion
3. **Multi-language**: Automatic language detection
4. **SSML Support**: Advanced speech markup
5. **Real-time Streaming**: Stream audio as it's generated
6. **Voice Comparison**: Side-by-side voice testing

## API Reference

### Generate Narration
```typescript
POST /api/tts-enhanced/narrate
{
  "text": "Text to narrate",
  "voiceKey": "british_female",
  "eventId": "unique-event-id",
  "enhanceForHistory": true,
  "addEmphasis": true
}

Response:
{
  "success": true,
  "audioUrl": "/api/audio/filename.mp3",
  "voiceInfo": { ... },
  "duration": 30,
  "eventId": "unique-event-id",
  "textLength": 150
}
```

### Get Voice Options
```typescript
GET /api/tts-enhanced/voices

Response:
{
  "voices": [
    {
      "key": "british_female",
      "name": "Emma (British Female)",
      "description": "Clear, articulate British female voice",
      "characteristics": "Professional, engaging, educational",
      "accent": "British",
      "gender": "female",
      "speed": 0.95,
      "pitch": 1.1
    }
  ],
  "totalVoices": 6,
  "categories": { ... }
}
```

This setup provides a robust, high-quality TTS system with intelligent fallbacks and excellent user experience.
