import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MobileNav from '@/components/mobile-nav';
import FloatingChatbot from '@/components/floating-chatbot';
import { Loader2, BookOpen, Brain, FileText, HelpCircle } from 'lucide-react';

export default function RAGLearningPage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [timelineContent, setTimelineContent] = useState<any>(null);
  const [studyGuide, setStudyGuide] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'study' | 'questions'>('timeline');

  const generateContent = async (type: 'timeline' | 'study' | 'questions') => {
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const endpoint = type === 'timeline' ? '/api/rag/timeline' : 
                     type === 'study' ? '/api/rag/study-guide' : 
                     '/api/rag/questions';
      
      const body = type === 'questions' ? { topic, difficulty } : { topic };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      
      if (type === 'timeline') {
        setTimelineContent(data);
        setActiveTab('timeline');
      } else if (type === 'study') {
        setStudyGuide(data);
        setActiveTab('study');
      } else {
        setQuestions(data);
        setActiveTab('questions');
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Learning</h1>
        <p className="text-gray-600">
          Generate personalized study content using our RAG system powered by your study materials.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generate Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
                <Input
              placeholder="Enter a topic (e.g., Norman Conquest, UK Government, British History)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => generateContent('timeline')}
              disabled={isLoading || !topic.trim()}
              className="flex items-center gap-2"
            >
              {isLoading && activeTab === 'timeline' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              Timeline Entry
            </Button>
            
            <Button
              onClick={() => generateContent('study')}
              disabled={isLoading || !topic.trim()}
              className="flex items-center gap-2"
            >
              {isLoading && activeTab === 'study' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Study Guide
            </Button>
            
            <Button
              onClick={() => generateContent('questions')}
              disabled={isLoading || !topic.trim()}
              className="flex items-center gap-2"
            >
              {isLoading && activeTab === 'questions' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <HelpCircle className="h-4 w-4" />
              )}
              Practice Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Content */}
      {timelineContent && (
        <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Timeline Entry: {timelineContent.title}
                </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">Year: {timelineContent.year}</Badge>
              <Badge variant="outline">Category: {timelineContent.category}</Badge>
              <Badge variant="outline">Importance: {timelineContent.importance}/5</Badge>
            </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{timelineContent.description}</p>
              </div>
              
              {timelineContent.details && (
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                    __html: timelineContent.details.replace(/\n/g, '<br>') 
                  }} />
                        </div>
              )}
              
              {timelineContent.keyFigures && (
                <div>
                  <h4 className="font-semibold mb-2">Key Figures</h4>
                  <p className="text-gray-700">{timelineContent.keyFigures}</p>
                </div>
              )}
                </div>
              </CardContent>
            </Card>
          )}

      {/* Study Guide */}
      {studyGuide && (
        <Card className="mb-6">
                      <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Study Guide: {studyGuide.topic}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">Generated: {new Date(studyGuide.generatedAt).toLocaleDateString()}</Badge>
              <Badge variant="outline">Source Chunks: {studyGuide.sourceChunks}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
              __html: studyGuide.content.replace(/\n/g, '<br>') 
            }} />
                      </CardContent>
                    </Card>
      )}

      {/* Practice Questions */}
      {questions.length > 0 && (
        <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Practice Questions ({questions.length})
                      </CardTitle>
                    </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">
                    {index + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-2 mb-4">
                    {question.options?.map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <span className="font-medium">
                          {String.fromCharCode(65 + optionIndex)}.
                                    </span>
                        <span>{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <Badge variant="default" className="ml-2">Correct</Badge>
                                )}
                              </div>
                      ))}
                    </div>
                  
                  {question.explanation && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
                            ))}
                          </div>
          </CardContent>
        </Card>
      )}

      {/* No content message */}
      {!timelineContent && !studyGuide && questions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Ready to Learn?</h3>
            <p className="text-gray-600 mb-4">
              Enter a topic above and generate personalized study content using our AI-powered system.
            </p>
            <div className="text-sm text-gray-500">
              <p>Try topics like:</p>
              <ul className="mt-2 space-y-1">
                <li>• Norman Conquest</li>
                <li>• UK Government</li>
                <li>• British History</li>
                <li>• Magna Carta</li>
                <li>• Industrial Revolution</li>
              </ul>
                      </div>
                    </CardContent>
                  </Card>
      )}

      <MobileNav />
      <FloatingChatbot />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
    </div>
  );
}