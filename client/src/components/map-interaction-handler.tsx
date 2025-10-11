import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapInteractionHandlerProps {
  selectedLocation: any;
  onLocationFocus: (location: any) => void;
}

export default function MapInteractionHandler({ selectedLocation, onLocationFocus }: MapInteractionHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      // Focus on the selected location
      map.setView([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng], 12);
      
      // Open popup for the selected location
      setTimeout(() => {
        const marker = document.querySelector(`[data-location-id="${selectedLocation.id}"]`);
        if (marker) {
          (marker as any)._popup?.openOn(map);
        }
      }, 100);
    }
  }, [map, selectedLocation]);

  return null;
}
