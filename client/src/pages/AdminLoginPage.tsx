import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      return apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: async (response: Response) => {
      const { accessToken, refreshToken, user } = await response.json();
      
      // Check if user is admin
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        toast({
          title: "Access Denied",
          description: "Admin privileges required to access this area.",
          variant: "destructive",
        });
        return;
      }

      // Store tokens and user data
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      // Update the auth context with the user data
      updateUser(user);
      
      toast({
        title: "Welcome Admin",
        description: `Successfully logged in as ${user.firstName || user.username}`,
      });
      
      // Add a small delay to ensure authentication state is properly set
      setTimeout(() => {
        // Force a page reload to ensure authentication state is properly initialized
        // This ensures the AdminRoute component gets the correct user state
        window.location.href = "/admin/users";
      }, 100);
    },
    onError: (error: any) => {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials or insufficient privileges",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-blue-50 to-red-100 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to regular login */}
        <div className="flex justify-center">
          <Link href="/login">
            <Button variant="outline" size="sm" data-testid="button-back-regular-login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Regular Login
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" data-testid="card-admin-login">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                Admin Access
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Administrative login for Life in UK platform
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@example.com"
                          disabled={loginMutation.isPending}
                          data-testid="input-admin-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password"
                            disabled={loginMutation.isPending}
                            data-testid="input-admin-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loginMutation.isPending}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
                  disabled={loginMutation.isPending}
                  data-testid="button-admin-login"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Login
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Admin credentials hint */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700" data-testid="card-admin-credentials">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Default Admin Credentials
              </h4>
              <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <div><strong>Email:</strong> admin@example.com</div>
                <div><strong>Password:</strong> admin123</div>
              </div>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                Change these credentials in production
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Life in UK Test Platform - Administrative Access</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}