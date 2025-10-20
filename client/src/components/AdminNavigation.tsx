import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Users, 
  Video, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Shield, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Crown,
  Activity,
  TrendingUp,
  FileText,
  History,
  Globe,
  Database,
  Cloud,
  Zap,
  Target,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Heart,
  Share,
  MessageCircle,
  MousePointer,
  Filter,
  SortAsc,
  SortDesc,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Save,
  Loader2,
  Gamepad2,
  Moon,
  Sun,
  Brain
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className = "" }: AdminNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      description: "User management",
    },
    {
      title: "Videos",
      href: "/admin/videos",
      icon: Video,
      description: "Video content management"
    },
    {
      title: "Games",
      href: "/admin/games",
      icon: Gamepad2,
      description: "Interactive games management"
    },
    {
      title: "Test Management",
      href: "/admin/tests",
      icon: FileText,
      description: "Manage practice and mock tests"
    },
    {
      title: "Timeline Management",
      href: "/admin/timeline",
      icon: Calendar,
      description: "Manage historical timeline events"
    },
    {
      title: "Map Management",
      href: "/admin/map",
      icon: MapPin,
      description: "Manage interactive map locations"
    },
    {
      title: "Diagrams Management",
      href: "/admin/diagrams",
      icon: Crown,
      description: "Manage system diagrams"
    },
    {
      title: "AI Book Intelligence",
      href: "/admin/ai-book-suite",
      icon: Brain,
      description: "AI-powered book content generation"
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      description: "Reports and insights"
    },
  
  ];

  const quickActions = [
    {
      title: "Add User",
      icon: Plus,
      action: () => setLocation("/admin/users")
    },
    {
      title: "Upload Video",
      icon: Upload,
      action: () => setLocation("/admin/videos")
    },
    {
      title: "Create Test",
      icon: FileText,
      action: () => setLocation("/admin/tests")
    },
    {
      title: "View Analytics",
      icon: TrendingUp,
      action: () => setLocation("/admin/analytics")
    },
    {
      title: "System Settings",
      icon: Settings,
      action: () => setLocation("/admin/settings")
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm dark:bg-gray-900"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${className}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Life in UK Test</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="p-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={user?.name || user?.username} />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <Badge variant="outline" className="mt-1">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Button>
              </Link>
            ))}
          </nav>

         

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">System Online</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
