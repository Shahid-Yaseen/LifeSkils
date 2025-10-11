# Enhanced Test Management System

## Overview

The Enhanced Test Management System provides a comprehensive solution for managing practice tests and mock tests in the Life Skills Prep application. It includes advanced features for data upload, analytics, and test generation.

## System Architecture

### Core Components

1. **Enhanced Test Manager** (`server/services/enhanced-test-manager.ts`)
   - Centralized test management
   - Advanced analytics
   - Bulk operations
   - Test duplication and archiving

2. **Data Upload Service** (`server/services/data-upload-service.ts`)
   - Handles bulk data uploads
   - Validates test data
   - Converts question pools to enhanced format
   - Provides upload analytics

3. **Data Upload Routes** (`server/routes/data-upload-routes.ts`)
   - RESTful API endpoints for data upload
   - Validation endpoints
   - Upload status tracking
   - History management

## Features

### 1. Enhanced Question Management

- **Question Validation**: Comprehensive validation of question format, options, and explanations
- **Difficulty Calculation**: Automatic difficulty assessment based on question complexity
- **Category Management**: Organized question categorization
- **Bulk Operations**: Efficient handling of large question sets

### 2. Advanced Test Generation

- **Dynamic Test Creation**: Generate tests with specific criteria
- **Balanced Question Distribution**: Ensure proper category coverage
- **Custom Test Creation**: Create tests with specific question sets
- **Test Duplication**: Clone existing tests with modifications

### 3. Comprehensive Analytics

- **Test Performance Metrics**: Track test completion rates, average scores, pass rates
- **Question-Level Analytics**: Identify top-performing and struggling questions
- **Time-Based Analytics**: Analyze completion times and patterns
- **Category Performance**: Track performance across different topics

### 4. Data Upload Capabilities

- **Bulk Upload**: Upload multiple tests simultaneously
- **Question Pool Conversion**: Convert existing question pools to enhanced format
- **Validation**: Comprehensive data validation before upload
- **Progress Tracking**: Real-time upload progress and status

## API Endpoints

### Data Upload Endpoints

#### Upload Practice Test Data
```http
POST /api/data-upload/upload-practice-test
Content-Type: application/json

{
  "title": "History Practice Test",
  "description": "Comprehensive history test",
  "category": "History",
  "difficulty": 3,
  "questions": [
    {
      "question": "When did the Norman Conquest take place?",
      "options": ["1066", "1086", "1046", "1076"],
      "correctAnswer": 0,
      "explanation": "The Norman Conquest occurred in 1066...",
      "category": "History"
    }
  ],
  "testType": "practice"
}
```

#### Upload Question Pools
```http
POST /api/data-upload/upload-question-pools
Content-Type: application/json

{
  "questionPools": {
    "history": [...],
    "government": [...],
    "geography": [...],
    "culture": [...]
  }
}
```

#### Validate Test Data
```http
POST /api/data-upload/validate-test-data
Content-Type: application/json

{
  "title": "Test Title",
  "description": "Test Description",
  "category": "History",
  "difficulty": 3,
  "questions": [...]
}
```

#### Get Upload Status
```http
GET /api/data-upload/upload-status/{testId}?testType=practice
```

#### Get Upload History
```http
GET /api/data-upload/upload-history?page=1&limit=20
```

### Enhanced Test Management Endpoints

#### Create Custom Practice Test
```http
POST /api/admin/practice-tests
Content-Type: application/json

{
  "title": "Custom Test",
  "description": "Custom test description",
  "category": "History",
  "difficulty": 3,
  "questions": [...],
  "orderIndex": 1
}
```

#### Get Enhanced Analytics
```http
GET /api/admin/test-analytics?testId={id}&testType=practice&timeRange=30d
```

#### Duplicate Test
```http
POST /api/admin/tests/{id}/duplicate
Content-Type: application/json

{
  "newTitle": "Duplicated Test Title"
}
```

#### Archive Test
```http
PATCH /api/admin/tests/{id}/archive
```

## Usage Examples

### 1. Upload the Given Question Pool Data

```javascript
// Using the upload script
const { uploadPracticeTestData } = require('./upload-practice-test-data.js');

// The script automatically processes the question pools from practice-tests.ts
await uploadPracticeTestData();
```

### 2. Create Custom Tests Programmatically

```javascript
const { enhancedTestManager } = require('./server/services/enhanced-test-manager');

// Create a custom practice test
const customTest = await enhancedTestManager.generateEnhancedPracticeTest(
  "Custom History Test",
  "A focused test on British history",
  "History",
  3, // difficulty
  24, // question count
  customQuestions // optional custom questions
);
```

### 3. Get Comprehensive Analytics

```javascript
const analytics = await enhancedTestManager.getEnhancedTestAnalytics(
  testId, 
  'practice'
);

console.log('Test Analytics:', {
  totalAttempts: analytics.totalAttempts,
  averageScore: analytics.averageScore,
  passRate: analytics.passRate,
  topPerformingQuestions: analytics.topPerformingQuestions,
  strugglingQuestions: analytics.strugglingQuestions
});
```

### 4. Bulk Upload Tests

```javascript
const { dataUploadService } = require('./server/services/data-upload-service');

const tests = [
  {
    title: "History Test 1",
    description: "First history test",
    category: "History",
    difficulty: 3,
    questions: [...],
    testType: "practice"
  },
  // ... more tests
];

const result = await dataUploadService.uploadBatchTests(tests, {
  validateQuestions: true,
  generateAnalytics: true,
  batchSize: 5
});
```

## Data Structure

### Question Format

```typescript
interface Question {
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
```

### Test Format

```typescript
interface UploadedTestData {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  questions: Question[];
  testType: 'practice' | 'mock';
}
```

## Configuration Options

### Upload Options

```typescript
interface DataUploadOptions {
  overwriteExisting?: boolean;
  validateQuestions?: boolean;
  generateAnalytics?: boolean;
  batchSize?: number;
}
```

### Analytics Options

```typescript
interface AnalyticsOptions {
  testId?: string;
  testType?: 'practice' | 'mock';
  timeRange?: string;
  category?: string;
}
```

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Detailed validation messages for invalid data
- **Upload Errors**: Specific error messages for upload failures
- **Analytics Errors**: Graceful handling of analytics generation failures
- **Network Errors**: Retry mechanisms for network-related issues

## Performance Considerations

- **Batch Processing**: Tests are processed in configurable batches
- **Async Operations**: Non-blocking operations for better performance
- **Caching**: Analytics data is cached for improved response times
- **Database Optimization**: Efficient queries with proper indexing

## Security

- **Authentication**: All admin endpoints require authentication
- **Authorization**: Role-based access control for different operations
- **Data Validation**: Comprehensive input validation
- **Audit Logging**: All operations are logged for audit purposes

## Monitoring and Logging

- **Upload Progress**: Real-time progress tracking
- **Error Logging**: Comprehensive error logging
- **Performance Metrics**: Track system performance
- **Audit Trail**: Complete audit trail of all operations

## Future Enhancements

1. **AI-Powered Question Generation**: Generate questions using AI
2. **Advanced Analytics**: Machine learning-based insights
3. **Test Recommendations**: Personalized test recommendations
4. **Collaborative Features**: Multi-user test creation
5. **Export/Import**: Enhanced data portability

## Troubleshooting

### Common Issues

1. **Upload Failures**: Check data format and validation errors
2. **Analytics Issues**: Ensure sufficient test data for analytics
3. **Performance Issues**: Adjust batch sizes and check database performance
4. **Authentication Issues**: Verify user permissions and tokens

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## Support

For technical support or questions about the Enhanced Test Management System, please refer to the system documentation or contact the development team.
