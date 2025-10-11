import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { 
  BookOpen, 
  BarChart3, 
  Settings, 
  Users, 
  Target, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Archive,
  Trash2,
  Edit,
  Eye,
  Copy,
  ArrowRight,
  FileText,
  BarChart
} from 'lucide-react';
import AdminTestManagement from './AdminTestManagement';
import AdminTestAnalytics from './AdminTestAnalytics';
import BulkTestOperations from '@/components/admin/BulkTestOperations';

interface DashboardStats {
  totalTests: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  activeUsers: number;
  recentActivity: number;
}

const AdminTestDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/test-analytics');
      const data = await response.json();
      setStats({
        totalTests: data.totalTests || 0,
        totalAttempts: data.totalAttempts || 0,
        averageScore: data.averageScore || 0,
        passRate: data.passRate || 0,
        activeUsers: data.activeUsers || 0,
        recentActivity: data.recentActivity || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Management Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive test administration and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="w-4 h-4 mr-2" />
            Import Tests
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTests.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts.toLocaleString()}</p>
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
                  <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                    {stats.averageScore.toFixed(1)}%
                  </p>
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
                  <p className={`text-2xl font-bold ${getScoreColor(stats.passRate)}`}>
                    {stats.passRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/tests/management">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Test Management</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Create, edit, and manage tests</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/admin/tests/analytics">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <BarChart className="h-8 w-8 text-green-500 dark:text-green-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Test Analytics</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View performance insights</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Download className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Download test data and reports</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="management" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Test Management</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Analytics</TabsTrigger>
          <TabsTrigger value="bulk" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">New test created</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">British History Practice Test #5</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center">
                      <Edit className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Test updated</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Government & Politics Mock Test #3</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">High test completion</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Geography & Culture Test - 15 completions today</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Performance</span>
                    <Badge variant={stats && stats.averageScore >= 70 ? 'default' : 'destructive'}>
                      {stats?.averageScore.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</span>
                    <Badge variant={stats && stats.passRate >= 70 ? 'default' : 'destructive'}>
                      {stats?.passRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats?.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Recent Activity</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats?.recentActivity} tests today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Categories Overview */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Test Categories Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'British History', count: 12, color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' },
                  { name: 'Government & Politics', count: 8, color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
                  { name: 'Geography & Culture', count: 10, color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
                  { name: 'Laws & Society', count: 6, color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' }
                ].map((category) => (
                  <div key={category.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                      <Badge className={category.color}>
                        {category.count} tests
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" 
                        style={{ width: `${(category.count / 12) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Test Management</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Access the full test management interface to create, edit, and manage tests
            </p>
            <Link href="/admin/tests/management">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Go to Test Management
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8">
            <BarChart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Test Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              View comprehensive analytics and performance insights for all tests
            </p>
            <Link href="/admin/tests/analytics">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                <BarChart className="w-4 h-4 mr-2" />
                Go to Analytics
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Bulk Test Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Bulk Operations</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Select tests from the Test Management tab to perform bulk operations
                </p>
                <Link href="/admin/tests/management">
                  <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Go to Test Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminTestDashboard;
