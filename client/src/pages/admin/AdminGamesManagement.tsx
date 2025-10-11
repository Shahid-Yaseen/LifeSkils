import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Gamepad2, 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
  FileText,
  Video,
  Image,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Tag,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  Book,
  TestTube,
  Brain,
  Map,
  History,
  Crown,
  Sparkles,
  RotateCw,
  CheckSquare,
  Zap,
  Star,
  Trophy,
  Play,
  Pause,
  Square,
  Database,
  Layers,
  Palette,
  Scale,
  Church,
  Sword,
  Utensils,
  Flag,
  Building2,
  MapPin,
  Medal,
  Cross,
  Building,
  RotateCcw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";

const gameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  gameType: z.string().min(1, "Game type is required"),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  isActive: z.boolean(),
  orderIndex: z.number().min(0),
  instructions: z.string().optional(),
  estimatedTime: z.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
  gameData: z.any().optional(),
  // Game-specific data structures
  trueFalseQuestions: z.array(z.object({
    id: z.string(),
    statement: z.string(),
    isTrue: z.boolean(),
    explanation: z.string(),
    category: z.string()
  })).optional(),
  matchingPairs: z.array(z.object({
    id: z.string(),
    left: z.string(),
    right: z.string(),
    category: z.string()
  })).optional(),
  tripleMatches: z.array(z.object({
    id: z.string(),
    column1: z.string(),
    column2: z.string(),
    column3: z.string(),
    category: z.string()
  })).optional(),
  flipCards: z.array(z.object({
    id: z.string(),
    front: z.string(),
    back: z.string(),
    category: z.string()
  })).optional(),
  aiTopics: z.array(z.object({
    value: z.string(),
    icon: z.string(),
    description: z.string()
  })).optional(),
});

type GameForm = z.infer<typeof gameSchema>;

interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  gameType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  orderIndex: number;
  instructions?: string;
  estimatedTime?: number;
  tags?: string[];
  gameData?: any;
  // Game-specific data
  trueFalseQuestions?: Array<{
    id: string;
    statement: string;
    isTrue: boolean;
    explanation: string;
    category: string;
  }>;
  matchingPairs?: Array<{
    id: string;
    left: string;
    right: string;
    category: string;
  }>;
  tripleMatches?: Array<{
    id: string;
    column1: string;
    column2: string;
    column3: string;
    category: string;
  }>;
  flipCards?: Array<{
    id: string;
    front: string;
    back: string;
    category: string;
  }>;
  aiTopics?: Array<{
    value: string;
    icon: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AdminGamesManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [currentGameData, setCurrentGameData] = useState<any>(null);
  const [dataType, setDataType] = useState<'trueFalse' | 'matching' | 'triple' | 'flip' | 'ai'>('trueFalse');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: games = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/admin/games"],
  });

  const form = useForm<GameForm>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      gameType: "",
      difficulty: "intermediate",
      isActive: true,
      orderIndex: 0,
      instructions: "",
      estimatedTime: 5,
      tags: [],
      gameData: {},
    },
  });

  const createGameMutation = useMutation({
    mutationFn: async (data: GameForm) => {
      return apiRequest("POST", "/api/admin/games", data);
    },
    onSuccess: () => {
      toast({
        title: "Game created",
        description: "The game has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create game.",
        variant: "destructive",
      });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GameForm }) => {
      return apiRequest("PUT", `/api/admin/games/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Game updated",
        description: "The game has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      setShowEditDialog(false);
      setSelectedGame(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update game.",
        variant: "destructive",
      });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/games/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Game deleted",
        description: "The game has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      setShowDeleteDialog(false);
      setGameToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete game.",
        variant: "destructive",
      });
    },
  });

  const handleCreateGame = (data: GameForm) => {
    createGameMutation.mutate(data);
  };

  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    form.reset({
      title: game.title,
      description: game.description,
      category: game.category,
      gameType: game.gameType,
      difficulty: game.difficulty,
      isActive: game.isActive,
      orderIndex: game.orderIndex,
      instructions: game.instructions || "",
      estimatedTime: game.estimatedTime || 5,
      tags: game.tags || [],
      gameData: game.gameData || {},
    });
    setShowEditDialog(true);
  };

  const handleUpdateGame = (data: GameForm) => {
    if (selectedGame) {
      updateGameMutation.mutate({ id: selectedGame.id, data });
    }
  };

  const handleDeleteGame = (game: Game) => {
    setGameToDelete(game);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (gameToDelete) {
      deleteGameMutation.mutate(gameToDelete.id);
    }
  };

  const handleManageData = (game: Game) => {
    setSelectedGame(game);
    setCurrentGameData(game.gameData || {});
    
    // Determine data type based on game type
    if (game.gameType === 'true-false') {
      setDataType('trueFalse');
    } else if (game.gameType.includes('matching')) {
      if (game.gameType.includes('acts-treaties') || game.gameType.includes('battles-wars') || 
          game.gameType.includes('justice-system') || game.gameType.includes('prime-ministers') ||
          game.gameType.includes('religion-demographics') || game.gameType.includes('rulers-religions') ||
          game.gameType.includes('sports-heroes') || game.gameType.includes('traditional-foods') ||
          game.gameType.includes('uk-memberships') || game.gameType.includes('uk-constituent-countries') ||
          game.gameType.includes('uk-parliament-devolution') || game.gameType.includes('uk-places')) {
        setDataType('triple');
      } else {
        setDataType('matching');
      }
    } else if (game.gameType === 'flip-cards') {
      setDataType('flip');
    } else if (game.gameType === 'ai-exercises') {
      setDataType('ai');
    }
    
    setShowDataDialog(true);
  };

  const handleAddDataItem = (type: string) => {
    const newItem = {
      id: Date.now().toString(),
      ...(type === 'trueFalse' ? {
        statement: '',
        isTrue: true,
        explanation: '',
        category: ''
      } : type === 'matching' ? {
        left: '',
        right: '',
        category: ''
      } : type === 'triple' ? {
        column1: '',
        column2: '',
        column3: '',
        category: ''
      } : type === 'flip' ? {
        front: '',
        back: '',
        category: ''
      } : {
        value: '',
        icon: '',
        description: ''
      })
    };

    setCurrentGameData((prev: any) => ({
      ...prev,
      [type === 'trueFalse' ? 'trueFalseQuestions' : 
       type === 'matching' ? 'matchingPairs' :
       type === 'triple' ? 'tripleMatches' :
       type === 'flip' ? 'flipCards' : 'aiTopics']: [
        ...(prev[type === 'trueFalse' ? 'trueFalseQuestions' : 
             type === 'matching' ? 'matchingPairs' :
             type === 'triple' ? 'tripleMatches' :
             type === 'flip' ? 'flipCards' : 'aiTopics'] || []),
        newItem
      ]
    }));
  };

  const handleUpdateDataItem = (type: string, index: number, field: string, value: any) => {
    setCurrentGameData((prev: any) => {
      const dataKey = type === 'trueFalse' ? 'trueFalseQuestions' : 
                     type === 'matching' ? 'matchingPairs' :
                     type === 'triple' ? 'tripleMatches' :
                     type === 'flip' ? 'flipCards' : 'aiTopics';
      
      const updatedData = [...(prev[dataKey] || [])];
      updatedData[index] = { ...updatedData[index], [field]: value };
      
      return {
        ...prev,
        [dataKey]: updatedData
      };
    });
  };

  const handleDeleteDataItem = (type: string, index: number) => {
    setCurrentGameData((prev: any) => {
      const dataKey = type === 'trueFalse' ? 'trueFalseQuestions' : 
                     type === 'matching' ? 'matchingPairs' :
                     type === 'triple' ? 'tripleMatches' :
                     type === 'flip' ? 'flipCards' : 'aiTopics';
      
      const updatedData = [...(prev[dataKey] || [])];
      updatedData.splice(index, 1);
      
      return {
        ...prev,
        [dataKey]: updatedData
      };
    });
  };

  const handleSaveGameData = () => {
    if (selectedGame) {
      updateGameMutation.mutate({ 
        id: selectedGame.id, 
        data: { ...selectedGame, gameData: currentGameData } 
      });
      setShowDataDialog(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "ai-generated": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "true-false": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "matching": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "flip-cards": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case "ai-exercises": return <Sparkles className="h-4 w-4" />;
      case "true-false": return <CheckSquare className="h-4 w-4" />;
      case "matching-cards": return <RotateCw className="h-4 w-4" />;
      case "flip-cards": return <RotateCw className="h-4 w-4" />;
      default: return <Gamepad2 className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = [
    "ai-generated", "true-false", "matching", "flip-cards"
  ];

  const gameTypes = [
    { value: "ai-exercises", label: "AI Exercises", icon: <Sparkles className="h-4 w-4" /> },
    { value: "true-false", label: "True/False", icon: <CheckSquare className="h-4 w-4" /> },
    { value: "matching-cards", label: "Matching Cards", icon: <RotateCw className="h-4 w-4" /> },
    { value: "flip-cards", label: "Flip Cards", icon: <RotateCw className="h-4 w-4" /> },
  ];

  // Specific game components from the games page
  const specificGameTypes = [
    // AI Generated
    { value: "ai-exercises", label: "AI Exercises", icon: <Sparkles className="h-4 w-4" />, category: "ai-generated" },
    
    // True/False
    { value: "true-false", label: "True/False", icon: <CheckSquare className="h-4 w-4" />, category: "true-false" },
    
    // 2-Column Matching Games
    { value: "general-matching", label: "General Matching", icon: <Target className="h-4 w-4" />, category: "matching" },
    { value: "holidays-matching", label: "Holiday Dates", icon: <Calendar className="h-4 w-4" />, category: "matching" },
    { value: "holiday-meanings-matching", label: "Holiday Meanings", icon: <Book className="h-4 w-4" />, category: "matching" },
    { value: "sports-achievements-matching", label: "Sports Achievements", icon: <Trophy className="h-4 w-4" />, category: "matching" },
    { value: "british-artists-matching", label: "British Artists", icon: <Palette className="h-4 w-4" />, category: "matching" },
    { value: "uk-ages-matching", label: "UK Ages", icon: <Clock className="h-4 w-4" />, category: "matching" },
    { value: "british-leaders-matching", label: "British Leaders", icon: <Crown className="h-4 w-4" />, category: "matching" },
    { value: "uk-cultural-awards-matching", label: "Cultural Awards", icon: <Award className="h-4 w-4" />, category: "matching" },
    
    // 3-Column Matching Games
    { value: "acts-treaties-bills-matching", label: "Acts, Treaties & Bills", icon: <FileText className="h-4 w-4" />, category: "matching" },
    { value: "battles-wars-matching", label: "Battles & Wars", icon: <Sword className="h-4 w-4" />, category: "matching" },
    { value: "justice-system-matching", label: "Justice System", icon: <Scale className="h-4 w-4" />, category: "matching" },
    { value: "prime-ministers-matching", label: "Prime Ministers", icon: <Building className="h-4 w-4" />, category: "matching" },
    { value: "religion-demographics-matching", label: "Religion & Demographics", icon: <Church className="h-4 w-4" />, category: "matching" },
    { value: "rulers-religions-matching", label: "Rulers & Religions", icon: <Cross className="h-4 w-4" />, category: "matching" },
    { value: "sports-heroes-matching", label: "Sports Heroes", icon: <Medal className="h-4 w-4" />, category: "matching" },
    { value: "traditional-foods-matching", label: "Traditional Foods", icon: <Utensils className="h-4 w-4" />, category: "matching" },
    { value: "uk-memberships-matching", label: "UK Memberships", icon: <Globe className="h-4 w-4" />, category: "matching" },
    { value: "uk-constituent-countries-matching", label: "UK Countries", icon: <Flag className="h-4 w-4" />, category: "matching" },
    { value: "uk-parliament-devolution-matching", label: "UK Parliament & Devolution", icon: <Building2 className="h-4 w-4" />, category: "matching" },
    { value: "uk-places-matching", label: "UK Places", icon: <MapPin className="h-4 w-4" />, category: "matching" },
    
    // Flip Cards
    { value: "flip-cards", label: "Flip Cards", icon: <RotateCcw className="h-4 w-4" />, category: "flip-cards" },
  ];

  const difficulties = [
    { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
    { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
    { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
  ];

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || game.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && game.isActive) ||
                         (selectedStatus === "inactive" && !game.isActive);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const getTabGames = (tab: string) => {
    if (tab === "all") return filteredGames;
    return filteredGames.filter(game => game.category === tab);
  };

  if (gamesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Games Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage interactive learning games and activities
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Upload className="h-4 w-4" />
              Import Games
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              Export Games
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Game
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Games</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{games.length}</p>
                </div>
                <Gamepad2 className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Games</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {games.filter(g => g.isActive).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Content Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {games.reduce((total, game) => {
                      let count = 0;
                      if (game.trueFalseQuestions) count += game.trueFalseQuestions.length;
                      if (game.matchingPairs) count += game.matchingPairs.length;
                      if (game.tripleMatches) count += game.tripleMatches.length;
                      if (game.flipCards) count += game.flipCards.length;
                      if (game.aiTopics) count += game.aiTopics.length;
                      return total + count;
                    }, 0)}
                  </p>
                </div>
                <Database className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Matching Games</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {games.filter(g => g.category === 'matching').length}
                  </p>
                </div>
                <RotateCw className="h-8 w-8 text-orange-500 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Content Statistics */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5" />
              Content Statistics
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed breakdown of content items across all games - Total: {games.reduce((total, game) => {
                let count = 0;
                if (game.trueFalseQuestions) count += game.trueFalseQuestions.length;
                if (game.matchingPairs) count += game.matchingPairs.length;
                if (game.tripleMatches) count += game.tripleMatches.length;
                if (game.flipCards) count += game.flipCards.length;
                if (game.aiTopics) count += game.aiTopics.length;
                return total + count;
              }, 0)} items
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">True/False</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {games.reduce((total, game) => total + (game.trueFalseQuestions?.length || 0), 0)}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Questions</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">2-Column Pairs</span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {games.reduce((total, game) => total + (game.matchingPairs?.length || 0), 0)}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">Matching Pairs</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">3-Column Matches</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {games.reduce((total, game) => total + (game.tripleMatches?.length || 0), 0)}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">Triple Matches</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Flip Cards</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {games.reduce((total, game) => total + (game.flipCards?.length || 0), 0)}
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Card Pairs</p>
              </div>

              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-900 dark:text-pink-100">AI Topics</span>
                </div>
                <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                  {games.reduce((total, game) => total + (game.aiTopics?.length || 0), 0)}
                </p>
                <p className="text-xs text-pink-700 dark:text-pink-300">AI Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">
              <Gamepad2 className="h-4 w-4" />
              All Games
            </TabsTrigger>
            <TabsTrigger value="ai-generated" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">
              <Sparkles className="h-4 w-4" />
              AI Generated
            </TabsTrigger>
            <TabsTrigger value="true-false" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">
              <CheckSquare className="h-4 w-4" />
              True/False
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">
              <RotateCw className="h-4 w-4" />
              Matching
            </TabsTrigger>
            <TabsTrigger value="flip-cards" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300">
              <RotateCw className="h-4 w-4" />
              Flip Cards
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Filters */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                      <Input
                        placeholder="Search games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="all" className="text-gray-900 dark:text-white">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-gray-900 dark:text-white">
                          {category.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Filter by difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="all" className="text-gray-900 dark:text-white">All Difficulties</SelectItem>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty.value} value={difficulty.value} className="text-gray-900 dark:text-white">
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="all" className="text-gray-900 dark:text-white">All Status</SelectItem>
                      <SelectItem value="active" className="text-gray-900 dark:text-white">Active</SelectItem>
                      <SelectItem value="inactive" className="text-gray-900 dark:text-white">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Games Table */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Gamepad2 className="h-5 w-5" />
                  Games ({getTabGames(activeTab).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTabGames(activeTab).length === 0 ? (
                  <div className="text-center py-12">
                    <Gamepad2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No games found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchTerm || selectedCategory !== "all" || selectedDifficulty !== "all" || selectedStatus !== "all"
                        ? "Try adjusting your search or filters" 
                        : "No games have been created yet. You may need to populate the database with existing games."}
                    </p>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Game
                      </Button>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>To populate with existing games from the games page, run the SQL script:</p>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          insert-games.sql
                        </code>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 dark:border-gray-700">
                          <TableHead className="text-gray-900 dark:text-white">Title</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Category</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Type</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Difficulty</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Content Items</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Order</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Created</TableHead>
                          <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getTabGames(activeTab).map((game) => (
                          <TableRow key={game.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {getGameTypeIcon(game.gameType)}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {game.title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {game.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge className={getCategoryColor(game.category)}>
                                {game.category.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <Badge variant="outline">
                                {game.gameType.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <Badge className={getDifficultyColor(game.difficulty)}>
                                {game.difficulty}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-xs">
                                  {game.trueFalseQuestions && game.trueFalseQuestions.length > 0 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      <CheckSquare className="h-3 w-3 mr-1" />
                                      {game.trueFalseQuestions.length}
                                    </Badge>
                                  )}
                                  {game.matchingPairs && game.matchingPairs.length > 0 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      <Target className="h-3 w-3 mr-1" />
                                      {game.matchingPairs.length}
                                    </Badge>
                                  )}
                                  {game.tripleMatches && game.tripleMatches.length > 0 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      <Layers className="h-3 w-3 mr-1" />
                                      {game.tripleMatches.length}
                                    </Badge>
                                  )}
                                  {game.flipCards && game.flipCards.length > 0 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      {game.flipCards.length}
                                    </Badge>
                                  )}
                                  {game.aiTopics && game.aiTopics.length > 0 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      {game.aiTopics.length}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Total: {(() => {
                                    let count = 0;
                                    if (game.trueFalseQuestions) count += game.trueFalseQuestions.length;
                                    if (game.matchingPairs) count += game.matchingPairs.length;
                                    if (game.tripleMatches) count += game.tripleMatches.length;
                                    if (game.flipCards) count += game.flipCards.length;
                                    if (game.aiTopics) count += game.aiTopics.length;
                                    return count;
                                  })()}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge variant={game.isActive ? "default" : "secondary"}>
                                {game.isActive ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {game.orderIndex}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(game.createdAt)}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditGame(game)}
                                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleManageData(game)}
                                  className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Database className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteGame(game)}
                                  className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setSelectedGame(null);
            form.reset();
          }
        }}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                {showCreateDialog ? 'Add New Game' : 'Edit Game'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(showCreateDialog ? handleCreateGame : handleUpdateGame)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
                  <Input 
                    {...form.register("title")}
                    placeholder="Enter game title" 
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Index</label>
                  <Input 
                    type="number"
                    {...form.register("orderIndex", { valueAsNumber: true })}
                    placeholder="0" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                <Textarea 
                  {...form.register("description")}
                  placeholder="Enter game description" 
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                  <Select onValueChange={(value) => form.setValue("category", value)} value={form.watch("category")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Game Type *</label>
                  <Select onValueChange={(value) => {
                    form.setValue("gameType", value);
                    // Auto-set category based on game type
                    const gameType = specificGameTypes.find(gt => gt.value === value);
                    if (gameType) {
                      form.setValue("category", gameType.category);
                    }
                  }} value={form.watch("gameType")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select game type" />
                    </SelectTrigger>
                    <SelectContent>
                      {specificGameTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gameType && (
                    <p className="text-sm text-red-600">{form.formState.errors.gameType.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty *</label>
                  <Select onValueChange={(value) => form.setValue("difficulty", value as any)} value={form.watch("difficulty")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Time (minutes)</label>
                  <Input 
                    type="number"
                    {...form.register("estimatedTime", { valueAsNumber: true })}
                    placeholder="5" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructions</label>
                <Textarea 
                  {...form.register("instructions")}
                  placeholder="Enter game instructions" 
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...form.register("isActive")}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setShowCreateDialog(false);
                  setShowEditDialog(false);
                  setSelectedGame(null);
                  form.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createGameMutation.isPending || updateGameMutation.isPending}>
                  {createGameMutation.isPending || updateGameMutation.isPending ? "Saving..." : (showCreateDialog ? 'Create' : 'Update')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Delete Game</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete "{gameToDelete?.title}"? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteGameMutation.isPending}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {deleteGameMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Game Data Management Dialog */}
        <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Manage Game Data - {selectedGame?.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Data Type Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Data Type:</label>
                <Select value={dataType} onValueChange={(value: any) => setDataType(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trueFalse">True/False Questions</SelectItem>
                    <SelectItem value="matching">2-Column Matching</SelectItem>
                    <SelectItem value="triple">3-Column Matching</SelectItem>
                    <SelectItem value="flip">Flip Cards</SelectItem>
                    <SelectItem value="ai">AI Topics</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleAddDataItem(dataType)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {/* True/False Questions */}
              {dataType === 'trueFalse' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">True/False Questions</h3>
                  {(currentGameData?.trueFalseQuestions || []).map((item: any, index: number) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Statement</label>
                          <Textarea
                            value={item.statement}
                            onChange={(e) => handleUpdateDataItem('trueFalse', index, 'statement', e.target.value)}
                            placeholder="Enter the statement..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Explanation</label>
                          <Textarea
                            value={item.explanation}
                            onChange={(e) => handleUpdateDataItem('trueFalse', index, 'explanation', e.target.value)}
                            placeholder="Enter explanation..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Input
                            value={item.category}
                            onChange={(e) => handleUpdateDataItem('trueFalse', index, 'category', e.target.value)}
                            placeholder="Enter category..."
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Is True?</label>
                            <input
                              type="checkbox"
                              checked={item.isTrue}
                              onChange={(e) => handleUpdateDataItem('trueFalse', index, 'isTrue', e.target.checked)}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDataItem('trueFalse', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* 2-Column Matching */}
              {dataType === 'matching' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">2-Column Matching Pairs</h3>
                  {(currentGameData?.matchingPairs || []).map((item: any, index: number) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Left Column</label>
                          <Input
                            value={item.left}
                            onChange={(e) => handleUpdateDataItem('matching', index, 'left', e.target.value)}
                            placeholder="Enter left item..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Right Column</label>
                          <Input
                            value={item.right}
                            onChange={(e) => handleUpdateDataItem('matching', index, 'right', e.target.value)}
                            placeholder="Enter right item..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                              value={item.category}
                              onChange={(e) => handleUpdateDataItem('matching', index, 'category', e.target.value)}
                              placeholder="Enter category..."
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDataItem('matching', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* 3-Column Matching */}
              {dataType === 'triple' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">3-Column Matching</h3>
                  {(currentGameData?.tripleMatches || []).map((item: any, index: number) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium">Column 1</label>
                          <Input
                            value={item.column1}
                            onChange={(e) => handleUpdateDataItem('triple', index, 'column1', e.target.value)}
                            placeholder="Enter column 1 item..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Column 2</label>
                          <Input
                            value={item.column2}
                            onChange={(e) => handleUpdateDataItem('triple', index, 'column2', e.target.value)}
                            placeholder="Enter column 2 item..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Column 3</label>
                          <Input
                            value={item.column3}
                            onChange={(e) => handleUpdateDataItem('triple', index, 'column3', e.target.value)}
                            placeholder="Enter column 3 item..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                              value={item.category}
                              onChange={(e) => handleUpdateDataItem('triple', index, 'category', e.target.value)}
                              placeholder="Enter category..."
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDataItem('triple', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Flip Cards */}
              {dataType === 'flip' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Flip Cards</h3>
                  {(currentGameData?.flipCards || []).map((item: any, index: number) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Front</label>
                          <Textarea
                            value={item.front}
                            onChange={(e) => handleUpdateDataItem('flip', index, 'front', e.target.value)}
                            placeholder="Enter front text..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Back</label>
                          <Textarea
                            value={item.back}
                            onChange={(e) => handleUpdateDataItem('flip', index, 'back', e.target.value)}
                            placeholder="Enter back text..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                              value={item.category}
                              onChange={(e) => handleUpdateDataItem('flip', index, 'category', e.target.value)}
                              placeholder="Enter category..."
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDataItem('flip', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* AI Topics */}
              {dataType === 'ai' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Topics</h3>
                  {(currentGameData?.aiTopics || []).map((item: any, index: number) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Topic Value</label>
                          <Input
                            value={item.value}
                            onChange={(e) => handleUpdateDataItem('ai', index, 'value', e.target.value)}
                            placeholder="Enter topic name..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Icon</label>
                          <Input
                            value={item.icon}
                            onChange={(e) => handleUpdateDataItem('ai', index, 'icon', e.target.value)}
                            placeholder="Enter icon (emoji or code)..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                              value={item.description}
                              onChange={(e) => handleUpdateDataItem('ai', index, 'description', e.target.value)}
                              placeholder="Enter description..."
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDataItem('ai', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDataDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGameData} disabled={updateGameMutation.isPending}>
                {updateGameMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
