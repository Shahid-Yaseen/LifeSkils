import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Upload,
  Youtube,
  Play,
  Clock,
  Tag,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Mic,
  Download,
  Link,
  Image,
  File,
  Volume2,
  Headphones
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import EnhancedVideoUpload from "@/components/enhanced-video-upload";
import AdminLayout from "@/components/AdminLayout";
import type { VideoModule } from "@shared/schema";

export default function AdminVideoManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoModule | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoModule | null>(null);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [selectedVideoForContent, setSelectedVideoForContent] = useState<VideoModule | null>(null);
  const [activeContentTab, setActiveContentTab] = useState("content");
  const [showAddResourceDialog, setShowAddResourceDialog] = useState(false);
  const [showAddAudioDialog, setShowAddAudioDialog] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState("link");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAudioType, setSelectedAudioType] = useState("narration");
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle audio source radio button switching
  useEffect(() => {
    const handleAudioSourceChange = () => {
      const urlRadio = document.querySelector('input[name="audio-source"][value="url"]') as HTMLInputElement;
      const fileRadio = document.querySelector('input[name="audio-source"][value="file"]') as HTMLInputElement;
      const urlSection = document.getElementById('audio-url-section');
      const fileSection = document.getElementById('audio-file-section');
      
      if (urlRadio?.checked) {
        urlSection?.classList.remove('hidden');
        fileSection?.classList.add('hidden');
      } else if (fileRadio?.checked) {
        urlSection?.classList.add('hidden');
        fileSection?.classList.remove('hidden');
      }
    };

    // Add event listeners when dialog opens
    if (showAddAudioDialog) {
      const urlRadio = document.querySelector('input[name="audio-source"][value="url"]') as HTMLInputElement;
      const fileRadio = document.querySelector('input[name="audio-source"][value="file"]') as HTMLInputElement;
      
      urlRadio?.addEventListener('change', handleAudioSourceChange);
      fileRadio?.addEventListener('change', handleAudioSourceChange);
      
      // Initial setup
      handleAudioSourceChange();
      
      return () => {
        urlRadio?.removeEventListener('change', handleAudioSourceChange);
        fileRadio?.removeEventListener('change', handleAudioSourceChange);
      };
    }
  }, [showAddAudioDialog]);

  const { data: videos = [], isLoading } = useQuery<VideoModule[]>({
    queryKey: ["/api/videos"],
  });

  // Video Resources and Audio queries
  const { data: videoResources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: [`/api/admin/videos/${selectedVideoForContent?.id}/resources`],
    enabled: !!selectedVideoForContent,
  });

  const { data: videoAudio = [], isLoading: audioLoading } = useQuery({
    queryKey: [`/api/admin/videos/${selectedVideoForContent?.id}/audio`],
    enabled: !!selectedVideoForContent,
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      return apiRequest("DELETE", `/api/videos/${videoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Video deleted",
        description: "The video has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setShowDeleteDialog(false);
      setVideoToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete video.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteVideo = (video: VideoModule) => {
    setVideoToDelete(video);
    setShowDeleteDialog(true);
  };

  const handleManageContent = (video: VideoModule) => {
    setSelectedVideoForContent(video);
    setShowContentDialog(true);
  };

  // Content management mutations
  const updateContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      console.log('Updating content:', { videoId: selectedVideoForContent?.id, contentData });
      return apiRequest("PUT", `/api/admin/videos/${selectedVideoForContent?.id}/content`, contentData);
    },
    onSuccess: () => {
      console.log('Content updated successfully');
      toast({ title: "Content updated", description: "Video content has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error: any) => {
      console.error('Content update error:', error);
      toast({ title: "Update failed", description: error.message || "Failed to update content.", variant: "destructive" });
    },
  });


  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/videos/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Video updated", description: "Video has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message || "Failed to update video.", variant: "destructive" });
    },
  });

  // Video Resources mutations
  const addResourceMutation = useMutation({
    mutationFn: async ({ videoId, data }: { videoId: string; data: any }) => {
      console.log('Adding resource:', { videoId, data });
      return apiRequest("POST", `/api/admin/videos/${videoId}/resources`, data);
    },
    onSuccess: () => {
      console.log('Resource added successfully');
      toast({ title: "Resource added", description: "Resource has been added successfully." });
      if (selectedVideoForContent) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/videos/${selectedVideoForContent.id}/resources`] });
      }
    },
    onError: (error: any) => {
      console.error('Resource add error:', error);
      toast({ title: "Add failed", description: error.message || "Failed to add resource.", variant: "destructive" });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async ({ videoId, resourceId }: { videoId: string; resourceId: string }) => {
      return apiRequest("DELETE", `/api/admin/videos/${videoId}/resources/${resourceId}`);
    },
    onSuccess: () => {
      toast({ title: "Resource deleted", description: "Resource has been deleted successfully." });
      if (selectedVideoForContent) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/videos/${selectedVideoForContent.id}/resources`] });
      }
    },
    onError: (error: any) => {
      toast({ title: "Delete failed", description: error.message || "Failed to delete resource.", variant: "destructive" });
    },
  });

  // Video Audio mutations
  const addAudioMutation = useMutation({
    mutationFn: async ({ videoId, data }: { videoId: string; data: any }) => {
      console.log('Adding audio:', { videoId, data });
      return apiRequest("POST", `/api/admin/videos/${videoId}/audio`, data);
    },
    onSuccess: () => {
      console.log('Audio added successfully');
      toast({ title: "Audio added", description: "Audio has been added successfully." });
      if (selectedVideoForContent) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/videos/${selectedVideoForContent.id}/audio`] });
      }
    },
    onError: (error: any) => {
      console.error('Audio add error:', error);
      toast({ title: "Add failed", description: error.message || "Failed to add audio.", variant: "destructive" });
    },
  });

  const deleteAudioMutation = useMutation({
    mutationFn: async ({ videoId, audioId }: { videoId: string; audioId: string }) => {
      return apiRequest("DELETE", `/api/admin/videos/${videoId}/audio/${audioId}`);
    },
    onSuccess: () => {
      toast({ title: "Audio deleted", description: "Audio has been deleted successfully." });
      if (selectedVideoForContent) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/videos/${selectedVideoForContent.id}/audio`] });
      }
    },
    onError: (error: any) => {
      toast({ title: "Delete failed", description: error.message || "Failed to delete audio.", variant: "destructive" });
    },
  });

  const confirmDelete = () => {
    if (videoToDelete) {
      deleteVideoMutation.mutate(videoToDelete.id);
    }
  };

  const handleEditVideo = (video: VideoModule) => {
    setSelectedVideo(video);
    setShowEditDialog(true);
  };

  const filteredVideos = videos.filter(video => {
    const tagsString = Array.isArray(video.tags) ? video.tags.join(' ') : String(video.tags || '');
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tagsString.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Government": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "History": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      "Culture": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Geography": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Law": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Education": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      "Sports": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "Arts": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "Economy": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      "Society": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoStats = () => {
    const totalVideos = videos.length;
    const youtubeVideos = videos.filter(v => v.videoType === 'youtube').length;
    const uploadedVideos = videos.filter(v => v.videoType === 'uploaded').length;
    const activeVideos = videos.filter(v => v.isActive).length;
    
    return {
      total: totalVideos,
      youtube: youtubeVideos,
      uploaded: uploadedVideos,
      active: activeVideos,
      inactive: totalVideos - activeVideos
    };
  };

  const stats = getVideoStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading video management...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Video Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage educational videos and content library
          </p>
        </div>
        
        <Button 
          onClick={() => setShowUploadDialog(true)} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Video
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Video className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">YouTube Videos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.youtube}</p>
              </div>
              <Youtube className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uploaded Videos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uploaded}</p>
              </div>
              <Upload className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Videos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Categories</SelectItem>
                <SelectItem value="Government" className="text-gray-900 dark:text-white">Government</SelectItem>
                <SelectItem value="History" className="text-gray-900 dark:text-white">History</SelectItem>
                <SelectItem value="Culture" className="text-gray-900 dark:text-white">Culture</SelectItem>
                <SelectItem value="Geography" className="text-gray-900 dark:text-white">Geography</SelectItem>
                <SelectItem value="Law" className="text-gray-900 dark:text-white">Law</SelectItem>
                <SelectItem value="Education" className="text-gray-900 dark:text-white">Education</SelectItem>
                <SelectItem value="Sports" className="text-gray-900 dark:text-white">Sports</SelectItem>
                <SelectItem value="Arts" className="text-gray-900 dark:text-white">Arts</SelectItem>
                <SelectItem value="Economy" className="text-gray-900 dark:text-white">Economy</SelectItem>
                <SelectItem value="Society" className="text-gray-900 dark:text-white">Society</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Videos ({filteredVideos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No videos have been uploaded yet"}
              </p>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Video
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">Video</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Category</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Type</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Duration</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.map((video) => (
                    <TableRow key={video.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            {video.videoType === 'youtube' ? (
                              <Youtube className="h-6 w-6 text-white" />
                            ) : (
                              <Video className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {video.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {video.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getCategoryColor(video.category)}>
                          {video.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {video.videoType === 'youtube' ? (
                            <Youtube className="h-4 w-4 text-red-500" />
                          ) : (
                            <Video className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="capitalize text-sm">{video.videoType}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          {video.duration > 0 ? formatDuration(video.duration) : 'Unknown'}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={video.isActive ? "default" : "secondary"}>
                          {video.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageContent(video)}
                            title="Manage Content"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVideo(video)}
                            title="Edit Video"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVideo(video)}
                            className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Video"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add New Video</DialogTitle>
          </DialogHeader>
          <EnhancedVideoUpload
            onSuccess={() => setShowUploadDialog(false)}
            onCancel={() => setShowUploadDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  defaultValue={selectedVideo?.title || ""}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select defaultValue={selectedVideo?.category || "government"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="culture">Culture</SelectItem>
                    <SelectItem value="geography">Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                defaultValue={selectedVideo?.description || ""}
                placeholder="Enter video description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration (seconds)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  defaultValue={selectedVideo?.duration || 0}
                  placeholder="Enter duration in seconds"
                />
              </div>
              <div>
                <Label htmlFor="edit-video-url">Video URL</Label>
                <Input
                  id="edit-video-url"
                  defaultValue={selectedVideo?.videoUrl || ""}
                  placeholder="Enter video URL"
                />
              </div>
            </div>

            {/* Video Reupload Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Reupload Video</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="mb-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Upload a new video file to replace the current one. This will overwrite the existing video.
                  </p>
                  {selectedVideo && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      Current video type: <span className="font-medium">{selectedVideo.videoType === 'youtube' ? 'YouTube URL' : 'Uploaded File'}</span>
                      {selectedVideo.videoType === 'youtube' && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">• Uploading a file will change this to an uploaded video</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-video-file">Select New Video File</Label>
                    <Input
                      id="edit-video-file"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Store the file for upload
                          (window as any).selectedEditVideoFile = file;
                          // Show file info
                          const fileInfo = document.getElementById('edit-video-file-info');
                          const fileActions = document.getElementById('edit-video-file-actions');
                          if (fileInfo) {
                            fileInfo.innerHTML = `
                              <div class="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span class="text-sm text-green-700 dark:text-green-300">
                                  Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                            `;
                          }
                          if (fileActions) {
                            fileActions.classList.remove('hidden');
                          }
                        } else {
                          // Clear file selection
                          (window as any).selectedEditVideoFile = null;
                          const fileInfo = document.getElementById('edit-video-file-info');
                          const fileActions = document.getElementById('edit-video-file-actions');
                          if (fileInfo) fileInfo.innerHTML = '';
                          if (fileActions) fileActions.classList.add('hidden');
                        }
                      }}
                      className="mt-1"
                    />
                    <div id="edit-video-file-info" className="mt-2"></div>
                    <div id="edit-video-file-actions" className="mt-2 hidden">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Clear file selection
                          const fileInput = document.getElementById('edit-video-file') as HTMLInputElement;
                          if (fileInput) {
                            fileInput.value = '';
                          }
                          (window as any).selectedEditVideoFile = null;
                          // Hide file info
                          const fileInfo = document.getElementById('edit-video-file-info');
                          const fileActions = document.getElementById('edit-video-file-actions');
                          if (fileInfo) fileInfo.innerHTML = '';
                          if (fileActions) fileActions.classList.add('hidden');
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Clear Selection
                      </Button>
                    </div>
                    
                    {/* Upload Progress Indicator */}
                    <div id="edit-upload-progress" className="mt-4 hidden">
                      {/* Progress content will be dynamically inserted here */}
                    </div>
                    <div id="edit-upload-status" className="hidden"></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: MP4, MOV, AVI, WebM. Max size: 500MB
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
              <Input
                id="edit-thumbnail"
                defaultValue={selectedVideo?.thumbnail || ""}
                placeholder="Enter thumbnail URL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select defaultValue={selectedVideo?.difficulty || "intermediate"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  defaultValue={Array.isArray(selectedVideo?.tags) ? selectedVideo.tags.join(', ') : ""}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-additional-content">Additional Content</Label>
              <Textarea
                id="edit-additional-content"
                defaultValue={selectedVideo?.additionalContent || ""}
                placeholder="Enter additional educational content"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                // Get form data and update video
                const title = (document.getElementById('edit-title') as HTMLInputElement)?.value || '';
                const description = (document.getElementById('edit-description') as HTMLTextAreaElement)?.value || '';
                const duration = parseInt((document.getElementById('edit-duration') as HTMLInputElement)?.value || '0');
                const videoUrl = (document.getElementById('edit-video-url') as HTMLInputElement)?.value || '';
                const thumbnail = (document.getElementById('edit-thumbnail') as HTMLInputElement)?.value || '';
                const tags = (document.getElementById('edit-tags') as HTMLInputElement)?.value?.split(',').map(t => t.trim()).filter(t => t) || [];
                const additionalContent = (document.getElementById('edit-additional-content') as HTMLTextAreaElement)?.value || '';
                
                let finalVideoUrl = videoUrl;
                let finalVideoType = selectedVideo?.videoType || 'uploaded';
                
                // Check if a new video file was selected for reupload
                const selectedFile = (window as any).selectedEditVideoFile;
                if (selectedFile) {
                  // Show upload progress
                  const uploadProgress = document.getElementById('edit-upload-progress');
                  const uploadStatus = document.getElementById('edit-upload-status');
                  const updateButton = document.querySelector('[data-edit-update-button]') as HTMLButtonElement;
                  
                  if (uploadProgress) {
                    uploadProgress.classList.remove('hidden');
                    uploadProgress.innerHTML = `
                      <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <div class="flex-1">
                          <div class="text-sm font-medium text-blue-900 dark:text-blue-100">Uploading video...</div>
                          <div class="text-xs text-blue-700 dark:text-blue-300">Please wait while your video is being uploaded to R2 storage</div>
                        </div>
                      </div>
                    `;
                  }
                  
                  if (updateButton) {
                    updateButton.disabled = true;
                    updateButton.innerHTML = `
                      <div class="flex items-center gap-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </div>
                    `;
                  }
                  
                  try {
                    // Get presigned URL for R2 upload
                    if (uploadStatus) {
                      uploadStatus.textContent = 'Getting upload URL...';
                    }
                    
                    const presignedResponse = await apiRequest("POST", "/api/videos/presigned-upload", {
                      fileName: selectedFile.name,
                      contentType: selectedFile.type,
                    });
                    
                    if (!presignedResponse.ok) {
                      throw new Error("Failed to get upload URL");
                    }
                    
                    const { uploadUrl, key } = await presignedResponse.json();
                    
                    if (uploadStatus) {
                      uploadStatus.textContent = 'Uploading file to R2...';
                    }
                    
                    // Upload file directly to R2 with progress tracking
                    const uploadResponse = await fetch(uploadUrl, {
                      method: "PUT",
                      body: selectedFile,
                      headers: {
                        "Content-Type": selectedFile.type,
                      },
                    });
                    
                    // Upload is in progress - no progress tracking needed
                    
                    if (!uploadResponse.ok) {
                      const errorText = await uploadResponse.text();
                      console.error("R2 upload failed:", errorText);
                      throw new Error(`Failed to upload video to R2: ${uploadResponse.status} ${uploadResponse.statusText}`);
                    }
                    
                    // Use the R2 key for storage
                    finalVideoUrl = key;
                    finalVideoType = 'uploaded';
                    
                    if (uploadStatus) {
                      uploadStatus.textContent = 'Upload complete!';
                    }
                    
                    // Show success state
                    if (uploadProgress) {
                      uploadProgress.innerHTML = `
                        <div class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <div class="text-sm font-medium text-green-900 dark:text-green-100">Upload successful!</div>
                            <div class="text-xs text-green-700 dark:text-green-300">Video has been uploaded to R2 storage</div>
                          </div>
                        </div>
                      `;
                    }
                    
                    toast({ 
                      title: "Video uploaded successfully", 
                      description: "New video file has been uploaded to R2 storage" 
                    });
                  } catch (error: any) {
                    console.error('Video reupload error:', error);
                    
                    // Show error state
                    if (uploadProgress) {
                      uploadProgress.innerHTML = `
                        <div class="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <div class="text-sm font-medium text-red-900 dark:text-red-100">Upload failed</div>
                            <div class="text-xs text-red-700 dark:text-red-300">${error.message || "Failed to upload video file"}</div>
                          </div>
                        </div>
                      `;
                    }
                    
                    if (updateButton) {
                      updateButton.disabled = false;
                      updateButton.innerHTML = 'Update Video';
                    }
                    
                    toast({ 
                      title: "Upload failed", 
                      description: error.message || "Failed to upload video file", 
                      variant: "destructive" 
                    });
                    return;
                  }
                }
                
                const updateData = {
                  title,
                  description,
                  category: selectedVideo?.category || 'government', // Keep existing category for now
                  duration,
                  videoUrl: finalVideoUrl,
                  videoType: finalVideoType,
                  thumbnail,
                  difficulty: selectedVideo?.difficulty || 'intermediate', // Keep existing difficulty for now
                  tags,
                  additionalContent
                };
                
                // Call update mutation
                if (selectedVideo) {
                  updateVideoMutation.mutate({ id: selectedVideo.id, data: updateData });
                }
                setShowEditDialog(false);
              }}
              disabled={updateVideoMutation.isPending}
              data-edit-update-button
            >
              {updateVideoMutation.isPending ? "Updating..." : "Update Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Delete Video</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{videoToDelete?.title}"? This action cannot be undone.
            </p>
            {videoToDelete?.videoType === 'uploaded' && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                This will also delete the video file from storage.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteVideoMutation.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Management Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Manage Content - {selectedVideoForContent?.title}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Audio
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content-title">Content Title</Label>
                  <Input
                    id="content-title"
                    placeholder="Enter content title"
                    defaultValue={selectedVideoForContent?.title || ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content-description">Content Description</Label>
                  <Textarea
                    id="content-description"
                    placeholder="Enter detailed content description"
                    rows={4}
                    defaultValue={selectedVideoForContent?.description || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="content-text">Additional Content Text</Label>
                  <Textarea
                    id="content-text"
                    placeholder="Enter additional educational content, key points, or detailed explanations"
                    rows={6}
                    defaultValue={selectedVideoForContent?.additionalContent || ""}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content-difficulty">Difficulty Level</Label>
                    <Select defaultValue={selectedVideoForContent?.difficulty || "intermediate"}>
                      <SelectTrigger id="content-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="content-tags">Tags</Label>
                    <Input
                      id="content-tags"
                      placeholder="Enter tags separated by commas"
                      defaultValue={Array.isArray(selectedVideoForContent?.tags) ? selectedVideoForContent.tags.join(', ') : String(selectedVideoForContent?.tags || "")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => {
                      const title = (document.getElementById('content-title') as HTMLInputElement)?.value || '';
                      const description = (document.getElementById('content-description') as HTMLTextAreaElement)?.value || '';
                      const additionalContent = (document.getElementById('content-text') as HTMLTextAreaElement)?.value || '';
                      const difficultySelect = document.getElementById('content-difficulty') as HTMLSelectElement;
                      const difficulty = difficultySelect?.value || 'intermediate';
                      const tags = (document.getElementById('content-tags') as HTMLInputElement)?.value?.split(',').map(t => t.trim()).filter(t => t) || [];
                      
                      const contentData = {
                        title,
                        description,
                        additionalContent,
                        difficulty,
                        tags
                      };
                      
                      console.log('Attempting to update content:', { videoId: selectedVideoForContent?.id, contentData });
                      updateContentMutation.mutate(contentData);
                    }}
                    disabled={updateContentMutation.isPending}
                  >
                    {updateContentMutation.isPending ? "Saving..." : "Save Content"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Video Resources</h3>
                  <Button size="sm" onClick={() => setShowAddResourceDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </div>

                {resourcesLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
                  </div>
                ) : (videoResources as any[]).length === 0 ? (
                  <div className="text-center py-8">
                    <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No resources added yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Add your first resource to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(videoResources as any[]).map((resource: any) => (
                      <div key={resource.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              resource.type === 'pdf' ? 'bg-blue-100 dark:bg-blue-900' :
                              resource.type === 'link' ? 'bg-green-100 dark:bg-green-900' :
                              resource.type === 'file' ? 'bg-purple-100 dark:bg-purple-900' :
                              'bg-orange-100 dark:bg-orange-900'
                            }`}>
                              {resource.type === 'pdf' ? <File className="h-5 w-5 text-blue-600" /> :
                               resource.type === 'link' ? <Link className="h-5 w-5 text-green-600" /> :
                               resource.type === 'file' ? <File className="h-5 w-5 text-purple-600" /> :
                               <Image className="h-5 w-5 text-orange-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{resource.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                              {resource.size && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">{resource.size}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(resource.url, '_blank')}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => {
                              if (selectedVideoForContent && confirm('Delete this resource?')) {
                                deleteResourceMutation.mutate({
                                  videoId: selectedVideoForContent.id,
                                  resourceId: resource.id
                                });
                              }
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="instructor-notes">Instructor Notes</Label>
                  <Textarea
                    id="instructor-notes"
                    placeholder="Enter instructor notes, teaching tips, or key points to emphasize"
                    rows={6}
                    defaultValue={selectedVideoForContent?.instructorNotes || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="student-notes">Student Study Notes</Label>
                  <Textarea
                    id="student-notes"
                    placeholder="Enter study notes that will be available to students"
                    rows={6}
                    defaultValue={selectedVideoForContent?.studentNotes || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="key-points">Key Points to Remember</Label>
                  <Textarea
                    id="key-points"
                    placeholder="Enter key points, important dates, or facts to remember"
                    rows={4}
                    defaultValue={selectedVideoForContent?.keyPoints || ""}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prerequisites">Prerequisites</Label>
                    <Textarea
                      id="prerequisites"
                      placeholder="What students should know before watching this video"
                      rows={3}
                      defaultValue={selectedVideoForContent?.prerequisites || ""}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="follow-up">Follow-up Actions</Label>
                    <Textarea
                      id="follow-up"
                      placeholder="What students should do after watching this video"
                      rows={3}
                      defaultValue={selectedVideoForContent?.followUpActions || ""}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => {
                      const instructorNotes = (document.getElementById('instructor-notes') as HTMLTextAreaElement)?.value || '';
                      const studentNotes = (document.getElementById('student-notes') as HTMLTextAreaElement)?.value || '';
                      const keyPoints = (document.getElementById('key-points') as HTMLTextAreaElement)?.value || '';
                      const prerequisites = (document.getElementById('prerequisites') as HTMLTextAreaElement)?.value || '';
                      const followUpActions = (document.getElementById('follow-up') as HTMLTextAreaElement)?.value || '';
                      
                      const notesData = {
                        instructorNotes,
                        studentNotes,
                        keyPoints,
                        prerequisites,
                        followUpActions
                      };
                      
                      console.log('Attempting to update notes:', { videoId: selectedVideoForContent?.id, notesData });
                      updateContentMutation.mutate(notesData);
                    }}
                    disabled={updateContentMutation.isPending}
                  >
                    {updateContentMutation.isPending ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Audio Narration</h3>
                  <Button size="sm" onClick={() => setShowAddAudioDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Audio
                  </Button>
                </div>

                {audioLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading audio...</p>
                  </div>
                ) : (videoAudio as any[]).length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No audio files added yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Add your first audio file to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(videoAudio as any[]).map((audio: any) => (
                      <div key={audio.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              audio.type === 'narration' ? 'bg-purple-100 dark:bg-purple-900' :
                              audio.type === 'accessibility' ? 'bg-orange-100 dark:bg-orange-900' :
                              'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              {audio.type === 'narration' ? <Volume2 className="h-5 w-5 text-purple-600" /> :
                               audio.type === 'accessibility' ? <Headphones className="h-5 w-5 text-orange-600" /> :
                               <Mic className="h-5 w-5 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{audio.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{audio.description}</p>
                              <div className="flex items-center gap-4 mt-1">
                                {audio.duration && <span className="text-xs text-gray-500">Duration: {audio.duration}</span>}
                                {audio.quality && <span className="text-xs text-gray-500">Quality: {audio.quality}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              const audioElement = new Audio(audio.url);
                              audioElement.play();
                            }}>
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(audio.url, '_blank')}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => {
                              if (selectedVideoForContent && confirm('Delete this audio file?')) {
                                deleteAudioMutation.mutate({
                                  videoId: selectedVideoForContent.id,
                                  audioId: audio.id
                                });
                              }
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Get form data and save
                const contentData = {
                  title: (document.getElementById('content-title') as HTMLInputElement)?.value || '',
                  description: (document.getElementById('content-description') as HTMLTextAreaElement)?.value || '',
                  difficulty: (document.querySelector('[data-value]') as HTMLElement)?.getAttribute('data-value') || 'intermediate',
                  tags: (document.getElementById('content-tags') as HTMLInputElement)?.value?.split(',').map(t => t.trim()) || [],
                  additionalContent: (document.getElementById('content-text') as HTMLTextAreaElement)?.value || '',
                  instructorNotes: (document.getElementById('instructor-notes') as HTMLTextAreaElement)?.value || '',
                  studentNotes: (document.getElementById('student-notes') as HTMLTextAreaElement)?.value || '',
                  keyPoints: (document.getElementById('key-points') as HTMLTextAreaElement)?.value || '',
                  prerequisites: (document.getElementById('prerequisites') as HTMLTextAreaElement)?.value || '',
                  followUpActions: (document.getElementById('follow-up') as HTMLTextAreaElement)?.value || ''
                };
                updateContentMutation.mutate(contentData);
                setShowContentDialog(false);
              }}
              disabled={updateContentMutation.isPending}
            >
              {updateContentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Resource Dialog */}
      <Dialog open={showAddResourceDialog} onOpenChange={(open) => {
        setShowAddResourceDialog(open);
        if (!open) {
          setSelectedFile(null);
          setSelectedResourceType("link");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resource-title">Resource Title</Label>
              <Input
                id="resource-title"
                placeholder="Enter resource title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="resource-type">Resource Type</Label>
              <Select defaultValue="link" onValueChange={setSelectedResourceType}>
                <SelectTrigger id="resource-type">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Web Link (URL required)</SelectItem>
                  <SelectItem value="pdf">PDF Document (Upload file)</SelectItem>
                  <SelectItem value="file">File (Upload file)</SelectItem>
                  <SelectItem value="image">Image (Upload file)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedResourceType === "link" ? (
              <div>
                <Label htmlFor="resource-url">Resource URL *</Label>
                <Input
                  id="resource-url"
                  placeholder="Enter resource URL (e.g., https://example.com)"
                  required
                  type="url"
                  defaultValue=""
                />
                <p className="text-sm text-gray-500 mt-1">Enter a valid URL starting with http:// or https://</p>
              </div>
            ) : (
              <div>
                <Label htmlFor="resource-file">Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {selectedResourceType === "pdf" && "Upload PDF document"}
                      {selectedResourceType === "file" && "Upload any file"}
                      {selectedResourceType === "image" && "Upload image file"}
                    </div>
                    <Input
                      id="resource-file"
                      type="file"
                      accept={
                        selectedResourceType === "pdf" ? ".pdf" :
                        selectedResourceType === "image" ? "image/*" :
                        "*"
                      }
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="mb-2"
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                placeholder="Enter resource description"
                rows={3}
              />
            </div>

            {selectedResourceType !== "link" && (
              <div>
                <Label htmlFor="resource-size">File Size (Optional)</Label>
                <Input
                  id="resource-size"
                  placeholder="e.g., 2.5 MB"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddResourceDialog(false);
              setSelectedResourceType("link");
              setSelectedFile(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const title = (document.getElementById('resource-title') as HTMLInputElement)?.value;
                const type = selectedResourceType; // Use state instead of DOM element
                const description = (document.getElementById('resource-description') as HTMLTextAreaElement)?.value;
                const size = (document.getElementById('resource-size') as HTMLInputElement)?.value;
                
                console.log('Selected resource type:', type);
                console.log('Selected file:', selectedFile);
                console.log('selectedResourceType state:', selectedResourceType);
                
                if (!title) {
                  toast({ title: "Error", description: "Title is required", variant: "destructive" });
                  return;
                }
                
                let url = '';
                let fileSize = size;
                
                if (type === 'link') {
                  const urlInput = (document.getElementById('resource-url') as HTMLInputElement)?.value;
                  console.log('URL input value:', urlInput);
                  console.log('URL input element:', document.getElementById('resource-url'));
                  if (!urlInput || urlInput.trim() === '') {
                    toast({ title: "Error", description: "URL is required for links", variant: "destructive" });
                    return;
                  }
                  
                  // Basic URL validation
                  try {
                    new URL(urlInput);
                  } catch (e) {
                    toast({ title: "Error", description: "Please enter a valid URL (e.g., https://example.com)", variant: "destructive" });
                    return;
                  }
                  
                  url = urlInput;
                } else {
                  if (!selectedFile) {
                    const fileTypeName = type === 'pdf' ? 'PDF' : type === 'image' ? 'Image' : 'File';
                    toast({ title: "Error", description: `Please select a ${fileTypeName.toLowerCase()} file to upload`, variant: "destructive" });
                    return;
                  }
                  
                  try {
                    // Get presigned URL for R2 upload
                    const presignedResponse = await apiRequest("POST", `/api/admin/videos/${selectedVideoForContent?.id}/resources/presigned-upload`, {
                      fileName: selectedFile.name,
                      contentType: selectedFile.type,
                    });
                    
                    if (!presignedResponse.ok) {
                      throw new Error("Failed to get upload URL");
                    }
                    
                    const { uploadUrl, key, publicUrl } = await presignedResponse.json();
                    
                    // Upload file directly to R2
                    const uploadResponse = await fetch(uploadUrl, {
                      method: "PUT",
                      body: selectedFile,
                      headers: {
                        "Content-Type": selectedFile.type,
                      },
                    });
                    
                    if (!uploadResponse.ok) {
                      const errorText = await uploadResponse.text();
                      console.error("R2 upload failed:", errorText);
                      throw new Error(`Failed to upload file to R2: ${uploadResponse.status} ${uploadResponse.statusText}`);
                    }
                    
                    // Use the R2 key for storage, public URL for display
                    url = key;
                    fileSize = fileSize || `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
                    
                    toast({ 
                      title: "File uploaded successfully", 
                      description: "File has been uploaded to R2 storage" 
                    });
                  } catch (error: any) {
                    console.error('Resource upload error:', error);
                    toast({ 
                      title: "Upload failed", 
                      description: error.message || "Failed to upload file", 
                      variant: "destructive" 
                    });
                    return;
                  }
                }
                
                if (selectedVideoForContent) {
        addResourceMutation.mutate({
          videoId: selectedVideoForContent.id,
          data: { title, type, url, description, size: fileSize }
        });
        setShowAddResourceDialog(false);
        setSelectedFile(null);
        setSelectedResourceType("link");
        
        // Reset form fields
        (document.getElementById('resource-title') as HTMLInputElement).value = '';
        (document.getElementById('resource-description') as HTMLTextAreaElement).value = '';
        (document.getElementById('resource-size') as HTMLInputElement).value = '';
        if (document.getElementById('resource-url')) {
          (document.getElementById('resource-url') as HTMLInputElement).value = '';
        }
                }
              }}
              disabled={addResourceMutation.isPending}
            >
              {addResourceMutation.isPending ? "Adding..." : "Add Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Audio Dialog */}
      <Dialog open={showAddAudioDialog} onOpenChange={(open) => {
        setShowAddAudioDialog(open);
        if (!open) {
          setSelectedAudioFile(null);
          setSelectedAudioType("narration");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Audio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="audio-title">Audio Title</Label>
              <Input
                id="audio-title"
                placeholder="Enter audio title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="audio-type">Audio Type</Label>
              <Select defaultValue="narration" onValueChange={setSelectedAudioType}>
                <SelectTrigger id="audio-type">
                  <SelectValue placeholder="Select audio type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narration">Narration</SelectItem>
                  <SelectItem value="accessibility">Accessibility</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="audio-source">Audio Source</Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="audio-source" value="url" defaultChecked />
                    <span>Audio URL</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="audio-source" value="file" />
                    <span>Upload File</span>
                  </label>
                </div>
                
                <div id="audio-url-section">
                  <Input
                    id="audio-url"
                    placeholder="Enter audio URL"
                    required
                  />
                </div>
                
                <div id="audio-file-section" className="hidden">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload audio file (MP3, WAV, etc.)
                      </div>
                      <Input
                        id="audio-file"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setSelectedAudioFile(e.target.files?.[0] || null)}
                        className="mb-2"
                      />
                      {selectedAudioFile && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Selected: {selectedAudioFile.name} ({(selectedAudioFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="audio-description">Description</Label>
              <Textarea
                id="audio-description"
                placeholder="Enter audio description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audio-duration">Duration</Label>
                <Input
                  id="audio-duration"
                  placeholder="e.g., 7:30"
                />
              </div>
              
              <div>
                <Label htmlFor="audio-quality">Quality</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger id="audio-quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAudioDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const title = (document.getElementById('audio-title') as HTMLInputElement)?.value;
                const typeSelect = document.getElementById('audio-type') as HTMLSelectElement;
                const type = typeSelect?.value || 'narration';
                const description = (document.getElementById('audio-description') as HTMLTextAreaElement)?.value;
                const duration = (document.getElementById('audio-duration') as HTMLInputElement)?.value;
                const qualitySelect = document.getElementById('audio-quality') as HTMLSelectElement;
                const quality = qualitySelect?.value || 'Medium';
                
                if (!title) {
                  toast({ title: "Error", description: "Title is required", variant: "destructive" });
                  return;
                }
                
                let url = '';
                
                // Check which audio source is selected
                const urlRadio = document.querySelector('input[name="audio-source"][value="url"]') as HTMLInputElement;
                const fileRadio = document.querySelector('input[name="audio-source"][value="file"]') as HTMLInputElement;
                
                if (urlRadio?.checked) {
                  const urlInput = (document.getElementById('audio-url') as HTMLInputElement)?.value;
                  if (!urlInput) {
                    toast({ title: "Error", description: "Audio URL is required", variant: "destructive" });
                    return;
                  }
                  url = urlInput;
                } else if (fileRadio?.checked) {
                  if (!selectedAudioFile) {
                    toast({ title: "Error", description: "Please select an audio file to upload", variant: "destructive" });
                    return;
                  }
                  
                  try {
                    // Get presigned URL for R2 upload
                    const presignedResponse = await apiRequest("POST", `/api/admin/videos/${selectedVideoForContent?.id}/resources/presigned-upload`, {
                      fileName: selectedAudioFile.name,
                      contentType: selectedAudioFile.type,
                    });
                    
                    if (!presignedResponse.ok) {
                      throw new Error("Failed to get upload URL");
                    }
                    
                    const { uploadUrl, key, publicUrl } = await presignedResponse.json();
                    
                    // Upload file directly to R2
                    const uploadResponse = await fetch(uploadUrl, {
                      method: "PUT",
                      body: selectedAudioFile,
                      headers: {
                        "Content-Type": selectedAudioFile.type,
                      },
                    });
                    
                    if (!uploadResponse.ok) {
                      const errorText = await uploadResponse.text();
                      console.error("R2 upload failed:", errorText);
                      throw new Error(`Failed to upload audio file to R2: ${uploadResponse.status} ${uploadResponse.statusText}`);
                    }
                    
                    // Use the R2 key for storage
                    url = key;
                    
                    toast({ 
                      title: "Audio uploaded successfully", 
                      description: "Audio file has been uploaded to R2 storage" 
                    });
                  } catch (error: any) {
                    console.error('Audio upload error:', error);
                    toast({ 
                      title: "Upload failed", 
                      description: error.message || "Failed to upload audio file", 
                      variant: "destructive" 
                    });
                    return;
                  }
                }
                
                if (selectedVideoForContent) {
                  addAudioMutation.mutate({
                    videoId: selectedVideoForContent.id,
                    data: { title, type, url, description, duration, quality }
                  });
                  setShowAddAudioDialog(false);
                  setSelectedAudioFile(null);
                  setSelectedAudioType("narration");
                }
              }}
              disabled={addAudioMutation.isPending}
            >
              {addAudioMutation.isPending ? "Adding..." : "Add Audio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
