import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
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
  RefreshCw,
  Calendar,
  Award,
  BookOpen,
  Activity
} from 'lucide-react';
import TestAnalytics from '@/components/admin/TestAnalytics';

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
  timeSeriesData: {
    date: string;
    attempts: number;
    averageScore: number;
    passRate: number;
  }[];
  userEngagement: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionTime: number;
  };
}

const AdminTestAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTestType, setSelectedTestType] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedCategory, selectedTestType]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        category: selectedCategory,
        testType: selectedTestType
      });
      
      const response = await fetch(`/api/admin/test-analytics?${params}`);
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
        testType: selectedTestType,
        format: 'csv'
      });
      
      const response = await fetch(`/api/admin/test-analytics/export?${params}`);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into test performance and student engagement</p>
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
            <Select value={selectedTestType} onValueChange={setSelectedTestType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="practice">Practice Tests</SelectItem>
                <SelectItem value="mock">Mock Tests</SelectItem>
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
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{analytics.totalTests.toLocaleString()}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold">{analytics.totalAttempts.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
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
              <Target className="w-8 h-8 text-purple-600" />
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
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
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

            {/* Difficulty Performance */}
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
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* User Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{analytics.userEngagement.activeUsers}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Users</p>
                    <p className="text-2xl font-bold">{analytics.userEngagement.newUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Returning Users</p>
                    <p className="text-2xl font-bold">{analytics.userEngagement.returningUsers}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Session Time</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.userEngagement.averageSessionTime / 60)}m</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Attempts</CardTitle>
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
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.timeSeriesData.map((dataPoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{dataPoint.date}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-gray-600">{dataPoint.attempts} attempts</span>
                      <span className={`font-medium ${getScoreColor(dataPoint.averageScore)}`}>
                        {dataPoint.averageScore.toFixed(1)}%
                      </span>
                      <Badge variant={dataPoint.passRate >= 70 ? 'default' : 'destructive'}>
                        {dataPoint.passRate.toFixed(1)}% pass rate
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Best Performing Category</h4>
                    <p className="text-sm text-blue-600">
                      {analytics.categoryBreakdown.reduce((best, current) => 
                        current.averageScore > best.averageScore ? current : best
                      ).category} with {analytics.categoryBreakdown.reduce((best, current) => 
                        current.averageScore > best.averageScore ? current : best
                      ).averageScore.toFixed(1)}% average score
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Improvement Areas</h4>
                    <p className="text-sm text-green-600">
                      Focus on {analytics.strugglingAreas.length > 0 ? 
                        analytics.strugglingAreas[0].category : 'all categories'} 
                      to improve overall performance
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Engagement Level</h4>
                    <p className="text-sm text-yellow-600">
                      {analytics.userEngagement.activeUsers} active users with 
                      {Math.round(analytics.userEngagement.averageSessionTime / 60)} minutes average session time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.strugglingAreas.length > 0 && (
                    <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-800">Content Review Needed</h4>
                      <p className="text-sm text-red-600">
                        Consider reviewing content for {analytics.strugglingAreas[0].category} 
                        as students are struggling with this area
                      </p>
                    </div>
                  )}
                  
                  <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-medium text-blue-800">Success Story</h4>
                    <p className="text-sm text-blue-600">
                      {analytics.topPerformingTests[0]?.title} is performing exceptionally well 
                      with {analytics.topPerformingTests[0]?.passRate.toFixed(1)}% pass rate
                    </p>
                  </div>
                  
                  <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-medium text-green-800">Engagement Boost</h4>
                    <p className="text-sm text-green-600">
                      High user engagement suggests the platform is meeting student needs effectively
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminTestAnalytics;
