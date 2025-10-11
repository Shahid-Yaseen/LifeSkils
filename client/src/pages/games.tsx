import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DynamicGames from "@/components/dynamic-games";
import MobileNav from "@/components/mobile-nav";
import FloatingChatbot from "@/components/floating-chatbot";
import { Gamepad2, ArrowLeft, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function GamesPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect to login if not authenticated (handled by ProtectedRoute)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-3 sm:mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="p-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Interactive Learning Games
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  Life in UK Test Platform
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2 sm:px-4">
              Master Life in UK test content through engaging interactive games and activities
            </p>
          </div>
        </div>

        {/* Dynamic Games Component */}
        <DynamicGames userId={user.id} />
      </div>

      <MobileNav />
      <FloatingChatbot />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
    </div>
  );
}