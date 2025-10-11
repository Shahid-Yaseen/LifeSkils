import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileNav from "@/components/mobile-nav";
import FloatingChatbot from "@/components/floating-chatbot";
import { 
  ArrowLeft, 
  Crown, 
  Scale, 
  Building, 
  Users, 
  Gavel,
  MapPin,
  Shield,
  BookOpen,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

type Diagram = {
  id: string;
  title: string;
  description: string;
  category: string;
  section: string;
  content: any;
  orderIndex: number;
  isActive: boolean;
  icon?: string;
  color?: string;
  tags?: string[];
  keyPoints?: string[];
  relatedTopics?: string[];
  components?: DiagramComponent[];
};

type DiagramComponent = {
  id: string;
  diagramId: string;
  type: string;
  title: string;
  content: any;
  orderIndex: number;
  isActive: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  metadata?: any;
};

export default function DiagramsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("england");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Fetch diagrams data
  const { data: diagrams = [], isLoading, error } = useQuery({
    queryKey: ['diagrams'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/diagrams/public/government');
      return await response.json();
    },
  });

  const { data: justiceDiagrams = [] } = useQuery({
    queryKey: ['justice-diagrams'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/diagrams/public/justice');
      return await response.json();
    },
  });

  const { data: parliamentDiagrams = [] } = useQuery({
    queryKey: ['parliament-diagrams'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/diagrams/public/parliament');
      return await response.json();
    },
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'government': return <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'justice': return <Scale className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'parliament': return <Building className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default: return <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const renderComponent = (component: DiagramComponent) => {
    const baseClasses = `p-4 rounded-lg border ${component.backgroundColor || 'bg-gray-50 dark:bg-gray-800'} ${component.borderColor || 'border-gray-200 dark:border-gray-700'}`;
    
    switch (component.type) {
      case 'card':
        return (
          <Card key={component.id} className={baseClasses}>
            <CardContent className="p-4">
              <h4 className={`font-semibold text-lg mb-2 ${component.textColor || 'text-gray-900 dark:text-white'}`}>
                {component.title}
              </h4>
              {component.content.role && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {component.content.role}
                </p>
              )}
              {component.content.current && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Currently: {component.content.current}
                </p>
              )}
              {component.content.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {component.content.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      
      case 'hierarchy':
        return (
          <Card key={component.id} className={baseClasses}>
            <CardContent className="p-4">
              <h4 className={`font-semibold text-lg mb-4 ${component.textColor || 'text-gray-900 dark:text-white'}`}>
                {component.title}
              </h4>
              <div className="space-y-3">
                {component.content.levels?.map((level: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">{level.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{level.description || level.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'grid':
        return (
          <Card key={component.id} className={baseClasses}>
            <CardContent className="p-4">
              <h4 className={`font-semibold text-lg mb-4 ${component.textColor || 'text-gray-900 dark:text-white'}`}>
                {component.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {component.content.houses?.map((house: any, index: number) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold text-gray-900 dark:text-white">{house.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{house.members}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{house.type}</p>
                    {house.powers && (
                      <ul className="text-xs mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                        {house.powers.map((power: string, powerIndex: number) => (
                          <li key={powerIndex}>• {power}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'process':
        return (
          <Card key={component.id} className={baseClasses}>
            <CardContent className="p-4">
              <h4 className={`font-semibold text-lg mb-4 ${component.textColor || 'text-gray-900 dark:text-white'}`}>
                {component.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {component.content.stages?.map((stage: any, index: number) => (
                  <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{index + 1}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{stage.step}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stage.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {component.content.note && (
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="text-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {component.content.note}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card key={component.id} className={baseClasses}>
            <CardContent className="p-4">
              <h4 className={`font-semibold text-lg ${component.textColor || 'text-gray-900 dark:text-white'}`}>
                {component.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {JSON.stringify(component.content)}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UK System Diagrams</h1>
                <p className="text-gray-600 dark:text-gray-400">Visual guides to understanding UK governance and justice</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading diagrams...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">Error loading diagrams. Please try again later.</p>
          </div>
        ) : (
          <Tabs defaultValue="government" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="government" className="flex items-center space-x-2">
                <Crown className="h-4 w-4" />
                <span>Government System</span>
              </TabsTrigger>
              <TabsTrigger value="justice" className="flex items-center space-x-2">
                <Scale className="h-4 w-4" />
                <span>Justice System</span>
              </TabsTrigger>
              <TabsTrigger value="parliament" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Parliament Structure</span>
              </TabsTrigger>
            </TabsList>

            {/* Government System Diagram */}
            <TabsContent value="government" className="mt-6">
              {diagrams.length > 0 ? (
                diagrams.map((diagram: Diagram) => (
                  <Card key={diagram.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        {getCategoryIcon(diagram.category)}
                        <span>{diagram.title}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {diagram.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {diagram.components?.map((component: DiagramComponent) => 
                          renderComponent(component)
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Government Diagrams Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Government system diagrams will appear here once they are added by an administrator.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Justice System Diagram */}
            <TabsContent value="justice" className="mt-6">
              {justiceDiagrams.length > 0 ? (
                justiceDiagrams.map((diagram: Diagram) => (
                  <Card key={diagram.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        {getCategoryIcon(diagram.category)}
                        <span>{diagram.title}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {diagram.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {diagram.components?.map((component: DiagramComponent) => 
                          renderComponent(component)
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Justice System Diagrams Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Justice system diagrams will appear here once they are added by an administrator.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Parliament Structure Diagram */}
            <TabsContent value="parliament" className="mt-6">
              {parliamentDiagrams.length > 0 ? (
                parliamentDiagrams.map((diagram: Diagram) => (
                  <Card key={diagram.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        {getCategoryIcon(diagram.category)}
                        <span>{diagram.title}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {diagram.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {diagram.components?.map((component: DiagramComponent) => 
                          renderComponent(component)
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Parliament Structure Diagrams Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Parliament structure diagrams will appear here once they are added by an administrator.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>


      <MobileNav />
      <FloatingChatbot />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
    </div>
  );
}