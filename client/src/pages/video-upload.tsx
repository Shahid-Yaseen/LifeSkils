import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Upload, VideoIcon, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const uploadFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  orderIndex: z.number().min(0, "Order index must be 0 or greater"),
  detailedContent: z.string().optional(),
  duration: z.number().min(1, "Duration must be greater than 0").optional(),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

const categories = [
  "Government",
  "History", 
  "Geography",
  "Culture",
  "Society",
  "Law",
  "Education",
  "Sports",
  "Arts",
  "Economy"
];

export default function VideoUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      orderIndex: 0,
      detailedContent: "",
      duration: undefined,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData & { file: File }) => {
      const formData = new FormData();
      formData.append('video', data.file);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('orderIndex', data.orderIndex.toString());
      if (data.detailedContent) {
        formData.append('detailedContent', data.detailedContent);
      }

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (result) => {
      setUploadStatus('success');
      setUploadedVideo(result.video);
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      
      toast({
        title: "Video uploaded successfully!",
        description: `${result.video.title} has been added to the video library.`,
      });

      // If duration was provided, update it
      if (form.getValues('duration')) {
        updateDurationMutation.mutate({
          videoId: result.video.id,
          duration: form.getValues('duration')!
        });
      }
    },
    onError: (error: Error) => {
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDurationMutation = useMutation({
    mutationFn: async ({ videoId, duration }: { videoId: string; duration: number }) => {
      const response = await fetch(`/api/videos/${videoId}/duration`, {
        method: 'PATCH',
        body: JSON.stringify({ duration }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update duration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Video duration updated",
        description: "Video duration has been set successfully.",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file (MP4, AVI, MOV, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 500MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setUploadStatus('idle');
      
      // Try to get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration);
        form.setValue('duration', duration);
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const onSubmit = (data: UploadFormData) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus('uploading');
    uploadMutation.mutate({ ...data, file: selectedFile });
  };

  const resetForm = () => {
    form.reset();
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Video Content
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Add educational video content to enhance the Life in UK test preparation experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VideoIcon className="h-5 w-5" />
                Video Upload Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video File</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="video-upload"
                        disabled={uploadStatus === 'uploading'}
                      />
                      {!selectedFile ? (
                        <label htmlFor="video-upload" className="cursor-pointer">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to select video file
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supports MP4, AVI, MOV (max 500MB)
                          </p>
                        </label>
                      ) : (
                        <div className="space-y-4">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-md mx-auto">
                            <video
                              src={URL.createObjectURL(selectedFile)}
                              className="w-full h-full object-contain"
                              controls
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFile(null);
                                form.setValue('duration', undefined);
                              }}
                              className="mt-2"
                            >
                              Choose Different File
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter video title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this video covers..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Order Index */}
                  <FormField
                    control={form.control}
                    name="orderIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Index</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Position in the video list (0 = first)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Auto-detected from video"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty to auto-detect from video file
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Detailed Content */}
                  <FormField
                    control={form.control}
                    name="detailedContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Content (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional educational content and context..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Rich text content about the topic covered in the video
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={!selectedFile || uploadStatus === 'uploading'}
                      className="flex-1"
                    >
                      {uploadStatus === 'uploading' ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Video
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      disabled={uploadStatus === 'uploading'}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Upload Status */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Status</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadStatus === 'idle' && (
                <div className="text-center py-8">
                  <VideoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Ready to upload video content</p>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="text-center py-8">
                  <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                  <p className="text-blue-600 font-medium">Uploading video...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                </div>
              )}

              {uploadStatus === 'success' && uploadedVideo && (
                <div className="py-8">
                  <div className="text-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-green-600 font-medium mb-2">Upload successful!</p>
                  </div>
                  
                  {/* Video Preview */}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      src={uploadedVideo.videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-left">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      {uploadedVideo.title}
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                      {uploadedVideo.description}
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                      <p>Category: {uploadedVideo.category}</p>
                      <p>Duration: {uploadedVideo.duration}s</p>
                      <p>File: {uploadedVideo.videoUrl}</p>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2 font-medium">
                        Next Steps:
                      </p>
                      <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                        <li>• Video is now available to students in the {uploadedVideo.category} section</li>
                        <li>• Students can access it from the main dashboard</li>
                        <li>• Video preview is shown above - this is how students will see it</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Upload failed</p>
                  <p className="text-gray-500 text-sm mt-2">Please try again or check the file format</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}