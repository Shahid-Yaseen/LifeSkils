import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import MobileNav from "@/components/mobile-nav";
import FloatingChatbot from "@/components/floating-chatbot";
import { 
  ArrowLeft,
  User,
  Crown,
  CreditCard,
  Settings,
  Mail,
  Calendar,
  Trophy,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  Loader2,
  Edit3,
  Save,
  X,
  Shield,
  Star,
  TrendingUp,
  Award,
  Activity,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const { user, isLoading, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (handled by ProtectedRoute)
  if (!user) {
    return null;
  }

  const [formData, setFormData] = useState({
    firstName: user.name || "",
    email: user.email || "",
    username: user.username || ""
  });

  const getSubscriptionDisplay = () => {
    if (!user.subscriptionType || user.subscriptionStatus !== 'active') {
      return {
        badge: <Badge variant="outline" className="text-xs">Free Access</Badge>,
        description: "Limited access to basic features"
      };
    }

    const subscriptionInfo = {
      basic: {
        label: 'Learning App Access',
        description: '3 months complete platform access - Perfect for intensive study preparation',
        badge: <Badge className="text-xs bg-green-600"><Crown className="w-3 h-3 mr-1" />Learning App (3mo)</Badge>
      },
      group: {
        label: 'Group Video Sessions',
        description: 'Premium package with live group video calls and UK test specialist support',
        badge: <Badge className="text-xs bg-blue-600"><Crown className="w-3 h-3 mr-1" />Group Sessions</Badge>
      },
      guidance: {
        label: 'Citizenship Application Guidance',
        description: 'Dedicated support for completing UK citizenship application forms',
        badge: <Badge className="text-xs bg-purple-600"><Crown className="w-3 h-3 mr-1" />Application Guide</Badge>
      }
    };

    return subscriptionInfo[user.subscriptionType as keyof typeof subscriptionInfo] || {
      badge: <Badge className="text-xs bg-uk-blue"><Crown className="w-3 h-3 mr-1" />Premium</Badge>,
      description: "Premium access to all features"
    };
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { firstName?: string; email?: string; username?: string }) => {
      const response = await apiRequest('PUT', '/api/user/profile', profileData);
      return await response.json();
    },
    onSuccess: (data) => {
      // Update the user context with new data
      updateUser(data.user);
      
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    // Prepare data for API call
    const updateData: { firstName?: string; email?: string; username?: string } = {};
    
    if (formData.firstName !== user.name) {
      updateData.firstName = formData.firstName;
    }
    if (formData.email !== user.email) {
      updateData.email = formData.email;
    }
    if (formData.username !== user.username) {
      updateData.username = formData.username;
    }

    // Only proceed if there are changes
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes were made to your profile.",
      });
      setIsEditing(false);
      return;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.name || "",
      email: user.email || "",
      username: user.username || ""
    });
    setIsEditing(false);
  };

  const subscriptionInfo = getSubscriptionDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header with Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/dashboard')}
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium backdrop-blur-sm"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 duration-200" />
                <span className="text-xs sm:text-sm">Back to Dashboard</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              {subscriptionInfo.badge}
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 ring-4 ring-white/20 shadow-2xl mx-auto sm:mx-0">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-white/20 text-white text-lg sm:text-xl lg:text-2xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-white text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{user.name || user.username}</h1>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-4">{user.email}</p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center justify-center sm:justify-start space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Active now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Personal Information Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-gray-200/50 dark:bg-gray-800/95 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-white text-lg sm:text-xl">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                      Manage your personal details and account settings
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-cancel"
                        className="hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save"
                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      data-testid="input-firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className={`h-10 sm:h-12 ${!isEditing ? "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-900 dark:text-gray-100"}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4" />
                      <span>Username</span>
                    </Label>
                    <Input
                      id="username"
                      data-testid="input-username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      disabled={!isEditing}
                      className={`h-10 sm:h-12 ${!isEditing ? "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-900 dark:text-gray-100"}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className={`h-10 sm:h-12 ${!isEditing ? "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-900 dark:text-gray-100"}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>Member Since</span>
                  </Label>
                  <Input
                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : "N/A"}
                    disabled
                    className="h-10 sm:h-12 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-gray-200/50 dark:bg-gray-800/95 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-white text-lg sm:text-xl">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>Subscription & Billing</span>
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 sm:p-6 border border-blue-200/50 dark:border-gray-600/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                        {subscriptionInfo.badge}
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {user.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 mb-4 text-sm sm:text-base">{subscriptionInfo.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Secure billing</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <span>Instant access</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation('/payment')}
                      className="hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors border-blue-200 dark:border-gray-600 w-full sm:w-auto"
                      data-testid="button-manage-plan"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Progress Sidebar */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Learning Progress */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-gray-200/50 dark:bg-gray-800/95 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-white text-lg sm:text-xl">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>Learning Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mb-3 sm:mb-4">
                    <svg className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-600"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${2.51 * (user.overallProgress || 0)} 251.2`}
                        className="text-blue-600 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{user.overallProgress || 0}%</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Keep up the great work!</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">Study Time</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total learning hours</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm sm:text-lg font-bold text-blue-600">{Math.floor((user.totalStudyTime || 0) / 60)}h</div>
                      <div className="text-xs text-gray-500">{(user.totalStudyTime || 0) % 60}m</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">Exercises</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm sm:text-lg font-bold text-emerald-600">0</div>
                      <div className="text-xs text-gray-500">total</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">Avg Score</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Performance</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm sm:text-lg font-bold text-purple-600">0%</div>
                      <div className="text-xs text-gray-500">average</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">Streak</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Current streak</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm sm:text-lg font-bold text-amber-600">{user.currentStreak || 0}</div>
                      <div className="text-xs text-gray-500">days</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Activity */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-gray-200/50 dark:bg-gray-800/95 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-white text-lg sm:text-xl">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span>Account Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">Last Activity</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Most recent session</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-lg font-bold text-green-600">Today</div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">Member Since</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Account creation</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-lg font-bold text-purple-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { 
                        year: 'numeric', 
                        month: 'short' 
                      }) : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">joined</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
      <FloatingChatbot />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
    </div>
  );
}