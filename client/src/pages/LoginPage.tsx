import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn, UserPlus, Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Login successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
      // Use requestAnimationFrame to ensure state updates are processed
      requestAnimationFrame(() => {
        setLocation("/dashboard");
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Theme Toggle */}
        <div className="flex justify-end">
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

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Life in UK Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your gateway to UK citizenship preparation
          </p>
        </div>

        <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-gray-900 dark:text-white">
              <LogIn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email address"
                          data-testid="input-email"
                          className="transition-colors border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          disabled={isSubmitting}
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            data-testid="input-password"
                            className="pr-10 transition-colors border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 dark:text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                            disabled={isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  disabled={isSubmitting}
                  data-testid="button-login"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        data-testid="link-register"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Create one here
                      </Button>
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}