import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, AlertTriangle, CheckCircle } from "lucide-react";

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

interface MapBulkOperationsProps {
  locations: MapLocation[];
  onImport: (locations: MapLocation[]) => void;
  onExport: () => void;
}

export default function MapBulkOperations({ locations, onImport, onExport }: MapBulkOperationsProps) {
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const handleExport = () => {
    const dataStr = JSON.stringify(locations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `map-locations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      setImportError("");
      setImportSuccess("");
      
      const parsedData = JSON.parse(importData);
      
      if (!Array.isArray(parsedData)) {
        throw new Error("Data must be an array of locations");
      }

      // Validate each location
      const validatedLocations = parsedData.map((location, index) => {
        if (!location.name || !location.region || !location.coordinates) {
          throw new Error(`Location at index ${index} is missing required fields`);
        }
        
        if (!location.coordinates.lat || !location.coordinates.lng) {
          throw new Error(`Location at index ${index} is missing coordinates`);
        }

        return {
          id: location.id || Date.now().toString() + index,
          name: location.name,
          region: location.region,
          type: location.type || 'capital',
          coordinates: {
            lat: parseFloat(location.coordinates.lat),
            lng: parseFloat(location.coordinates.lng)
          },
          description: location.description || "",
          details: location.details || "",
          notablePeople: location.notablePeople || [],
          lifeInUKInfo: location.lifeInUKInfo || {}
        };
      });

      onImport(validatedLocations);
      setImportSuccess(`Successfully imported ${validatedLocations.length} locations`);
      setImportData("");
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Invalid JSON format");
    }
  };

  const generateSampleData = () => {
    const sampleData = [
      {
        id: "sample-1",
        name: "Sample Location 1",
        region: "Sample Region",
        type: "capital",
        coordinates: { lat: 51.5074, lng: -0.1278 },
        description: "Sample description",
        details: "Sample details",
        notablePeople: ["Person 1", "Person 2"],
        lifeInUKInfo: {
          population: "Sample population",
          government: "Sample government",
          culture: "Sample culture",
          economy: "Sample economy",
          testRelevance: "Sample test relevance"
        }
      }
    ];
    
    setImportData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Export all current locations to a JSON file for backup or sharing.
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{locations.length} locations</Badge>
            <Badge variant="outline">JSON format</Badge>
          </div>
          <Button onClick={handleExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export All Locations
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Import locations from a JSON file. This will replace all current locations.
          </p>
          
          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Import Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{importError}</p>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Import Successful</span>
              </div>
              <p className="text-sm text-green-700 mt-1">{importSuccess}</p>
            </div>
          )}

          <div>
            <Label htmlFor="importData">JSON Data</Label>
            <Textarea
              id="importData"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Import Locations
            </Button>
            <Button variant="outline" onClick={generateSampleData}>
              <FileText className="h-4 w-4 mr-2" />
              Sample
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p><strong>Required fields:</strong> name, region, coordinates.lat, coordinates.lng</p>
            <p><strong>Optional fields:</strong> type, description, details, notablePeople, lifeInUKInfo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
