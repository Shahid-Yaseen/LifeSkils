import { storage } from '../storage';
import { db } from '../db';
import { practiceTests, mockTests } from '@shared/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export interface Question {
  id?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0-3 index
  explanation: string;
  category: string;
  difficulty?: number; // 1-5 scale
  tags?: string[];
  source?: string;
  createdAt?: Date;
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
  topPerformingQuestions: Question[];
  strugglingQuestions: Question[];
}

export interface BulkUploadResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  warnings: string[];
  importedQuestions: Question[];
}

export class EnhancedTestManager {
  private static instance: EnhancedTestManager;

  private constructor() {}

  public static getInstance(): EnhancedTestManager {
    if (!EnhancedTestManager.instance) {
      EnhancedTestManager.instance = new EnhancedTestManager();
    }
    return EnhancedTestManager.instance;
  }

  // Enhanced Question Management
  async createQuestion(question: Question): Promise<Question> {
    // Validate question format
    this.validateQuestion(question);
    
    // Add to question bank (could be a separate table in the future)
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newQuestion: Question = {
      ...question,
      id: questionId,
      createdAt: new Date()
    };

    // Store in a questions table or JSON file
    // For now, we'll return the question with ID
    return newQuestion;
  }

  async bulkUploadQuestions(questions: Question[]): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      successCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      importedQuestions: []
    };

    for (let i = 0; i < questions.length; i++) {
      try {
        const question = questions[i];
        this.validateQuestion(question);
        
        const createdQuestion = await this.createQuestion(question);
        result.importedQuestions.push(createdQuestion);
        result.successCount++;
      } catch (error: any) {
        result.errorCount++;
        result.errors.push(`Question ${i + 1}: ${error.message}`);
      }
    }

    return result;
  }

  // Enhanced Test Generation
  async generateEnhancedPracticeTest(
    title: string,
    description: string,
    category: string,
    difficulty: number,
    questionCount: number = 24,
    customQuestions?: Question[]
  ) {
    const questions = customQuestions || await this.selectQuestionsForTest({
      category,
      difficulty,
      count: questionCount
    });

    const test = {
      title,
      description,
      category,
      difficulty,
      questions,
      orderIndex: await this.getNextOrderIndex('practice')
    };

    return await storage.createPracticeTest(test);
  }

  async generateEnhancedMockTest(
    title: string,
    description: string,
    difficulty: number = 3,
    questionCount: number = 24,
    customQuestions?: Question[]
  ) {
    const questions = customQuestions || await this.selectQuestionsForTest({
      difficulty,
      count: questionCount,
      balancedCategories: true
    });

    const test = {
      title,
      description,
      questions,
      orderIndex: await this.getNextOrderIndex('mock'),
      difficulty
    };

    return await storage.createMockTest(test);
  }

  // Advanced Analytics
  async getEnhancedTestAnalytics(testId: string, testType: 'practice' | 'mock'): Promise<TestAnalytics> {
    const baseAnalytics = await storage.getTestAnalytics(testId, testType);
    
    // Get additional detailed analytics
    const detailedAnalytics = await this.getDetailedAnalytics(testId, testType);
    
    return {
      ...baseAnalytics,
      ...detailedAnalytics
    };
  }

  async getDetailedAnalytics(testId: string, testType: 'practice' | 'mock') {
    // Get question-level performance
    const questionPerformance = await this.getQuestionPerformance(testId, testType);
    
    // Get time-based analytics
    const timeAnalytics = await this.getTimeAnalytics(testId, testType);
    
    // Get difficulty distribution
    const difficultyDistribution = await this.getDifficultyDistribution(testId, testType);
    
    // Get category performance
    const categoryPerformance = await this.getCategoryPerformance(testId, testType);

    return {
      questionPerformance,
      timeAnalytics,
      difficultyDistribution,
      categoryPerformance,
      topPerformingQuestions: questionPerformance.topPerforming,
      strugglingQuestions: questionPerformance.struggling
    };
  }

  // Test Management Utilities
  async duplicateTest(testId: string, testType: 'practice' | 'mock', newTitle: string) {
    const originalTest = testType === 'practice' 
      ? await storage.getPracticeTest(testId)
      : await storage.getMockTest(testId);

    if (!originalTest) {
      throw new Error('Test not found');
    }

    const duplicatedTest = {
      ...originalTest,
      title: newTitle,
      orderIndex: await this.getNextOrderIndex(testType)
    };

    delete duplicatedTest.id;

    if (testType === 'practice') {
      return await storage.createPracticeTest(duplicatedTest);
    } else {
      return await storage.createMockTest(duplicatedTest);
    }
  }

  async archiveTest(testId: string, testType: 'practice' | 'mock') {
    // Archive instead of delete to preserve historical data
    const archiveData = {
      archived: true,
      archivedAt: new Date()
    };

    if (testType === 'practice') {
      return await storage.updatePracticeTest(testId, archiveData);
    } else {
      return await storage.updateMockTest(testId, archiveData);
    }
  }

  // Bulk Operations
  async bulkCreateTests(tests: any[], testType: 'practice' | 'mock') {
    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdTests: []
    };

    for (const test of tests) {
      try {
        const createdTest = testType === 'practice'
          ? await storage.createPracticeTest(test)
          : await storage.createMockTest(test);
        
        results.createdTests.push(createdTest);
        results.successCount++;
      } catch (error: any) {
        results.errorCount++;
        results.errors.push(`Test "${test.title}": ${error.message}`);
      }
    }

    return results;
  }

  // Private helper methods
  private validateQuestion(question: Question): void {
    if (!question.question || question.question.trim().length === 0) {
      throw new Error('Question text is required');
    }
    
    if (!question.options || question.options.length !== 4) {
      throw new Error('Question must have exactly 4 options');
    }
    
    if (question.correctAnswer < 0 || question.correctAnswer > 3) {
      throw new Error('Correct answer must be between 0 and 3');
    }
    
    if (!question.explanation || question.explanation.trim().length === 0) {
      throw new Error('Explanation is required');
    }
    
    if (!question.category || question.category.trim().length === 0) {
      throw new Error('Category is required');
    }
  }

  private async selectQuestionsForTest(criteria: {
    category?: string;
    difficulty?: number;
    count: number;
    balancedCategories?: boolean;
  }): Promise<Question[]> {
    // This would integrate with a proper question bank
    // For now, return a placeholder implementation
    return [];
  }

  private async getNextOrderIndex(testType: 'practice' | 'mock'): Promise<number> {
    const table = testType === 'practice' ? practiceTests : mockTests;
    const result = await db
      .select({ maxOrder: sql<number>`MAX(${table.orderIndex})` })
      .from(table);
    
    return (result[0]?.maxOrder || 0) + 1;
  }

  private async getQuestionPerformance(testId: string, testType: 'practice' | 'mock') {
    // Implementation for question-level analytics
    return {
      topPerforming: [],
      struggling: []
    };
  }

  private async getTimeAnalytics(testId: string, testType: 'practice' | 'mock') {
    // Implementation for time-based analytics
    return {};
  }

  private async getDifficultyDistribution(testId: string, testType: 'practice' | 'mock') {
    // Implementation for difficulty distribution
    return {};
  }

  private async getCategoryPerformance(testId: string, testType: 'practice' | 'mock') {
    // Implementation for category performance
    return {};
  }
}

export const enhancedTestManager = EnhancedTestManager.getInstance();
