import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

// Helper function to check if user is admin
const isAdminUser = (role: string | undefined): boolean => {
  return role === 'admin' || role === 'superadmin';
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!isLoading && isAuthenticated && user && !isAdminUser(user.role)) {
      // Redirect non-admin users to dashboard
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

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

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  if (!user || !isAdminUser(user.role)) {
    return null; // Will be redirected by useEffect
  }

  return <>{children}</>;
}