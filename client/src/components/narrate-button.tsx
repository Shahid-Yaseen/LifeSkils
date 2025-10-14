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
      className={`flex items-center gap-2 ${className}`}
      disabled={isCurrentEvent && isPlaying}
    >
      {isCurrentEvent && isPlaying ? (
        <Volume2 className="h-4 w-4 animate-pulse" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {addToQueue ? 'Add to Queue' : 'Narrate'}
    </Button>
  );
}
