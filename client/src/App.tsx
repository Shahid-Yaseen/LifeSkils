import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LandingPage from "@/pages/LandingPage";
import GamesPage from "@/pages/games";
import PracticeTestsPage from "@/pages/enhanced-practice-tests";
import PracticeTestPage from "@/pages/enhanced-practice-test";
import MockTestsPage from "@/pages/enhanced-mock-tests";
import MockTestPage from "@/pages/enhanced-mock-test";
import TimelinePage from "@/pages/timeline";
import TimelineTestPage from "@/pages/timeline-test";
import DiagramsPage from "@/pages/diagrams";
import VideoUploadPage from "@/pages/video-upload";
import InteractiveMapPage from "@/pages/interactive-map";
import PaymentPage from "@/pages/payment";
import PaymentSuccessPage from "@/pages/payment-success";
import ProfilePage from "@/pages/profile";
import ChatBotPage from "@/pages/chatbot";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminRoute from "@/components/AdminRoute";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminVideoManagement from "@/pages/admin/AdminVideoManagement";
import AdminTimelineManagement from "@/pages/admin/AdminTimelineManagement";
import RAGLearning from "@/pages/rag-learning";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminGamesManagement from "@/pages/admin/AdminGamesManagement";
import AdminTestManagement from "@/pages/admin/AdminTestManagement";
import AdminDiagramsManagement from "@/pages/admin/AdminDiagramsManagement";
import AdminTestAnalytics from "@/pages/admin/AdminTestAnalytics";
import AdminMapManagement from "@/pages/admin/AdminMapManagement";
import AdminAIBookSuite from "@/pages/admin/AdminAIBookSuite";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

// Component for public routes (landing page)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/">
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/games">
        <ProtectedRoute>
          <GamesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/practice-tests">
        <ProtectedRoute>
          <PracticeTestsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/practice-test/:id">
        <ProtectedRoute>
          <PracticeTestPage />
        </ProtectedRoute>
      </Route>
      <Route path="/mock-tests">
        <ProtectedRoute>
          <MockTestsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/mock-test/:id">
        <ProtectedRoute>
          <MockTestPage />
        </ProtectedRoute>
      </Route>
      <Route path="/timeline">
        <ProtectedRoute>
          <TimelinePage />
        </ProtectedRoute>
      </Route>
      <Route path="/timeline-test/:topicId">
        <ProtectedRoute>
          <TimelineTestPage />
        </ProtectedRoute>
      </Route>
      <Route path="/diagrams">
        <ProtectedRoute>
          <DiagramsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/video-upload">
        <ProtectedRoute requireRole="admin">
          <VideoUploadPage />
        </ProtectedRoute>
      </Route>
      <Route path="/interactive-map">
        <ProtectedRoute>
          <InteractiveMapPage />
        </ProtectedRoute>
      </Route>
      <Route path="/payment">
        <ProtectedRoute>
          <PaymentPage />
        </ProtectedRoute>
      </Route>
      <Route path="/payment-success">
        <ProtectedRoute>
          <PaymentSuccessPage />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>
      <Route path="/rag-learning">
        <ProtectedRoute>
          <RAGLearning />
        </ProtectedRoute>
      </Route>
      <Route path="/chatbot">
        <ProtectedRoute>
          <ChatBotPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      </Route>
     
      <Route path="/admin/videos">
        <AdminRoute>
          <AdminVideoManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute>
          <AdminAnalytics />
        </AdminRoute>
      </Route>
      <Route path="/admin/timeline">
        <AdminRoute>
          <AdminTimelineManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/games">
        <AdminRoute>
          <AdminGamesManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/tests">
        <AdminRoute>
          <AdminTestManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/tests/management">
        <AdminRoute>
          <AdminTestManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/tests/analytics">
        <AdminRoute>
          <AdminTestAnalytics />
        </AdminRoute>
      </Route>
      <Route path="/admin/map">
        <AdminRoute>
          <AdminMapManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/diagrams">
        <AdminRoute>
          <AdminDiagramsManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/ai-book-suite">
        <AdminRoute>
          <AdminAIBookSuite />
        </AdminRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
