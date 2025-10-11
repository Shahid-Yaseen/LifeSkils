import { Router } from 'express';
import { dataUploadService, UploadedTestData, DataUploadOptions } from '../services/data-upload-service';
import { authenticateToken, requireAdmin, type AuthenticatedRequest } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Upload practice test data
router.post('/upload-practice-test', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const testData: UploadedTestData = req.body;
    const options: DataUploadOptions = req.body.options || {};

    const result = await dataUploadService.uploadPracticeTestData(testData, options);

    if (result.success) {
      // Log the action
      await storage.createAuditLog({
        adminId: req.user!.userId,
        action: 'upload_practice_test',
        entityId: result.testId!,
        details: { 
          title: testData.title, 
          category: testData.category,
          questionCount: testData.questions.length 
        },
        timestamp: new Date()
      });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error uploading practice test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload practice test',
      error: error.message 
    });
  }
});

// Upload batch tests
router.post('/upload-batch-tests', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { tests, options } = req.body;

    if (!tests || !Array.isArray(tests)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tests array is required' 
      });
    }

    const result = await dataUploadService.uploadBatchTests(tests, options);

    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'upload_batch_tests',
      entityId: 'multiple',
      details: { 
        testCount: tests.length,
        successfulUploads: result.summary.successfulUploads,
        failedUploads: result.summary.failedUploads
      },
      timestamp: new Date()
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error uploading batch tests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload batch tests',
      error: error.message 
    });
  }
});

// Upload the given question pool data
router.post('/upload-question-pools', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { questionPools } = req.body;

    if (!questionPools || typeof questionPools !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Question pools data is required' 
      });
    }

    const result = await dataUploadService.createComprehensiveTestsFromData(questionPools);

    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'upload_question_pools',
      entityId: 'multiple',
      details: { 
        categories: Object.keys(questionPools),
        createdTests: result.createdTests.length
      },
      timestamp: new Date()
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error uploading question pools:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload question pools',
      error: error.message 
    });
  }
});

// Get upload status and analytics
router.get('/upload-status/:testId', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { testId } = req.params;
    const { testType = 'practice' } = req.query;

    const analytics = await dataUploadService['enhancedTestManager'].getEnhancedTestAnalytics(
      testId, 
      testType as 'practice' | 'mock'
    );

    res.json({
      success: true,
      testId,
      analytics
    });
  } catch (error: any) {
    console.error('Error getting upload status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get upload status',
      error: error.message 
    });
  }
});

// Validate test data before upload
router.post('/validate-test-data', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const testData: UploadedTestData = req.body;

    // Validate the data structure
    try {
      dataUploadService['validateTestData'](testData);
    } catch (error: any) {
      return res.json({
        valid: false,
        errors: [error.message],
        warnings: []
      });
    }

    // Validate questions
    const questionValidation = await dataUploadService['validateQuestions'](testData.questions);

    res.json({
      valid: questionValidation.valid,
      errors: questionValidation.errors,
      warnings: questionValidation.warnings,
      questionCount: testData.questions.length,
      estimatedDifficulty: dataUploadService['calculateDifficulty'](testData.questions)
    });
  } catch (error: any) {
    console.error('Error validating test data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate test data',
      error: error.message 
    });
  }
});

// Get upload history
router.get('/upload-history', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const auditLogs = await storage.getAuditLogs({
      page: pageNum,
      limit: limitNum
    });

    const uploadLogs = auditLogs.filter(log => 
      log.action.includes('upload') || log.action.includes('create')
    );

    res.json({
      success: true,
      uploads: uploadLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: uploadLogs.length
      }
    });
  } catch (error: any) {
    console.error('Error getting upload history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get upload history',
      error: error.message 
    });
  }
});

export default router;
