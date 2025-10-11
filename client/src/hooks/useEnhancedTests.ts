import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Enhanced interfaces for the new test management system
export interface EnhancedQuestion {
  id?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty?: number;
  tags?: string[];
  source?: string;
}

export interface EnhancedTest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  questions: EnhancedQuestion[];
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
  // Enhanced analytics fields
  totalAttempts?: number;
  averageScore?: number;
  passRate?: number;
  completionRate?: number;
  averageTimeSpent?: number;
}

export interface TestAnalytics {
  testId: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  completionRate: number;
  averageTimeSpent: number;
  difficultyDistribution: Record<string, number>;
  categoryPerformance: Record<string, number>;
  recentAttempts: any[];
  topPerformingQuestions: EnhancedQuestion[];
  strugglingQuestions: EnhancedQuestion[];
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  passedTest: boolean;
  timeSpent: number;
  completedAt: string;
}

// Enhanced API hooks
export function useEnhancedPracticeTests() {
  return useQuery<EnhancedTest[]>({
    queryKey: ["/api/practice-tests"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEnhancedMockTests() {
  return useQuery<EnhancedTest[]>({
    queryKey: ["/api/mock-tests"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEnhancedTest(testId: string) {
  return useQuery<EnhancedTest>({
    queryKey: [`/api/practice-tests/${testId}`],
    enabled: !!testId,
    staleTime: 30 * 60 * 1000, // 30 minutes - questions are now static
    cacheTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    retry: 1, // Reduce retries since questions are now pre-loaded
    retryDelay: 500, // Faster retry
  });
}

export function useEnhancedMockTest(testId: string | undefined) {
  return useQuery<EnhancedTest>({
    queryKey: [`/api/mock-tests/${testId}`],
    enabled: !!testId,
    staleTime: 30 * 60 * 1000, // 30 minutes - questions are now static
    cacheTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    retry: 1, // Reduce retries since questions are now pre-loaded
    retryDelay: 500, // Faster retry
  });
}

export function useTestAnalytics(testId: string, testType: 'practice' | 'mock' = 'practice') {
  return useQuery<TestAnalytics>({
    queryKey: [`/api/admin/test-analytics`, { testId, testType }],
    enabled: !!testId,
  });
}

export function useTestAttempts(userId: string, testId?: string) {
  return useQuery<TestAttempt[]>({
    queryKey: testId 
      ? [`/api/practice-tests/attempts/${userId}/${testId}`]
      : [`/api/practice-tests/attempts/${userId}`],
    enabled: !!userId,
  });
}

export function useSubmitTestAttempt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attemptData: {
      userId: string;
      testId: string;
      answers: number[];
      timeSpent: number;
    }) => {
      return apiRequest(`/api/practice-tests/attempt`, {
        method: 'POST',
        body: JSON.stringify({
          ...attemptData,
          score: attemptData.answers.filter((answer, index) => {
            // This would need to be calculated based on the test questions
            // For now, we'll let the backend calculate it
            return true;
          }).length,
          totalQuestions: attemptData.answers.length,
          passedTest: false, // Will be calculated by backend
        }),
      } as any);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch test attempts
      queryClient.invalidateQueries({
        queryKey: [`/api/practice-tests/attempts/${variables.userId}`]
      });
      
      // Invalidate test analytics if available
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/test-analytics`]
      });
    },
  });
}

export function useSubmitMockTestAttempt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attemptData: {
      userId: string;
      testId: string;
      answers: number[];
      timeSpent: number;
    }) => {
      return apiRequest(`/api/mock-tests/${attemptData.testId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          userId: attemptData.userId,
          answers: attemptData.answers,
          timeSpent: attemptData.timeSpent,
        }),
      } as any);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch mock test attempts
      queryClient.invalidateQueries({
        queryKey: [`/api/mock-tests/attempts/${variables.userId}`]
      });
    },
  });
}

// Enhanced test management hooks for admin users
export function useEnhancedTestManagement() {
  const queryClient = useQueryClient();

  const uploadPracticeTest = useMutation({
    mutationFn: async (testData: {
      title: string;
      description: string;
      category: string;
      difficulty: number;
      questions: EnhancedQuestion[];
    }) => {
      return apiRequest('/api/data-upload/upload-practice-test', {
        method: 'POST',
        body: JSON.stringify({
          ...testData,
          testType: 'practice'
        }),
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice-tests"] });
    },
  });

  const uploadQuestionPools = useMutation({
    mutationFn: async (questionPools: Record<string, EnhancedQuestion[]>) => {
      return apiRequest('/api/data-upload/upload-question-pools', {
        method: 'POST',
        body: JSON.stringify({ questionPools }),
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice-tests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mock-tests"] });
    },
  });

  const validateTestData = useMutation({
    mutationFn: async (testData: any) => {
      return apiRequest('/api/data-upload/validate-test-data', {
        method: 'POST',
        body: JSON.stringify(testData),
      } as any);
    },
  });

  const getUploadHistory = useQuery({
    queryKey: ["/api/data-upload/upload-history"],
  });

  return {
    uploadPracticeTest,
    uploadQuestionPools,
    validateTestData,
    getUploadHistory,
  };
}

// Utility functions for enhanced test management
export function getDifficultyColor(difficulty: number): string {
  switch (difficulty) {
    case 1: return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
    case 2: return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700";
    case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
    case 4: return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700";
    case 5: return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
    default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600";
  }
}

export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1: return "Beginner";
    case 2: return "Easy";
    case 3: return "Medium";
    case 4: return "Hard";
    case 5: return "Expert";
    default: return "Unknown";
  }
}

export function calculateTestScore(answers: number[], questions: EnhancedQuestion[]): {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
} {
  const correctAnswers = answers.filter((answer, index) => {
    return answer === questions[index]?.correctAnswer;
  }).length;
  
  const totalQuestions = questions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = percentage >= 75; // 75% pass mark
  
  return {
    score: correctAnswers,
    totalQuestions,
    percentage,
    passed,
  };
}

export function formatTimeSpent(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getTestCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'British History': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    'Government & Politics': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    'Geography & Culture': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    'General Knowledge': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    'Comprehensive Review': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
    'Mock Exam': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
  };
  
  return colors[category] || colors['General Knowledge'];
}
