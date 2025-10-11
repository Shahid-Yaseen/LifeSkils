import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, RotateCcw, CheckCircle, XCircle, Sparkles, Lightbulb, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIExercisesGameProps {
  userId: string;
}

export default function AIExercisesGame({ userId }: AIExercisesGameProps) {
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [parsedChoices, setParsedChoices] = useState<Array<{id: string, options: string[], correct: string}>>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: exercises = [] } = useQuery({
    queryKey: ["/api/exercises", userId],
  });

  const generateExerciseMutation = useMutation({
    mutationFn: async ({ topic, difficulty }: { topic: string; difficulty?: number }) => {
      const response = await apiRequest("POST", "/api/exercises/generate", {
        userId,
        topic,
        difficulty: difficulty || 1
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentExercise(data);
      setUserAnswers({});
      setShowFeedback(false);
      setScore({ correct: 0, total: 0 });
      
      // Parse inline choices from the text and reset user answers
      let choices: Array<{id: string, options: string[], correct: string}> = [];
      if (data.content?.text) {
        choices = parseInlineChoices(data.content.text);
        setParsedChoices(choices);
        
        // Pre-fill answers with first option (correct answer) to show text properly
        const initialAnswers: Record<string, string> = {};
        choices.forEach((choice) => {
          initialAnswers[choice.id] = choice.options[0];
        });
        setUserAnswers(initialAnswers);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/exercises", userId] });
      
      toast({
        title: "New Exercise Generated!",
        description: `${selectedTopic} passage created with ${choices.length} interactive words to complete.`
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate new exercise. Please try again.",
        variant: "destructive"
      });
    }
  });

  const submitAttemptMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      const response = await apiRequest("POST", "/api/exercises/attempt", attemptData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises/attempts", userId] });
      toast({
        title: "Exercise Completed!",
        description: `Your score: ${score.correct}/${score.total}`
      });
    }
  });

  const topics = [
    { value: "British Government", icon: "🏛️", description: "Parliament, Prime Ministers, political system" },
    { value: "UK History", icon: "📜", description: "From Roman Britain to modern times" },
    { value: "British Culture", icon: "🎭", description: "Arts, traditions, festivals, literature" },
    { value: "British Values", icon: "⚖️", description: "Democracy, rule of law, liberty, tolerance" },
    { value: "UK Geography", icon: "🗺️", description: "Countries, cities, landmarks, demographics" },
    { value: "Sports & Achievements", icon: "🏆", description: "British sports history and heroes" },
    { value: "Laws & Justice", icon: "⚖️", description: "Legal system, courts, police" }
  ];

  const difficulties = [
    { value: 1, label: "Beginner", color: "bg-green-100 text-green-800", description: "Basic knowledge, 8-10 questions" },
    { value: 2, label: "Intermediate", color: "bg-blue-100 text-blue-800", description: "Standard level, 10-12 questions" },
    { value: 3, label: "Advanced", color: "bg-purple-100 text-purple-800", description: "Challenge mode, 12 questions" }
  ];

  const handleGenerateExercise = () => {
    if (!selectedTopic) {
      toast({
        title: "Select a Topic",
        description: "Please choose a topic before generating an exercise.",
        variant: "destructive"
      });
      return;
    }
    generateExerciseMutation.mutate({ topic: selectedTopic, difficulty: selectedDifficulty });
  };

  // Function to parse inline choices from text
  const parseInlineChoices = (text: string) => {
    const choiceRegex = /\{([^}]+)\}/g;
    const choices: Array<{id: string, options: string[], correct: string}> = [];
    let match;
    let index = 0;
    
    while ((match = choiceRegex.exec(text)) !== null) {
      const options = match[1].split('|');
      if (options.length >= 2) {
        choices.push({
          id: `choice_${index}`,
          options: options,
          correct: options[0] // First option is always correct
        });
        index++;
      }
    }
    
    return choices;
  };

  // Function to render text with clickable word choices
  const renderTextWithChoices = (text: string) => {
    const choiceRegex = /\{([^}]+)\}/g;
    const parts: Array<string | JSX.Element> = [];
    let lastIndex = 0;
    let match;
    let choiceIndex = 0;
    
    while ((match = choiceRegex.exec(text)) !== null) {
      // Add text before the choice
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const options = match[1].split('|');
      const choiceId = `choice_${choiceIndex}`;
      const currentSelection = userAnswers[choiceId];
      const isAnswered = !!currentSelection;
      const isCorrect = currentSelection === options[0];
      
      // Add clickable word with dropdown menu
      parts.push(
        <span key={choiceId} className="relative inline-block">
          <Select
            value={currentSelection || options[0]} // Show first option as default
            onValueChange={(value) => handleAnswerChange(choiceId, value)}
            disabled={showFeedback}
          >
            <SelectTrigger className={`inline-flex h-auto px-2 py-1 text-base font-medium rounded border-2 border-dashed cursor-pointer transition-all ${
              showFeedback 
                ? isCorrect
                  ? 'border-green-500 bg-green-100 text-green-800'
                  : isAnswered && !isCorrect
                  ? 'border-red-500 bg-red-100 text-red-800'
                  : 'border-gray-400 bg-gray-100 text-gray-600'
                : isAnswered
                ? 'border-blue-500 bg-blue-100 text-blue-800'
                : 'border-indigo-400 bg-indigo-50 text-indigo-700 hover:border-indigo-600 hover:bg-indigo-100'
            }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      );
      
      lastIndex = match.index + match[0].length;
      choiceIndex++;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  const handleAnswerChange = (choiceId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [choiceId]: answer
    }));
  };

  const handleSubmitExercise = () => {
    if (!currentExercise || Object.keys(userAnswers).length === 0 || parsedChoices.length === 0) return;

    let correct = 0;
    const total = parsedChoices.length;

    parsedChoices.forEach((choice) => {
      const userAnswer = userAnswers[choice.id];
      if (userAnswer === choice.correct) {
        correct++;
      }
    });

    setScore({ correct, total });
    setShowFeedback(true);

    const attemptData = {
      userId,
      exerciseId: currentExercise.id,
      answers: userAnswers,
      score: correct,
      totalQuestions: total,
      completedAt: new Date().toISOString()
    };

    submitAttemptMutation.mutate(attemptData);
  };

  const resetExercise = () => {
    setCurrentExercise(null);
    setUserAnswers({});
    setShowFeedback(false);
    setScore({ correct: 0, total: 0 });
    setParsedChoices([]);
    setSelectedTopic("");
    setSelectedDifficulty(1);
  };

  return (
    <div className="space-y-6">
      {/* AI Exercise Generator Header */}
      <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            AI-Powered Exercise Generator
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Smart Learning</Badge>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Generate personalized exercises using advanced AI. Choose your topic and difficulty level for tailored practice questions.
          </p>
        </CardHeader>
      </Card>

      {/* Topic and Difficulty Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-6 h-6 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              Choose Your Topic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                  selectedTopic === topic.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => setSelectedTopic(topic.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{topic.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{topic.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
              Select Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {difficulties.map((diff) => (
              <div
                key={diff.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-purple-300 ${
                  selectedDifficulty === diff.value ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => setSelectedDifficulty(diff.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={diff.color}>{diff.label}</Badge>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{diff.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Generate Exercise Button */}
      <div className="text-center">
        <Button
          onClick={handleGenerateExercise}
          disabled={generateExerciseMutation.isPending || !selectedTopic}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          {generateExerciseMutation.isPending ? (
            <>
              <Brain className="mr-2 h-5 w-5 animate-pulse" />
              Generating Exercise...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate AI Exercise
            </>
          )}
        </Button>
      </div>

      {/* Current Exercise Display */}
      {currentExercise && (
        <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                {currentExercise.topic} - Fill in the Blanks
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {parsedChoices.length} Choices
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetExercise}
                  className="flex items-center gap-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exercise Text with Interactive Choices */}
            <div className="p-6 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="mb-4">
                <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
                  Read the passage and click on the highlighted words to select the correct options:
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Click on any dashed underlined word to see multiple choice options. Choose the best answer for each word.
                </p>
              </div>
              
              <div className="text-lg leading-relaxed text-gray-900 dark:text-white p-6 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 min-h-[200px]">
                {currentExercise.content?.text ? (
                  <div className="prose prose-lg max-w-none">
                    <p>{renderTextWithChoices(currentExercise.content.text)}</p>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic flex items-center justify-center h-32">
                    No exercise text available
                  </div>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            {parsedChoices.length > 0 && !showFeedback && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Interactive words: {parsedChoices.length} | Ready to submit
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Click words to change answers</span>
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Show correct answers after submission */}
            {showFeedback && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Answer Review
                </h5>
                <div className="space-y-2 text-sm">
                  {parsedChoices.map((choice, index) => {
                    const userAnswer = userAnswers[choice.id];
                    const isCorrect = userAnswer === choice.correct;
                    
                    return (
                      <div key={choice.id} className="flex items-center justify-between">
                        <span>Choice {index + 1}:</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {userAnswer || "Not answered"}
                          </span>
                          {!isCorrect && (
                            <>
                              <span className="text-gray-500">→</span>
                              <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                                {choice.correct}
                              </span>
                            </>
                          )}
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation */}
            {showFeedback && currentExercise.content?.explanation && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h5 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Explanation:</h5>
                <p className="text-amber-800 dark:text-amber-200 text-sm">{currentExercise.content.explanation}</p>
              </div>
            )}

            {!showFeedback && parsedChoices.length > 0 && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleSubmitExercise}
                  disabled={Object.keys(userAnswers).length !== parsedChoices.length || submitAttemptMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  {submitAttemptMutation.isPending ? "Submitting..." : "Submit Answers"}
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Complete all {parsedChoices.length} choices to submit
                </p>
              </div>
            )}

            {showFeedback && (
              <div className="text-center pt-4 space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Your Score: {score.correct}/{score.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {score.correct === score.total ? "Perfect! Excellent work!" :
                     score.correct >= score.total * 0.8 ? "Great job! You're doing well." :
                     score.correct >= score.total * 0.6 ? "Good effort! Keep practicing." :
                     "Keep studying! You'll improve with practice."}
                  </div>
                </div>
                <Button
                  onClick={handleGenerateExercise}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Another Exercise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Exercises */}
      {exercises.length > 0 && (
        <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-6 h-6 bg-gray-600 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              Your Recent AI Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(exercises as any[]).slice(0, 5).map((exercise: any) => (
                <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{exercise.topic}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(exercise.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Fill-in-the-blank
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}