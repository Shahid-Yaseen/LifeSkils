import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import {
  Upload,
  Book,
  FileText,
  Calendar,
  Gamepad2,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  Loader2,
} from "lucide-react";

interface BookItem {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  filePath: string;
  importantPointsPath: string | null;
  isProcessed: boolean;
  createdAt: string;
}

interface Summary {
  summaryText: string;
  chapterBreakdowns: Array<{
    chapterNumber: number;
    title: string;
    summary: string;
    keyPoints: string[];
  }>;
  keyTopics: string[];
  estimatedCounts: {
    tests: number;
    events: number;
    games: number;
  };
}

export default function AdminAIBookSuite() {
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [importantPointsFile, setImportantPointsFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingBookId, setProcessingBookId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ["/api/admin/ai-book/books"],
  });

  const { data: summaryData } = useQuery({
    queryKey: ["/api/admin/ai-book/books", selectedBookId, "summary"],
    enabled: !!selectedBookId,
  });

  const { data: generatedContentData } = useQuery({
    queryKey: ["/api/admin/ai-book/books", selectedBookId, "generated-content"],
    enabled: !!selectedBookId,
  });

  const books: BookItem[] = booksData?.books || [];
  const summary: Summary | null = summaryData?.summary || null;
  const generatedContent = generatedContentData || { tests: 0, events: 0, games: 0 };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!contentFile || !importantPointsFile || !title) {
        throw new Error("Both files and title are required");
      }

      const formData = new FormData();
      formData.append("contentFile", contentFile);
      formData.append("importantPointsFile", importantPointsFile);
      formData.append("title", title);
      formData.append("author", author);
      formData.append("description", description);

      const response = await fetch("/api/admin/ai-book/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: `Book "${data.book.title}" uploaded successfully with important points`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-book/books"] });
      setContentFile(null);
      setImportantPointsFile(null);
      setTitle("");
      setAuthor("");
      setDescription("");
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return apiRequest("POST", `/api/admin/ai-book/process/${bookId}`);
    },
    onSuccess: (data, bookId) => {
      setProcessingBookId(bookId);
      toast({
        title: "Processing started",
        description: "AI is analyzing the book and generating content. This may take several minutes.",
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-book/books"] });
        setProcessingBookId(null);
      }, 60000);
    },
    onError: (error: any) => {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessingBookId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return apiRequest("DELETE", `/api/admin/ai-book/books/${bookId}`);
    },
    onSuccess: () => {
      toast({
        title: "Book deleted",
        description: "Book and all generated content removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-book/books"] });
      setSelectedBookId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContentFile(e.target.files[0]);
    }
  };

  const handleImportantPointsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportantPointsFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    uploadMutation.mutate();
  };

  const handleProcess = (bookId: string) => {
    processMutation.mutate(bookId);
  };

  const handleDelete = (bookId: string) => {
    if (confirm("Are you sure you want to delete this book and all generated content?")) {
      deleteMutation.mutate(bookId);
    }
  };

  const handleDownload = (bookId: string) => {
    window.open(`/api/admin/ai-book/books/${bookId}/download-tests`, "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-8 h-8" />
              AI Book Intelligence Suite
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload books and automatically generate tests, timeline events, and games
            </p>
          </div>
        </div>

        <Card data-testid="card-upload-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Book
            </CardTitle>
            <CardDescription>
              Upload two files: (1) Main content PDF/DOCX and (2) Important points document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Two files required:</strong> Upload the main book/content file and a separate document listing the important points you want to extract content for.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentFile" data-testid="label-content-file" className="flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Main Content File (PDF or DOCX) *
                </Label>
                <Input
                  id="contentFile"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleContentFileChange}
                  data-testid="input-content-file"
                />
                {contentFile && (
                  <p className="text-sm text-green-600 dark:text-green-400" data-testid="text-content-file">
                    ✓ {contentFile.name} ({(contentFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="importantPointsFile" data-testid="label-important-points-file" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Important Points File (PDF or DOCX) *
                </Label>
                <Input
                  id="importantPointsFile"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleImportantPointsFileChange}
                  data-testid="input-important-points-file"
                />
                {importantPointsFile && (
                  <p className="text-sm text-green-600 dark:text-green-400" data-testid="text-important-points-file">
                    ✓ {importantPointsFile.name} ({(importantPointsFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" data-testid="label-title">Book Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter book title"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author" data-testid="label-author">Author</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter author name"
                  data-testid="input-author"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" data-testid="label-description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter book description"
                  rows={3}
                  data-testid="input-description"
                />
              </div>
            </div>

            {uploadProgress > 0 && (
              <Progress value={uploadProgress} className="w-full" data-testid="progress-upload" />
            )}

            <Button
              onClick={handleUpload}
              disabled={!contentFile || !importantPointsFile || !title || uploadMutation.isPending}
              className="w-full md:w-auto"
              data-testid="button-upload"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Book
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-books-list">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Uploaded Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="flex items-center justify-center py-8" data-testid="loader-books">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : books.length === 0 ? (
              <p className="text-gray-500 text-center py-8" data-testid="text-no-books">
                No books uploaded yet
              </p>
            ) : (
              <div className="space-y-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    data-testid={`card-book-${book.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2" data-testid={`text-book-title-${book.id}`}>
                          {book.title}
                          {book.isProcessed && (
                            <Badge variant="default" className="bg-green-600" data-testid={`badge-processed-${book.id}`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Processed
                            </Badge>
                          )}
                          {processingBookId === book.id && (
                            <Badge variant="secondary" data-testid={`badge-processing-${book.id}`}>
                              <Clock className="w-3 h-3 mr-1 animate-spin" />
                              Processing...
                            </Badge>
                          )}
                        </h3>
                        {book.author && <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-book-author-${book.id}`}>By {book.author}</p>}
                        {book.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" data-testid={`text-book-description-${book.id}`}>{book.description}</p>}
                        <div className="flex flex-col gap-1 mt-2 text-xs">
                          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1" data-testid={`text-content-file-${book.id}`}>
                            <Book className="w-3 h-3" />
                            Content: {book.filePath?.split('/').pop() || 'N/A'}
                          </p>
                          {book.importantPointsPath && (
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1" data-testid={`text-important-points-file-${book.id}`}>
                              <FileText className="w-3 h-3" />
                              Important Points: {book.importantPointsPath.split('/').pop()}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2" data-testid={`text-book-date-${book.id}`}>
                          Uploaded: {new Date(book.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!book.isProcessed && processingBookId !== book.id && (
                          <Button
                            onClick={() => handleProcess(book.id)}
                            variant="default"
                            size="sm"
                            disabled={processMutation.isPending}
                            data-testid={`button-process-${book.id}`}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Generate Content
                          </Button>
                        )}
                        {book.isProcessed && (
                          <>
                            <Button
                              onClick={() => setSelectedBookId(book.id)}
                              variant="outline"
                              size="sm"
                              data-testid={`button-view-${book.id}`}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View Summary
                            </Button>
                            <Button
                              onClick={() => handleDownload(book.id)}
                              variant="outline"
                              size="sm"
                              data-testid={`button-download-${book.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download Tests
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleDelete(book.id)}
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${book.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedBookId && summary && (
          <Card data-testid="card-summary-details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                AI-Generated Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2" data-testid="text-summary-heading">Book Summary</h3>
                <p className="text-gray-700 dark:text-gray-300" data-testid="text-summary-content">{summary.summaryText}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2" data-testid="text-key-topics-heading">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" data-testid={`badge-topic-${index}`}>
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4" data-testid="text-generated-content-heading">Generated Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card data-testid="card-tests-count">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-tests-count">{generatedContent.tests}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Practice Tests</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-events-count">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-events-count">{generatedContent.events}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Timeline Events</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-games-count">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Gamepad2 className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-games-count">{generatedContent.games}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Educational Games</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {summary.chapterBreakdowns && summary.chapterBreakdowns.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4" data-testid="text-chapters-heading">Chapter Breakdowns</h3>
                  <div className="space-y-3">
                    {summary.chapterBreakdowns.map((chapter, index) => (
                      <div key={index} className="border rounded-lg p-4" data-testid={`card-chapter-${index}`}>
                        <h4 className="font-medium mb-2" data-testid={`text-chapter-title-${index}`}>
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" data-testid={`text-chapter-summary-${index}`}>
                          {chapter.summary}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {chapter.keyPoints.map((point, pIndex) => (
                            <Badge key={pIndex} variant="outline" className="text-xs" data-testid={`badge-point-${index}-${pIndex}`}>
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
