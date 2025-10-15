import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';
import { useTTS } from '@/contexts/TTSContext';

interface NarrateButtonProps {
  eventId: string;
  title: string;
  description: string;
  details?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  addToQueue?: boolean;
  allEvents?: any[];
}

export default function NarrateButton({
  eventId,
  title,
  description,
  details,
  variant = 'outline',
  size = 'sm',
  className = '',
  addToQueue = false,
  allEvents
}: NarrateButtonProps) {
  const { 
    currentEventId, 
    isPlaying, 
    setCurrentContent, 
    setCurrentContentWithAutoQueue,
    addToQueue: addToQueueAction,
    playNarration 
  } = useTTS();

  const isCurrentEvent = currentEventId === eventId;

  const handleNarrate = async () => {
    // Prevent multiple clicks
    if (isPlaying && currentEventId === eventId) {
      console.log('🎵 Already playing this event, ignoring click');
      return;
    }

    if (addToQueue) {
      addToQueueAction(eventId, title, description, details);
    } else {
      console.log(`🎵 Starting narration for event: ${eventId} - ${title}`);
      
      // Use automatic queuing if allEvents are provided, otherwise use regular setCurrentContent
      if (allEvents && allEvents.length > 0) {
        setCurrentContentWithAutoQueue(eventId, title, description, details, allEvents);
      } else {
        setCurrentContent(eventId, title, description, details);
      }
      
      // Small delay to ensure state is updated before starting playback
      setTimeout(() => {
        playNarration();
      }, 200);
    }
  };

  return (
    <Button
      onClick={handleNarrate}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 transition-all duration-200 ${
        variant === 'outline' 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800 dark:from-blue-900/20 dark:to-purple-900/20 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 dark:border-blue-600 dark:hover:border-blue-500 dark:text-blue-300 dark:hover:text-blue-200' 
          : ''
      } ${className}`}
      disabled={isCurrentEvent && isPlaying}
    >
      {isCurrentEvent && isPlaying ? (
        <Volume2 className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" />
      ) : (
        <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      )}
      <span className="font-medium">{addToQueue ? 'Add to Queue' : 'Narrate'}</span>
    </Button>
  );
}
