import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { useTTS } from '@/contexts/TTSContext';

interface EventNavigationProps {
  allEvents?: any[];
}

export default function EventNavigation({ allEvents: propEvents = [] }: EventNavigationProps) {
  const {
    currentEventId,
    currentTitle,
    navigateToNextEvent,
    navigateToPreviousEvent,
    scrollToEvent,
  } = useTTS();

  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [allEvents, setAllEvents] = useState<any[]>(propEvents);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);

  // Memoize the events to prevent unnecessary re-renders
  const memoizedEvents = useMemo(() => {
    return propEvents.length > 0 ? propEvents : allEvents;
  }, [propEvents, allEvents]);

  // Fetch events only once if not provided as props
  useEffect(() => {
    if (propEvents.length === 0 && !isLoadingEvents && allEvents.length === 0) {
      setIsLoadingEvents(true);
      const fetchEvents = async () => {
        try {
          const response = await fetch('/api/timeline');
          if (response.ok) {
            const events = await response.json();
            setAllEvents(events);
          }
        } catch (error) {
          console.error('Failed to fetch timeline events:', error);
        } finally {
          setIsLoadingEvents(false);
        }
      };
      fetchEvents();
    }
  }, []); // Empty dependency array to run only once

  // Update current event info when currentEventId or events change
  useEffect(() => {
    if (memoizedEvents && memoizedEvents.length > 0 && currentEventId) {
      const sortedEvents = [...memoizedEvents].sort((a, b) => a.year - b.year);
      const index = sortedEvents.findIndex(event => event.id === currentEventId);
      
      if (index !== -1) {
        setCurrentEvent(sortedEvents[index]);
        setCurrentIndex(index);
        setTotalEvents(sortedEvents.length);
      }
    }
  }, [currentEventId, memoizedEvents]);

  const handleNextEvent = useCallback(() => {
    if (memoizedEvents && memoizedEvents.length > 0) {
      navigateToNextEvent(memoizedEvents);
    }
  }, [memoizedEvents, navigateToNextEvent]);

  const handlePreviousEvent = useCallback(() => {
    if (memoizedEvents && memoizedEvents.length > 0) {
      navigateToPreviousEvent(memoizedEvents);
    }
  }, [memoizedEvents, navigateToPreviousEvent]);

  const handleScrollToCurrent = useCallback(() => {
    if (currentEventId) {
      scrollToEvent(currentEventId);
    }
  }, [currentEventId, scrollToEvent]);

  const isFirstEvent = currentIndex === 0;
  const isLastEvent = currentIndex === totalEvents - 1;

  if (!currentEventId || !currentEvent || isLoadingEvents) {
    return null;
  }

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
      
      <CardContent className="pt-0">
        {/* Current Event Info */}
        <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
            <Clock className="h-3 w-3 mr-1" />
            <span className="font-medium">{currentEvent.year}</span>
            <span className="mx-2">•</span>
            <span>Event {currentIndex + 1} of {totalEvents}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {currentTitle}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePreviousEvent}
            disabled={isFirstEvent}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button
            onClick={handleNextEvent}
            disabled={isLastEvent}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Go to Current Event Button */}
        <div className="mt-2">
          <Button
            onClick={handleScrollToCurrent}
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Go to Current Event
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(((currentIndex + 1) / totalEvents) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalEvents) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
