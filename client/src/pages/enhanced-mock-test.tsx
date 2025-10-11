import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft, ArrowRight, Trophy, Target, BarChart3, Timer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useEnhancedMockTest, 
  useSubmitMockTestAttempt, 
  useTestAttempts,
  getDifficultyColor, 
  getDifficultyLabel,
  calculateTestScore,
  formatTimeSpent,
  type EnhancedTest,
  type EnhancedQuestion
} from "@/hooks/useEnhancedTests";

export default function EnhancedMockTestPage() {
  const [match, params] = useRoute("/mock-test/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const testId = match ? params?.id : null;

  // Redirect to login if not authenticated
  if (!user) {
    return null;
  }
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);

  const { data: test, isLoading, error } = useEnhancedMockTest(testId ?? undefined);
  const submitAttempt = useSubmitMockTestAttempt();
  const { data: previousAttempts } = useTestAttempts(user.id, testId ?? undefined);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !isFinished && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished && testStarted) {
      handleFinishTest();
    }
  }, [timeLeft, isFinished, showResults, testStarted]);

  // Initialize answers array when test loads
  useEffect(() => {
    if ((test as unknown as EnhancedTest)?.questions) {
      setAnswers(new Array((test as unknown as EnhancedTest).questions.length).fill(-1));
    }
  }, [test]);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < ((test as unknown as EnhancedTest)?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] !== -1 ? answers[currentQuestion + 1] : null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] !== -1 ? answers[currentQuestion - 1] : null);
    }
  };

  const handleFinishTest = async () => {
    if (!test) return;
    
    setIsFinished(true);
    
    const testResults = calculateTestScore(answers, (test as unknown as EnhancedTest).questions);
    
    try {
      await submitAttempt.mutateAsync({
        userId: user.id,
        testId: (test as unknown as EnhancedTest).id,
        answers,
        timeSpent: (45 * 60) - timeLeft,
      });
      
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting mock test:', error);
      // Still show results even if submission fails
      setShowResults(true);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers(new Array((test as unknown as EnhancedTest)?.questions.length || 0).fill(-1));
    setTimeLeft(45 * 60);
    setIsFinished(false);
    setShowResults(false);
    setSelectedAnswer(null);
    setTestStarted(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading enhanced mock (test as unknown as EnhancedTest)...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <XCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Mock Test Not Found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">The requested mock test could not be found.</p>
            <Button onClick={() => setLocation("/mock-tests")} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
              Back to Mock Tests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-test screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{(test as unknown as EnhancedTest).title}</h1>
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">{(test as unknown as EnhancedTest).description}</p>
            </div>

            {/* Test Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">45</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">24</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Questions</div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardContent className="p-4 sm:p-6 text-center">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">75%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pass Mark</div>
                </CardContent>
              </Card>
            </div>

            {/* Test Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">Enhanced Mock Test Instructions</h3>
              <ul className="space-y-1 sm:space-y-2 text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
                <li>• This is a timed test with 45 minutes to complete 24 questions</li>
                <li>• You need to answer at least 18 questions correctly (75%) to pass</li>
                <li>• You can navigate between questions using the navigation buttons</li>
                <li>• The timer will start as soon as you begin the test</li>
                <li>• Enhanced features include detailed explanations and performance analytics</li>
                <li>• You can review all questions and answers after completing the test</li>
              </ul>
            </div>

            {/* Previous Attempts */}
            {previousAttempts && previousAttempts.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Your Previous Attempts</h3>
                <div className="space-y-2">
                  {previousAttempts.slice(0, 3).map((attempt, index) => (
                    <div key={attempt.id} className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Attempt {previousAttempts.length - index}
                      </span>
                      <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                        <span className={`font-medium ${attempt.passedTest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatTimeSpent(attempt.timeSpent)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleStartTest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                size="lg"
              >
                <Timer className="h-5 w-5 mr-2" />
                Start Enhanced Mock Test
              </Button>
              <Button 
                onClick={() => setLocation("/mock-tests")}
                variant="outline"
                className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                size="lg"
              >
                Back to Mock Tests
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = (test as unknown as EnhancedTest).questions[currentQuestion];
  const progress = ((currentQuestion + 1) / (test as unknown as EnhancedTest).questions.length) * 100;
  const answeredQuestions = answers.filter(answer => answer !== -1).length;

  if (showResults) {
    const testResults = calculateTestScore(answers, (test as unknown as EnhancedTest).questions);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Enhanced Results Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-4 ${
                testResults.passed 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {testResults.passed ? (
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {testResults.passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                {testResults.passed 
                  ? 'Excellent work! You\'re ready for the official (test as unknown as EnhancedTest).' 
                  : 'You need 75% to pass. Review the questions and try again.'
                }
              </p>
              
              {/* Enhanced Results Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{testResults.score}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Correct</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{testResults.totalQuestions - testResults.score}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{testResults.percentage}%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Score</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{formatTimeSpent((45 * 60) - timeLeft)}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Time Used</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Question Review */}
          <div className="space-y-4 mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Detailed Question Review</h3>
            {(test as unknown as EnhancedTest).questions.map((question: EnhancedQuestion, index: number) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              const isAnswered = userAnswer !== -1;
              
              return (
                <Card key={index} className={`${
                  isCorrect ? 'border-green-200 dark:border-green-600 bg-green-50/30 dark:bg-green-900/10' : 
                  isAnswered ? 'border-red-200 dark:border-red-600 bg-red-50/30 dark:bg-red-900/10' : 
                  'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-gray-900 dark:text-white">Question {index + 1}</CardTitle>
                      <div className="flex gap-2">
                        {isCorrect && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        {isAnswered && !isCorrect && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                        {!isAnswered && <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-700 dark:text-gray-300">{question.question}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => {
                        const isUserAnswer = userAnswer === optionIndex;
                        const isCorrectAnswer = question.correctAnswer === optionIndex;
                        
                        return (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border ${
                              isCorrectAnswer 
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-600' 
                                : isUserAnswer && !isCorrectAnswer
                                ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-600'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium mr-2 text-gray-900 dark:text-white">{String.fromCharCode(65 + optionIndex)}.</span>
                              <span className={`${isCorrectAnswer ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>{option}</span>
                              {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />}
                              {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 ml-auto" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-blue-800 dark:text-blue-100">
                          <strong className="text-blue-900 dark:text-blue-50">Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              onClick={resetTest}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Mock Test
            </Button>
            <Button 
              onClick={() => setLocation("/mock-tests")}
              variant="outline"
              className="w-full sm:flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back to Mock Tests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-4xl px-4 py-3 sm:py-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/mock-tests")}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{(test as unknown as EnhancedTest).title}</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{(test as unknown as EnhancedTest).category}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:space-x-4">
              <div className="flex items-center text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-600 dark:text-orange-400" />
                <span className={timeLeft < 300 ? "text-red-600 font-bold dark:text-red-400" : "text-gray-600 dark:text-gray-400"}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <Badge className={`${getDifficultyColor((test as unknown as EnhancedTest).difficulty)} text-xs`}>
                {getDifficultyLabel((test as unknown as EnhancedTest).difficulty)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-4xl px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {(test as unknown as EnhancedTest).questions.length}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {answeredQuestions} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto max-w-4xl p-4">
        {/* Quick Navigation - Always Visible */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center justify-center">
            <Button
              size="sm"
              onClick={handleFinishTest}
              disabled={answeredQuestions < (test as unknown as EnhancedTest).questions.length}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              Submit Test
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentQuestion === (test as unknown as EnhancedTest).questions.length - 1}
            className="w-full sm:w-auto border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">
              {currentQ.question}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Category: {currentQ.category}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3">
              {currentQ.options.map((option: string, index: number) => (
                <button
                  key={index}
                  className={`w-full p-3 sm:p-4 text-left border-2 rounded-lg transition-colors ${
                    selectedAnswer === index
                      ? "bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                      : "bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm sm:text-base text-gray-900 dark:text-white">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation - Duplicate for convenience */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Previous
          </Button>

          <Button
            variant="ghost"
            onClick={handleNext}
            disabled={currentQuestion === (test as unknown as EnhancedTest).questions.length - 1}
            className="w-full sm:w-auto dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
