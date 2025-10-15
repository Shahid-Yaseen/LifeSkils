import { Crown, Trophy, User, Upload, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import VideoSection from "@/components/video-section";
import EnhancedVideoLibrary from "@/components/enhanced-video-library";
import TimelineSection from "@/components/timeline-section";
import ExerciseSection from "@/components/exercise-section";
import ProgressRoadmap from "@/components/progress-roadmap";
import ResourcesSection from "@/components/resources-section";
import StudyStats from "@/components/study-stats";
import MobileNav from "@/components/mobile-nav";
import UserProfileDropdown from "@/components/user-profile-dropdown";
import FloatingChatbot from "@/components/floating-chatbot";
import StudentProgressStats from "@/components/student-progress-stats";
import { SimpleThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { TTSProvider } from "@/contexts/TTSContext";
import GlobalTTSNarration from "@/components/global-tts-narration";
import EventNavigation from "@/components/event-navigation";
import TimelineScrollNavigation from "@/components/timeline-scroll-navigation";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (handled by ProtectedRoute)
  if (!user) {
    return null;
  }

  return (
    <TTSProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="text-white" size={16} />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Life in UK Test</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">E-Learning Platform</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-6 flex-1 justify-center max-w-5xl mx-auto">
              <Link href="/" className="text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 px-2 py-1 text-sm">
                Dashboard
              </Link>
              <Link href="/timeline" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Timeline
              </Link>
              <Link href="/diagrams" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Diagrams
              </Link>
              <Link href="/games" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Games
              </Link>
              <Link href="/practice-tests" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Practice Tests
              </Link>
              <Link href="/mock-tests" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Mock Tests
              </Link>
              <Link href="/interactive-map" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Map
              </Link>
              <Link href="/rag-learning" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                AI Learning
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Progress Indicator - Hidden on very small screens */}
              <div className="hidden sm:flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full px-2 sm:px-3 py-1">
                <Trophy className="text-yellow-500" size={14} />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{user.overallProgress || 0}%</span>
              </div>
              
              {/* Theme Toggle */}
              <SimpleThemeToggle />
              
              {/* User Profile */}
              <UserProfileDropdown user={user} />
              
              {/* Mobile Navigation Toggle - Show on screens smaller than xl */}
              <div className="xl:hidden">
                <MobileNav />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        
        {/* Enhanced Welcome Hero Section */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl sm:rounded-3xl shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}>
              </div>
            </div>
            
            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                {/* Welcome Content */}
                <div className="text-center lg:text-left max-w-xl w-full lg:w-auto">
                  <div className="flex items-center justify-center lg:justify-start mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                      <span className="text-lg sm:text-xl">🇬🇧</span>
                    </div>
                    <div className="text-white/90 text-xs font-medium uppercase tracking-wider">
                      Life in UK Test Preparation
                    </div>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                    Welcome back, <span className="text-yellow-300">{user.name}!</span>
                  </h1>
                  
                  <p className="text-base sm:text-lg text-white/90 mb-4 leading-relaxed">
                    Continue your comprehensive journey to UK learning
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[80px] sm:min-w-[100px]">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-300">{user.overallProgress || 0}%</div>
                      <div className="text-xs text-white/80">Progress</div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[80px] sm:min-w-[100px]">
                      <div className="text-xl sm:text-2xl font-bold text-green-300">156h</div>
                      <div className="text-xs text-white/80">Study Time</div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[80px] sm:min-w-[100px]">
                      <div className="text-xl sm:text-2xl font-bold text-blue-300">12</div>
                      <div className="text-xs text-white/80">Day Streak</div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Avatar & Progress Ring */}
                <div className="flex flex-col items-center space-y-4 mt-4 lg:mt-0">
                  <div className="relative">
                    {/* Progress Ring */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="8"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="url(#progressGradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${((user.overallProgress || 0) / 100) * 314} 314`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Avatar */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">{user.name?.charAt(0) || 'U'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Link href="/practice-tests">
                      <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 w-full sm:w-auto">
                        Practice →
                      </button>
                    </Link>
                    <Link href="/mock-tests">
                      <button className="bg-yellow-500/90 hover:bg-yellow-400 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg w-full sm:w-auto">
                        Mock Test →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Practice Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">★</span>
                </div>
                <Link href="/practice-tests" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <span className="text-xs sm:text-sm font-medium">View →</span>
                </Link>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Practice Tests</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Advanced tests with analytics & insights</p>
            </div>
          </div>

          {/* Mock Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">⚡</span>
                </div>
                <Link href="/mock-tests" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <span className="text-xs sm:text-sm font-medium">View →</span>
                </Link>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Mock Tests</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Advanced mock tests with detailed analytics</p>
            </div>
          </div>
          
          {/* Interactive Games */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">2</span>
                </div>
                <Link href="/games" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <span className="text-xs sm:text-sm font-medium">View →</span>
                </Link>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Interactive Games</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Play matching cards and flip card games</p>
            </div>
          </div>

          {/* AI Learning */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">AI</span>
                </div>
                <Link href="/rag-learning" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <span className="text-xs sm:text-sm font-medium">View →</span>
                </Link>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">AI Learning</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">AI-powered content from books</p>
            </div>
          </div>

          {/* UK System Diagrams */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">3</span>
                </div>
                <Link href="/diagrams" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <span className="text-xs sm:text-sm font-medium">View →</span>
                </Link>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">System Diagrams</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Visual guides to UK government and justice systems</p>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">18</span>
                </div>
                <Link href="/interactive-map" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <span className="text-xs sm:text-sm font-medium">View →</span>
                </Link>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Interactive Map</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Explore UK geography and cultural regions</p>
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <Upload className="text-white" size={16} />
                </div>
                <Link href="/video-upload" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <span className="text-xs sm:text-sm font-medium">View →</span>
                </Link>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Upload Video</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Add educational video content</p>
            </div>
          </div>
        </div>

        {/* Learning Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <EnhancedVideoLibrary userId={user.id} />
            <TimelineSection />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-3 lg:space-y-4">
            <StudentProgressStats userId={user.id} />
            <ProgressRoadmap userId={user.id} />
            <ResourcesSection />
            
            {/* Fixed TTS and Navigation Group */}
            <div className="sticky top-20 space-y-6 lg:space-y-4 z-10">
              <GlobalTTSNarration />
              <EventNavigation />
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
      <FloatingChatbot />
      <TimelineScrollNavigation />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
      </div>
    </TTSProvider>
  );
}
