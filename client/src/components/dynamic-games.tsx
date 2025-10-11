import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Sparkles, 
  CheckCircle, 
  RotateCw, 
  Target, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Medal, 
  Palette, 
  Clock, 
  Crown, 
  Scale, 
  Church, 
  Globe, 
  Sword, 
  FileText, 
  Cross, 
  Building, 
  MapPin, 
  Utensils, 
  Award, 
  Flag, 
  Building2, 
  RotateCcw
} from "lucide-react";
import AIExercisesGame from "@/components/ai-exercises-game";
import TrueFalseGame from "@/components/true-false-game";
import FlipCards from "@/components/flip-cards";
import MatchingCards from "@/components/matching-cards";
import EnhancedMatchingCards from "@/components/enhanced-matching-cards";
import HolidaysMatching from "@/components/holidays-matching";
import HolidayMeaningsMatching from "@/components/holiday-meanings-matching";
import SportsAchievementsMatching from "@/components/sports-achievements-matching";
import SportsHeroesMatching from "@/components/sports-heroes-matching";
import EnhancedSportsHeroesMatching from "@/components/enhanced-sports-heroes-matching";
import BritishArtistsMatching from "@/components/british-artists-matching";
import UKAgesMatching from "@/components/uk-ages-matching";
import BritishLeadersMatching from "@/components/british-leaders-matching";
import JusticeSystemMatching from "@/components/justice-system-matching";
import ReligionDemographicsMatching from "@/components/religion-demographics-matching";
import UKMembershipsMatching from "@/components/uk-memberships-matching";
import BattlesWarsMatching from "@/components/battles-wars-matching";
import ActsTreatiesBillsMatching from "@/components/acts-treaties-bills-matching";
import RulersReligionsMatching from "@/components/rulers-religions-matching";
import PrimeMinistersMatching from "@/components/prime-ministers-matching";
import UKPlacesMatching from "@/components/uk-places-matching";
import TraditionalFoodsMatching from "@/components/traditional-foods-matching";
import UKCulturalAwardsMatching from "@/components/uk-cultural-awards-matching";
import UKConstituentCountriesMatching from "@/components/uk-constituent-countries-matching";
import UKParliamentDevolutionMatching from "@/components/uk-parliament-devolution-matching";

interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  gameType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  orderIndex: number;
  instructions?: string;
  estimatedTime?: number;
  tags?: string[];
  gameData?: any;
  trueFalseQuestions?: Array<{
    id: string;
    statement: string;
    isTrue: boolean;
    explanation: string;
    category: string;
  }>;
  matchingPairs?: Array<{
    id: string;
    left: string;
    right: string;
    category: string;
  }>;
  tripleMatches?: Array<{
    id: string;
    column1: string;
    column2: string;
    column3: string;
    category: string;
  }>;
  flipCards?: Array<{
    id: string;
    front: string;
    back: string;
    category: string;
  }>;
  aiTopics?: Array<{
    value: string;
    icon: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface DynamicGamesProps {
  userId: string;
}

// Component mapping for different game types
const GameComponentMap: Record<string, any> = {
  "ai-exercises": AIExercisesGame,
  "true-false": TrueFalseGame,
  "flip-cards": FlipCards,
  "general-matching": MatchingCards,
  "holidays-matching": HolidaysMatching,
  "holiday-meanings-matching": HolidayMeaningsMatching,
  "sports-achievements-matching": SportsAchievementsMatching,
  "sports-heroes-matching": SportsHeroesMatching,
  "enhanced-sports-heroes-matching": EnhancedSportsHeroesMatching,
  "british-artists-matching": BritishArtistsMatching,
  "uk-ages-matching": UKAgesMatching,
  "british-leaders-matching": BritishLeadersMatching,
  "justice-system-matching": JusticeSystemMatching,
  "religion-demographics-matching": ReligionDemographicsMatching,
  "uk-memberships-matching": UKMembershipsMatching,
  "battles-wars-matching": BattlesWarsMatching,
  "acts-treaties-bills-matching": ActsTreatiesBillsMatching,
  "rulers-religions-matching": RulersReligionsMatching,
  "prime-ministers-matching": PrimeMinistersMatching,
  "uk-places-matching": UKPlacesMatching,
  "traditional-foods-matching": TraditionalFoodsMatching,
  "uk-cultural-awards-matching": UKCulturalAwardsMatching,
  "uk-constituent-countries-matching": UKConstituentCountriesMatching,
  "uk-parliament-devolution-matching": UKParliamentDevolutionMatching,
};

export default function DynamicGames({ userId }: DynamicGamesProps) {
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading games...</p>
        </div>
      </div>
    );
  }

  // Filter games by category
  const aiGeneratedGames = games.filter(game => game.category === 'ai-generated');
  const trueFalseGames = games.filter(game => game.category === 'true-false');
  const matchingGames = games.filter(game => game.category === 'matching');
  const flipCardGames = games.filter(game => game.category === 'flip-cards');
  
  // Check if we have any games at all
  const hasAnyGames = games.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Game Categories Overview */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Game Categories</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">All Systems Active</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="truncate">AI Generated</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Smart personalized practice questions using artificial intelligence</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">Fill-in-the-Blank</Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">Multiple Choice</Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">Authentic Content</Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">{aiGeneratedGames.length} Games</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="truncate">True/False</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Quick decision-based learning with immediate feedback</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">Quick Learning</Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">Instant Feedback</Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">Score Tracking</Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">{trueFalseGames.length} Games</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RotateCw className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="truncate">Match the Cards</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Interactive matching games with difficulty levels and variants</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs">Flip Cards</Badge>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs">2-Column Match</Badge>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs">3-Column Match</Badge>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs">{matchingGames.length + flipCardGames.length} Games</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Interactive Games Tabs */}
      <Tabs defaultValue="ai-generated" className="w-full">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Interactive Games</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Live Games</span>
            </div>
          </div>
          <TabsList className="grid w-full grid-cols-3 p-0 bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
            <TabsTrigger value="ai-generated" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold text-xs sm:text-sm py-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded flex items-center justify-center">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
              </div>
              <span className="font-medium hidden sm:inline">AI Generated</span>
              <span className="font-medium sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="true-false" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold text-xs sm:text-sm py-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded flex items-center justify-center">
                <CheckCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
              </div>
              <span className="font-medium hidden sm:inline">True/False</span>
              <span className="font-medium sm:hidden">T/F</span>
            </TabsTrigger>
            <TabsTrigger value="match-cards" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold text-xs sm:text-sm py-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-600 rounded flex items-center justify-center">
                <RotateCw className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
              </div>
              <span className="font-medium hidden sm:inline">Match the Cards</span>
              <span className="font-medium sm:hidden">Match</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* AI Generated Games */}
        <TabsContent value="ai-generated">
          <div className="space-y-3 sm:space-y-4">
            {aiGeneratedGames.length > 0 ? (
              aiGeneratedGames.map((game) => {
                const GameComponent = GameComponentMap[game.gameType];
                return (
                  <Card key={game.id} className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="truncate">{game.title}</span>
                      </CardTitle>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        {game.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {GameComponent ? (
                        <GameComponent userId={userId} game={game} />
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Game component not available for this game type.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : !hasAnyGames ? (
              <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span className="truncate">AI-Powered Exercise Generator</span>
                  </CardTitle>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Generate personalized practice exercises using advanced AI. Choose your topic and difficulty level for tailored learning using authentic Life in UK content.
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <AIExercisesGame userId={userId} />
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-600 dark:text-gray-400">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base">No AI Generated games available. Please check back later!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* True/False Games */}
        <TabsContent value="true-false">
          <div className="space-y-3 sm:space-y-4">
            {trueFalseGames.length > 0 ? (
              trueFalseGames.map((game) => {
                const GameComponent = GameComponentMap[game.gameType];
                return (
                  <Card key={game.id} className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="truncate">{game.title}</span>
                      </CardTitle>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        {game.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {GameComponent ? (
                        <GameComponent userId={userId} game={game} />
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Game component not available for this game type.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : !hasAnyGames ? (
              <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span className="truncate">True/False Challenge Games</span>
                  </CardTitle>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Test your knowledge with True/False statements about UK facts, traditions, and values. Perfect for quick learning and building confidence!
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <TrueFalseGame userId={userId} />
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base">No True/False games available. Please check back later!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Match the Cards Games */}
        <TabsContent value="match-cards">
          <div className="space-y-3 sm:space-y-4">
            <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 mb-3 sm:mb-4">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-base sm:text-lg">Match the Cards Games</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                  Interactive card matching games with different difficulty levels. Start with flip cards, then progress to 2-column and 3-column matching challenges.
                </p>
              </CardHeader>
            </Card>

            {/* Flip Cards Section */}
            <Card className="shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white text-base sm:text-lg">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="truncate">Flip Cards Game</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                  Click on cards to reveal the answers. Test your knowledge and mark cards as completed when you've mastered them.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <FlipCards userId={userId} />
              </CardContent>
            </Card>

            {/* 2-Column Matching Games */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white text-base sm:text-lg">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="truncate">2-Column Matching Games</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                  Match items from two columns. Perfect for building connections between related concepts.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="general-matching" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mb-4 sm:mb-6 bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 gap-1">
                    <TabsTrigger value="general-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">General Match</span>
                      <span className="sm:hidden">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="holidays-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Holiday Dates</span>
                      <span className="sm:hidden">Holidays</span>
                    </TabsTrigger>
                    <TabsTrigger value="holiday-meanings-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Holiday Meanings</span>
                      <span className="sm:hidden">Meanings</span>
                    </TabsTrigger>
                    <TabsTrigger value="sports-achievements-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Sports Achievements</span>
                      <span className="sm:hidden">Sports</span>
                    </TabsTrigger>
                    <TabsTrigger value="british-artists-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">British Artists</span>
                      <span className="sm:hidden">Artists</span>
                    </TabsTrigger>
                    <TabsTrigger value="uk-ages-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">UK Ages</span>
                      <span className="sm:hidden">Ages</span>
                    </TabsTrigger>
                    <TabsTrigger value="british-leaders-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">British Leaders</span>
                      <span className="sm:hidden">Leaders</span>
                    </TabsTrigger>
                    <TabsTrigger value="uk-cultural-awards-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Cultural Awards</span>
                      <span className="sm:hidden">Awards</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general-matching">
                    <MatchingCards userId={userId} />
                  </TabsContent>
                  <TabsContent value="holidays-matching">
                    <HolidaysMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="holiday-meanings-matching">
                    <HolidayMeaningsMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="sports-achievements-matching">
                    <SportsAchievementsMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="british-artists-matching">
                    <BritishArtistsMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="uk-ages-matching">
                    <UKAgesMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="british-leaders-matching">
                    <BritishLeadersMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="uk-cultural-awards-matching">
                    <UKCulturalAwardsMatching userId={userId} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 3-Column Matching Games */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white text-base sm:text-lg">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="truncate">3-Column Matching Games</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                  Advanced matching with three columns. Perfect for complex relationships and detailed knowledge testing.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="acts-treaties-bills-matching" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mb-4 sm:mb-6 bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 gap-1">
                    <TabsTrigger value="acts-treaties-bills-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Acts, Treaties & Bills</span>
                      <span className="sm:hidden">Acts</span>
                    </TabsTrigger>
                    <TabsTrigger value="battles-wars-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Sword className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Battles & Wars</span>
                      <span className="sm:hidden">Battles</span>
                    </TabsTrigger>
                    <TabsTrigger value="justice-system-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Justice System</span>
                      <span className="sm:hidden">Justice</span>
                    </TabsTrigger>
                    <TabsTrigger value="prime-ministers-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Prime Ministers</span>
                      <span className="sm:hidden">PMs</span>
                    </TabsTrigger>
                    <TabsTrigger value="religion-demographics-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Church className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Religion & Demographics</span>
                      <span className="sm:hidden">Religion</span>
                    </TabsTrigger>
                    <TabsTrigger value="rulers-religions-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Cross className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Rulers & Religions</span>
                      <span className="sm:hidden">Rulers</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="acts-treaties-bills-matching">
                    <div className="space-y-6">
                      {/* Game Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Acts, Treaties & Bills Triple Match</h3>
                            <p className="text-gray-600 dark:text-gray-300">Match British legislation with their years and historical significance</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">0/2 Matches</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">0% Accuracy</div>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Category</label>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-pointer">All Categories</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Constitutional</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Social Reform</Badge>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer">International Treaty</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Religious</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Economic</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Legal Reform</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Human Rights</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Type</label>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-pointer">All Types</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Act</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Treaty</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Bill</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Charter</Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">Agreement</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex items-center gap-2">
                          <RotateCw className="h-4 w-4" />
                          Shuffle
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <RotateCw className="h-4 w-4" />
                          Reset
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Show Legislative Reference
                        </Button>
                      </div>

                      {/* Three Column Matching Game */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Column 1: Acts, Treaties & Bills */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Acts, Treaties & Bills (2)</h4>
                          <div className="space-y-3">
                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                              <div className="font-medium text-gray-900 dark:text-white mb-2">Act of Supremacy</div>
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Religious</Badge>
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Act</Badge>
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Revolutionary</Badge>
                              </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                              <div className="font-medium text-gray-900 dark:text-white mb-2">Catholic Emancipation Act</div>
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Religious</Badge>
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Act</Badge>
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Major</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Years */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Years (2)</h4>
                          <div className="space-y-3">
                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                              <div className="font-medium text-gray-900 dark:text-white mb-2">1534</div>
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Religious</Badge>
                              </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                              <div className="font-medium text-gray-900 dark:text-white mb-2">1829</div>
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">Religious</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Historical Significance */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Historical Significance (2)</h4>
                          <div className="space-y-3">
                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                              <div className="text-gray-900 dark:text-white">Allowed Catholics to sit in Parliament and hold most public offices</div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                              <div className="text-gray-900 dark:text-white">Made Henry VIII head of Church of England, broke with Roman Catholic Church</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="battles-wars-matching">
                    <BattlesWarsMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="justice-system-matching">
                    <JusticeSystemMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="prime-ministers-matching">
                    <PrimeMinistersMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="religion-demographics-matching">
                    <ReligionDemographicsMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="rulers-religions-matching">
                    <RulersReligionsMatching userId={userId} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Additional 3-Column Games */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white text-base sm:text-lg">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-600 dark:bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="truncate">Specialized 3-Column Games</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                  Specialized matching games for specific UK knowledge areas.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="sports-heroes-matching" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-4 sm:mb-6 bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 gap-1">
                    <TabsTrigger value="sports-heroes-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Medal className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Sports Heroes</span>
                      <span className="sm:hidden">Sports</span>
                    </TabsTrigger>
                    <TabsTrigger value="traditional-foods-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Utensils className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Traditional Foods</span>
                      <span className="sm:hidden">Foods</span>
                    </TabsTrigger>
                    <TabsTrigger value="uk-memberships-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">UK Memberships</span>
                      <span className="sm:hidden">Memberships</span>
                    </TabsTrigger>
                    <TabsTrigger value="uk-constituent-countries-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">UK Countries</span>
                      <span className="sm:hidden">Countries</span>
                    </TabsTrigger>
                    <TabsTrigger value="uk-parliament-devolution-matching" className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 font-semibold text-xs sm:text-sm">
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">UK Parliament & Devolution</span>
                      <span className="sm:hidden">Parliament</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="sports-heroes-matching">
                    <SportsHeroesMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="traditional-foods-matching">
                    <TraditionalFoodsMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="uk-memberships-matching">
                    <UKMembershipsMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="uk-constituent-countries-matching">
                    <UKConstituentCountriesMatching userId={userId} />
                  </TabsContent>
                  <TabsContent value="uk-parliament-devolution-matching">
                    <UKParliamentDevolutionMatching userId={userId} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}