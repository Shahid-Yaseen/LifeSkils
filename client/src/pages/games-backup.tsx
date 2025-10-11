import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FlipCards from "@/components/flip-cards";
import MatchingCards from "@/components/matching-cards";
import HolidaysMatching from "@/components/holidays-matching";
import HolidayMeaningsMatching from "@/components/holiday-meanings-matching";
import SportsAchievementsMatching from "@/components/sports-achievements-matching";
import SportsHeroesMatching from "@/components/sports-heroes-matching";
import BritishArtistsMatching from "@/components/british-artists-matching";
import UKAgesMatching from "@/components/uk-ages-matching";
import TrueFalseGame from "@/components/true-false-game";
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
import { Gamepad2, RotateCcw, RotateCw, Target, Trophy, ArrowLeft, Calendar, BookOpen, Medal, Palette, Clock, CheckCircle, Crown, Scale, Church, Globe, Sword, FileText, Cross, Building, MapPin, Utensils, Award, Flag, Building2 } from "lucide-react";
import { Link } from "wouter";

export default function GamesPage() {
  const userId = "176ee191-c925-40f7-8d6e-12b3342020d2"; // In a real app, this would come from authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gamepad2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Interactive Learning Games
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Master Life in UK test content through engaging interactive games and activities
            </p>
          </div>
        </div>

        {/* Game Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RotateCw className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">Flip Cards</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">8</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Available Cards</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-semibold">General Match</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">10</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">History & Facts</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-rose-600" />
                <h3 className="text-sm font-semibold">Holiday Dates</h3>
              </div>
              <p className="text-2xl font-bold text-rose-600">18</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Date Matching</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-semibold">Holiday Meanings</h3>
              </div>
              <p className="text-2xl font-bold text-indigo-600">18</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Meaning Match</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-semibold">Sports Heroes</h3>
              </div>
              <p className="text-2xl font-bold text-amber-600">18</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Athletes & Achievements</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Medal className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">Triple Match</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Name-Sport-Achievement</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-semibold">British Artists</h3>
              </div>
              <p className="text-2xl font-bold text-indigo-600">10</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Artists & Art Forms</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">UK Ages</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Age Requirements</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-semibold">True/False</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Test Statements</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-semibold">British Leaders</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">15</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Leaders & Achievements</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">Justice System</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Courts & Jurisdictions</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Church className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-semibold">Religion & Demographics</h3>
              </div>
              <p className="text-2xl font-bold text-indigo-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Faith & Ethnicity</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">UK Memberships</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">International Organizations</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sword className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-semibold">Battles & Wars</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Historical Conflicts</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-semibold">Acts, Treaties & Bills</h3>
              </div>
              <p className="text-2xl font-bold text-amber-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Legislative History</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Cross className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-semibold">Rulers & Religions</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Royal Religious History</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">Prime Ministers</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Political Leadership</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-semibold">UK Places</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Places of Interest</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-semibold">Traditional Foods</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">21</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Regional Dishes</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-semibold">Cultural Awards</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">15</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Arts & Culture</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flag className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-semibold">UK Countries</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">18</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Countries & Symbols</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">Parliament & Devolution</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">18</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Government Structure</p>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Levels */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Difficulty Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-700 dark:text-green-300">Beginner Level</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Single activities and basic learning</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Flip Cards</Badge>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">True/False</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300">Middle Level</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Double matching challenges</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 flex flex-wrap gap-1">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">General Matching</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Holiday Dates</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Holiday Meanings</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Sports Achievements</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">British Artists</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">UK Ages</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">British Leaders</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Cultural Awards</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Advanced Level</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Triple matching challenges</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 flex flex-wrap gap-1">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Sports Heroes</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Justice System</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Religion & Demographics</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">UK Memberships</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Battles & Wars</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Acts, Treaties & Bills</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Rulers & Religions</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Prime Ministers</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">UK Places</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Traditional Foods</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">UK Countries</Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Parliament & Devolution</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactive Games Tabs */}
        <Tabs defaultValue="beginner-level" className="w-full">
          <TabsList className="grid w-full grid-cols-1 lg:grid-cols-3 mb-8">
            <TabsTrigger value="beginner-level" className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Beginner Level
            </TabsTrigger>
            <TabsTrigger value="middle-level" className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Middle Level (Double Match)
            </TabsTrigger>
            <TabsTrigger value="advanced-level" className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              Advanced Level (Triple Match)
            </TabsTrigger>
          </TabsList>

          {/* Beginner Level */}
          <TabsContent value="beginner-level">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCw className="h-5 w-5 text-green-600" />
                    Flip Cards Game
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Click on cards to reveal the answers. Test your knowledge and mark cards as completed when you've mastered them.
                  </p>
                </CardHeader>
                <CardContent>
                  <FlipCards userId={userId} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    True/False Challenge
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Test your knowledge with True/False statements about UK facts, traditions, and values. Perfect for building confidence!
                  </p>
                </CardHeader>
                <CardContent>
                  <TrueFalseGame userId={userId} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Middle Level - Double Matching */}
          <TabsContent value="middle-level">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                  Middle Level - Double Matching Games
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Match items from two columns. Perfect for building connections between related concepts.
                </p>
              </div>
              
              <Tabs defaultValue="general-matching" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 mb-8">
            <TabsTrigger value="flip-cards" className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Flip Cards
            </TabsTrigger>
            <TabsTrigger value="matching-cards" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              General Match
            </TabsTrigger>
            <TabsTrigger value="holidays-matching" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Holiday Dates
            </TabsTrigger>
            <TabsTrigger value="holiday-meanings-matching" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Holiday Meanings
            </TabsTrigger>
            <TabsTrigger value="sports-achievements-matching" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Sports Heroes
            </TabsTrigger>
            <TabsTrigger value="sports-heroes-matching" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Triple Match
            </TabsTrigger>
            <TabsTrigger value="british-artists-matching" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              British Artists
            </TabsTrigger>
            <TabsTrigger value="uk-ages-matching" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              UK Ages
            </TabsTrigger>
            <TabsTrigger value="true-false-game" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              True/False
            </TabsTrigger>
            <TabsTrigger value="british-leaders-matching" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              British Leaders
            </TabsTrigger>
            <TabsTrigger value="justice-system-matching" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Justice System
            </TabsTrigger>
            <TabsTrigger value="religion-demographics-matching" className="flex items-center gap-2">
              <Church className="h-4 w-4" />
              Religion & Demographics
            </TabsTrigger>
            <TabsTrigger value="uk-memberships-matching" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              UK Memberships
            </TabsTrigger>
            <TabsTrigger value="battles-wars-matching" className="flex items-center gap-2">
              <Sword className="h-4 w-4" />
              Battles & Wars
            </TabsTrigger>
            <TabsTrigger value="acts-treaties-bills-matching" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Acts, Treaties & Bills
            </TabsTrigger>
            <TabsTrigger value="rulers-religions-matching" className="flex items-center gap-2">
              <Cross className="h-4 w-4" />
              Rulers & Religions
            </TabsTrigger>
            <TabsTrigger value="prime-ministers-matching" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Prime Ministers
            </TabsTrigger>
            <TabsTrigger value="uk-places-matching" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              UK Places
            </TabsTrigger>
            <TabsTrigger value="traditional-foods-matching" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Traditional Foods
            </TabsTrigger>
            <TabsTrigger value="uk-cultural-awards-matching" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Cultural Awards
            </TabsTrigger>
            <TabsTrigger value="uk-constituent-countries-matching" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              UK Countries
            </TabsTrigger>
            <TabsTrigger value="uk-parliament-devolution-matching" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Parliament & Devolution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flip-cards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCw className="h-5 w-5" />
                  Flip Cards Game
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Click on cards to reveal the answers. Test your knowledge and mark cards as completed when you've mastered them.
                </p>
              </CardHeader>
              <CardContent>
                <FlipCards userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matching-cards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  General Matching Game
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Click one button from each column to match related items. Cards are shuffled to challenge your critical thinking. Correct matches turn green and move to bottom, incorrect matches show red for 3 seconds.
                </p>
              </CardHeader>
              <CardContent>
                <MatchingCards userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  UK Holiday Dates Matching Game
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match UK holidays with their celebration dates. Learn about traditional British celebrations, religious festivals, and cultural events celebrated throughout the year.
                </p>
              </CardHeader>
              <CardContent>
                <HolidaysMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holiday-meanings-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Holiday Meanings Matching Game
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match UK holidays with their meanings and significance. Understand the cultural, religious, and historical importance of each celebration.
                </p>
              </CardHeader>
              <CardContent>
                <HolidayMeaningsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sports-achievements-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Sports Achievements Matching Game
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match British sports champions with their greatest achievements. Learn about legendary athletes who have made Britain proud in international competition.
                </p>
              </CardHeader>
              <CardContent>
                <SportsAchievementsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sports-heroes-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5" />
                  Sports Heroes Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  The ultimate challenge! Match British sports legends with their sport AND their greatest achievement. All three selections must be correct for a successful match.
                </p>
              </CardHeader>
              <CardContent>
                <SportsHeroesMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="british-artists-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  British Artists Matching Game
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match renowned British artists with their primary art forms. Discover the rich artistic heritage that has shaped British culture from the 18th century to today.
                </p>
              </CardHeader>
              <CardContent>
                <BritishArtistsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uk-ages-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  UK Age Requirements Matching Game
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match legal activities with their age requirements in the UK. Learn important age milestones for employment, driving, voting, and other legal rights and responsibilities.
                </p>
              </CardHeader>
              <CardContent>
                <UKAgesMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="true-false-game">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  True or False Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Test your Life in UK knowledge with true or false statements! Answer correctly to see celebratory confetti. Choose from different categories or challenge yourself with all questions.
                </p>
              </CardHeader>
              <CardContent>
                <TrueFalseGame userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="british-leaders-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  British Leaders Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  The ultimate test of British royal and political history! Match kings, queens, and prime ministers with their greatest achievements and the years they occurred. From Norman Conquest to modern times.
                </p>
              </CardHeader>
              <CardContent>
                <BritishLeadersMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="justice-system-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  UK Justice System Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Master the complex UK justice system! Match courts with their jurisdictions and regions across England & Wales, Scotland, and Northern Ireland. Learn about criminal, civil, family, and appeal courts.
                </p>
              </CardHeader>
              <CardContent>
                <JusticeSystemMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="religion-demographics-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  UK Religion & Demographics Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore UK's religious diversity! Match religions with their population percentages and ethnic compositions. Learn about Christianity, Islam, Hinduism, Sikhism, Judaism, Buddhism, and secular demographics across different regions.
                </p>
              </CardHeader>
              <CardContent>
                <ReligionDemographicsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uk-memberships-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  UK International Memberships Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Master UK's role in global governance! Match international organizations with UK's specific roles and membership details. Learn about UN Security Council, NATO, Commonwealth, G7, Brexit impact, and more.
                </p>
              </CardHeader>
              <CardContent>
                <UKMembershipsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="battles-wars-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  British Battles & Wars Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Journey through British military history! Match battles with their years and participants from medieval times to modern conflicts. Learn about Hastings, Agincourt, Trafalgar, Waterloo, World Wars, and more.
                </p>
              </CardHeader>
              <CardContent>
                <BattlesWarsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acts-treaties-bills-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Acts, Treaties & Bills Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Master British legislative history! Match Acts, Treaties, and Bills with their years and historical significance. Learn about Magna Carta, Bill of Rights, Great Reform Act, Human Rights Act, Brexit, and more.
                </p>
              </CardHeader>
              <CardContent>
                <ActsTreatiesBillsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rulers-religions-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cross className="h-5 w-5" />
                  British Rulers & Religions Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore British royal religious history! Match rulers with their reign start dates and religious affiliations. Learn about Catholic Norman kings, Anglican reformation, and religious conflicts through the centuries.
                </p>
              </CardHeader>
              <CardContent>
                <RulersReligionsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prime-ministers-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  British Prime Ministers Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Master British political history! Match Prime Ministers with their term start dates and historical periods. Learn about Walpole, Churchill, Thatcher, Blair, and other key political leaders who shaped modern Britain.
                </p>
              </CardHeader>
              <CardContent>
                <PrimeMinistersMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uk-places-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  UK Places of Interest Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover Britain's iconic locations! Match places of interest with their regions and descriptions across England, Scotland, Wales, and Northern Ireland. Learn about historic sites, natural landmarks, and cultural treasures.
                </p>
              </CardHeader>
              <CardContent>
                <UKPlacesMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traditional-foods-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Traditional Foods Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore British culinary heritage! Match traditional dishes with their regions and ingredients across England, Scotland, Wales, and Northern Ireland. Learn about fish and chips, haggis, Welsh rarebit, and more.
                </p>
              </CardHeader>
              <CardContent>
                <TraditionalFoodsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uk-cultural-awards-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  UK Cultural Awards Matching Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match British cultural awards with their categories. Learn about prestigious honors in theatre, music, literature, and the arts including BRIT Awards, Turner Prize, Booker Prize, and more.
                </p>
              </CardHeader>
              <CardContent>
                <UKCulturalAwardsMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uk-constituent-countries-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  UK Constituent Countries Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match countries with their capitals and symbols. Test your knowledge of UK geography, culture, and national identity including patron saints, symbols, flags, and major cities.
                </p>
              </CardHeader>
              <CardContent>
                <UKConstituentCountriesMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uk-parliament-devolution-matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  UK Parliament & Devolution Triple Match Challenge
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Match regions with their parliaments and powers. Learn about UK government structure, devolution, and democratic institutions including Westminster, Holyrood, Senedd, and Stormont.
                </p>
              </CardHeader>
              <CardContent>
                <UKParliamentDevolutionMatching userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Game Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Flip Cards:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Click on any card to flip it and reveal the answer</li>
                <li>Use category filters to focus on specific topics</li>
                <li>Mark cards as "Got it!" when you've mastered the content</li>
                <li>Track your progress and reset when needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">General Matching:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Click one button from Column A to select it</li>
                <li>Click the matching button from Column B</li>
                <li>Correct matches turn green and move to bottom of columns</li>
                <li>Incorrect matches show red for 3 seconds, then reset for retry</li>
                <li>Cards remain shuffled to challenge critical thinking</li>
                <li>Track your score and accuracy as you play</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Holiday Dates Matching:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Match UK holidays with their correct celebration dates</li>
                <li>Learn when different religious and cultural festivals occur</li>
                <li>Includes Christian, Hindu, Sikh, Jewish, and Islamic celebrations</li>
                <li>Correct matches turn green and move to the bottom</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Holiday Meanings Matching:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Match UK holidays with their meanings and significance</li>
                <li>Understand the cultural and religious importance of each celebration</li>
                <li>Filter by categories: Christian, Islamic, Hindu/Sikh, Jewish, Cultural</li>
                <li>Learn about Britain's diverse multicultural heritage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">UK Age Requirements:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Match legal activities with their correct age requirements</li>
                <li>Learn about employment, driving, voting, and other legal milestones</li>
                <li>Filter by categories: Employment, Transport, Legal Rights, Gambling, Civic Duties, Benefits</li>
                <li>Understand important ages: 16 (NINO, moped), 17 (car), 18 (voting, betting), 75+ (free TV licence)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}