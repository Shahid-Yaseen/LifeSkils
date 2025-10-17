import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileNav from "@/components/mobile-nav";
import FloatingChatbot from "@/components/floating-chatbot";
import { Clock, Target, CheckCircle, BookOpen, Users, Filter, Star, TrendingUp, BarChart3 } from "lucide-react";
import { 
  useEnhancedMockTests, 
  getDifficultyColor, 
  getDifficultyLabel,
  type EnhancedTest 
} from "@/hooks/useEnhancedTests";

export default function EnhancedMockTestsPage() {
  const [, setLocation] = useLocation();
  const { data: mockTests, isLoading, error } = useEnhancedMockTests();
  
  // Filter state
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("category");

  // Filter logic with safety check
  const filteredTests = (() => {
    // Safety check to ensure mockTests is an array
    if (!Array.isArray(mockTests)) {
      console.warn('filteredTests received non-array data:', mockTests);
      return [];
    }
    
    return mockTests.filter((test) => {
      let matchesDifficulty = true;
      if (difficultyFilter !== "all") {
        const filterValue = parseInt(difficultyFilter);
        if (filterValue === 1) {
          // Beginner: difficulty 1
          matchesDifficulty = test.difficulty === 1;
        } else if (filterValue === 3) {
          // Intermediate: difficulty 2, 3, 4
          matchesDifficulty = test.difficulty >= 2 && test.difficulty <= 4;
        } else if (filterValue === 5) {
          // Expert: difficulty 5
          matchesDifficulty = test.difficulty === 5;
        }
      }
      
      return matchesDifficulty;
    });
  })();

  // Sort logic
  const sortedTests = [...filteredTests].sort((a, b) => {
    switch (sortBy) {
      case "difficulty":
        return a.difficulty - b.difficulty;
      case "category":
        return (a.category || "").localeCompare(b.category || "");
      case "order":
      default:
        return a.orderIndex - b.orderIndex;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading enhanced mock tests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <Target className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Tests</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">There was an error loading the mock tests. Please try again.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full sm:w-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mock Tests</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Official-style mock tests with comprehensive analytics and performance tracking
              </p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={() => setLocation("/practice-tests")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Practice Tests
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/dashboard")}
                className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="container mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Array.isArray(mockTests) ? mockTests.length : 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(mockTests) && mockTests.length > 0 ? Math.round(mockTests.reduce((sum, test) => sum + (test.questions?.length || 0), 0) / mockTests.length) : 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">75%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pass Mark</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:gap-4 lg:items-center">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-4 flex-1">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1">Beginner</SelectItem>
                  <SelectItem value="3">Intermediate</SelectItem>
                  <SelectItem value="5">Expert</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="category">CategorySelect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Reset Button */}
            <div className="flex justify-center lg:justify-end">
              <Button 
                onClick={() => {
                  setDifficultyFilter("all");
                  setSortBy("category");
                }}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Info Banner */}
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-sm sm:text-base">Mock Test Experience</h3>
                <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                  These enhanced mock tests provide comprehensive analytics, detailed performance tracking, 
                  and advanced question management. Perfect for final preparation with real-time feedback 
                  and detailed explanations for every question.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mock Tests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-all duration-200 !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 border-2 hover:border-blue-200 dark:hover:border-blue-600 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getDifficultyColor(test.difficulty)} text-xs`}>
                    {getDifficultyLabel(test.difficulty)}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">#{test.orderIndex}</span>
                </div>
                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2">{test.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span>45 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span>{test.questions?.length || 0} questions</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Pass mark: {Math.ceil((test.questions?.length || 0) * 0.75)}/{test.questions?.length || 0} (75%)</p>
                  </div>

                  {/* Enhanced analytics indicators if available */}
                  {test.totalAttempts !== undefined && (
                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{test.totalAttempts} attempts</span>
                      </span>
                      {test.averageScore !== undefined && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{test.averageScore}% avg</span>
                        </span>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-sm sm:text-base" 
                    onClick={() => setLocation(`/mock-test/${test.id}`)}
                  >
                    Start Mock Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!sortedTests.length && !isLoading && (
          <div className="text-center py-8 sm:py-12 px-4">
            <Target className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">No Mock Tests Found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {difficultyFilter !== "all" 
                ? "Try adjusting your filters to see more tests."
                : "Mock tests are being prepared. Please check back soon."
              }
            </p>
            {(difficultyFilter !== "all") && (
              <Button 
                onClick={() => {
                  setDifficultyFilter("all");
                }}
                className="mt-4 w-full sm:w-auto"
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <MobileNav />
      <FloatingChatbot />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
    </div>
  );
}
