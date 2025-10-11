import { useState, useEffect } from 'react';

interface MapLocation {
  id: string;
  name: string;
  region: string;
  type: 'capital' | 'attraction' | 'historical' | 'artistic' | 'literary';
  coordinates: { lat: number; lng: number };
  description: string;
  details: string;
  notablePeople?: string[];
  lifeInUKInfo?: {
    population?: string;
    government?: string;
    culture?: string;
    economy?: string;
    testRelevance?: string;
  };
}

export function useMapLocations() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/map-locations');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch locations: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLocations(data);
      } catch (err) {
        console.error('Error fetching map locations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading, error };
}
