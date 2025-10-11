import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileNav from "@/components/mobile-nav";
import FloatingChatbot from "@/components/floating-chatbot";
import { Clock, Target, CheckCircle, BarChart3, Filter, Search, Star, TrendingUp } from "lucide-react";
import { 
  useEnhancedPracticeTests, 
  getDifficultyColor, 
  getDifficultyLabel, 
  getTestCategoryColor,
  type EnhancedTest 
} from "@/hooks/useEnhancedTests";

export default function EnhancedPracticeTestsPage() {
  const [, setLocation] = useLocation();
  const { data: tests, isLoading, error } = useEnhancedPracticeTests();
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("order");

  // Filter and search logic
  const filteredTests = tests?.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "all" || test.difficulty.toString() === difficultyFilter;
    const matchesCategory = categoryFilter === "all" || test.category === categoryFilter;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  }) || [];

  // Sort logic
  const sortedTests = [...filteredTests].sort((a, b) => {
    switch (sortBy) {
      case "difficulty":
        return a.difficulty - b.difficulty;
      case "category":
        return a.category.localeCompare(b.category);
      case "title":
        return a.title.localeCompare(b.title);
      case "order":
      default:
        return a.orderIndex - b.orderIndex;
    }
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(tests?.map(test => test.category) || []));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading enhanced practice tests...</p>
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
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">There was an error loading the practice tests. Please try again.</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Enhanced Practice Tests</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Advanced practice tests with analytics and enhanced question management
              </p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={() => setLocation("/mock-tests")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Mock Tests
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{tests?.length || 0}</p>
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
                    {tests && tests.length > 0 ? Math.round(tests.reduce((sum, test) => sum + (test.questions?.length || 0), 0) / tests.length) : 0}
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

        {/* Enhanced Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tests by title, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-4">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="1">Beginner</SelectItem>
                  <SelectItem value="2">Easy</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">Hard</SelectItem>
                  <SelectItem value="5">Expert</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Enhanced Test Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-all duration-200 !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 shadow-sm hover:border-blue-200 dark:hover:border-blue-600">
              <CardHeader className="pb-3">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2">{test.title}</CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {test.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 sm:ml-2 sm:flex-shrink-0">
                    <Badge className={`${getDifficultyColor(test.difficulty)} text-xs`}>
                      {getDifficultyLabel(test.difficulty)}
                    </Badge>
                    <Badge className={`${getTestCategoryColor(test.category)} text-xs`}>
                      {test.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {/* Enhanced test info */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{test.category}</span>
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span>{test.questions?.length || 0} Questions</span>
                    </span>
                  </div>
                  
                  {/* Analytics indicators if available */}
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
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-sm sm:text-base" 
                    onClick={() => setLocation(`/practice-test/${test.id}`)}
                  >
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!sortedTests.length && !isLoading && (
          <div className="text-center py-8 sm:py-12 px-4">
            <Target className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Tests Found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || difficultyFilter !== "all" || categoryFilter !== "all" 
                ? "Try adjusting your filters to see more tests."
                : "Enhanced practice tests are being prepared. Please check back soon."
              }
            </p>
            {(searchTerm || difficultyFilter !== "all" || categoryFilter !== "all") && (
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setDifficultyFilter("all");
                  setCategoryFilter("all");
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
