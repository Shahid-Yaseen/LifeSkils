import confetti from 'canvas-confetti';

// Standard celebration confetti
export const celebrateCorrectMatch = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

// Game completion celebration with multiple bursts
export const celebrateGameComplete = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

// Themed confetti for different games
export const celebrateWithTheme = (theme: 'sports' | 'holidays' | 'art' | 'general' | 'ages' | 'royal' | 'justice' | 'religious' | 'international' | 'military' | 'legislative' | 'political') => {
  const configs = {
    sports: {
      colors: ['#FFD700', '#FFA500', '#FF4500', '#32CD32'],
      shapes: ['circle', 'square'],
      particleCount: 120
    },
    holidays: {
      colors: ['#FF0000', '#00FF00', '#FFD700', '#FFA500', '#8A2BE2'],
      shapes: ['circle', 'square'],
      particleCount: 100
    },
    art: {
      colors: ['#FF69B4', '#9370DB', '#4169E1', '#20B2AA', '#FFB6C1'],
      shapes: ['circle', 'square'],
      particleCount: 110
    },
    general: {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
      shapes: ['circle', 'square'],
      particleCount: 100
    },
    ages: {
      colors: ['#3B82F6', '#1D4ED8', '#60A5FA', '#93C5FD', '#DBEAFE'],
      shapes: ['circle', 'square'],
      particleCount: 105
    },
    royal: {
      colors: ['#7C3AED', '#A855F7', '#C084FC', '#FFD700', '#B91C1C'],
      shapes: ['circle', 'square'],
      particleCount: 130
    },
    justice: {
      colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#1F2937', '#6B7280'],
      shapes: ['circle', 'square'],
      particleCount: 125
    },
    religious: {
      colors: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
      shapes: ['circle', 'square'],
      particleCount: 120
    },
    international: {
      colors: ['#2563EB', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD'],
      shapes: ['circle', 'square'],
      particleCount: 115
    },
    military: {
      colors: ['#DC2626', '#B91C1C', '#EF4444', '#F87171', '#FCA5A5'],
      shapes: ['circle', 'square'],
      particleCount: 140
    },
    legislative: {
      colors: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
      shapes: ['circle', 'square'],
      particleCount: 125
    },
    political: {
      colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
      shapes: ['circle', 'square'],
      particleCount: 130
    }
  };

  const config = configs[theme];
  
  confetti({
    particleCount: config.particleCount,
    spread: 80,
    origin: { y: 0.6 },
    colors: config.colors
  });
};