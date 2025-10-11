import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Search } from "lucide-react";

interface MapControlsProps {
  onLocationSelect?: (location: any) => void;
  selectedLocation?: any;
  filteredLocations?: any[];
}

export default function MapControls({ onLocationSelect, selectedLocation, filteredLocations }: MapControlsProps) {
  const map = useMap();

  // Fit bounds to show all filtered locations
  useEffect(() => {
    if (filteredLocations && filteredLocations.length > 0) {
      const bounds = filteredLocations.map(location => [
        location.coordinates.lat,
        location.coordinates.lng
      ] as [number, number]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, filteredLocations]);

  // Focus on selected location
  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng], 10);
    }
  }, [map, selectedLocation]);

  const resetView = () => {
    // Reset to UK bounds
    map.fitBounds([
      [49.5, -8.5], // Southwest corner
      [61.0, 2.0]   // Northeast corner
    ], { padding: [20, 20] });
  };

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        size="sm"
        variant="outline"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={zoomIn}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={zoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="bg-white shadow-md hover:bg-gray-50"
        onClick={resetView}
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
