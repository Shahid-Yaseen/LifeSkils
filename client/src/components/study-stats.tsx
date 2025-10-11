import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudyStatsProps {
  userId: string;
}

export default function StudyStats({ userId }: StudyStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats", userId],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
            <div className="h-8 bg-gray-200 rounded mt-4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-200 overflow-hidden">
      <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="text-success mr-2 sm:mr-3" size={18} />
          <span className="hidden sm:inline">Study Statistics</span>
          <span className="sm:hidden">Stats</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-600">Total Study Time</span>
          <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.totalStudyTime || "0h 0m"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-600">Exercises Completed</span>
          <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats?.exercisesCompleted || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-600">Average Score</span>
          <span className="font-semibold text-success text-sm sm:text-base">{stats?.averageScore || "0%"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-600">Current Streak</span>
          <span className="font-semibold text-warning text-sm sm:text-base">{stats?.currentStreak || "0 days"}</span>
        </div>
        
        <div className="pt-3 sm:pt-4 border-t border-gray-200">
          <Button className="w-full bg-uk-blue hover:bg-uk-blue/90 text-white text-xs sm:text-sm py-2">
            <ClipboardCheck className="mr-1 sm:mr-2" size={14} />
            Take Practice Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
