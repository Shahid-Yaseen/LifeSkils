import { Crown, BookOpen, GamepadIcon, Map, Video, Trophy, Check, ArrowRight, Star, Users, Timer, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Practice Tests",
      description: "Take comprehensive 24-question practice tests with instant feedback and detailed explanations",
      color: "from-green-500 to-blue-600"
    },
    {
      icon: Timer,
      title: "Mock Tests",
      description: "Official exam simulation with timer to prepare you for the real test experience",
      color: "from-red-500 to-orange-600"
    },
    {
      icon: GamepadIcon,
      title: "Interactive Games",
      description: "Learn through engaging matching games, flip cards, and True/False challenges",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Map,
      title: "Interactive UK Map",
      description: "Explore UK geography, cultural regions, and important landmarks",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Video,
      title: "Video Learning",
      description: "Watch educational videos covering government, history, geography, and culture",
      color: "from-indigo-500 to-cyan-600"
    },
    {
      icon: MessageCircle,
      title: "AI Study Assistant",
      description: "Get instant help from our AI chatbot with comprehensive UK knowledge",
      color: "from-violet-500 to-purple-600"
    }
  ];

  const stats = [
    { number: "45+", label: "Practice Tests" },
    { number: "50+", label: "Mock Tests" },
    { number: "18", label: "UK Locations" },
    { number: "1000+", label: "Questions" }
  ];

  const testimonials = [
    {
      text: "The interactive games made learning so much fun. I passed my test on the first try!",
      name: "Sarah M.",
      rating: 5
    },
    {
      text: "The mock tests gave me confidence for the real exam. Excellent preparation platform.",
      name: "Ahmed K.",
      rating: 5
    },
    {
      text: "Comprehensive content covering everything I needed to know about UK history and culture.",
      name: "Maria L.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-uk-blue rounded-lg flex items-center justify-center">
                <Crown className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Life in UK Test</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">E-Learning Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <SimpleThemeToggle />
              <Link href="/login">
                <Button variant="outline" size="sm" data-testid="button-login">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-uk-blue hover:bg-uk-blue/90" data-testid="button-signup">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 dark:bg-gradient-to-r dark:from-blue-900 dark:via-purple-900 dark:to-red-900 py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-4xl">🇬🇧</span>
              </div>
              <div className="text-white/90 text-sm font-medium uppercase tracking-wider">
                Official Life in UK Test Preparation
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Master Your <span className="text-yellow-300">UK Citizenship Test</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive e-learning platform with interactive tests, games, and AI-powered study assistance 
              to help you pass the Life in UK test with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 text-lg" data-testid="button-get-started">
                  Get Started Free <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/login">
                <Button  size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg" data-testid="button-login-hero">
                  Login to Continue
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-yellow-300" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Pass
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform combines proven learning methods with modern technology 
              to give you the best preparation experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300" data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple steps to get you prepared and confident for your test
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center" data-testid="step-signup">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your free account and get instant access to our comprehensive learning platform.
              </p>
            </div>

            <div className="text-center" data-testid="step-learn">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Learn & Practice</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Study with our interactive content, take practice tests, and play educational games.
              </p>
            </div>

            <div className="text-center" data-testid="step-pass">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Pass Your Test</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Take your official test with confidence, knowing you're fully prepared for success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-white via-red-50 to-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands who have passed their Life in UK test with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg" data-testid={`testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful students who have passed their Life in UK test 
            with our comprehensive preparation platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 text-lg" data-testid="button-start-learning">
                Start Learning Today <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/login">
              <Button  size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg" data-testid="button-continue-learning">
                Continue Learning
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-white/80 text-sm">
            <p>Free account • No credit card required • Instant access</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-uk-blue rounded-lg flex items-center justify-center">
                  <Crown className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Life in UK Test</h3>
                  <p className="text-sm text-gray-400">E-Learning Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The most comprehensive online platform for Life in UK test preparation. 
                Master UK history, culture, and government with our interactive learning tools.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Practice Tests</li>
                <li>Mock Exams</li>
                <li>Interactive Games</li>
                <li>AI Study Assistant</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Life in UK Test E-Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}