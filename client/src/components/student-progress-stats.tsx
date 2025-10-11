import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Video, Clock, Trophy, Target, CheckCircle } from "lucide-react";

interface CategoryStats {
  category: string;
  displayName: string;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  recentActivity: boolean;
  progressPercentage: number;
  icon: React.ReactNode;
  color: string;
}

interface StudentProgressStatsProps {
  userId: string;
}

export default function StudentProgressStats({ userId }: StudentProgressStatsProps) {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['/api/student-stats', userId],
    enabled: !!userId
  });

  // Life in UK Test Categories with authentic content areas
  const getProgressByCategory = (): CategoryStats[] => {
    if (!statsData) return [];

    const categories = [
      {
        category: 'british-history',
        displayName: 'British History',
        icon: <BookOpen className="h-4 w-4" />,
        color: 'bg-blue-500'
      },
      {
        category: 'government-politics',
        displayName: 'Government & Politics',
        icon: <Trophy className="h-4 w-4" />,
        color: 'bg-purple-500'
      },
      {
        category: 'culture-traditions',
        displayName: 'Culture & Traditions',
        icon: <Target className="h-4 w-4" />,
        color: 'bg-green-500'
      },
      {
        category: 'geography-demographics',
        displayName: 'Geography & Demographics',
        icon: <Video className="h-4 w-4" />,
        color: 'bg-orange-500'
      },
      {
        category: 'british-values',
        displayName: 'British Values',
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-red-500'
      },
      {
        category: 'legal-system',
        displayName: 'Legal System',
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-indigo-500'
      }
    ];

    return categories.map(cat => {
      const categoryData = statsData.categoryStats?.[cat.category] || {
        totalExercises: 0,
        completedExercises: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        recentActivity: false
      };

      return {
        ...cat,
        ...categoryData,
        progressPercentage: categoryData.totalExercises > 0 
          ? Math.round((categoryData.completedExercises / categoryData.totalExercises) * 100) 
          : 0
      };
    });
  };

  const categoryStats = getProgressByCategory();
  const overallProgress = categoryStats.length > 0 
    ? Math.round(categoryStats.reduce((sum, cat) => sum + cat.progressPercentage, 0) / categoryStats.length)
    : 0;

  const totalExercisesCompleted = categoryStats.reduce((sum, cat) => sum + cat.completedExercises, 0);
  const overallAverageScore = categoryStats.length > 0
    ? Math.round(categoryStats.reduce((sum, cat) => sum + cat.averageScore, 0) / categoryStats.filter(cat => cat.averageScore > 0).length)
    : 0;

  if (isLoading) {
    return (
      <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Student Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Student Progress Statistics</span>
          <span className="sm:hidden">Progress</span>
        </CardTitle>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{totalExercisesCompleted}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Done</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{overallAverageScore}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto p-4 sm:p-6">
        {categoryStats.map((category) => (
          <div key={category.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 sm:p-1.5 rounded-full ${category.color} text-white`}>
                  {category.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">{category.displayName}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.completedExercises}/{category.totalExercises} completed
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <Badge variant={category.progressPercentage >= 75 ? "default" : "secondary"} className="text-xs">
                  {category.progressPercentage}%
                </Badge>
                {category.recentActivity && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">Recent</div>
                )}
              </div>
            </div>
            
            <Progress value={category.progressPercentage} className="h-2 mb-2" />
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Average Score:</span>
                <span className="font-medium">{category.averageScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Best Score:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{category.bestScore}%</span>
              </div>
            </div>
            
            {category.totalTimeSpent > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(category.totalTimeSpent / 60)} minutes studied
              </div>
            )}
          </div>
        ))}

        {categoryStats.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No progress data available yet.</p>
            <p className="text-xs mt-1">Start completing exercises to see your statistics!</p>
          </div>
        )}

        {/* Study Recommendations */}
        {categoryStats.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
              <Target className="h-4 w-4" />
              Study Recommendations
            </h5>
            <div className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
              {categoryStats
                .filter(cat => cat.progressPercentage < 75)
                .slice(0, 2)
                .map(cat => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full flex-shrink-0"></div>
                    <span>Focus on <strong>{cat.displayName}</strong> - {cat.progressPercentage}% complete</span>
                  </div>
                ))}
              {categoryStats.every(cat => cat.progressPercentage >= 75) && (
                <div className="text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Excellent progress! You're ready for the test.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}