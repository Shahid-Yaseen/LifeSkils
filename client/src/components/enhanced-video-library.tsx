import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Clock, 
  Tag, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download,
  CheckCircle,
  PlayCircle,
  Lock,
  Youtube,
  Video,
  FileText,
  Image,
  BookOpen,
  Star,
  TrendingUp,
  Volume2,
  VolumeX
} from "lucide-react";
import type { VideoModule, UserVideoProgress } from "@shared/schema";

interface EnhancedVideoLibraryProps {
  userId: string;
  onVideoSelect?: (video: VideoModule) => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Government", label: "Government & Politics" },
  { value: "History", label: "History" },
  { value: "Culture", label: "Culture & Society" },
  { value: "Geography", label: "Geography" },
  { value: "Law", label: "Law & Justice" },
  { value: "Education", label: "Education" },
  { value: "Sports", label: "Sports & Recreation" },
  { value: "Arts", label: "Arts & Literature" },
  { value: "Economy", label: "Economy" },
  { value: "Society", label: "Society & Community" }
];

export default function EnhancedVideoLibrary({ userId, onVideoSelect }: EnhancedVideoLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVideo, setSelectedVideo] = useState<VideoModule | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const { data: videos = [], isLoading } = useQuery<VideoModule[]>({
    queryKey: ["/api/videos"],
  });

  const { data: progress = [] } = useQuery<UserVideoProgress[]>({
    queryKey: ["/api/videos/progress", userId],
  });

  // Fetch resources for the selected video
  const { data: videoResources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ["video-resources", selectedVideo?.id],
    queryFn: async () => {
      if (!selectedVideo?.id) return [];
      const response = await apiRequest("GET", `/api/admin/videos/${selectedVideo.id}/resources`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedVideo?.id,
  });

  // Fetch detailed content for the selected video
  const { data: videoContent, isLoading: contentLoading } = useQuery({
    queryKey: ["video-content", selectedVideo?.id],
    queryFn: async () => {
      if (!selectedVideo?.id) return null;
      const response = await apiRequest("GET", `/api/admin/videos/${selectedVideo.id}/content`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!selectedVideo?.id,
  });

  const handleVideoClick = (video: VideoModule) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
    onVideoSelect?.(video);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedVideo(null);
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(null);
    }
  };

  const speakText = (text: string, videoId: string) => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(null);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use British voice
      const voices = speechSynthesis.getVoices();
      const britishVoice = voices.find(voice => 
        voice.lang.includes('en-GB') || 
        voice.name.includes('British') ||
        voice.name.includes('UK')
      );
      
      if (britishVoice) {
        utterance.voice = britishVoice;
      }
      
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      
      speechSynthesis.speak(utterance);
      setSpeaking(videoId);
    }
  };

  const getVideoProgress = (videoId: string) => {
    return progress.find(p => p.videoId === videoId);
  };

  const getVideoThumbnail = (video: VideoModule) => {
    if (video.videoType === 'youtube') {
      const videoId = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.tags && typeof video.tags === 'string' && video.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading video library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Educational Video Library</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`${viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"} h-8 w-8 p-0`}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={`${viewMode === "list" ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"} h-8 w-8 p-0`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search videos, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 sm:h-10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 h-9 sm:h-10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Video Grid/List */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || selectedCategory !== "all" 
              ? "Try adjusting your search or filters" 
              : "No videos have been uploaded yet"}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
          : "space-y-3 sm:space-y-4"
        }>
          {filteredVideos.map((video) => {
            const videoProgress = getVideoProgress(video.id);
            const thumbnail = getVideoThumbnail(video);
            const isCompleted = videoProgress?.completed;
            const progressPercent = videoProgress?.watchTime || 0;

            return (
              <Card 
                key={video.id} 
                className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm ${
                  isCompleted ? 'ring-2 ring-green-200 dark:ring-green-800' : ''
                }`}
                onClick={() => handleVideoClick(video)}
              >
                <CardHeader className="p-0">
                  <div className="relative">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={video.title}
                        className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                        {video.videoType === 'youtube' ? (
                          <Youtube className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                        ) : (
                          <Video className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                        )}
                      </div>
                    )}
                    
                    {/* Progress overlay */}
                    {videoProgress && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                        <Progress value={progressPercent} className="h-1 mb-1" />
                        <div className="flex items-center justify-between text-xs">
                          <span>{Math.round(progressPercent)}% watched</span>
                          {isCompleted && <CheckCircle className="h-3 w-3 text-green-400" />}
                        </div>
                      </div>
                    )}
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-t-lg">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                    
                    {/* Duration badge */}
                    {video.duration > 0 && (
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {video.title}
                      </h3>
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`${getCategoryColor(video.category)} text-xs`}>
                        {video.category}
                      </Badge>
                      
                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {video.videoType === 'youtube' ? (
                          <Youtube className="h-3 w-3" />
                        ) : (
                          <Video className="h-3 w-3" />
                        )}
                        <span className="capitalize hidden sm:inline">{video.videoType}</span>
                      </div>
                    </div>
                    
                    {video.tags ? (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(video.tags) ? video.tags : (typeof video.tags === 'string' ? video.tags.split(',') : [])).slice(0, 2).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Enhanced Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl sm:max-w-5xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mx-2 sm:mx-4">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {selectedVideo?.videoType === 'youtube' ? (
                <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              ) : (
                <Video className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              )}
              <span className="line-clamp-2">{selectedVideo?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <Tabs defaultValue="video" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-700 h-auto">
                    <TabsTrigger value="video" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-3">
                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Video</span>
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-3">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Content</span>
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-3">
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Audio</span>
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-3">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Resources</span>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-3">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Notes</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="video" className="mt-4">
                    <div className="space-y-4">
                      {/* Video Player */}
                      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                        {selectedVideo.videoType === 'youtube' ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${selectedVideo.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]}`}
                            title={selectedVideo.title}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        ) : (
                          <video
                            src={selectedVideo.videoUrl}
                            controls
                            className="w-full h-full"
                            preload="metadata"
                            onTimeUpdate={(e) => {
                              const video = e.currentTarget;
                              const progress = (video.currentTime / video.duration) * 100;
                              // Update progress in database
                              // This would typically be debounced
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Video Description - Below the video like before */}
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-4">
                          <Badge className={getCategoryColor(selectedVideo.category)}>
                            {selectedVideo.category}
                          </Badge>
                          {selectedVideo.duration > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              {formatDuration(selectedVideo.duration)}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedVideo.description}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                
                  <TabsContent value="content" className="mt-4">
                    {contentLoading ? (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
                        </div>
                      </div>
                    ) : videoContent?.content ? (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Video Content</h3>
                          
                          {videoContent.content.keyPoints && (
                            <div className="mb-6">
                              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                Key Points
                              </h4>
                              <div className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: videoContent.content.keyPoints }} />
                              </div>
                            </div>
                          )}

                          {videoContent.content.additionalContent && (
                            <div className="mb-6">
                              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                Additional Content
                              </h4>
                              <div className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: videoContent.content.additionalContent }} />
                              </div>
                            </div>
                          )}

                          {videoContent.content.prerequisites && (
                            <div className="mb-6">
                              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                                Prerequisites
                              </h4>
                              <div className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: videoContent.content.prerequisites }} />
                              </div>
                            </div>
                          )}

                          {videoContent.content.followUpActions && (
                            <div className="mb-6">
                              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                                Follow-up Actions
                              </h4>
                              <div className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: videoContent.content.followUpActions }} />
                              </div>
                            </div>
                          )}

                          {videoContent.content.difficulty && (
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Difficulty:</span>
                              <Badge variant="outline" className="capitalize">
                                {videoContent.content.difficulty}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No detailed content available</h3>
                          <p className="text-gray-600 dark:text-gray-400">Detailed content will be added by administrators.</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="audio" className="mt-4">
                    {selectedVideo.audioScript ? (
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <Volume2 className="h-5 w-5 mr-2 text-blue-500" />
                            Audio Narration
                          </h3>
                          
                          <div className="mb-4">
                            <Button
                              onClick={() => speakText(selectedVideo.audioScript || '', selectedVideo.id)}
                              className={`w-full ${speaking === selectedVideo.id ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'}`}
                            >
                              {speaking === selectedVideo.id ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                              {speaking === selectedVideo.id ? 'Stop Audio' : 'Play Audio'}
                            </Button>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Audio Script:</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {selectedVideo.audioScript}
                            </p>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-4">
                            <Volume2 className="h-4 w-4 mr-2" />
                            <span>Female British voice • Natural pace • Educational content</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-8">
                          <Volume2 className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No audio available</h3>
                          <p className="text-gray-600 dark:text-gray-400">Audio narration will be added by administrators.</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="resources" className="mt-4">
                    {resourcesLoading ? (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
                        </div>
                      </div>
                    ) : videoResources.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Study Resources ({videoResources.length})
                        </h3>
                        <div className="grid gap-4">
                          {videoResources.map((resource: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className="flex-shrink-0">
                                    {resource.type === 'link' ? (
                                      <BookOpen className="h-5 w-5 text-blue-500 mt-1" />
                                    ) : resource.type === 'pdf' ? (
                                      <FileText className="h-5 w-5 text-red-500 mt-1" />
                                    ) : resource.type === 'image' ? (
                                      <Image className="h-5 w-5 text-green-500 mt-1" />
                                    ) : (
                                      <Download className="h-5 w-5 text-gray-500 mt-1" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {resource.title}
                                    </h4>
                                    {resource.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {resource.description}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                      <span className="capitalize">{resource.type}</span>
                                      {resource.size && <span>{resource.size}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (resource.type === 'link') {
                                        window.open(resource.url, '_blank');
                                      } else {
                                        window.open(resource.url, '_blank');
                                      }
                                    }}
                                    className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 dark:text-blue-400 dark:hover:text-blue-300 dark:border-blue-600 dark:hover:border-blue-500"
                                  >
                                    {resource.type === 'link' ? 'Visit' : 'Download'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-8">
                          <Download className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No resources available</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">Downloadable resources will be added by administrators.</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">Check back later for study materials and documents.</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="notes" className="mt-4">
                    {contentLoading ? (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading notes...</p>
                        </div>
                      </div>
                    ) : videoContent?.content ? (
                      <div className="space-y-6">
                        {videoContent.content.instructorNotes && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                            <h4 className="text-md font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                              Instructor Notes
                            </h4>
                            <div className="prose dark:prose-invert max-w-none text-blue-800 dark:text-blue-200">
                              <div dangerouslySetInnerHTML={{ __html: videoContent.content.instructorNotes }} />
                            </div>
                          </div>
                        )}

                        {videoContent.content.studentNotes && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                            <h4 className="text-md font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                              Student Notes
                            </h4>
                            <div className="prose dark:prose-invert max-w-none text-green-800 dark:text-green-200">
                              <div dangerouslySetInnerHTML={{ __html: videoContent.content.studentNotes }} />
                            </div>
                          </div>
                        )}

                        {!videoContent.content.instructorNotes && !videoContent.content.studentNotes && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-center py-8">
                              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No notes available</h3>
                              <p className="text-gray-600 dark:text-gray-400">Instructor and student notes will be added by administrators.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No notes available</h3>
                          <p className="text-gray-600 dark:text-gray-400">Instructor and student notes will be added by administrators.</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
