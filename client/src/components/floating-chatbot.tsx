import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Bot, User, MessageCircle, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your Life in UK study assistant. I can help with questions about British history, government, culture, and citizenship test preparation. What would you like to learn?",
      timestamp: new Date(),
      suggestions: [
        "How does the UK Parliament work?",
        "Tell me about British history",
        "What are British values?"
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
      case 'video': return "🎥";
      case 'timeline': return "📚";
      case 'game': return "🎮";
      case 'resource': return "📄";
      default: return "📖";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-2 sm:right-4 z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isMinimized ? 'w-72 sm:w-80 h-16' : 'w-80 sm:w-96 h-[400px] sm:h-[500px] max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 dark:bg-blue-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div>
              <p className="font-medium text-xs sm:text-sm">Study Assistant</p>
              <p className="text-xs text-blue-100 dark:text-blue-200">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content - Hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <ScrollArea className="h-64 sm:h-80 p-2 sm:p-3">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[90%] sm:max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm leading-relaxed ${
                          message.type === 'user'
                            ? 'bg-blue-600 dark:bg-blue-700 text-white rounded-br-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
                      </div>
                      
                      <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                        {formatTime(message.timestamp)}
                      </div>

                      {/* Resources */}
                      {message.resources && message.resources.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.resources.map((resource, index) => (
                            <Link key={index} href={resource.url}>
                              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800">
                                <span className="flex-shrink-0">{getResourceIcon(resource.type)}</span>
                                <span className="text-blue-700 dark:text-blue-300 flex-1 min-w-0 break-words">
                                  {resource.title}
                                </span>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200 flex-shrink-0">
                                  {resource.type}
                                </Badge>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.slice(0, 2).map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs h-auto min-h-8 px-3 py-2 w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left break-words"
                            >
                              <span className="break-words">{suggestion}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {message.type === 'user' && (
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
              <div className="flex gap-1 sm:gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about British history, government, culture, citizenship..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputMessage);
                    }
                  }}
                  disabled={chatMutation.isPending}
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
                <Button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || chatMutation.isPending}
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}