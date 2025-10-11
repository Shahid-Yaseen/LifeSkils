import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Crown, 
  Scale, 
  Building, 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
  FileText,
  Video,
  Image,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Tag,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  Book,
  TestTube,
  Brain,
  Map,
  History,
  Sparkles,
  RotateCw,
  CheckSquare,
  Zap,
  Star,
  Trophy,
  Play,
  Pause,
  Square,
  Database,
  Layers,
  Palette,
  Gavel,
  MapPin,
  Shield,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Copy,
  Archive,
  Save,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";

const diagramSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(['government', 'justice', 'parliament']),
  section: z.string().min(1, "Section is required"),
  content: z.any().optional(),
  orderIndex: z.number().min(0),
  isActive: z.boolean(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keyPoints: z.array(z.string()).optional(),
  relatedTopics: z.array(z.string()).optional(),
});


type Diagram = {
  id: string;
  title: string;
  description: string;
  category: string;
  section: string;
  content: any;
  orderIndex: number;
  isActive: boolean;
  icon?: string;
  color?: string;
  tags?: string[];
  keyPoints?: string[];
  relatedTopics?: string[];
  createdAt: string;
  updatedAt: string;
};


export default function AdminDiagramsManagement() {
  const [selectedDiagram, setSelectedDiagram] = useState<Diagram | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("diagrams");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch diagrams
  const { data: diagrams = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-diagrams'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/diagrams');
      return await response.json();
    },
  });

  // Create diagram mutation
  const createDiagramMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/diagrams', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-diagrams'] });
      toast({
        title: "Success",
        description: "Diagram created successfully",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create diagram",
        variant: "destructive",
      });
    },
  });

  // Update diagram mutation
  const updateDiagramMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/diagrams/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-diagrams'] });
      toast({
        title: "Success",
        description: "Diagram updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedDiagram(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update diagram",
        variant: "destructive",
      });
    },
  });

  // Delete diagram mutation
  const deleteDiagramMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/diagrams/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-diagrams'] });
      toast({
        title: "Success",
        description: "Diagram deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete diagram",
        variant: "destructive",
      });
    },
  });


  // Filter diagrams
  const filteredDiagrams = diagrams.filter((diagram: Diagram) => {
    const matchesSearch = diagram.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diagram.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || diagram.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && diagram.isActive) ||
                         (filterStatus === "inactive" && !diagram.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'government': return <Crown className="h-4 w-4" />;
      case 'justice': return <Scale className="h-4 w-4" />;
      case 'parliament': return <Building className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'government': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'justice': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'parliament': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Diagrams Management</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage UK system diagrams and their components
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Diagram
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Diagrams</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{diagrams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {diagrams.filter((d: Diagram) => d.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Government</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {diagrams.filter((d: Diagram) => d.category === 'government').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Scale className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Justice</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {diagrams.filter((d: Diagram) => d.category === 'justice').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
          </TabsList>

          {/* Diagrams Tab */}
          <TabsContent value="diagrams" className="space-y-4">
            {/* Filters */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search diagrams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="justice">Justice</SelectItem>
                      <SelectItem value="parliament">Parliament</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Diagrams Table */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                      <TableHead className="text-gray-900 dark:text-white">Title</TableHead>
                      <TableHead className="text-gray-900 dark:text-white">Category</TableHead>
                      <TableHead className="text-gray-900 dark:text-white">Section</TableHead>
                      <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                      <TableHead className="text-gray-900 dark:text-white">Order</TableHead>
                      <TableHead className="text-gray-900 dark:text-white">Created</TableHead>
                      <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-600 dark:text-gray-400">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          Loading diagrams...
                        </TableCell>
                      </TableRow>
                    ) : filteredDiagrams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No diagrams found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDiagrams.map((diagram: Diagram) => (
                        <TableRow key={diagram.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <TableCell className="text-gray-900 dark:text-white">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(diagram.category)}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {diagram.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {diagram.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(diagram.category)}>
                              {diagram.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {diagram.section}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={diagram.isActive ? "default" : "secondary"}>
                              {diagram.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {diagram.orderIndex}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(diagram.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDiagram(diagram);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this diagram?")) {
                                    deleteDiagramMutation.mutate(diagram.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Create Diagram Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Create New Diagram</DialogTitle>
            </DialogHeader>
            <DiagramForm
              onSubmit={(data) => createDiagramMutation.mutate(data)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Diagram Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Edit Diagram</DialogTitle>
            </DialogHeader>
            <DiagramForm
              diagram={selectedDiagram}
              onSubmit={(data) => {
                if (selectedDiagram) {
                  updateDiagramMutation.mutate({ id: selectedDiagram.id, data });
                }
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedDiagram(null);
              }}
            />
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}

// Diagram Form Component
function DiagramForm({ 
  diagram, 
  onSubmit, 
  onCancel 
}: { 
  diagram?: Diagram | null; 
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(diagramSchema),
    defaultValues: {
      title: diagram?.title || '',
      description: diagram?.description || '',
      category: diagram?.category || 'government',
      section: diagram?.section || '',
      orderIndex: diagram?.orderIndex || 0,
      isActive: diagram?.isActive ?? true,
      icon: diagram?.icon || '',
      tags: diagram?.tags || [],
      keyPoints: diagram?.keyPoints || [],
      relatedTopics: diagram?.relatedTopics || [],
    }
  });

  const watchedTags = watch('tags') || [];
  const watchedKeyPoints = watch('keyPoints') || [];
  const watchedRelatedTopics = watch('relatedTopics') || [];

  const [newTag, setNewTag] = useState('');
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newRelatedTopic, setNewRelatedTopic] = useState('');

  const addTag = () => {
    if (newTag.trim()) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', watchedTags.filter((_: any, i: number) => i !== index));
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setValue('keyPoints', [...watchedKeyPoints, newKeyPoint.trim()]);
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setValue('keyPoints', watchedKeyPoints.filter((_: any, i: number) => i !== index));
  };

  const addRelatedTopic = () => {
    if (newRelatedTopic.trim()) {
      setValue('relatedTopics', [...watchedRelatedTopics, newRelatedTopic.trim()]);
      setNewRelatedTopic('');
    }
  };

  const removeRelatedTopic = (index: number) => {
    setValue('relatedTopics', watchedRelatedTopics.filter((_: any, i: number) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <Input
            {...register('title')}
            placeholder="Enter diagram title"
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <Select onValueChange={(value) => setValue('category', value)} defaultValue={diagram?.category}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="justice">Justice</SelectItem>
              <SelectItem value="parliament">Parliament</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <Textarea
          {...register('description')}
          placeholder="Enter diagram description"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Section *
          </label>
          <Input
            {...register('section')}
            placeholder="e.g., executive, legislative, criminal"
          />
          {errors.section && (
            <p className="text-sm text-red-600 mt-1">{errors.section.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order Index
          </label>
          <Input
            type="number"
            {...register('orderIndex', { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.orderIndex && (
            <p className="text-sm text-red-600 mt-1">{errors.orderIndex.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Icon (Lucide name)
          </label>
          <Input
            {...register('icon')}
            placeholder="e.g., Crown, Scale, Building"
          />
        </div>

      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {watchedTags.map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter a tag"
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Points */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Key Points
        </label>
        <div className="space-y-2 mb-2">
          {watchedKeyPoints.map((point: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{point}</span>
              <button
                type="button"
                onClick={() => removeKeyPoint(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newKeyPoint}
            onChange={(e) => setNewKeyPoint(e.target.value)}
            placeholder="Enter a key point"
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyPoint();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addKeyPoint}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Related Topics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Related Topics
        </label>
        <div className="space-y-2 mb-2">
          {watchedRelatedTopics.map((topic: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{topic}</span>
              <button
                type="button"
                onClick={() => removeRelatedTopic(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newRelatedTopic}
            onChange={(e) => setNewRelatedTopic(e.target.value)}
            placeholder="Enter a related topic"
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRelatedTopic();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addRelatedTopic}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="rounded border-gray-300"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Active
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {diagram ? 'Update' : 'Create'} Diagram
        </Button>
      </DialogFooter>
    </form>
  );
}

