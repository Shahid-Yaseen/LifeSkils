import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Eye, 
  Plus, 
  Settings, 
  BookOpen, 
  Target, 
  Clock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import QuestionEditor from './QuestionEditor';

interface TestFormData {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  isActive: boolean;
  questions: any[];
  timeLimit?: number;
  passingScore?: number;
  instructions?: string;
  tags?: string[];
}

interface TestCreationFormProps {
  testType: 'practice' | 'mock';
  initialData?: Partial<TestFormData>;
  onSave: (data: TestFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const TestCreationForm: React.FC<TestCreationFormProps> = ({
  testType,
  initialData,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<TestFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'British History',
    difficulty: initialData?.difficulty || 3,
    isActive: initialData?.isActive ?? true,
    questions: initialData?.questions || [],
    timeLimit: initialData?.timeLimit || (testType === 'mock' ? 45 : 30),
    passingScore: initialData?.passingScore || 75,
    instructions: initialData?.instructions || '',
    tags: initialData?.tags || []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const categories = [
    'British History',
    'Government & Politics',
    'Geography & Culture',
    'Laws & Society'
  ];

  const difficulties = [
    { value: 1, label: 'Beginner', description: 'Basic knowledge required' },
    { value: 2, label: 'Easy', description: 'Fundamental concepts' },
    { value: 3, label: 'Medium', description: 'Moderate understanding needed' },
    { value: 4, label: 'Hard', description: 'Advanced knowledge required' },
    { value: 5, label: 'Expert', description: 'Expert-level understanding' }
  ];

  const handleInputChange = (field: keyof TestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionsChange = (questions: any[]) => {
    setFormData(prev => ({ ...prev, questions }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Test title is required');
    }

    if (!formData.description.trim()) {
      errors.push('Test description is required');
    }

    if (!formData.category) {
      errors.push('Test category is required');
    }

    if (formData.questions.length === 0) {
      errors.push('At least one question is required');
    }

    if (formData.questions.length < 5) {
      errors.push('Minimum 5 questions recommended for a complete test');
    }

    // Validate questions
    formData.questions.forEach((question, index) => {
      if (!question.question?.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }
      if (!question.options || question.options.length !== 4) {
        errors.push(`Question ${index + 1}: Exactly 4 options are required`);
      }
      if (question.options?.some((opt: string) => !opt.trim())) {
        errors.push(`Question ${index + 1}: All options must be filled`);
      }
      if (!question.explanation?.trim()) {
        errors.push(`Question ${index + 1}: Explanation is required`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      console.log('TestCreationForm: Saving form data:', formData);
      onSave(formData);
    } else {
      console.log('TestCreationForm: Validation failed');
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    return difficulties.find(d => d.value === difficulty)?.label || 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Test' : 'Create New Test'}
          </h2>
          <p className="text-gray-600">
            {testType === 'practice' ? 'Practice Test' : 'Mock Test'} Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Update Test' : 'Create Test'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Test Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter test title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter test description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select value={formData.difficulty.toString()} onValueChange={(value) => handleInputChange('difficulty', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map(difficulty => (
                            <SelectItem key={difficulty.value} value={difficulty.value.toString()}>
                              {difficulty.label} - {difficulty.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      placeholder="Enter test instructions for students"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <QuestionEditor
                questions={formData.questions}
                onQuestionsChange={handleQuestionsChange}
                readOnly={false}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Test Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Test is active and available to students</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={formData.timeLimit}
                        onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                        min="5"
                        max="180"
                      />
                    </div>

                    <div>
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        value={formData.passingScore}
                        onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                        min="50"
                        max="100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Test Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">{formData.title}</h3>
                      <p className="text-gray-600">{formData.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={getDifficultyColor(formData.difficulty)}>
                        {getDifficultyLabel(formData.difficulty)}
                      </Badge>
                      <Badge variant="outline">{formData.category}</Badge>
                      <Badge variant="secondary">{formData.questions.length} questions</Badge>
                      {formData.timeLimit && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {formData.timeLimit} min
                        </Badge>
                      )}
                    </div>

                    {formData.instructions && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Instructions:</h4>
                        <p className="text-sm">{formData.instructions}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium">Questions Preview:</h4>
                      {formData.questions.slice(0, 3).map((question, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <p className="font-medium mb-2">Q{index + 1}: {question.question}</p>
                          <div className="space-y-1">
                            {question.options?.map((option: string, optIndex: number) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className={optIndex === question.correctAnswer ? 'font-medium text-green-600' : ''}>
                                  {option}
                                </span>
                                {optIndex === question.correctAnswer && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {formData.questions.length > 3 && (
                        <p className="text-sm text-gray-500">
                          ... and {formData.questions.length - 3} more questions
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Test Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Questions:</span>
                <span className="font-medium">{formData.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <Badge className={getDifficultyColor(formData.difficulty)}>
                  {getDifficultyLabel(formData.difficulty)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="font-medium">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time Limit:</span>
                <span className="font-medium">{formData.timeLimit} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Passing Score:</span>
                <span className="font-medium">{formData.passingScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Test Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Preview Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestCreationForm;
