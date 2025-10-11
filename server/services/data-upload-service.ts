import { enhancedTestManager, Question } from './enhanced-test-manager';
import { storage } from '../storage';

export interface UploadedTestData {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  questions: Question[];
  testType: 'practice' | 'mock';
}

export interface DataUploadOptions {
  overwriteExisting?: boolean;
  validateQuestions?: boolean;
  generateAnalytics?: boolean;
  batchSize?: number;
}

export class DataUploadService {
  private static instance: DataUploadService;

  private constructor() {}

  public static getInstance(): DataUploadService {
    if (!DataUploadService.instance) {
      DataUploadService.instance = new DataUploadService();
    }
    return DataUploadService.instance;
  }

  // Upload the given practice test data
  async uploadPracticeTestData(
    data: UploadedTestData,
    options: DataUploadOptions = {}
  ): Promise<{
    success: boolean;
    testId?: string;
    message: string;
    analytics?: any;
  }> {
    try {
      // Validate the data structure
      this.validateTestData(data);

      // Process questions if validation is enabled
      if (options.validateQuestions !== false) {
        const questionValidation = await this.validateQuestions(data.questions);
        if (!questionValidation.valid) {
          return {
            success: false,
            message: `Question validation failed: ${questionValidation.errors.join(', ')}`
          };
        }
      }

      // Create the test
      const test = await enhancedTestManager.generateEnhancedPracticeTest(
        data.title,
        data.description,
        data.category,
        data.difficulty,
        data.questions.length,
        data.questions
      );

      // Generate analytics if requested
      let analytics = null;
      if (options.generateAnalytics) {
        analytics = await enhancedTestManager.getEnhancedTestAnalytics(test.id, 'practice');
      }

      return {
        success: true,
        testId: test.id,
        message: `Successfully uploaded practice test: ${data.title}`,
        analytics
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to upload practice test: ${error.message}`
      };
    }
  }

  // Upload multiple tests in batch
  async uploadBatchTests(
    tests: UploadedTestData[],
    options: DataUploadOptions = {}
  ): Promise<{
    success: boolean;
    results: Array<{
      testTitle: string;
      success: boolean;
      testId?: string;
      message: string;
    }>;
    summary: {
      totalTests: number;
      successfulUploads: number;
      failedUploads: number;
    };
  }> {
    const results = [];
    let successfulUploads = 0;
    let failedUploads = 0;

    const batchSize = options.batchSize || 5;

    // Process tests in batches to avoid overwhelming the system
    for (let i = 0; i < tests.length; i += batchSize) {
      const batch = tests.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (test) => {
        try {
          const result = await this.uploadPracticeTestData(test, options);
          if (result.success) {
            successfulUploads++;
          } else {
            failedUploads++;
          }
          return {
            testTitle: test.title,
            success: result.success,
            testId: result.testId,
            message: result.message
          };
        } catch (error: any) {
          failedUploads++;
          return {
            testTitle: test.title,
            success: false,
            message: `Upload failed: ${error.message}`
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return {
      success: failedUploads === 0,
      results,
      summary: {
        totalTests: tests.length,
        successfulUploads,
        failedUploads
      }
    };
  }

  // Convert the given question pool data to the enhanced format
  convertQuestionPoolToEnhancedFormat(questionPools: any): UploadedTestData[] {
    const tests: UploadedTestData[] = [];
    
    // Process each category
    Object.entries(questionPools).forEach(([category, questions]: [string, any]) => {
      if (Array.isArray(questions) && questions.length > 0) {
        // Create a test for each category
        const test: UploadedTestData = {
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} Practice Test`,
          description: `Comprehensive practice test covering ${category} topics with ${questions.length} questions`,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          difficulty: this.calculateDifficulty(questions),
          questions: questions.map((q: any, index: number) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            category: q.category,
            difficulty: this.calculateQuestionDifficulty(q),
            tags: [category.toLowerCase()],
            source: 'uploaded_data'
          })),
          testType: 'practice'
        };
        
        tests.push(test);
      }
    });

    return tests;
  }

  // Create comprehensive tests from the given data
  async createComprehensiveTestsFromData(questionPools: any): Promise<{
    success: boolean;
    createdTests: any[];
    message: string;
  }> {
    try {
      // Convert the data to enhanced format
      const tests = this.convertQuestionPoolToEnhancedFormat(questionPools);
      
      // Upload all tests
      const uploadResults = await this.uploadBatchTests(tests, {
        validateQuestions: true,
        generateAnalytics: true,
        batchSize: 3
      });

      return {
        success: uploadResults.success,
        createdTests: uploadResults.results.filter(r => r.success),
        message: `Successfully created ${uploadResults.summary.successfulUploads} tests from ${uploadResults.summary.totalTests} categories`
      };
    } catch (error: any) {
      return {
        success: false,
        createdTests: [],
        message: `Failed to create comprehensive tests: ${error.message}`
      };
    }
  }

  // Enhanced question validation
  private async validateQuestions(questions: Question[]): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!questions || questions.length === 0) {
      errors.push('No questions provided');
      return { valid: false, errors, warnings };
    }

    if (questions.length < 24) {
      warnings.push(`Only ${questions.length} questions provided. Recommended minimum is 24.`);
    }

    questions.forEach((question, index) => {
      try {
        enhancedTestManager['validateQuestion'](question);
      } catch (error: any) {
        errors.push(`Question ${index + 1}: ${error.message}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate test data structure
  private validateTestData(data: UploadedTestData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Test title is required');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Test description is required');
    }
    
    if (!data.category || data.category.trim().length === 0) {
      throw new Error('Test category is required');
    }
    
    if (data.difficulty < 1 || data.difficulty > 5) {
      throw new Error('Difficulty must be between 1 and 5');
    }
    
    if (!data.questions || data.questions.length === 0) {
      throw new Error('At least one question is required');
    }
  }

  // Calculate overall test difficulty based on questions
  private calculateDifficulty(questions: any[]): number {
    if (questions.length === 0) return 3;
    
    // Simple difficulty calculation based on question complexity
    const avgComplexity = questions.reduce((sum, q) => {
      const questionLength = q.question.length;
      const explanationLength = q.explanation.length;
      return sum + (questionLength + explanationLength) / 100;
    }, 0) / questions.length;
    
    return Math.min(5, Math.max(1, Math.round(avgComplexity)));
  }

  // Calculate individual question difficulty
  private calculateQuestionDifficulty(question: any): number {
    const questionLength = question.question.length;
    const explanationLength = question.explanation.length;
    const optionsComplexity = question.options.reduce((sum: number, opt: string) => sum + opt.length, 0);
    
    const complexity = (questionLength + explanationLength + optionsComplexity) / 200;
    return Math.min(5, Math.max(1, Math.round(complexity)));
  }
}

export const dataUploadService = DataUploadService.getInstance();
