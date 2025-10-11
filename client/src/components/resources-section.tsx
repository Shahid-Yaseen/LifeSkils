import { useQuery } from "@tanstack/react-query";
import { Download, FileText, FileImage, List, ShoppingCart, ExternalLink, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return <FileText className="text-uk-red text-sm" size={16} />;
    case "image":
    case "png":
    case "jpg":
      return <FileImage className="text-royal-purple text-sm" size={16} />;
    default:
      return <List className="text-success text-sm" size={16} />;
  }
};

const getIconColor = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return "bg-uk-red/10";
    case "image":
    case "png":
    case "jpg":
      return "bg-royal-purple/10";
    default:
      return "bg-success/10";
  }
};

export default function ResourcesSection() {
  const { toast } = useToast();
  
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["/api/resources"],
  });

  // Type guard for resources
  const typedResources = resources as Array<{
    id: string;
    title: string;
    fileType: string;
    fileSize: string;
  }>;

  const handleDownload = async (resourceId: string, title: string) => {
    try {
      const response = await apiRequest("GET", `/api/resources/download/${resourceId}`);
      const data = await response.json();
      
      toast({
        title: "Download Started",
        description: `${title} download has been initiated.`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download resource. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded mb-1 w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Amazon Book Purchase Section */}
      <Card className="shadow-sm border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 overflow-hidden">
        <CardHeader className="border-b border-orange-200 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="text-orange-600 mr-2 sm:mr-3" size={18} />
            <span className="hidden sm:inline">Official Study Book</span>
            <span className="sm:hidden">Study Book</span>
            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 text-xs">
              Recommended
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Life in the UK Test: Handbook 2025</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">
                Everything you need to study for the British citizenship test. Includes online practice tests access.
              </p>
              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>✓ Updated for 2025</span>
                <span>✓ Official content</span>
                <span>✓ Online tests included</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-3 w-full lg:w-auto lg:min-w-[180px]">
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto lg:w-full"
                onClick={() => window.open('https://www.amazon.co.uk/Life-UK-Test-Everything-citizenship/dp/1907389954', '_blank')}
              >
                <ShoppingCart className="mr-1 sm:mr-2" size={12} />
                Amazon UK
                <ExternalLink className="ml-1 sm:ml-2" size={10} />
              </Button>
              <Button 
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50 px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto lg:w-full"
                onClick={() => window.open('https://www.amazon.com/Life-UK-Test-essential-citizenship/dp/1907389938', '_blank')}
              >
                <ShoppingCart className="mr-1 sm:mr-2" size={12} />
                Amazon US
                <ExternalLink className="ml-1 sm:ml-2" size={10} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloadable Resources Section */}
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <Download className="text-uk-red mr-2 sm:mr-3" size={18} />
            <span className="hidden sm:inline">Free Cheatsheets & Resources</span>
            <span className="sm:hidden">Resources</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
        {typedResources.map((resource) => (
          <div 
            key={resource.id}
            className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
            onClick={() => handleDownload(resource.id, resource.title)}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 ${getIconColor(resource.fileType)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {getFileIcon(resource.fileType)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{resource.title}</h4>
                <p className="text-xs text-gray-600">{resource.fileSize}</p>
              </div>
            </div>
            <Download className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" size={14} />
          </div>
        ))}
        </CardContent>
      </Card>
    </div>
  );
}
