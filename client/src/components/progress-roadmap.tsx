import { useQuery } from "@tanstack/react-query";
import { Map, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressRoadmapProps {
  userId: string;
}

export default function ProgressRoadmap({ userId }: ProgressRoadmapProps) {
  const { data: modules = [] } = useQuery({
    queryKey: ["/api/modules"],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/modules/progress", userId],
  });

  const getModuleProgress = (moduleId: string) => {
    const progress = userProgress.find((p: any) => p.moduleId === moduleId);
    return progress?.progress || 0;
  };

  const getStatusIcon = (progress: number) => {
    if (progress === 100) {
      return <Check className="text-white text-xs" size={12} />;
    } else if (progress > 0) {
      return <Clock className="text-white text-xs" size={12} />;
    } else {
      return <span className="text-gray-600 text-xs font-bold">{modules.findIndex(m => getModuleProgress(m.id) === progress) + 1}</span>;
    }
  };

  const getStatusColor = (progress: number) => {
    if (progress === 100) return "bg-success";
    if (progress > 0) return "bg-warning";
    return "bg-gray-300";
  };

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-2 sm:p-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Map className="text-success mr-2 sm:mr-3" size={18} />
          <span className="hidden sm:inline">Learning Roadmap</span>
          <span className="sm:hidden">Roadmap</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {modules.map((module: any) => {
          const progress = getModuleProgress(module.id);
          
          return (
            <div key={module.id} className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4 last:mb-0">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 ${getStatusColor(progress)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {getStatusIcon(progress)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{module.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{module.description}</p>
                <div className="w-full">
                  <Progress value={progress} className="h-1 sm:h-1.5" />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
