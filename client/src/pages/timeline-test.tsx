import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  Users,
  Trophy,
  Music,
  BookOpen,
  PartyPopper,
  Crown,
  FileText,
  Vote,
  Map,
  ShoppingCart,
  Palette,
  Lightbulb,
  Church,
  Clock,
  CheckCircle,
  XCircle,
  Shuffle,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  details?: string;
  category: string;
  importance: number;
  keyFigures?: string;
  timelineTopic: string;
}

interface MatchingItem {
  id: string;
  title: string;
  match: string;
}

interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

const TIMELINE_TOPICS = [
  { id: "population-migration", title: "Population & Migration", icon: Users },
  { id: "sports-athletics", title: "Sports & Athletics", icon: Trophy },
  { id: "literature", title: "Literature & Writers", icon: BookOpen },
  { id: "british-holidays", title: "British Holidays & Traditions", icon: PartyPopper },
  { id: "british-sports", title: "British Sports Heritage", icon: Trophy },
  { id: "parliament", title: "Evolution of Parliament", icon: Crown },
  { id: "documents", title: "Important Historical Documents", icon: FileText },
  { id: "voting_rights", title: "Evolution of Voting Rights", icon: Vote },
  { id: "territories", title: "Territorial Evolution", icon: Map },
  { id: "trades", title: "Trade and Economic History", icon: ShoppingCart },
  { id: "arts", title: "Arts & Visual Culture", icon: Palette },
  { id: "inventions", title: "Inventions & Discoveries", icon: Lightbulb },
  { id: "church", title: "Church Evolution", icon: Church },
  { id: "historical", title: "Historical Timeline", icon: Clock }
];

export default function TimelineTestPage() {
  const params = useParams();
  const topicId = params.topicId;
  const [, setLocation] = useLocation();
  const [gameMode, setGameMode] = useState<'menu' | 'matching' | 'truefalse'>('menu');
  const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([]);
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<TrueFalseQuestion[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<{[key: string]: string}>({});
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [shuffledRightItems, setShuffledRightItems] = useState<MatchingItem[]>([]);
  const [currentTrueFalseIndex, setCurrentTrueFalseIndex] = useState(0);
  const [trueFalseAnswers, setTrueFalseAnswers] = useState<{[key: string]: boolean}>({});
  const [showResults, setShowResults] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const topicData = TIMELINE_TOPICS.find(topic => topic.id === topicId);

  const { data: events, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['/api/timeline', topicId],
    queryFn: async () => {
      const response = await fetch(`/api/timeline?topic=${topicId}`);
      if (!response.ok) throw new Error('Failed to fetch timeline events');
      return response.json();
    },
    enabled: !!topicId
  });

  const generateMatchingGame = () => {
    if (!events || events.length === 0) return;
    
    // Create matching pairs from timeline events
    const items: MatchingItem[] = events.slice(0, 8).map(event => ({
      id: event.id,
      title: event.title,
      match: `${event.year} - ${event.category}`
    }));
    
    // Shuffle the right column items for analytical thinking
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    
    setMatchingItems(items);
    setShuffledRightItems(shuffled);
    setSelectedMatches({});
    setSelectedLeftItem(null);
    setMatchedPairs(new Set());
    setShowResults(false);
    setGameComplete(false);
    setGameMode('matching');
  };

  const generateTrueFalseGame = () => {
    if (!events || events.length === 0) return;
    
    const questions: TrueFalseQuestion[] = [];
    
    // Generate true statements
    events.slice(0, 6).forEach(event => {
      questions.push({
        id: `true-${event.id}`,
        statement: `${event.title} occurred in ${event.year}.`,
        isTrue: true,
        explanation: `Correct! ${event.title} did occur in ${event.year}. ${event.description}`
      });
    });
    
    // Generate false statements by mixing years
    if (events.length >= 4) {
      questions.push({
        id: `false-1`,
        statement: `${events[0].title} occurred in ${events[1].year}.`,
        isTrue: false,
        explanation: `False! ${events[0].title} actually occurred in ${events[0].year}, not ${events[1].year}.`
      });
      
      questions.push({
        id: `false-2`,
        statement: `${events[2].title} occurred in ${events[3].year}.`,
        isTrue: false,
        explanation: `False! ${events[2].title} actually occurred in ${events[2].year}, not ${events[3].year}.`
      });
    }
    
    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 8);
    
    setTrueFalseQuestions(shuffledQuestions);
    setCurrentTrueFalseIndex(0);
    setTrueFalseAnswers({});
    setShowResults(false);
    setGameComplete(false);
    setGameMode('truefalse');
  };

  const handleLeftItemClick = (itemId: string) => {
    if (matchedPairs.has(itemId)) return; // Don't allow reselection of matched items
    setSelectedLeftItem(itemId);
  };

  const handleRightItemClick = (matchValue: string) => {
    if (!selectedLeftItem) return;
    
    // Check if this is a correct match
    const leftItem = matchingItems.find(item => item.id === selectedLeftItem);
    if (leftItem && leftItem.match === matchValue) {
      // Correct match!
      setSelectedMatches(prev => ({
        ...prev,
        [selectedLeftItem]: matchValue
      }));
      setMatchedPairs(prev => new Set([...Array.from(prev), selectedLeftItem]));
      setSelectedLeftItem(null);
      
      // Trigger confetti for correct match
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      
      // Check if all matches are complete
      if (matchedPairs.size + 1 === matchingItems.length) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          setGameComplete(true);
        }, 500);
      }
    } else {
      // Incorrect match - just clear selection
      setSelectedLeftItem(null);
    }
  };

  const checkMatchingResults = () => {
    const allMatched = matchingItems.every(item => selectedMatches[item.id] === item.match);
    if (allMatched) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setShowResults(true);
    setGameComplete(allMatched);
  };

  const handleTrueFalseAnswer = (answer: boolean) => {
    const currentQuestion = trueFalseQuestions[currentTrueFalseIndex];
    setTrueFalseAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    if (currentTrueFalseIndex < trueFalseQuestions.length - 1) {
      setCurrentTrueFalseIndex(prev => prev + 1);
    } else {
      // Game complete, show results
      setShowResults(true);
      const correctAnswers = trueFalseQuestions.filter(q => 
        trueFalseAnswers[q.id] === q.isTrue || 
        (currentQuestion.id === q.id && answer === q.isTrue)
      ).length;
      
      if (correctAnswers >= trueFalseQuestions.length * 0.8) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setGameComplete(true);
    }
  };

  const resetGame = () => {
    setGameMode('menu');
    setSelectedMatches({});
    setSelectedLeftItem(null);
    setMatchedPairs(new Set());
    setTrueFalseAnswers({});
    setCurrentTrueFalseIndex(0);
    setShowResults(false);
    setGameComplete(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl p-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">No Timeline Data Available</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                There are no events available for this timeline topic yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/timeline')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Timeline
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const IconComponent = topicData?.icon || Clock;

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto max-w-6xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/timeline')}
                  className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Timeline
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline Test: {topicData?.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Test your knowledge with games based on this timeline</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                {events.length} Events Available
              </Badge>
            </div>
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="container mx-auto max-w-4xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Shuffle className="h-6 w-6 text-green-700 dark:text-green-300" />
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-white">
                  Matching Cards Game
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Match historical events with their years and categories. Test your knowledge of when key events occurred.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors" 
                  variant="outline"
                  onClick={generateMatchingGame}
                >
                  Start Matching Game
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300 group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-white">
                  True or False Challenge
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Answer true or false questions about historical events, dates, and facts from this timeline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors" 
                  variant="outline"
                  onClick={generateTrueFalseGame}
                >
                  Start True/False Game
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'matching') {
    const allAnswered = matchingItems.every(item => selectedMatches[item.id]);
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="mb-6 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={resetGame}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Matching Cards: {topicData?.title}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(selectedMatches).length} / {matchingItems.length} matched
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Events Column (Left) */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-center text-gray-900 dark:text-white">Historical Events</h3>
              <div className="space-y-3">
                {/* Unmatched items first */}
                {matchingItems.filter(item => !matchedPairs.has(item.id)).map(item => (
                  <Card 
                    key={item.id}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                      selectedLeftItem === item.id 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-900 shadow-lg transform scale-105' 
                        : 'hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    onClick={() => handleLeftItemClick(item.id)}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to select</div>
                  </Card>
                ))}
                
                {/* Matched items at bottom */}
                {matchingItems.filter(item => matchedPairs.has(item.id)).map(item => (
                  <Card 
                    key={item.id}
                    className="p-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 opacity-75"
                  >
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">{item.title}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Matched with: {selectedMatches[item.id]}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Years & Categories Column (Right) */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-center text-gray-900 dark:text-white">Years & Categories</h3>
              <div className="space-y-3">
                {/* Unmatched items first (shuffled) */}
                {shuffledRightItems.filter(item => !matchedPairs.has(item.id)).map(item => (
                  <Card 
                    key={`match-${item.id}`}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                      selectedLeftItem 
                        ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
                        : 'hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleRightItemClick(item.match)}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.match}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {selectedLeftItem ? 'Click to match' : 'Select an event first'}
                    </div>
                  </Card>
                ))}
                
                {/* Matched items at bottom */}
                {shuffledRightItems.filter(item => matchedPairs.has(item.id)).map(item => (
                  <Card 
                    key={`match-${item.id}`}
                    className="p-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 opacity-75"
                  >
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">{item.match}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Matched successfully!</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center space-y-4">
            {/* Game Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progress: {matchedPairs.size} / {matchingItems.length} matches
              </div>
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${(matchedPairs.size / matchingItems.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Instructions */}
            {matchedPairs.size === 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How to play:</strong><br/>
                  1. Click an event in the left column<br/>
                  2. Click its matching year & category in the right column<br/>
                  3. Correct matches will move to the bottom with confetti!
                </div>
              </div>
            )}
            
            {gameComplete && (
              <div className="space-y-4">
                <div className="text-xl font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                  🎉 Congratulations! Perfect Score!<br/>
                  <span className="text-sm font-normal">You matched all {matchingItems.length} events correctly!</span>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={generateMatchingGame} 
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                  <Button 
                    onClick={resetGame}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Back to Menu
                  </Button>
                </div>
              </div>
            )}

            {/* Selected item indicator */}
            {selectedLeftItem && !gameComplete && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 max-w-md mx-auto">
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  Selected: <strong>{matchingItems.find(item => item.id === selectedLeftItem)?.title}</strong><br/>
                  Now click its matching year & category on the right →
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'truefalse') {
    const currentQuestion = trueFalseQuestions[currentTrueFalseIndex];
    const totalAnswered = Object.keys(trueFalseAnswers).length;
    
    if (showResults) {
      const correctAnswers = trueFalseQuestions.filter(q => 
        trueFalseAnswers[q.id] === q.isTrue
      ).length;
      const percentage = Math.round((correctAnswers / trueFalseQuestions.length) * 100);
      
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto max-w-4xl p-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className={`text-2xl ${percentage >= 80 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {percentage >= 80 ? '🎉 Excellent!' : '📚 Keep Learning!'}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  You got {correctAnswers} out of {trueFalseQuestions.length} questions correct ({percentage}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trueFalseQuestions.map(question => (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-start space-x-3">
                      {trueFalseAnswers[question.id] === question.isTrue ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1 text-gray-900 dark:text-white">{question.statement}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{question.explanation}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center space-x-4 pt-4">
                  <Button 
                    onClick={generateTrueFalseGame} 
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={resetGame}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Back to Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="mb-6 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={resetGame}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">True or False: {topicData?.title}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentTrueFalseIndex + 1} / {trueFalseQuestions.length}
            </div>
          </div>

          <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-gray-900 dark:text-white">
                {currentQuestion?.statement}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-8">
                <Button 
                  onClick={() => handleTrueFalseAnswer(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  True
                </Button>
                <Button 
                  onClick={() => handleTrueFalseAnswer(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                  size="lg"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  False
                </Button>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((totalAnswered + 1) / trueFalseQuestions.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}