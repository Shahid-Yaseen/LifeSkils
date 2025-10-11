import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "student" | "admin";
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireRole, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation(redirectTo);
        return;
      }

      if (requireRole && user?.role !== requireRole) {
        // Redirect based on user role
        if (user?.role === "admin") {
          setLocation("/admin/users");
        } else {
          setLocation("/dashboard");
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireRole, redirectTo, setLocation]);

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

  if (requireRole && user?.role !== requireRole) {
    return null; // Will be redirected by useEffect
  }

  return <>{children}</>;
}