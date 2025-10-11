import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Save, X, Plus, Trash2 } from "lucide-react";

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

interface MapLocationFormProps {
  location?: MapLocation | null;
  onSave: (location: MapLocation) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const locationTypes = [
  { value: 'capital', label: 'Capital', color: 'bg-red-500' },
  { value: 'attraction', label: 'Attraction', color: 'bg-green-500' },
  { value: 'historical', label: 'Historical', color: 'bg-blue-500' },
  { value: 'artistic', label: 'Artistic', color: 'bg-purple-500' },
  { value: 'literary', label: 'Literary', color: 'bg-orange-500' }
];

export default function MapLocationForm({ location, onSave, onCancel, isEditing = false }: MapLocationFormProps) {
  const [formData, setFormData] = useState<Partial<MapLocation>>({
    name: location?.name || "",
    region: location?.region || "",
    type: location?.type || "capital",
    coordinates: location?.coordinates || { lat: 0, lng: 0 },
    description: location?.description || "",
    details: location?.details || "",
    notablePeople: location?.notablePeople || [],
    lifeInUKInfo: location?.lifeInUKInfo || {}
  });

  const [notablePeopleInput, setNotablePeopleInput] = useState(
    location?.notablePeople?.join(', ') || ""
  );

  const [lifeInUKFields, setLifeInUKFields] = useState({
    population: location?.lifeInUKInfo?.population || "",
    government: location?.lifeInUKInfo?.government || "",
    culture: location?.lifeInUKInfo?.culture || "",
    economy: location?.lifeInUKInfo?.economy || "",
    testRelevance: location?.lifeInUKInfo?.testRelevance || ""
  });

  const handleSave = () => {
    if (!formData.name || !formData.region || !formData.coordinates.lat || !formData.coordinates.lng) {
      alert("Please fill in all required fields");
      return;
    }

    const locationData: MapLocation = {
      id: location?.id || Date.now().toString(),
      name: formData.name!,
      region: formData.region!,
      type: formData.type as any,
      coordinates: formData.coordinates!,
      description: formData.description!,
      details: formData.details || "",
      notablePeople: notablePeopleInput.split(',').map(p => p.trim()).filter(p => p),
      lifeInUKInfo: {
        population: lifeInUKFields.population || undefined,
        government: lifeInUKFields.government || undefined,
        culture: lifeInUKFields.culture || undefined,
        economy: lifeInUKFields.economy || undefined,
        testRelevance: lifeInUKFields.testRelevance || undefined
      }
    };

    onSave(locationData);
  };

  const getTypeColor = (type: string) => {
    const typeConfig = locationTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-500';
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <MapPin className="h-5 w-5" />
          {isEditing ? 'Edit Location' : 'Add New Location'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Location name"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="region" className="text-gray-700 dark:text-gray-300">Region *</Label>
              <Input
                id="region"
                value={formData.region || ''}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                placeholder="Region/County"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Type *</Label>
              <Select value={formData.type || 'capital'} onValueChange={(value) => setFormData({...formData, type: value as any})}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {locationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lat" className="text-gray-700 dark:text-gray-300">Latitude *</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                value={formData.coordinates?.lat || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  coordinates: {...formData.coordinates!, lat: parseFloat(e.target.value) || 0}
                })}
                placeholder="51.5074"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="lng" className="text-gray-700 dark:text-gray-300">Longitude *</Label>
              <Input
                id="lng"
                type="number"
                step="0.000001"
                value={formData.coordinates?.lng || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  coordinates: {...formData.coordinates!, lng: parseFloat(e.target.value) || 0}
                })}
                placeholder="-0.1278"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description *</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="details" className="text-gray-700 dark:text-gray-300">Details</Label>
            <Textarea
              id="details"
              value={formData.details || ''}
              onChange={(e) => setFormData({...formData, details: e.target.value})}
              placeholder="Detailed information about the location"
              rows={3}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Notable People */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notable People</h3>
          <div>
            <Label htmlFor="notablePeople" className="text-gray-700 dark:text-gray-300">Notable People (comma-separated)</Label>
            <Input
              id="notablePeople"
              value={notablePeopleInput}
              onChange={(e) => setNotablePeopleInput(e.target.value)}
              placeholder="Charles Dickens, William Shakespeare, Virginia Woolf"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Separate multiple people with commas
            </p>
          </div>
        </div>

        {/* Life in UK Test Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Life in UK Test Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="population" className="text-gray-700 dark:text-gray-300">Population</Label>
              <Input
                id="population"
                value={lifeInUKFields.population}
                onChange={(e) => setLifeInUKFields({...lifeInUKFields, population: e.target.value})}
                placeholder="Population information"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="government" className="text-gray-700 dark:text-gray-300">Government</Label>
              <Input
                id="government"
                value={lifeInUKFields.government}
                onChange={(e) => setLifeInUKFields({...lifeInUKFields, government: e.target.value})}
                placeholder="Government information"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="culture" className="text-gray-700 dark:text-gray-300">Culture</Label>
            <Textarea
              id="culture"
              value={lifeInUKFields.culture}
              onChange={(e) => setLifeInUKFields({...lifeInUKFields, culture: e.target.value})}
              placeholder="Cultural information"
              rows={2}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="economy" className="text-gray-700 dark:text-gray-300">Economy</Label>
            <Textarea
              id="economy"
              value={lifeInUKFields.economy}
              onChange={(e) => setLifeInUKFields({...lifeInUKFields, economy: e.target.value})}
              placeholder="Economic information"
              rows={2}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="testRelevance" className="text-gray-700 dark:text-gray-300">Test Relevance</Label>
            <Textarea
              id="testRelevance"
              value={lifeInUKFields.testRelevance}
              onChange={(e) => setLifeInUKFields({...lifeInUKFields, testRelevance: e.target.value})}
              placeholder="Why this location is important for the Life in UK test"
              rows={2}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Preview */}
        {formData.name && formData.region && formData.coordinates.lat && formData.coordinates.lng && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preview</h3>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${getTypeColor(formData.type || 'capital')}`}></div>
                <h4 className="font-medium text-gray-900 dark:text-white">{formData.name}</h4>
                <Badge className={`text-xs ${getTypeColor(formData.type || 'capital')} text-white`}>
                  {locationTypes.find(t => t.value === formData.type)?.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formData.region}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{formData.description}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Add Location'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
