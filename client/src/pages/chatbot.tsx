import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Bot, User, MessageCircle, ArrowLeft, Lightbulb, BookOpen, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  resources?: {
    type: 'video' | 'timeline' | 'game' | 'resource';
    title: string;
    url: string;
  }[];
}

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your Life in UK study assistant. I can help you with questions about British history, culture, government, and citizenship test preparation. What would you like to learn about?",
      timestamp: new Date(),
      suggestions: [
        "Tell me about the British Parliament",
        "What are the key historical periods?",
        "How does the UK government work?",
        "What should I know about British culture?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/chatbot/ask", { question });
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.answer,
        timestamp: new Date(),
        suggestions: data.suggestions || [],
        resources: data.resources || []
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    chatMutation.mutate(messageText);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'timeline': return <BookOpen className="h-4 w-4" />;
      case 'game': return <Lightbulb className="h-4 w-4" />;
      case 'resource': return <MapPin className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-uk-blue rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Life in UK Study Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Ask questions about British history, culture, and citizenship
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="h-[70vh] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat with Study Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className="w-8 h-8 bg-uk-blue rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-uk-blue text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                        {formatTime(message.timestamp)}
                      </div>

                      {/* Resources */}
                      {message.resources && message.resources.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Helpful Resources:
                          </p>
                          {message.resources.map((resource, index) => (
                            <Link key={index} href={resource.url}>
                              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                                {getResourceIcon(resource.type)}
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                  {resource.title}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {resource.type}
                                </Badge>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            You might also ask:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-uk-blue rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about British history, culture, government..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputMessage);
                    }
                  }}
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || chatMutation.isPending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Quick Help Topics:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "British Parliament",
                "Historical Timeline",
                "UK Geography",
                "Cultural Traditions",
                "Government System",
                "Citizenship Test",
                "Royal Family",
                "British Laws"
              ].map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(`Tell me about ${topic}`)}
                  className="text-left justify-start"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}