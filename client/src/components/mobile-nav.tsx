import { Home, Clock, Building, Map, Sparkles, Gamepad2, FileText, ClipboardCheck } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around py-1 sm:py-2">
        <Link href="/dashboard">
          <div className={`flex flex-col items-center py-1 sm:py-2 px-1 sm:px-2 cursor-pointer ${
            location === '/dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}>
            <Home size={16} />
            <span className="text-xs mt-0.5 sm:mt-1">Dashboard</span>
          </div>
        </Link>
        <Link href="/timeline">
          <div className={`flex flex-col items-center py-1 sm:py-2 px-1 sm:px-2 cursor-pointer ${
            location === '/timeline' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}>
            <Clock size={16} />
            <span className="text-xs mt-0.5 sm:mt-1">Timeline</span>
          </div>
        </Link>
        <Link href="/diagrams">
          <div className={`flex flex-col items-center py-1 sm:py-2 px-1 sm:px-2 cursor-pointer ${
            location === '/diagrams' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}>
            <Building size={16} />
            <span className="text-xs mt-0.5 sm:mt-1">Diagrams</span>
          </div>
        </Link>
        <Link href="/games">
          <div className={`flex flex-col items-center py-1 sm:py-2 px-1 sm:px-2 cursor-pointer ${
            location === '/games' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}>
            <Gamepad2 size={16} />
            <span className="text-xs mt-0.5 sm:mt-1">Games</span>
          </div>
        </Link>
        <Link href="/practice-tests">
          <div className={`flex flex-col items-center py-1 sm:py-2 px-1 sm:px-2 cursor-pointer ${
            location === '/practice-tests' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}>
            <FileText size={16} />
            <span className="text-xs mt-0.5 sm:mt-1">Tests</span>
          </div>
        </Link>
        <Link href="/interactive-map">
          <div className={`flex flex-col items-center py-1 sm:py-2 px-1 sm:px-2 cursor-pointer ${
            location === '/interactive-map' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}>
            <Map size={16} />
            <span className="text-xs mt-0.5 sm:mt-1">Map</span>
          </div>
        </Link>
        <Link href="/rag-learning">
          <div className={`flex flex-col items-center py-1 sm:py-2 px-1 sm:px-2 cursor-pointer ${
            location === '/rag-learning' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}>
            <Sparkles size={16} />
            <span className="text-xs mt-0.5 sm:mt-1">AI</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
