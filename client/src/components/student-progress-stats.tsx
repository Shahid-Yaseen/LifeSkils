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
      <Card className="h-fit bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
    <Card className="h-fit bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2 p-3 sm:p-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-gray-900 dark:text-white">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Student Progress Statistics</span>
          <span className="sm:hidden">Progress</span>
        </CardTitle>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{totalExercisesCompleted}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Done</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{overallAverageScore}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 p-3 sm:p-4">
        {categoryStats.map((category) => (
          <div key={category.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${category.color} text-white`}>
                  {category.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-xs text-gray-900 dark:text-white truncate">{category.displayName}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.completedExercises}/{category.totalExercises} completed
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <Badge variant={category.progressPercentage >= 75 ? "default" : "secondary"} className="text-xs">
                  {category.progressPercentage}%
                </Badge>
              </div>
            </div>
            
            <Progress value={category.progressPercentage} className="h-1.5 mb-1" />
            
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Avg: {category.averageScore}%</span>
              <span className="text-green-600 dark:text-green-400">Best: {category.bestScore}%</span>
            </div>
          </div>
        ))}

        {categoryStats.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No progress data available yet.</p>
            <p className="text-xs mt-1">Start completing exercises to see your statistics!</p>
          </div>
        )}

        {/* Study Recommendations - Compact */}
        {categoryStats.length > 0 && categoryStats.some(cat => cat.progressPercentage < 75) && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <Target className="h-3 w-3 inline mr-1" />
              Focus on: {categoryStats.filter(cat => cat.progressPercentage < 75).slice(0, 1).map(cat => cat.displayName).join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}