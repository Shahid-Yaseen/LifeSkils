import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Plus, Edit, Trash2, Search, Eye, Save, X, RefreshCw } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapLocationForm from "@/components/admin/MapLocationForm";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/queryClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const locationTypes = [
  { value: 'capital', label: 'Capital', color: 'bg-red-500' },
  { value: 'attraction', label: 'Attraction', color: 'bg-green-500' },
  { value: 'historical', label: 'Historical', color: 'bg-blue-500' },
  { value: 'artistic', label: 'Artistic', color: 'bg-purple-500' },
  { value: 'literary', label: 'Literary', color: 'bg-orange-500' }
];

// Sample data - in real app this would come from API
const sampleLocations: MapLocation[] = [
  {
    id: "1",
    name: "London",
    region: "England",
    type: "capital",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    description: "Capital of England and the UK",
    details: "Seat of government, monarchy, and Parliament. Population over 9 million.",
    notablePeople: ["Charles Dickens", "William Shakespeare", "Virginia Woolf"],
    lifeInUKInfo: {
      population: "9.5 million (Greater London)",
      government: "Houses of Parliament, Prime Minister's residence at 10 Downing Street",
      culture: "Financial center, West End theatres, numerous museums",
      economy: "Major global financial center, contributes 22% of UK's GDP",
      testRelevance: "Essential for Life in UK test - seat of government, monarchy, Parliament"
    }
  }
];

export default function AdminMapManagement() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<MapLocation>>({
    name: "",
    region: "",
    type: "capital",
    coordinates: { lat: 0, lng: 0 },
    description: "",
    details: "",
    notablePeople: [],
    lifeInUKInfo: {}
  });

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/map-locations');
        const data = await response.json();
        setLocations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || location.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddLocation = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedLocation(null);
    setFormData({
      name: "",
      region: "",
      type: "capital",
      coordinates: { lat: 0, lng: 0 },
      description: "",
      details: "",
      notablePeople: [],
      lifeInUKInfo: {}
    });
  };

  const handleEditLocation = (location: MapLocation) => {
    setSelectedLocation(location);
    setIsEditing(true);
    setIsAdding(false);
    setFormData(location);
  };

  const handleSaveLocation = async () => {
    if (!formData.name || !formData.region || !formData.coordinates?.lat || !formData.coordinates?.lng) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const locationData = {
        ...formData,
        isActive: true,
        orderIndex: locations.length + 1
      };

      if (isAdding) {
        const response = await apiRequest('POST', '/api/map-locations', locationData);
        const newLocation = await response.json();
        setLocations([...locations, newLocation]);
      } else if (isEditing && selectedLocation) {
        const response = await apiRequest('PUT', `/api/map-locations/${selectedLocation.id}`, locationData);
        const updatedLocation = await response.json();
        setLocations(locations.map(loc => 
          loc.id === selectedLocation.id ? updatedLocation : loc
        ));
      }

      setIsAdding(false);
      setIsEditing(false);
      setSelectedLocation(null);
      setFormData({
        name: "",
        region: "",
        type: "capital",
        coordinates: { lat: 0, lng: 0 },
        description: "",
        details: "",
        notablePeople: [],
        lifeInUKInfo: {}
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save location');
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      try {
        await apiRequest('DELETE', `/api/map-locations/${locationId}`);
        
        setLocations(locations.filter(loc => loc.id !== locationId));
        if (selectedLocation?.id === locationId) {
          setSelectedLocation(null);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete location');
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setSelectedLocation(null);
    setFormData({
      name: "",
      region: "",
      type: "capital",
      coordinates: { lat: 0, lng: 0 },
      description: "",
      details: "",
      notablePeople: [],
      lifeInUKInfo: {}
    });
  };

  const getTypeColor = (type: string) => {
    const typeConfig = locationTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = locationTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading map locations...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-red-500 dark:text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 dark:text-red-400 mb-2">Failed to load map locations</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl  space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Map Location Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage interactive map locations for the UK & Northern Ireland</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="add">Add Location</TabsTrigger>
            <TabsTrigger value="preview">Map Preview</TabsTrigger>
          </TabsList>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Location List */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Map className="h-5 w-5" />
                    Locations ({filteredLocations.length})
                  </CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">Search Locations</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="search"
                      placeholder="Search by name or region..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filter" className="text-gray-700 dark:text-gray-300">Filter by Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="all">All Types</SelectItem>
                      {locationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedLocation?.id === location.id
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${getTypeColor(location.type)}`}></div>
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{location.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{location.region}</p>
                        <Badge className={`mt-1 text-xs ${getTypeColor(location.type)} text-white`}>
                          {getTypeLabel(location.type)}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                          {location.coordinates.lat.toFixed(3)}, {location.coordinates.lng.toFixed(3)}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLocation(location);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 dark:border-gray-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLocation(location.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form or Details */}
        <div className="lg:col-span-2">
          {(isAdding || isEditing) ? (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  {isAdding ? 'Add New Location' : 'Edit Location'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                            {type.label}
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

                <div>
                  <Label htmlFor="notablePeople" className="text-gray-700 dark:text-gray-300">Notable People (comma-separated)</Label>
                  <Input
                    id="notablePeople"
                    value={formData.notablePeople?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      notablePeople: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                    })}
                    placeholder="Charles Dickens, William Shakespeare"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleSaveLocation} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {isAdding ? 'Add Location' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedLocation ? (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className={`w-4 h-4 rounded-full ${getTypeColor(selectedLocation.type)}`}></div>
                  {selectedLocation.name}
                  <Badge className="ml-auto">{getTypeLabel(selectedLocation.type)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Region</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLocation.region}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Coordinates</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLocation.description}</p>
                </div>
                {selectedLocation.details && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Details</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedLocation.details}</p>
                  </div>
                )}
                {selectedLocation.notablePeople && selectedLocation.notablePeople.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Notable People</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocation.notablePeople.map((person, index) => (
                        <Badge key={index} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{person}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={() => handleEditLocation(selectedLocation)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Location
                  </Button>
                  <Button variant="outline" onClick={() => handleDeleteLocation(selectedLocation.id)} className="border-gray-300 dark:border-gray-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-12">
                <Map className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Location Selected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Select a location from the list to view details, or add a new location.</p>
                <Button onClick={handleAddLocation} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Location
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <MapLocationForm
            location={selectedLocation}
            onSave={handleSaveLocation}
            onCancel={handleCancel}
            isEditing={isEditing}
          />
        </TabsContent>


        <TabsContent value="preview" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Map Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={[54.5, -2.5]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((location) => (
                    <Marker
                      key={location.id}
                      position={[location.coordinates.lat, location.coordinates.lng]}
                      eventHandlers={{
                        click: () => setSelectedLocation(location),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{location.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{location.region}</p>
                          <Badge className={`mt-1 text-xs ${getTypeColor(location.type)} text-white`}>
                            {getTypeLabel(location.type)}
                          </Badge>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
