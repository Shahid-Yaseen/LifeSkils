import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function TimelineScrollNavigation() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showArrows, setShowArrows] = useState(false);

  // Check scroll position within timeline section
  const checkScrollPosition = () => {
    const timelineSection = document.getElementById('timeline');
    if (!timelineSection) return;

    const timelineRect = timelineSection.getBoundingClientRect();
    const timelineTop = timelineRect.top + window.pageYOffset;
    const timelineBottom = timelineTop + timelineSection.offsetHeight;
    const currentScroll = window.pageYOffset;
    const windowHeight = window.innerHeight;

    // Check if timeline is visible in viewport
    const isTimelineVisible = timelineRect.top < windowHeight && timelineRect.bottom > 0;
    
    if (!isTimelineVisible) {
      setShowArrows(false);
      return;
    }

    // Check if we're at the top or bottom of the timeline section
    const atTop = currentScroll <= timelineTop + 100;
    const atBottom = currentScroll + windowHeight >= timelineBottom - 100;
    
    setIsAtTop(atTop);
    setIsAtBottom(atBottom);
    setShowArrows(isTimelineVisible && currentScroll > timelineTop - 200);
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      checkScrollPosition();
    };

    // Initial check
    checkScrollPosition();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to top of timeline section
  const scrollToTop = () => {
    const timelineSection = document.getElementById('timeline');
    if (timelineSection) {
      const timelineRect = timelineSection.getBoundingClientRect();
      const timelineTop = timelineRect.top + window.pageYOffset;
      window.scrollTo({
        top: timelineTop - 100, // Offset for header
        behavior: 'smooth'
      });
    }
  };

  // Scroll to bottom of timeline section
  const scrollToBottom = () => {
    const timelineSection = document.getElementById('timeline');
    if (timelineSection) {
      const timelineRect = timelineSection.getBoundingClientRect();
      const timelineBottom = timelineRect.top + window.pageYOffset + timelineSection.offsetHeight;
      window.scrollTo({
        top: timelineBottom - window.innerHeight + 100, // Show bottom with some padding
        behavior: 'smooth'
      });
    }
  };

  if (!showArrows) {
    return null;
  }

  return (
    <div className="fixed left-4 bottom-20 z-50 flex flex-col gap-2">
      {/* Scroll to Top Arrow */}
      {!isAtTop && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Scroll to top of timeline"
        >
          <ArrowUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Scroll to Bottom Arrow */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Scroll to bottom of timeline"
        >
          <ArrowDown className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
