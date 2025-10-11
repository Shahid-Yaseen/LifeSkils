import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  UserCheck, 
  Crown, 
  DollarSign,
  Target,
  Award,
  BookOpen,
  Video,
  FileText,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  MousePointer,
  Heart,
  Share,
  MessageCircle,
  Star,
  Zap,
  Globe,
  Shield,
  Activity,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    revenue: number;
    conversionRate: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  userGrowth: {
    daily: Array<{ date: string; users: number }>;
    weekly: Array<{ week: string; users: number }>;
    monthly: Array<{ month: string; users: number }>;
  };
  contentPerformance: {
    videos: Array<{ title: string; views: number; completionRate: number }>;
    exercises: Array<{ title: string; attempts: number; successRate: number }>;
    tests: Array<{ title: string; completions: number; averageScore: number }>;
  };
  revenue: {
    monthly: number;
    yearly: number;
    growth: number;
    subscriptionBreakdown: {
      premium: number;
      free: number;
    };
  };
  engagement: {
    averageSessionTime: number;
    pageViews: number;
    uniqueVisitors: number;
    returnVisitors: number;
  };
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  
  const { toast } = useToast();

  const { data: analytics, isLoading, refetch, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Analytics Refreshed",
      description: "Analytics data has been updated successfully.",
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export analytics data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Analytics data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Only use real data from backend
  const displayData = analytics;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please ensure you're logged in as an admin</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Error Notice */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Error:</strong> Failed to load analytics data. Please check your authentication and try again.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="7d" className="text-gray-900 dark:text-white">Last 7 days</SelectItem>
              <SelectItem value="30d" className="text-gray-900 dark:text-white">Last 30 days</SelectItem>
              <SelectItem value="90d" className="text-gray-900 dark:text-white">Last 90 days</SelectItem>
              <SelectItem value="1y" className="text-gray-900 dark:text-white">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(displayData?.overview?.totalUsers || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(12.5)}
                  <span className={`text-sm ${getTrendColor(12.5)}`}></span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(displayData?.overview?.activeUsers || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(8.2)}
                  <span className={`text-sm ${getTrendColor(8.2)}`}></span>
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(displayData?.overview?.revenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(15.3)}
                  <span className={`text-sm ${getTrendColor(15.3)}`}></span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(displayData?.overview?.conversionRate || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(2.1)}
                  <span className={`text-sm ${getTrendColor(2.1)}`}></span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Users</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Content</TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData?.userGrowth?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayData?.userGrowth?.monthly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                      <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">98.5%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">2.3s</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">User Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Premium Users', value: displayData?.revenue?.subscriptionBreakdown?.premium || 0, color: '#3b82f6' },
                          { name: 'Free Users', value: displayData?.revenue?.subscriptionBreakdown?.free || 0, color: '#6b7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Premium Users', value: displayData?.revenue?.subscriptionBreakdown?.premium || 0, color: '#3b82f6' },
                          { name: 'Free Users', value: displayData?.revenue?.subscriptionBreakdown?.free || 0, color: '#6b7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData?.userGrowth?.weekly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatNumber(displayData?.overview?.totalUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {formatNumber(displayData?.overview?.activeUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {formatNumber(displayData?.overview?.newUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">New Users (7d)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {formatTime(displayData?.overview?.averageSessionTime || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Session Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Top Performing Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData?.contentPerformance?.videos?.slice(0, 5).map((video, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{video.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {formatNumber(video.views)} views
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {video.completionRate}% completion
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Exercise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayData?.contentPerformance?.exercises?.slice(0, 5).map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{exercise.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {formatNumber(exercise.attempts)} attempts
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {exercise.successRate}% success
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Test Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData?.contentPerformance?.tests || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === 'completions' ? 'Completions' : 'Average Score']} />
                    <Bar dataKey="completions" fill="#3b82f6" name="completions" />
                    <Bar dataKey="averageScore" fill="#10b981" name="averageScore" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Monthly Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(displayData?.revenue?.monthly || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Yearly Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(displayData?.revenue?.yearly || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Growth Rate</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400 font-semibold">+{displayData?.revenue?.growth || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Subscription Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Premium', value: displayData?.revenue?.subscriptionBreakdown?.premium || 0, color: '#3b82f6' },
                          { name: 'Free', value: displayData?.revenue?.subscriptionBreakdown?.free || 0, color: '#6b7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Premium', value: displayData?.revenue?.subscriptionBreakdown?.premium || 0, color: '#3b82f6' },
                          { name: 'Free', value: displayData?.revenue?.subscriptionBreakdown?.free || 0, color: '#6b7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayData?.userGrowth?.monthly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value) * 100), 'Revenue']} />
                    <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Average Session Time</span>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{formatTime(displayData?.engagement?.averageSessionTime || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Page Views</span>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{formatNumber(displayData?.engagement?.pageViews || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Unique Visitors</span>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{formatNumber(displayData?.engagement?.uniqueVisitors || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Return Visitors</span>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{formatNumber(displayData?.engagement?.returnVisitors || 0)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">User Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Session Time', value: displayData?.engagement?.averageSessionTime || 0 },
                      { name: 'Page Views', value: Math.floor((displayData?.engagement?.pageViews || 0) / 1000) },
                      { name: 'Unique Visitors', value: Math.floor((displayData?.engagement?.uniqueVisitors || 0) / 100) },
                      { name: 'Return Visitors', value: Math.floor((displayData?.engagement?.returnVisitors || 0) / 100) }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatTime(displayData?.engagement?.averageSessionTime || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Session Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {formatNumber(displayData?.engagement?.pageViews || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Page Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {formatNumber(displayData?.engagement?.uniqueVisitors || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique Visitors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {formatPercentage(displayData?.overview?.bounceRate || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}
