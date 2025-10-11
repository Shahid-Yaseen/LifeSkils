import { Router } from 'express';
import { storage } from '../storage';
import { authenticateToken, requireAdmin, type AuthenticatedRequest } from '../middleware/auth';
import { insertPracticeTestSchema, insertMockTestSchema } from '@shared/schema';

const router = Router();

// Practice Tests Management

// Get all practice tests with analytics
router.get('/practice-tests', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = '1', limit = '20', category, difficulty, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const tests = await storage.getAllPracticeTests({
      page: pageNum,
      limit: limitNum,
      category: category as string,
      difficulty: difficulty ? parseInt(difficulty as string) : undefined,
      status: status as string
    });
    
    // Get analytics for each test
    const testsWithAnalytics = await Promise.all(
      tests.map(async (test) => {
        const analytics = await storage.getTestAnalytics(test.id, 'practice');
        return {
          ...test,
          totalAttempts: analytics.totalAttempts,
          averageScore: analytics.averageScore,
          passRate: analytics.passRate,
          completionRate: analytics.completionRate
        };
      })
    );
    
    res.json(testsWithAnalytics);
  } catch (error: any) {
    console.error('Error fetching practice tests:', error);
    res.status(500).json({ error: 'Failed to fetch practice tests' });
  }
});

// Get specific practice test
router.get('/practice-tests/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const test = await storage.getPracticeTest(id);
    
    if (!test) {
      return res.status(404).json({ error: 'Practice test not found' });
    }
    
    const analytics = await storage.getTestAnalytics(id, 'practice');
    
    res.json({
      ...test,
      analytics
    });
  } catch (error: any) {
    console.error('Error fetching practice test:', error);
    res.status(500).json({ error: 'Failed to fetch practice test' });
  }
});

// Create new practice test
router.post('/practice-tests', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const testData = req.body;
    
    // Validate required fields
    if (!testData.title || !testData.description || !testData.category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate questions if provided
    if (testData.questions && Array.isArray(testData.questions)) {
      for (const question of testData.questions) {
        if (!question.question || !question.options || question.options.length !== 4) {
          return res.status(400).json({ error: 'Invalid question format' });
        }
      }
    }
    
    const newTest = await storage.createPracticeTest({
      title: testData.title,
      description: testData.description,
      category: testData.category,
      difficulty: testData.difficulty || 3,
      questions: testData.questions || [],
      orderIndex: testData.orderIndex || 0
    });
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'create_practice_test',
      entityId: newTest.id,
      details: { title: newTest.title, category: newTest.category },
      timestamp: new Date()
    });
    
    res.status(201).json(newTest);
  } catch (error: any) {
    console.error('Error creating practice test:', error);
    res.status(500).json({ error: 'Failed to create practice test' });
  }
});

// Update practice test
router.put('/practice-tests/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const existingTest = await storage.getPracticeTest(id);
    if (!existingTest) {
      return res.status(404).json({ error: 'Practice test not found' });
    }
    
    const updatedTest = await storage.updatePracticeTest(id, updateData);
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'update_practice_test',
      entityId: id,
      details: updateData,
      timestamp: new Date()
    });
    
    res.json(updatedTest);
  } catch (error: any) {
    console.error('Error updating practice test:', error);
    res.status(500).json({ error: 'Failed to update practice test' });
  }
});

// Delete practice test
router.delete('/practice-tests/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const existingTest = await storage.getPracticeTest(id);
    if (!existingTest) {
      return res.status(404).json({ error: 'Practice test not found' });
    }
    
    // Check if test has attempts
    const attempts = await storage.getPracticeTestAttempts(id);
    if (attempts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete test with existing attempts. Archive instead.' 
      });
    }
    
    await storage.deletePracticeTest(id);
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'delete_practice_test',
      entityId: id,
      details: { title: existingTest.title },
      timestamp: new Date()
    });
    
    res.json({ message: 'Practice test deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting practice test:', error);
    res.status(500).json({ error: 'Failed to delete practice test' });
  }
});

// Mock Tests Management

// Get all mock tests with analytics
router.get('/mock-tests', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = '1', limit = '20', category, difficulty, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const tests = await storage.getMockTests({
      page: pageNum,
      limit: limitNum,
      category: category as string,
      difficulty: difficulty ? parseInt(difficulty as string) : undefined,
      status: status as string
    });
    
    // Get analytics for each test
    const testsWithAnalytics = await Promise.all(
      tests.map(async (test) => {
        const analytics = await storage.getTestAnalytics(test.id, 'mock');
        return {
          ...test,
          totalAttempts: analytics.totalAttempts,
          averageScore: analytics.averageScore,
          passRate: analytics.passRate,
          completionRate: analytics.completionRate
        };
      })
    );
    
    res.json(testsWithAnalytics);
  } catch (error: any) {
    console.error('Error fetching mock tests:', error);
    res.status(500).json({ error: 'Failed to fetch mock tests' });
  }
});

// Get specific mock test
router.get('/mock-tests/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const test = await storage.getMockTest(id);
    
    if (!test) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    
    const analytics = await storage.getTestAnalytics(id, 'mock');
    
    res.json({
      ...test,
      analytics
    });
  } catch (error: any) {
    console.error('Error fetching mock test:', error);
    res.status(500).json({ error: 'Failed to fetch mock test' });
  }
});

// Create new mock test
router.post('/mock-tests', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const testData = req.body;
    
    // Validate required fields
    if (!testData.title || !testData.description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate questions if provided
    if (testData.questions && Array.isArray(testData.questions)) {
      for (const question of testData.questions) {
        if (!question.question || !question.options || question.options.length !== 4) {
          return res.status(400).json({ error: 'Invalid question format' });
        }
      }
    }
    
    const newTest = await storage.createMockTest({
      title: testData.title,
      description: testData.description,
      questions: testData.questions || [],
      orderIndex: testData.orderIndex || 0,
      difficulty: testData.difficulty || 3
    });
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'create_mock_test',
      entityId: newTest.id,
      details: { title: newTest.title },
      timestamp: new Date()
    });
    
    res.status(201).json(newTest);
  } catch (error: any) {
    console.error('Error creating mock test:', error);
    res.status(500).json({ error: 'Failed to create mock test' });
  }
});

// Update mock test
router.put('/mock-tests/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const existingTest = await storage.getMockTest(id);
    if (!existingTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    
    const updatedTest = await storage.updateMockTest(id, updateData);
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'update_mock_test',
      entityId: id,
      details: updateData,
      timestamp: new Date()
    });
    
    res.json(updatedTest);
  } catch (error: any) {
    console.error('Error updating mock test:', error);
    res.status(500).json({ error: 'Failed to update mock test' });
  }
});

// Delete mock test
router.delete('/mock-tests/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const existingTest = await storage.getMockTest(id);
    if (!existingTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    
    // Check if test has attempts
    const attempts = await storage.getMockTestAttempts(id);
    if (attempts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete test with existing attempts. Archive instead.' 
      });
    }
    
    await storage.deleteMockTest(id);
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'delete_mock_test',
      entityId: id,
      details: { title: existingTest.title },
      timestamp: new Date()
    });
    
    res.json({ message: 'Mock test deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting mock test:', error);
    res.status(500).json({ error: 'Failed to delete mock test' });
  }
});

// Test Analytics

// Get comprehensive test analytics
router.get('/test-analytics', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { testId, testType, timeRange = '30d', category } = req.query;
    
    const analytics = await storage.getComprehensiveTestAnalytics({
      testId: testId as string,
      testType: testType as 'practice' | 'mock',
      timeRange: timeRange as string,
      category: category as string
    });
    
    res.json(analytics);
  } catch (error: any) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({ error: 'Failed to fetch test analytics' });
  }
});

// Export test analytics
router.get('/test-analytics/export', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { testId, testType, timeRange = '30d', category, format = 'csv' } = req.query;
    
    const analytics = await storage.getComprehensiveTestAnalytics({
      testId: testId as string,
      testType: testType as 'practice' | 'mock',
      timeRange: timeRange as string,
      category: category as string
    });
    
    if (format === 'csv') {
      const csv = await storage.exportTestAnalyticsToCSV(analytics);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=test-analytics.csv');
      res.send(csv);
    } else {
      res.json(analytics);
    }
  } catch (error: any) {
    console.error('Error exporting test analytics:', error);
    res.status(500).json({ error: 'Failed to export test analytics' });
  }
});

// Bulk Operations

// Bulk update tests
router.put('/tests/bulk-update', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { testIds, updates, testType } = req.body;
    
    if (!testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ error: 'Test IDs are required' });
    }
    
    const results = await storage.bulkUpdateTests(testIds, updates, testType);
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'bulk_update_tests',
      entityId: testIds.join(','),
      details: { testIds, updates, testType },
      timestamp: new Date()
    });
    
    res.json({ 
      message: `Updated ${results.successCount} tests successfully`,
      results 
    });
  } catch (error: any) {
    console.error('Error bulk updating tests:', error);
    res.status(500).json({ error: 'Failed to bulk update tests' });
  }
});

// Bulk delete tests
router.delete('/tests/bulk-delete', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { testIds, testType } = req.body;
    
    if (!testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ error: 'Test IDs are required' });
    }
    
    const results = await storage.bulkDeleteTests(testIds, testType);
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'bulk_delete_tests',
      entityId: testIds.join(','),
      details: { testIds, testType },
      timestamp: new Date()
    });
    
    res.json({ 
      message: `Deleted ${results.successCount} tests successfully`,
      results 
    });
  } catch (error: any) {
    console.error('Error bulk deleting tests:', error);
    res.status(500).json({ error: 'Failed to bulk delete tests' });
  }
});

// Test Import/Export

// Export tests
router.get('/tests/export', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { testType, format = 'json' } = req.query;
    
    const tests = await storage.exportTests(testType as string, format as string);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=tests-export.json');
      res.json(tests);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tests-export.csv');
      res.send(tests);
    }
  } catch (error: any) {
    console.error('Error exporting tests:', error);
    res.status(500).json({ error: 'Failed to export tests' });
  }
});

// Import tests
router.post('/tests/import', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { tests, testType, overwrite = false } = req.body;
    
    if (!tests || !Array.isArray(tests)) {
      return res.status(400).json({ error: 'Tests data is required' });
    }
    
    const results = await storage.importTests(tests, testType, overwrite);
    
    // Log the action
    await storage.createAuditLog({
      adminId: req.user!.userId,
      action: 'import_tests',
      entityId: 'multiple',
      details: { testType, count: tests.length, overwrite },
      timestamp: new Date()
    });
    
    res.json({ 
      message: `Imported ${results.successCount} tests successfully`,
      results 
    });
  } catch (error: any) {
    console.error('Error importing tests:', error);
    res.status(500).json({ error: 'Failed to import tests' });
  }
});

export default router;
