import { useQuery } from "@tanstack/react-query";
import { PlayCircle, Check, Clock, Lock, X, Volume2, VolumeX, Image, Download, FileText, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VideoModule, UserVideoProgress } from "@shared/schema";
import { useState } from "react";

interface VideoSectionProps {
  userId: string;
}

export default function VideoSection({ userId }: VideoSectionProps) {
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
    console.log('Video clicked:', video.title);
    console.log('Video URL:', video.videoUrl);
    console.log('Is uploaded video:', video.videoUrl.startsWith('/uploads/'));
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedVideo(null);
    // Stop any playing audio
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(null);
    }
  };

  const speakText = (text: string, videoId: string) => {
    // Stop any currently speaking text
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech functionality');
      return;
    }

    // Ensure voices are loaded
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Priority order for selecting female British voices
      const preferredVoices = [
        // Look for explicitly named female British voices
        voices.find(voice => 
          voice.lang.includes('en-GB') && 
          (voice.name.toLowerCase().includes('kate') || 
           voice.name.toLowerCase().includes('emma') ||
           voice.name.toLowerCase().includes('serena') ||
           voice.name.toLowerCase().includes('fiona') ||
           voice.name.toLowerCase().includes('victoria'))
        ),
        // Look for voices explicitly marked as female
        voices.find(voice => 
          voice.lang.includes('en-GB') && 
          voice.name.toLowerCase().includes('female')
        ),
        // Look for common female voice names in any English variant
        voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('kate') || 
           voice.name.toLowerCase().includes('emma') ||
           voice.name.toLowerCase().includes('serena') ||
           voice.name.toLowerCase().includes('samantha') ||
           voice.name.toLowerCase().includes('susan') ||
           voice.name.toLowerCase().includes('fiona') ||
           voice.name.toLowerCase().includes('victoria') ||
           voice.name.toLowerCase().includes('zira') ||
           voice.name.toLowerCase().includes('hazel'))
        ),
        // Filter British voices to exclude obviously male names
        voices.find(voice => 
          voice.lang.includes('en-GB') && 
          !voice.name.toLowerCase().includes('daniel') &&
          !voice.name.toLowerCase().includes('david') &&
          !voice.name.toLowerCase().includes('george') &&
          !voice.name.toLowerCase().includes('male')
        )
      ];

      // Use the first available preferred voice
      const selectedVoice = preferredVoices.find(voice => voice !== undefined);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Enhanced natural speech settings for female voice
      utterance.rate = 0.85; // Natural speaking pace
      utterance.pitch = 1.2; // Higher pitch to ensure female sound
      utterance.volume = 0.9; // Comfortable volume level
      
      // Add natural pauses by preprocessing text
      const naturalText = text
        .replace(/\./g, '... ') // Longer pause after periods
        .replace(/,/g, ', ') // Short pause after commas
        .replace(/:/g, ': ') // Pause after colons
        .replace(/;/g, '; '); // Pause after semicolons
      
      utterance.text = naturalText;

      // Set up event handlers
      utterance.onstart = () => setSpeaking(videoId);
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);

      // Start speaking
      speechSynthesis.speak(utterance);
    };

    // Load voices if not already loaded
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
    } else {
      loadVoices();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoStatus = (videoId: string) => {
    const videoProgress = progress.find((p) => p.videoId === videoId);
    if (videoProgress?.completed) return "completed";
    if (videoProgress?.watchTime && videoProgress.watchTime > 0) return "in-progress";
    return "available"; // Changed from "locked" to "available" to make all videos accessible
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-2 h-2 text-white" />;
      case "in-progress":
        return <Clock className="w-2 h-2 text-white" />;
      default:
        return <Lock className="w-2 h-2 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "in-progress":
        return "bg-warning";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      default:
        return "Available";
    }
  };

  const getActionText = (status: string) => {
    switch (status) {
      case "completed":
        return "Watch Again";
      case "in-progress":
        return "Continue";
      default:
        return "Complete previous modules";
    }
  };

  const completedCount = progress.filter((p: any) => p.completed).length;

  // Group videos by category
  const videosByCategory = videos.reduce((acc, video) => {
    if (!acc[video.category]) {
      acc[video.category] = [];
    }
    acc[video.category].push(video);
    return acc;
  }, {} as Record<string, VideoModule[]>);

  // Define category colors and descriptions
  const categoryInfo = {
    "Government": {
      color: "bg-uk-blue",
      description: "Parliament, democracy, and political system"
    },
    "History": {
      color: "bg-royal-purple", 
      description: "Key events and figures in British history"
    },
    "Geography": {
      color: "bg-success",
      description: "UK regions, countries, and physical features"
    },
    "Culture": {
      color: "bg-warning",
      description: "British values, traditions, and society"
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-4">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section id="videos">
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <PlayCircle className="text-uk-red mr-3" size={24} />
              Educational Videos
            </CardTitle>
            <Badge variant="secondary" className="bg-success/10 text-success">
              {completedCount}/{videos.length} Completed
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-8">
            {Object.entries(videosByCategory).map(([category, categoryVideos]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center mb-4">
                  <div className={`w-4 h-4 rounded-full ${categoryInfo[category as keyof typeof categoryInfo]?.color || 'bg-gray-400'} mr-3`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    <p className="text-sm text-gray-600">{categoryInfo[category as keyof typeof categoryInfo]?.description}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-xs">
                      {categoryVideos.length} video{categoryVideos.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>

                {/* Category Videos Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryVideos.map((video) => {
                    const status = getVideoStatus(video.id);
                    const isLocked = false; // Make all videos accessible
                    
                    return (
                      <div key={video.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100">
                        <div className="aspect-video bg-gray-300 rounded-lg mb-4 relative overflow-hidden">
                          {video.thumbnail ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <PlayCircle className="text-gray-500" size={48} />
                            </div>
                          )}
                          <div 
                            className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors"
                            onClick={() => handleVideoClick(video)}
                          >
                            <div className={`w-12 h-12 ${isLocked ? 'bg-gray-500/90' : 'bg-white/90'} rounded-full flex items-center justify-center hover:scale-110 transition-transform`}>
                              {isLocked ? (
                                <Lock className="text-gray-400" size={20} />
                              ) : (
                                <PlayCircle className="text-uk-blue" size={20} />
                              )}
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                          <div className={`absolute top-2 left-2 ${categoryInfo[category as keyof typeof categoryInfo]?.color || 'bg-gray-400'} text-white text-xs px-2 py-1 rounded font-medium`}>
                            {category}
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{video.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                            </div>
                            <span className="text-xs text-gray-500">{getStatusText(status)}</span>
                          </div>
                          {video.audioScript && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakText(video.audioScript || '', video.id)}
                              className={`p-2 ${speaking === video.id ? 'text-uk-red bg-red-50' : 'text-gray-500 hover:text-uk-blue hover:bg-blue-50'}`}
                            >
                              {speaking === video.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {video.detailedContent && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                <Image className="h-3 w-3 mr-1" />
                                Rich Content
                              </Badge>
                            )}
                            {video.audioScript && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Audio
                              </Badge>
                            )}
                          </div>
                          {isLocked ? (
                            <span className="text-gray-400 text-sm">Locked</span>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-uk-blue hover:text-uk-blue/80 text-sm font-medium"
                              onClick={() => handleVideoClick(video)}
                            >
                              Learn
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Video Modal with Tabs */}
      <Dialog open={isPlayerOpen} onOpenChange={handleClosePlayer}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                <Video className="h-6 w-6 text-blue-500" />
                {selectedVideo?.title}
              </DialogTitle>
              {selectedVideo?.audioScript && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakText(selectedVideo.audioScript || '', selectedVideo.id)}
                  className={`${speaking === selectedVideo.id ? 'text-uk-red border-uk-red' : 'text-uk-blue border-uk-blue'}`}
                >
                  {speaking === selectedVideo.id ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                  {speaking === selectedVideo.id ? 'Stop Audio' : 'Play Audio'}
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedVideo && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 flex-1 overflow-y-auto">
              <Tabs defaultValue="video" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="mt-6">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {selectedVideo.videoUrl.startsWith('/uploads/') ? (
                      <video
                        src={selectedVideo.videoUrl}
                        title={selectedVideo.title}
                        className="w-full h-full"
                        controls
                        preload="metadata"
                        onError={(e) => {
                          console.error('Video load error:', e.currentTarget.error);
                          console.error('Video URL:', selectedVideo.videoUrl);
                        }}
                        onLoadStart={() => {
                          console.log('Video loading started:', selectedVideo.videoUrl);
                        }}
                        onCanPlay={() => {
                          console.log('Video can play:', selectedVideo.videoUrl);
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        src={selectedVideo.videoUrl}
                        title={selectedVideo.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedVideo.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Duration: {formatDuration(selectedVideo.duration)}</span>
                      <span>Category: {selectedVideo.category}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-6">
                  {contentLoading ? (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
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
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No detailed content available</h3>
                        <p className="text-gray-600 dark:text-gray-400">Detailed content will be added by administrators.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="images" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Visual Learning Resources</h3>
                    {selectedVideo.keyImages ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {JSON.parse(selectedVideo.keyImages || '[]').map((image: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={image.description}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <p className="text-sm text-gray-700 font-medium">{image.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Visual resources will be available soon for this topic.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Volume2 className="h-6 w-6 text-uk-blue mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">AI Voice Narration</h3>
                    </div>
                    {selectedVideo.audioScript ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <Button
                            onClick={() => speakText(selectedVideo.audioScript || '', selectedVideo.id)}
                            className={`px-8 py-3 ${speaking === selectedVideo.id ? 'bg-uk-red hover:bg-uk-red/90' : 'bg-uk-blue hover:bg-uk-blue/90'}`}
                          >
                            {speaking === selectedVideo.id ? (
                              <>
                                <VolumeX className="h-5 w-5 mr-2" />
                                Stop Narration
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-5 w-5 mr-2" />
                                Play Narration
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium text-gray-900 mb-2">Audio Script:</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedVideo.audioScript}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 bg-white rounded-lg p-3">
                          <Volume2 className="h-4 w-4 mr-2" />
                          <span>Female British voice • Natural pace • Educational content</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Audio narration will be available soon for this topic.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="mt-6">
                  {resourcesLoading ? (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
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
                                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
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
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="text-center py-8">
                        <Download className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No resources available</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">Downloadable resources will be added by administrators.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Check back later for study materials and documents.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="notes" className="mt-6">
                  {contentLoading ? (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
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
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No notes available</h3>
                            <p className="text-gray-600 dark:text-gray-400">Instructor and student notes will be added by administrators.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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
    </section>
  );
}
