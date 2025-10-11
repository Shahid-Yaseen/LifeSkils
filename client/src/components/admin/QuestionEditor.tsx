import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface QuestionEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  onQuestionsChange,
  onSave,
  readOnly = false
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: 'British History'
  });

  const categories = [
    'British History',
    'Government & Politics',
    'Geography & Culture',
    'Laws & Society'
  ];

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      question: questionForm.question || '',
      options: questionForm.options || ['', '', '', ''],
      correctAnswer: questionForm.correctAnswer || 0,
      explanation: questionForm.explanation || '',
      category: questionForm.category || 'British History'
    };

    onQuestionsChange([...questions, newQuestion]);
    resetForm();
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      category: question.category
    });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion.id 
        ? {
            ...q,
            question: questionForm.question || '',
            options: questionForm.options || ['', '', '', ''],
            correctAnswer: questionForm.correctAnswer || 0,
            explanation: questionForm.explanation || '',
            category: questionForm.category || 'British History'
          }
        : q
    );

    onQuestionsChange(updatedQuestions);
    setEditingQuestion(null);
    resetForm();
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      onQuestionsChange(questions.filter(q => q.id !== questionId));
    }
  };

  const handleDuplicateQuestion = (question: Question) => {
    const duplicatedQuestion: Question = {
      ...question,
      id: Date.now(),
      question: `${question.question} (Copy)`
    };
    onQuestionsChange([...questions, duplicatedQuestion]);
  };

  const handleMoveQuestion = (questionId: number, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];
    onQuestionsChange(newQuestions);
  };

  const resetForm = () => {
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: 'British History'
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(questionForm.options || ['', '', '', ''])];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const isFormValid = () => {
    return questionForm.question?.trim() &&
           questionForm.options?.every(opt => opt.trim()) &&
           questionForm.explanation?.trim() &&
           questionForm.category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'British History': return 'bg-red-100 text-red-800';
      case 'Government & Politics': return 'bg-blue-100 text-blue-800';
      case 'Geography & Culture': return 'bg-green-100 text-green-800';
      case 'Laws & Society': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questions ({questions.length})</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage test questions and answers</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          {onSave && (
            <Button 
              size="sm" 
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Questions
            </Button>
          )}
        </div>
      </div>

      {/* Question Form */}
      {!readOnly && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base text-gray-900 dark:text-white">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question" className="text-gray-700 dark:text-gray-300">Question</Label>
              <Textarea
                id="question"
                value={questionForm.question || ''}
                onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                placeholder="Enter the question text"
                rows={3}
                className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Answer Options</Label>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Label className="w-8 text-sm text-gray-700 dark:text-gray-300">
                      {String.fromCharCode(65 + index)}.
                    </Label>
                    <Input
                      value={questionForm.options?.[index] || ''}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestionForm({...questionForm, correctAnswer: index})}
                      className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        questionForm.correctAnswer === index ? 'bg-green-100 dark:bg-green-900' : ''
                      }`}
                    >
                      {questionForm.correctAnswer === index ? <CheckCircle className="w-4 h-4" /> : 'Set Correct'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category</Label>
                <Select value={questionForm.category || ''} onValueChange={(value) => setQuestionForm({...questionForm, category: value})}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-gray-900 dark:text-white">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="correctAnswer" className="text-gray-700 dark:text-gray-300">Correct Answer</Label>
                <Select value={questionForm.correctAnswer?.toString() || '0'} onValueChange={(value) => setQuestionForm({...questionForm, correctAnswer: parseInt(value)})}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="0" className="text-gray-900 dark:text-white">A</SelectItem>
                    <SelectItem value="1" className="text-gray-900 dark:text-white">B</SelectItem>
                    <SelectItem value="2" className="text-gray-900 dark:text-white">C</SelectItem>
                    <SelectItem value="3" className="text-gray-900 dark:text-white">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="explanation" className="text-gray-700 dark:text-gray-300">Explanation</Label>
              <Textarea
                id="explanation"
                value={questionForm.explanation || ''}
                onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                placeholder="Explain why this answer is correct"
                rows={2}
                className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              {editingQuestion && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button 
                onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                disabled={!isFormValid()}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <Card key={question.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Q{index + 1}</span>
                    <Badge className={getCategoryColor(question.category)}>
                      {question.category}
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {String.fromCharCode(65 + question.correctAnswer)} is correct
                    </Badge>
                  </div>
                  
                  <p className="font-medium mb-3 text-gray-900 dark:text-white">{question.question}</p>
                  
                  <div className="space-y-1 mb-3">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          optIndex === question.correctAnswer 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className={`${optIndex === question.correctAnswer ? 'font-medium text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'}`}>
                          {option}
                        </span>
                        {optIndex === question.correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
                
                {!readOnly && (
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveQuestion(question.id, 'up')}
                      disabled={index === 0}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveQuestion(question.id, 'down')}
                      disabled={index === questions.length - 1}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateQuestion(question)}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {questions.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Questions Added</h3>
              <p className="text-gray-500 dark:text-gray-400">Add your first question to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Validation Alerts */}
      {questions.length > 0 && (
        <div className="space-y-2">
          {questions.some(q => !q.question.trim()) && (
            <Alert className="bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Some questions are missing question text.
              </AlertDescription>
            </Alert>
          )}
          {questions.some(q => q.options.some(opt => !opt.trim())) && (
            <Alert className="bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Some questions have empty answer options.
              </AlertDescription>
            </Alert>
          )}
          {questions.some(q => !q.explanation.trim()) && (
            <Alert className="bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Some questions are missing explanations.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
