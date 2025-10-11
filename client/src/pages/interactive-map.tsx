import { ArrowLeft, MapPin, Users, BookOpen, Camera, Star } from "lucide-react";
import { Link } from "wouter";
import UKInteractiveMapReal from "@/components/uk-interactive-map-real";
import MobileNav from "@/components/mobile-nav";
import FloatingChatbot from "@/components/floating-chatbot";

export default function InteractiveMapPage() {
  const userId = "guest"; // In a real app, this would come from authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header with Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link 
                href="/dashboard" 
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 duration-200" />
                <span className="text-xs sm:text-sm">Back to Dashboard</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Interactive UK Map</h1>
                  <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-4">
                    Explore the capitals, attractions, historical locations, and cultural regions of the United Kingdom and Northern Ireland. 
                    Discover notable artists, writers, and literary figures from each region.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <Users className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Cultural Regions</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Literary Figures</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <Camera className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Historical Sites</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                <Star className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Attractions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-8 relative z-10">
        {/* Interactive Map Component */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Interactive Map</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Click on regions to explore detailed information about each area
              </p>
            </div>
            <UKInteractiveMapReal userId={userId} />
          </div>
        </div>
      </div>

      <MobileNav />
      <FloatingChatbot />
      
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 sm:h-20 md:hidden"></div>
    </div>
  );
}