import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import QuestionEditor from '@/components/admin/QuestionEditor';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Archive, 
  Download, 
  Upload,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  BookOpen,
  FileText,
  Target,
  TrendingUp
} from 'lucide-react';

interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  questions: any[];
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalAttempts?: number;
  averageScore?: number;
  passRate?: number;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const AdminTestManagement: React.FC = () => {
  const [practiceTests, setPracticeTests] = useState<Test[]>([]);
  const [mockTests, setMockTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testType, setTestType] = useState<'practice' | 'mock'>('practice');
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Form state for creating/editing tests
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 3,
    isActive: true,
    questions: [] as Question[]
  });

  useEffect(() => {
    fetchTests();
    fetchAnalytics();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const [practiceResponse, mockResponse] = await Promise.all([
        fetch('/api/practice-tests'),
        fetch('/api/mock-tests')
      ]);
      
      // Check if responses are ok
      if (!practiceResponse.ok || !mockResponse.ok) {
        throw new Error(`API request failed: ${practiceResponse.status} ${mockResponse.status}`);
      }
      
      const practiceData = await practiceResponse.json();
      const mockData = await mockResponse.json();
      
      // Ensure we always set arrays, even if API returns non-array data
      setPracticeTests(Array.isArray(practiceData) ? practiceData : []);
      setMockTests(Array.isArray(mockData) ? mockData : []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      // Set empty arrays on error to prevent further issues
      setPracticeTests([]);
      setMockTests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await apiRequest('GET', '/api/admin/test-analytics');
      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && error.message.includes('401')) {
        console.log('Authentication required. Please log in as admin.');
        // Set sample data for demo purposes
        setAnalytics({
          totalTests: 5,
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          completionRate: 0
        });
      } else {
        // Set default values for other errors
        setAnalytics({
          totalTests: 0,
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          completionRate: 0
        });
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCreateTest = async (formData?: any) => {
    try {
      const dataToUse = formData || testForm;
      console.log('Creating test with data:', dataToUse);
      
      // Basic validation
      if (!dataToUse.title || !dataToUse.description || !dataToUse.category) {
        alert('Please fill in all required fields (title, description, category)');
        return;
      }
      
      if (!dataToUse.questions || dataToUse.questions.length === 0) {
        alert('Please add at least one question to the test');
        return;
      }
      
      const endpoint = testType === 'practice' ? '/api/admin/practice-tests' : '/api/admin/mock-tests';
      console.log('Using endpoint:', endpoint);
      
      const response = await apiRequest('POST', endpoint, dataToUse);
      console.log('Test creation successful:', response);
      
      setShowCreateDialog(false);
      resetForm();
      fetchTests();
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditTest = async () => {
    if (!editingTest) return;

    try {
      const endpoint = testType === 'practice' 
        ? `/api/admin/practice-tests/${editingTest.id}` 
        : `/api/admin/mock-tests/${editingTest.id}`;
      
      await apiRequest('PUT', endpoint, testForm);
      
      setShowEditDialog(false);
      setEditingTest(null);
      resetForm();
      fetchTests();
    } catch (error) {
      console.error('Error updating test:', error);
    }
  };

  const handleDeleteTest = async (testId: string, testType: 'practice' | 'mock') => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }

    try {
      const endpoint = testType === 'practice' 
        ? `/api/admin/practice-tests/${testId}` 
        : `/api/admin/mock-tests/${testId}`;
      
      await apiRequest('DELETE', endpoint);
      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const handleDuplicateTest = async (test: Test, testType: 'practice' | 'mock') => {
    const duplicatedTest = {
      ...test,
      title: `${test.title} (Copy)`,
      id: undefined
    };

    try {
      const endpoint = testType === 'practice' ? '/api/admin/practice-tests' : '/api/admin/mock-tests';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedTest)
      });

      if (response.ok) {
        fetchTests();
      }
    } catch (error) {
      console.error('Error duplicating test:', error);
    }
  };

  const resetForm = () => {
    setTestForm({
      title: '',
      description: '',
      category: '',
      difficulty: 3,
      isActive: true,
      questions: []
    });
  };

  const openEditDialog = (test: Test, type: 'practice' | 'mock') => {
    setEditingTest(test);
    setTestType(type);
    setTestForm({
      title: test.title,
      description: test.description,
      category: test.category,
      difficulty: test.difficulty,
      isActive: test.isActive,
      questions: test.questions || []
    });
    setShowEditDialog(true);
  };

  const filteredTests = (tests: Test[]) => {
    // Safety check to ensure tests is an array
    if (!Array.isArray(tests)) {
      console.warn('filteredTests received non-array data:', tests);
      return [];
    }
    
    return tests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
      const matchesDifficulty = filterDifficulty === 'all' || test.difficulty.toString() === filterDifficulty;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && test.isActive) ||
                           (filterStatus === 'inactive' && !test.isActive);
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
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
    switch (difficulty) {
      case 1: return 'Beginner';
      case 2: return 'Easy';
      case 3: return 'Medium';
      case 4: return 'Hard';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage practice tests and mock tests</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </div>
      </div>

      {/* Admin Login Notice */}
      {analytics && analytics.totalTests === 5 && analytics.totalAttempts === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Admin Access Required
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>To view real analytics data, please log in as an admin user:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Email: admin@example.com</li>
                  <li>Password: admin123</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Overview */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTests || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalAttempts || 0}</p>
                </div>
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(analytics.averageScore || 0)}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(analytics.passRate || 0)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Categories</SelectItem>
                <SelectItem value="British History" className="text-gray-900 dark:text-white">British History</SelectItem>
                <SelectItem value="Government & Politics" className="text-gray-900 dark:text-white">Government & Politics</SelectItem>
                <SelectItem value="Geography & Culture" className="text-gray-900 dark:text-white">Geography & Culture</SelectItem>
                <SelectItem value="Laws & Society" className="text-gray-900 dark:text-white">Laws & Society</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-32 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Levels</SelectItem>
                <SelectItem value="1" className="text-gray-900 dark:text-white">Beginner</SelectItem>
                <SelectItem value="2" className="text-gray-900 dark:text-white">Easy</SelectItem>
                <SelectItem value="3" className="text-gray-900 dark:text-white">Medium</SelectItem>
                <SelectItem value="4" className="text-gray-900 dark:text-white">Hard</SelectItem>
                <SelectItem value="5" className="text-gray-900 dark:text-white">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Status</SelectItem>
                <SelectItem value="active" className="text-gray-900 dark:text-white">Active</SelectItem>
                <SelectItem value="inactive" className="text-gray-900 dark:text-white">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Test Management Tabs */}
      <Tabs defaultValue="practice" className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <TabsTrigger value="practice" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Practice Tests</TabsTrigger>
          <TabsTrigger value="mock" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Mock Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Practice Tests ({filteredTests(practiceTests).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTests(practiceTests).map((test) => (
                  <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                          <Badge className={getDifficultyColor(test.difficulty)}>
                            {getDifficultyLabel(test.difficulty)}
                          </Badge>
                          <Badge variant={test.isActive ? 'default' : 'secondary'}>
                            {test.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{test.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Category: {test.category}</span>
                          <span>Questions: {test.questions?.length || 0}</span>
                          {test.totalAttempts && <span>Attempts: {test.totalAttempts}</span>}
                          {test.averageScore && <span>Avg Score: {test.averageScore}%</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(test, 'practice')} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicateTest(test, 'practice')} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTest(test.id, 'practice')} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mock">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Mock Tests ({filteredTests(mockTests).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTests(mockTests).map((test) => (
                  <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                          <Badge className={getDifficultyColor(test.difficulty)}>
                            {getDifficultyLabel(test.difficulty)}
                          </Badge>
                          <Badge variant={test.isActive ? 'default' : 'secondary'}>
                            {test.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{test.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Category: {test.category}</span>
                          <span>Questions: {test.questions?.length || 0}</span>
                          {test.totalAttempts && <span>Attempts: {test.totalAttempts}</span>}
                          {test.averageScore && <span>Avg Score: {test.averageScore}%</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(test, 'mock')} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicateTest(test, 'mock')} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTest(test.id, 'mock')} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Test Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setEditingTest(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {showCreateDialog ? 'Create New Test' : 'Edit Test'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Test Title</Label>
                <Input
                  id="title"
                  value={testForm.title}
                  onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                  placeholder="Enter test title"
                  className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category</Label>
                <Select value={testForm.category} onValueChange={(value) => setTestForm({...testForm, category: value})}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="British History" className="text-gray-900 dark:text-white">British History</SelectItem>
                    <SelectItem value="Government & Politics" className="text-gray-900 dark:text-white">Government & Politics</SelectItem>
                    <SelectItem value="Geography & Culture" className="text-gray-900 dark:text-white">Geography & Culture</SelectItem>
                    <SelectItem value="Laws & Society" className="text-gray-900 dark:text-white">Laws & Society</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={testForm.description}
                onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                placeholder="Enter test description"
                rows={3}
                className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">Difficulty Level</Label>
                <Select value={testForm.difficulty.toString()} onValueChange={(value) => setTestForm({...testForm, difficulty: parseInt(value)})}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="1" className="text-gray-900 dark:text-white">Beginner</SelectItem>
                    <SelectItem value="2" className="text-gray-900 dark:text-white">Easy</SelectItem>
                    <SelectItem value="3" className="text-gray-900 dark:text-white">Medium</SelectItem>
                    <SelectItem value="4" className="text-gray-900 dark:text-white">Hard</SelectItem>
                    <SelectItem value="5" className="text-gray-900 dark:text-white">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={testForm.isActive}
                  onCheckedChange={(checked) => setTestForm({...testForm, isActive: checked})}
                />
                <Label htmlFor="isActive" className="text-gray-700 dark:text-gray-300">Active</Label>
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-gray-700 dark:text-gray-300">Test Questions</Label>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{testForm.questions.length} questions</Badge>
              </div>
              
              <QuestionEditor
                questions={testForm.questions}
                onQuestionsChange={(questions) => setTestForm({...testForm, questions})}
                readOnly={false}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setShowEditDialog(false);
                  setEditingTest(null);
                  resetForm();
                }}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={showCreateDialog ? () => handleCreateTest() : handleEditTest}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {showCreateDialog ? 'Create Test' : 'Update Test'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      </div>
    </AdminLayout>
  );
};

export default AdminTestManagement;
