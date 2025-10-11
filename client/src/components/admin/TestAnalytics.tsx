import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';

interface TestAnalyticsProps {
  testId?: string;
  testType?: 'practice' | 'mock';
}

interface AnalyticsData {
  totalTests: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  completionRate: number;
  averageTimeSpent: number;
  categoryBreakdown: {
    category: string;
    attempts: number;
    averageScore: number;
    passRate: number;
  }[];
  difficultyBreakdown: {
    difficulty: number;
    attempts: number;
    averageScore: number;
    passRate: number;
  }[];
  recentAttempts: {
    id: string;
    userId: string;
    testId: string;
    score: number;
    totalQuestions: number;
    passed: boolean;
    timeSpent: number;
    completedAt: string;
  }[];
  topPerformingTests: {
    testId: string;
    title: string;
    attempts: number;
    averageScore: number;
    passRate: number;
  }[];
  strugglingAreas: {
    category: string;
    averageScore: number;
    attempts: number;
    improvement: number;
  }[];
}

const TestAnalytics: React.FC<TestAnalyticsProps> = ({ testId, testType }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [testId, testType, timeRange, selectedCategory]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        category: selectedCategory,
        ...(testId && { testId }),
        ...(testType && { testType })
      });
      
      const response = await apiRequest('GET', `/api/admin/test-analytics?${params}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        category: selectedCategory,
        format: 'csv',
        ...(testId && { testId }),
        ...(testType && { testType })
      });
      
      const response = await apiRequest('GET', `/api/admin/test-analytics/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting analytics:', error);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Analytics Data</h3>
          <p className="text-gray-500">Analytics data will appear here once students start taking tests.</p>
        </CardContent>
      </Card>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Test Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into test performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="British History">British History</SelectItem>
                <SelectItem value="Government & Politics">Government & Politics</SelectItem>
                <SelectItem value="Geography & Culture">Geography & Culture</SelectItem>
                <SelectItem value="Laws & Society">Laws & Society</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold">{analytics.totalAttempts.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                  {analytics.averageScore.toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.passRate)}`}>
                  {analytics.passRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Time Spent</p>
                <p className="text-2xl font-bold">{Math.round(analytics.averageTimeSpent / 60)}m</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.category}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{category.attempts} attempts</span>
                    <span className={`font-medium ${getScoreColor(category.averageScore)}`}>
                      {category.averageScore.toFixed(1)}%
                    </span>
                    <Badge variant={category.passRate >= 70 ? 'default' : 'destructive'}>
                      {category.passRate.toFixed(1)}% pass rate
                    </Badge>
                  </div>
                </div>
                <Progress value={category.averageScore} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.difficultyBreakdown.map((difficulty) => (
              <div key={difficulty.difficulty} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(difficulty.difficulty)}>
                      {getDifficultyLabel(difficulty.difficulty)}
                    </Badge>
                    <span className="text-sm text-gray-600">{difficulty.attempts} attempts</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-medium ${getScoreColor(difficulty.averageScore)}`}>
                      {difficulty.averageScore.toFixed(1)}%
                    </span>
                    <Badge variant={difficulty.passRate >= 70 ? 'default' : 'destructive'}>
                      {difficulty.passRate.toFixed(1)}% pass rate
                    </Badge>
                  </div>
                </div>
                <Progress value={difficulty.averageScore} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topPerformingTests.map((test, index) => (
              <div key={test.testId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{test.title}</p>
                    <p className="text-sm text-gray-600">{test.attempts} attempts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${getScoreColor(test.averageScore)}`}>
                    {test.averageScore.toFixed(1)}%
                  </span>
                  <Badge variant={test.passRate >= 70 ? 'default' : 'destructive'}>
                    {test.passRate.toFixed(1)}% pass rate
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Struggling Areas */}
      {analytics.strugglingAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Areas Needing Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.strugglingAreas.map((area) => (
                <div key={area.category} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-800">{area.category}</p>
                    <p className="text-sm text-red-600">{area.attempts} attempts</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-red-600">
                      {area.averageScore.toFixed(1)}%
                    </span>
                    {area.improvement > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">+{area.improvement.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentAttempts.slice(0, 10).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {attempt.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">User {attempt.userId.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${getScoreColor((attempt.score / attempt.totalQuestions) * 100)}`}>
                    {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(attempt.timeSpent / 60)}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAnalytics;
