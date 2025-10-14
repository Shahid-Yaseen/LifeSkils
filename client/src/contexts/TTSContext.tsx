import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface TTSContextType {
  // Current content
  currentEventId: string | null;
  currentTitle: string;
  currentDescription: string;
  currentDetails: string;
  
  // Playback state
  isPlaying: boolean;
  isGenerating: boolean;
  isTranslating: boolean;
  
  // Settings
  selectedLanguage: string;
  selectedVoice: string;
  speed: number;
  pitch: number;
  volume: number;
  useAITTS: boolean;
  isMuted: boolean;
  
  // Auto-play settings
  autoPlayNext: boolean;
  autoPlayTriggered: boolean;
  audioEndedNaturally: boolean;
  eventQueue: Array<{
    eventId: string;
    title: string;
    description: string;
    details?: string;
  }>;
  
  // Actions
  setCurrentContent: (eventId: string, title: string, description: string, details?: string) => void;
  setCurrentContentWithAutoQueue: (eventId: string, title: string, description: string, details?: string, allEvents?: any[]) => void;
  addToQueue: (eventId: string, title: string, description: string, details?: string) => void;
  refillQueueFromCurrentEvent: (allEvents: any[]) => void;
  playNarration: () => Promise<void>;
  pauseNarration: () => void;
  stopNarration: () => void;
  setAutoPlayNext: (enabled: boolean) => void;
  setAutoPlayTriggered: (triggered: boolean) => void;
  setAudioEndedNaturally: (ended: boolean) => void;
  navigateToNextEvent: (allEvents: any[]) => void;
  navigateToPreviousEvent: (allEvents: any[]) => void;
  scrollToEvent: (eventId: string) => void;
  updateSettings: (settings: Partial<{
    selectedLanguage: string;
    selectedVoice: string;
    speed: number;
    pitch: number;
    volume: number;
    isMuted: boolean;
  }>) => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};

interface TTSProviderProps {
  children: ReactNode;
}

export const TTSProvider: React.FC<TTSProviderProps> = ({ children }) => {
  // Current content state
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [currentDetails, setCurrentDetails] = useState<string>('');
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Settings - load from localStorage or use defaults
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => 
    localStorage.getItem('tts_language') || 'en'
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(() => 
    localStorage.getItem('tts_voice') || 'british_female'
  );
  const [speed, setSpeed] = useState<number>(() => 
    parseFloat(localStorage.getItem('tts_speed') || '1')
  );
  const [pitch, setPitch] = useState<number>(() => 
    parseFloat(localStorage.getItem('tts_pitch') || '1')
  );
  const [volume, setVolume] = useState<number>(() => 
    parseFloat(localStorage.getItem('tts_volume') || '1')
  );
  // Always use AI TTS
  const useAITTS = true;
  const [isMuted, setIsMuted] = useState(false);
  
  // Auto-play settings
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(() => 
    localStorage.getItem('tts_auto_play') === 'true'
  );
  const [autoPlayTriggered, setAutoPlayTriggered] = useState<boolean>(false);
  const [audioEndedNaturally, setAudioEndedNaturally] = useState<boolean>(false);
  const [eventQueue, setEventQueue] = useState<Array<{
    eventId: string;
    title: string;
    description: string;
    details?: string;
  }>>([]);
  
  // Refs for audio management
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tts_language', selectedLanguage);
  }, [selectedLanguage]);
  
  useEffect(() => {
    localStorage.setItem('tts_voice', selectedVoice);
  }, [selectedVoice]);
  
  useEffect(() => {
    localStorage.setItem('tts_speed', speed.toString());
  }, [speed]);
  
  useEffect(() => {
    localStorage.setItem('tts_pitch', pitch.toString());
  }, [pitch]);
  
  useEffect(() => {
    localStorage.setItem('tts_volume', volume.toString());
  }, [volume]);
  
  
  useEffect(() => {
    localStorage.setItem('tts_auto_play', autoPlayNext.toString());
  }, [autoPlayNext]);
  
  // Auto-play next event when current finishes naturally
  useEffect(() => {
    if (!isPlaying && autoPlayNext && eventQueue.length > 0 && currentEventId && audioEndedNaturally) {
      const nextEvent = eventQueue[0];
      console.log(`🎵 Auto-playing next event: ${nextEvent.title} (${eventQueue.length} remaining)`);
      setEventQueue(prev => prev.slice(1));
      setCurrentContent(nextEvent.eventId, nextEvent.title, nextEvent.description, nextEvent.details);
      setAudioEndedNaturally(false); // Reset the flag
      // Trigger auto-play by setting a flag that the GlobalTTSNarration component can detect
      setAutoPlayTriggered(true);
    } else if (!isPlaying && autoPlayNext && eventQueue.length === 0 && currentEventId && audioEndedNaturally) {
      console.log('🎵 Auto-play queue is empty, continuing with next chronological events...');
      setAudioEndedNaturally(false); // Reset the flag
      // If queue is empty but auto-play is still on, we need to refill the queue
      // This will be handled by the component that has access to all events
    }
  }, [isPlaying, autoPlayNext, eventQueue, currentEventId, audioEndedNaturally]);
  
  const setCurrentContent = (eventId: string, title: string, description: string, details?: string) => {
    setCurrentEventId(eventId);
    setCurrentTitle(title);
    setCurrentDescription(description);
    setCurrentDetails(details || '');
  };

  const setCurrentContentWithAutoQueue = (eventId: string, title: string, description: string, details?: string, allEvents?: any[]) => {
    // Stop any current playback first
    stopNarration();
    
    setCurrentEventId(eventId);
    setCurrentTitle(title);
    setCurrentDescription(description);
    setCurrentDetails(details || '');
    
    // If auto-play is enabled and we have all events, automatically queue the next chronological events
    if (autoPlayNext && allEvents && allEvents.length > 0) {
      // Sort events by year to get chronological order
      const sortedEvents = [...allEvents].sort((a, b) => a.year - b.year);
      const currentIndex = sortedEvents.findIndex(event => event.id === eventId);
      
      if (currentIndex !== -1) {
        // Queue the next 5 events (or remaining events if less than 5)
        const nextEvents = sortedEvents.slice(currentIndex + 1, currentIndex + 6);
        const queuedEvents = nextEvents.map(event => ({
          eventId: event.id,
          title: event.title,
          description: event.description,
          details: event.details
        }));
        
        setEventQueue(queuedEvents);
        console.log(`🎵 Auto-queued ${queuedEvents.length} next chronological events for auto-play`);
      }
    } else {
      // Clear queue if auto-play is disabled
      setEventQueue([]);
    }
  };
  
  const addToQueue = (eventId: string, title: string, description: string, details?: string) => {
    setEventQueue(prev => [...prev, { eventId, title, description, details }]);
  };

  const refillQueueFromCurrentEvent = (allEvents: any[]) => {
    if (!currentEventId || !autoPlayNext || !allEvents || allEvents.length === 0) return;
    
    // Sort events by year to get chronological order
    const sortedEvents = [...allEvents].sort((a, b) => a.year - b.year);
    const currentIndex = sortedEvents.findIndex(event => event.id === currentEventId);
    
    if (currentIndex !== -1) {
      // Queue the next 5 events (or remaining events if less than 5)
      const nextEvents = sortedEvents.slice(currentIndex + 1, currentIndex + 6);
      const queuedEvents = nextEvents.map(event => ({
        eventId: event.id,
        title: event.title,
        description: event.description,
        details: event.details
      }));
      
      setEventQueue(queuedEvents);
      console.log(`🎵 Refilled queue with ${queuedEvents.length} next chronological events`);
    }
  };
  
  const playNarration = async () => {
    if (!currentEventId) return;
    
    setIsGenerating(true);
    
    try {
      // This will be implemented in the GlobalTTSComponent
      // For now, just set the state
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing narration:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const pauseNarration = () => {
    setIsPlaying(false);
    
    // Stop AI TTS audio if it exists
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Stop browser TTS speech synthesis
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };
  
  const stopNarration = () => {
    setIsPlaying(false);
    setIsGenerating(false);
    
    // Stop AI TTS audio if it exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop browser TTS speech synthesis
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Clear queue if stopping
    setEventQueue([]);
  };
  
  const updateSettings = (settings: Partial<{
    selectedLanguage: string;
    selectedVoice: string;
    speed: number;
    pitch: number;
    volume: number;
    isMuted: boolean;
  }>) => {
    if (settings.selectedLanguage !== undefined) setSelectedLanguage(settings.selectedLanguage);
    if (settings.selectedVoice !== undefined) setSelectedVoice(settings.selectedVoice);
    if (settings.speed !== undefined) setSpeed(settings.speed);
    if (settings.pitch !== undefined) setPitch(settings.pitch);
    if (settings.volume !== undefined) setVolume(settings.volume);
    if (settings.isMuted !== undefined) setIsMuted(settings.isMuted);
  };

  const scrollToEvent = (eventId: string) => {
    // Find the event element by ID and scroll to it
    const element = document.querySelector(`[data-event-id="${eventId}"]`);
    if (element) {
      // Get the element's position relative to the document
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      
      // Calculate offset to position the event header at the top
      // Account for sticky header (approximately 80px) and some padding
      const offset = 100;
      const scrollToPosition = absoluteElementTop - offset;
      
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
      
      console.log(`🎵 Scrolled to event: ${eventId} at position ${scrollToPosition}`);
    } else {
      console.log(`🎵 Event element not found: ${eventId}`);
    }
  };

  const navigateToNextEvent = (allEvents: any[]) => {
    if (!currentEventId || !allEvents || allEvents.length === 0) return;
    
    const sortedEvents = [...allEvents].sort((a, b) => a.year - b.year);
    const currentIndex = sortedEvents.findIndex(event => event.id === currentEventId);
    
    if (currentIndex !== -1 && currentIndex < sortedEvents.length - 1) {
      const nextEvent = sortedEvents[currentIndex + 1];
      console.log(`🎵 Navigating to next event: ${nextEvent.title} (${nextEvent.year})`);
      setCurrentContentWithAutoQueue(nextEvent.id, nextEvent.title, nextEvent.description, nextEvent.details, allEvents);
      
      // Scroll to the next event after a short delay to allow state update
      setTimeout(() => {
        scrollToEvent(nextEvent.id);
      }, 100);
    } else {
      console.log('🎵 Already at the last event');
    }
  };

  const navigateToPreviousEvent = (allEvents: any[]) => {
    if (!currentEventId || !allEvents || allEvents.length === 0) return;
    
    const sortedEvents = [...allEvents].sort((a, b) => a.year - b.year);
    const currentIndex = sortedEvents.findIndex(event => event.id === currentEventId);
    
    if (currentIndex > 0) {
      const previousEvent = sortedEvents[currentIndex - 1];
      console.log(`🎵 Navigating to previous event: ${previousEvent.title} (${previousEvent.year})`);
      setCurrentContentWithAutoQueue(previousEvent.id, previousEvent.title, previousEvent.description, previousEvent.details, allEvents);
      
      // Scroll to the previous event after a short delay to allow state update
      setTimeout(() => {
        scrollToEvent(previousEvent.id);
      }, 100);
    } else {
      console.log('🎵 Already at the first event');
    }
  };

  const value: TTSContextType = {
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
    setCurrentContent,
    setCurrentContentWithAutoQueue,
    addToQueue,
    refillQueueFromCurrentEvent,
    playNarration,
    pauseNarration,
    stopNarration,
    setAutoPlayNext,
    setAutoPlayTriggered,
    setAudioEndedNaturally,
    navigateToNextEvent,
    navigateToPreviousEvent,
    scrollToEvent,
    updateSettings,
  };
  
  return (
    <TTSContext.Provider value={value}>
      {children}
    </TTSContext.Provider>
  );
};
