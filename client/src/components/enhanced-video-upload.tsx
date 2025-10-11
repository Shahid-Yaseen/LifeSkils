import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Video, 
  Youtube, 
  FileText, 
  Image, 
  Volume2, 
  CheckCircle, 
  AlertCircle, 
  X,
  Play,
  Pause,
  Loader2,
  Cloud,
  Link as LinkIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const videoUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  orderIndex: z.number().min(0, "Order index must be 0 or greater"),
  detailedContent: z.string().optional(),
  duration: z.number().min(1, "Duration must be greater than 0").optional(),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
});

type VideoUploadData = z.infer<typeof videoUploadSchema>;

const categories = [
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

interface VideoUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EnhancedVideoUpload({ onSuccess, onCancel }: VideoUploadProps) {
  const [uploadType, setUploadType] = useState<'file' | 'youtube'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VideoUploadData>({
    resolver: zodResolver(videoUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      orderIndex: 0,
      detailedContent: "",
      duration: 0,
      youtubeUrl: "",
      tags: "",
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      form.setValue("duration", 0); // Will be calculated on upload
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadVideoMutation = useMutation({
    mutationFn: async (data: VideoUploadData & { file?: File; youtubeUrl?: string }) => {
      if (uploadType === 'file' && data.file) {
        // Client-side upload for better performance
        const presignedResponse = await apiRequest("POST", "/api/videos/presigned-upload", {
          fileName: data.file.name,
          contentType: data.file.type,
        });
        
        if (!presignedResponse.ok) {
          throw new Error("Failed to get upload URL");
        }
        
        const { uploadUrl, key } = await presignedResponse.json();
        
        // Upload file directly to R2
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: data.file,
          headers: {
            "Content-Type": data.file.type,
          },
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("R2 upload failed:", errorText);
          throw new Error(`Failed to upload video to R2: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        // Create video record in database
        const videoData = {
          ...data,
          videoUrl: key,
          videoType: 'uploaded' as const,
        };
        
        return apiRequest("POST", "/api/videos", videoData);
      } else if (uploadType === 'youtube' && data.youtubeUrl) {
        const videoData = {
          ...data,
          videoUrl: data.youtubeUrl,
          videoType: 'youtube' as const,
        };
        
        return apiRequest("POST", "/api/videos", videoData);
      } else {
        throw new Error("Invalid upload type or missing data");
      }
    },
    onSuccess: (response) => {
      if (response.ok) {
        toast({
          title: "Video uploaded successfully!",
          description: "Your video has been added to the library.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
        setUploadedVideo(true);
        form.reset();
        setSelectedFile(null);
        setPreviewUrl(null);
        onSuccess?.();
      }
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VideoUploadData) => {
    if (uploadType === 'file' && !selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadType === 'youtube' && !data.youtubeUrl) {
      toast({
        title: "No YouTube URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadVideoMutation.mutate({
      ...data,
      file: selectedFile || undefined,
      youtubeUrl: data.youtubeUrl || undefined,
    });
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Educational Video</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Add videos to the educational library with rich content and progress tracking
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as 'file' | 'youtube')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            YouTube Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Cloud className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Click to upload video file
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Supports MP4, MOV, AVI formats up to 500MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Video className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {previewUrl && (
                    <div className="relative">
                      <video
                        src={previewUrl}
                        controls
                        className="w-full h-64 object-cover rounded-lg"
                        onLoadedMetadata={(e) => {
                          const duration = e.currentTarget.duration;
                          form.setValue("duration", Math.round(duration));
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5" />
                YouTube Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  YouTube URL
                </label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.watch("youtubeUrl")}
                  onChange={(e) => form.setValue("youtubeUrl", e.target.value)}
                />
                {form.watch("youtubeUrl") && (
                  <div className="mt-4">
                    <img
                      src={getYouTubeThumbnail(form.watch("youtubeUrl") || "") || ""}
                      alt="YouTube thumbnail"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Video Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter video title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter video description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first in the video list
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Video duration in seconds (auto-calculated for uploaded files)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="detailedContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed educational content, key points, or additional information"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Rich content that will be displayed alongside the video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags separated by commas"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Help students find this video (e.g., "government, politics, parliament")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Uploading video...</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Please wait while your video is being uploaded</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={uploadVideoMutation.isPending || isUploading}
              className="min-w-[120px]"
            >
              {uploadVideoMutation.isPending || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadType === 'file' ? 'Uploading...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadType === 'file' ? 'Upload Video' : 'Add YouTube Video'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
