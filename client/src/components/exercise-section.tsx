import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExerciseSectionProps {
  userId: string;
}

export default function ExerciseSection({ userId }: ExerciseSectionProps) {
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
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
      queryClient.invalidateQueries({ queryKey: ["/api/exercises", userId] });
      toast({
        title: "New Exercise Generated",
        description: "A new exercise has been created for you to practice."
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
    }
  });

  const handleGenerateExercise = () => {
    const topics = ["British Government", "UK History", "British Culture", "British Values", "UK Geography"];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    generateExerciseMutation.mutate({ topic: randomTopic });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const checkAnswers = () => {
    let text = displayExercise?.content?.content?.text || displayExercise?.content?.text;
    if (!text) return;
    
    const inlineChoiceRegex = /\{([^}]+)\}/g;
    let match;
    let correct = 0;
    let total = 0;
    
    // Reset regex state
    inlineChoiceRegex.lastIndex = 0;
    
    while ((match = inlineChoiceRegex.exec(text)) !== null) {
      const questionId = `choice-${total}`;
      const userAnswer = userAnswers[questionId];
      
      // First option in each choice set is always correct (index 0)
      if (userAnswer && parseInt(userAnswer) === 0) {
        correct++;
      }
      total++;
    }
    
    setScore({ correct, total });
    setShowFeedback(true);

    // Submit the attempt
    submitAttemptMutation.mutate({
      userId,
      exerciseId: displayExercise.id,
      answers: userAnswers,
      score: correct,
      totalQuestions: total
    });
  };

  // Use the latest exercise if available
  const displayExercise = currentExercise || exercises[exercises.length - 1];

  // Initialize with a default exercise on first load
  if (!displayExercise && exercises.length === 0 && !generateExerciseMutation.isPending) {
    handleGenerateExercise();
  }

  return (
    <section id="exercises">
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Brain className="text-warning mr-3" size={24} />
              AI-Generated Exercises
            </CardTitle>
            <Button 
              onClick={handleGenerateExercise}
              disabled={generateExerciseMutation.isPending}
              className="bg-warning hover:bg-warning/90 text-white"
            >
              <RotateCcw className="mr-2" size={16} />
              {generateExerciseMutation.isPending ? "Generating..." : "Generate New"}
            </Button>
          </div>
          <p className="text-gray-600 mt-1">Fill-in-the-blank exercises with AI-generated variations to enhance critical thinking</p>
        </CardHeader>
        
        <CardContent className="p-6">
          {generateExerciseMutation.isPending ? (
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          ) : displayExercise ? (
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Complete the text about {displayExercise.content?.topic || displayExercise.topic}:
              </h4>
              
              <div className="bg-white rounded-lg p-4 mb-6 leading-relaxed text-gray-700">
                {(() => {
                  // Handle nested content structure
                  let text = displayExercise.content?.content?.text || displayExercise.content?.text;
                  if (!text) {
                    console.log('Exercise data:', displayExercise);
                    return <div className="text-red-500">No exercise text found</div>;
                  }
                  
                  console.log('Exercise text:', text.substring(0, 200) + '...');
                  const inlineChoiceRegex = /\{([^}]+)\}/g;
                  let match;
                  let lastIndex = 0;
                  const elements = [];
                  let choiceIndex = 0;
                  
                  while ((match = inlineChoiceRegex.exec(text)) !== null) {
                    // Add text before this choice
                    if (match.index > lastIndex) {
                      elements.push(
                        <span key={`text-${choiceIndex}`}>
                          {text.substring(lastIndex, match.index)}
                        </span>
                      );
                    }
                    
                    // Get the options for this choice
                    const options = match[1].split('|');
                    const questionId = `choice-${choiceIndex}`;
                    
                    // Add the dropdown selector
                    elements.push(
                      <span key={questionId} className="inline-block mx-1">
                        <Select
                          value={userAnswers[questionId] || ""}
                          onValueChange={(value) => handleAnswerChange(questionId, value)}
                          disabled={showFeedback}
                        >
                          <SelectTrigger className="w-auto min-w-[120px] h-8 text-sm border-2 border-uk-blue/30 focus:border-uk-blue">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((option: string, optionIndex: number) => (
                              <SelectItem key={optionIndex} value={optionIndex.toString()}>
                                {option.trim()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </span>
                    );
                    
                    lastIndex = match.index + match[0].length;
                    choiceIndex++;
                  }
                  
                  // Add any remaining text
                  if (lastIndex < text.length) {
                    elements.push(
                      <span key={`text-final`}>
                        {text.substring(lastIndex)}
                      </span>
                    );
                  }
                  
                  return elements;
                })()}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {showFeedback ? (
                    <>
                      <CheckCircle className="inline text-success mr-1" size={16} />
                      {score.correct} of {score.total} correct
                    </>
                  ) : (
                    <>
                      Progress: {Object.keys(userAnswers).length} of {(() => {
                        let text = displayExercise.content?.content?.text || displayExercise.content?.text;
                        if (!text) return 0;
                        const matches = text.match(/\{[^}]+\}/g);
                        return matches ? matches.length : 0;
                      })()} answered
                    </>
                  )}
                </div>
                <Button 
                  onClick={checkAnswers}
                  disabled={showFeedback || Object.keys(userAnswers).length === 0}
                  className="bg-uk-blue hover:bg-uk-blue/90 text-white"
                >
                  Check Answers
                </Button>
              </div>

              {/* Answer feedback */}
              {showFeedback && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Feedback:</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {(() => {
                      let text = displayExercise.content?.content?.text || displayExercise.content?.text;
                      if (!text) return null;
                      
                      const inlineChoiceRegex = /\{([^}]+)\}/g;
                      let match;
                      const feedbackItems = [];
                      let choiceIndex = 0;
                      
                      // Reset regex state
                      inlineChoiceRegex.lastIndex = 0;
                      
                      while ((match = inlineChoiceRegex.exec(text)) !== null) {
                        const questionId = `choice-${choiceIndex}`;
                        const userAnswer = userAnswers[questionId];
                        const options = match[1].split('|');
                        const correctAnswer = options[0].trim(); // First option is correct
                        const isCorrect = userAnswer && parseInt(userAnswer) === 0;
                        const userSelectedOption = userAnswer ? options[parseInt(userAnswer)]?.trim() : 'Not answered';
                        
                        feedbackItems.push(
                          <li key={questionId} className="flex items-start">
                            {isCorrect ? (
                              <CheckCircle className="text-success mr-2 mt-0.5 flex-shrink-0" size={16} />
                            ) : (
                              <XCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                            )}
                            <span>
                              <strong>Choice {choiceIndex + 1}:</strong> {isCorrect ? "Correct!" : `Your answer: "${userSelectedOption}" - Correct answer: "${correctAnswer}"`}
                            </span>
                          </li>
                        );
                        
                        choiceIndex++;
                      }
                      
                      return feedbackItems;
                    })()}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Brain className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">No exercises available. Generate your first exercise to get started!</p>
              <Button onClick={handleGenerateExercise} className="bg-warning hover:bg-warning/90 text-white">
                Generate Exercise
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
