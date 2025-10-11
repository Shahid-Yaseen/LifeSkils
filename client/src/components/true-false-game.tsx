import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, RotateCcw, CheckCircle, XCircle, Trophy } from "lucide-react";
import { celebrateWithTheme, celebrateGameComplete } from "@/lib/confetti";

interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  category: string;
}

const trueFalseQuestions: TrueFalseQuestion[] = [
  {
    id: "1",
    statement: "The UK has been a member of the European Union since 1973.",
    isTrue: false,
    explanation: "The UK joined the European Economic Community (EEC) in 1973, which later became the EU. However, the UK left the EU in 2020 following Brexit.",
    category: "Politics"
  },
  {
    id: "2", 
    statement: "You must be 18 or over to vote in UK general elections.",
    isTrue: true,
    explanation: "The minimum voting age for UK general elections is 18. This applies to elections for the House of Commons.",
    category: "Politics"
  },
  {
    id: "3",
    statement: "The Union Flag is made up of three crosses representing England, Scotland, and Wales.",
    isTrue: false,
    explanation: "The Union Flag combines the crosses of England (St George), Scotland (St Andrew), and Northern Ireland (St Patrick). Wales is not represented as it was already united with England when the flag was created.",
    category: "History"
  },
  {
    id: "4",
    statement: "The Queen's official birthday is celebrated in June with Trooping the Colour.",
    isTrue: true,
    explanation: "Although the monarch's actual birthday varies, the official birthday is celebrated on the second Saturday in June with the Trooping the Colour ceremony.",
    category: "Traditions"
  },
  {
    id: "5",
    statement: "Scotland has its own banknotes which are legal tender throughout the UK.",
    isTrue: true,
    explanation: "Scottish banks issue their own banknotes which are legal tender throughout the UK, although some businesses may be unfamiliar with them.",
    category: "Economy"
  },
  {
    id: "6",
    statement: "The Industrial Revolution began in Britain in the 18th century.",
    isTrue: true,
    explanation: "The Industrial Revolution started in Britain around 1760-1840, transforming manufacturing, transportation, and society.",
    category: "History"
  },
  {
    id: "7",
    statement: "In the UK, you can get married at 16 without parental consent.",
    isTrue: false,
    explanation: "In England, Wales and Northern Ireland, you need to be 18 to marry without parental consent. In Scotland, you can marry at 16 without parental consent.",
    category: "Law"
  },
  {
    id: "8",
    statement: "The BBC is funded by a television licence fee paid by UK households.",
    isTrue: true,
    explanation: "The BBC's main funding comes from the television licence fee, which UK households must pay if they watch live TV or use BBC iPlayer.",
    category: "Media"
  },
  {
    id: "9",
    statement: "The House of Lords can permanently block legislation passed by the House of Commons.",
    isTrue: false,
    explanation: "The House of Lords can delay legislation but cannot permanently block it. They can only delay most bills for up to one year.",
    category: "Politics"
  },
  {
    id: "10",
    statement: "Christmas Day and Boxing Day are both bank holidays in the UK.",
    isTrue: true,
    explanation: "Both Christmas Day (25 December) and Boxing Day (26 December) are bank holidays throughout the UK.",
    category: "Traditions"
  },
  {
    id: "11",
    statement: "The UK Parliament is located in Westminster Palace in London.",
    isTrue: true,
    explanation: "The UK Parliament meets in the Palace of Westminster, also known as the Houses of Parliament, located in London.",
    category: "Politics"
  },
  {
    id: "12",
    statement: "Cricket was invented in England and is considered the national summer sport.",
    isTrue: true,
    explanation: "Cricket originated in England and is widely considered the national summer sport, with football being the national winter sport.",
    category: "Sport"
  },
  {
    id: "13",
    statement: "The NHS was established immediately after World War I in 1919.",
    isTrue: false,
    explanation: "The National Health Service (NHS) was established in 1948, after World War II, not World War I.",
    category: "History"
  },
  {
    id: "14",
    statement: "William Shakespeare was born in Stratford-upon-Avon in England.",
    isTrue: true,
    explanation: "William Shakespeare was born in Stratford-upon-Avon, Warwickshire, England in 1564.",
    category: "Culture"
  },
  {
    id: "15",
    statement: "The driving age in the UK is 17 for cars and 16 for mopeds.",
    isTrue: true,
    explanation: "You can get a provisional driving licence and start learning to drive a car at 17, and ride a moped at 16.",
    category: "Law"
  }
];

interface TrueFalseGameProps {
  userId: string;
}

export default function TrueFalseGame({ userId }: TrueFalseGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [gameStarted, setGameStarted] = useState(false);

  const categories = ["All", ...Array.from(new Set(trueFalseQuestions.map(q => q.category)))];
  
  const filteredQuestions = selectedCategory === "All" 
    ? trueFalseQuestions 
    : trueFalseQuestions.filter(q => q.category === selectedCategory);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const totalQuestions = filteredQuestions.length;
  const questionsAnswered = answeredQuestions.size;

  useEffect(() => {
    // Reset game when category changes
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setGameStarted(false);
  }, [selectedCategory]);

  const handleAnswerSelect = (answer: boolean) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestion.isTrue;
    
    if (isCorrect) {
      celebrateWithTheme('general');
      setScore(prev => prev + 1);
    }
    
    setAnsweredQuestions(prev => new Set(Array.from(prev).concat(currentQuestion.id)));
    
    // Show explanation after a brief delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      // Game completed
      setTimeout(() => celebrateGameComplete(), 500);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setGameStarted(false);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const isGameComplete = questionsAnswered === totalQuestions;
  const accuracy = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;

  if (!gameStarted) {
    return (
      <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="text-white" size={16} />
            </div>
            True or False Challenge
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Test Your Knowledge</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Answer True or False to statements from the Life in UK test. Get correct answers to see celebratory confetti!
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose Category:
                </label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs dark:text-white text-black px-2 py-1"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">{filteredQuestions.length}</strong> questions available in {selectedCategory === "All" ? "all categories" : selectedCategory}
                </p>
              </div>
              
              <Button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <CheckCircle className="mr-2" size={20} />
                Start Challenge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isGameComplete) {
    return (
      <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <div className="w-6 h-6 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
              <Trophy className="text-white" size={16} />
            </div>
            Challenge Complete!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Well Done!</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">You've completed all questions in this category.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
                <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Correct</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{accuracy}%</div>
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Accuracy</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={resetGame}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                <RotateCcw className="mr-2" size={16} />
                Play Again
              </Button>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Try a different category or challenge yourself again!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="text-white" size={16} />
            </div>
            True or False Challenge
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            {selectedCategory}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>Score: {score}/{questionsAnswered}</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          
          {/* Question */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-900 dark:text-white font-medium leading-relaxed">
                {currentQuestion.statement}
              </p>
            </div>
            
            {/* Answer Buttons */}
            {!showResult && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button
                  onClick={() => handleAnswerSelect(true)}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 text-base sm:text-lg"
                  disabled={showResult}
                >
                  <Check className="mr-1 sm:mr-2" size={16} />
                  <span className="hidden sm:inline">True</span>
                  <span className="sm:hidden">✓</span>
                </Button>
                <Button
                  onClick={() => handleAnswerSelect(false)}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 text-base sm:text-lg"
                  disabled={showResult}
                >
                  <X className="mr-1 sm:mr-2" size={16} />
                  <span className="hidden sm:inline">False</span>
                  <span className="sm:hidden">✗</span>
                </Button>
              </div>
            )}
            
            {/* Result */}
            {showResult && (
              <div className="space-y-4">
                <div className={`rounded-lg p-3 sm:p-4 text-center ${
                  selectedAnswer === currentQuestion.isTrue 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {selectedAnswer === currentQuestion.isTrue ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">Correct! 🎉</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-600" size={20} />
                        <span className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200">Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    The correct answer is: <strong className="text-gray-900 dark:text-white">{currentQuestion.isTrue ? "True" : "False"}</strong>
                  </p>
                </div>
                
                {showExplanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm sm:text-base">Explanation:</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm">{currentQuestion.explanation}</p>
                  </div>
                )}
                
                <Button
                  onClick={nextQuestion}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 text-sm sm:text-base"
                >
                  {currentQuestionIndex < filteredQuestions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              </div>
            )}
          </div>
          
          {/* Reset Button */}
          <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RotateCcw className="mr-2" size={16} />
              Reset Game
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}