import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Utensils, Filter, ChefHat } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface FoodData {
  id: string;
  dish: string;
  region: string;
  ingredients: string;
  category: 'Main Course' | 'Dessert' | 'Snack' | 'Breakfast' | 'Bread' | 'Soup' | 'Pudding' | 'Pastry';
  country: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland' | 'UK Wide';
  type: 'Meat' | 'Fish' | 'Vegetarian' | 'Sweet' | 'Baked' | 'Fried' | 'Boiled' | 'Roasted';
  description: string;
}

const traditionalFoodsData: FoodData[] = [
  // England
  {
    id: "1",
    dish: "Fish and Chips",
    region: "England (National)",
    ingredients: "White fish (cod/haddock), potatoes, batter, mushy peas, tartar sauce",
    category: "Main Course",
    country: "England",
    type: "Fish",
    description: "Britain's national dish - battered fish with thick-cut chips, traditionally wrapped in newspaper"
  },
  {
    id: "2",
    dish: "Yorkshire Pudding",
    region: "Yorkshire",
    ingredients: "Eggs, flour, milk, beef dripping, salt",
    category: "Main Course",
    country: "England",
    type: "Baked",
    description: "Light, airy batter pudding traditionally served with roast beef and gravy"
  },
  {
    id: "3",
    dish: "Cornish Pasty",
    region: "Cornwall",
    ingredients: "Beef, potato, swede, onion, pastry, seasoning",
    category: "Main Course",
    country: "England",
    type: "Pastry",
    description: "Protected geographical status pastry filled with beef and vegetables, crimped on one side"
  },
  {
    id: "4",
    dish: "Bangers and Mash",
    region: "England (National)",
    ingredients: "Pork sausages, mashed potatoes, onion gravy",
    category: "Main Course",
    country: "England",
    type: "Meat",
    description: "Traditional comfort food of sausages with creamy mashed potatoes and rich onion gravy"
  },
  {
    id: "5",
    dish: "Shepherd's Pie",
    region: "England (National)",
    ingredients: "Minced lamb, onions, carrots, peas, mashed potatoes, Worcestershire sauce",
    category: "Main Course",
    country: "England",
    type: "Meat",
    description: "Minced lamb topped with mashed potato and baked until golden (Cottage Pie uses beef)"
  },
  {
    id: "6",
    dish: "Spotted Dick",
    region: "England (National)",
    ingredients: "Suet, flour, dried fruit, milk, custard",
    category: "Dessert",
    country: "England",
    type: "Sweet",
    description: "Traditional steamed pudding with dried fruit, served with custard"
  },
  {
    id: "7",
    dish: "Eton Mess",
    region: "Berkshire",
    ingredients: "Strawberries, meringue, whipped cream",
    category: "Dessert",
    country: "England",
    type: "Sweet",
    description: "Dessert of broken meringue, cream and strawberries, originated at Eton College"
  },
  {
    id: "8",
    dish: "Full English Breakfast",
    region: "England (National)",
    ingredients: "Bacon, eggs, sausages, black pudding, baked beans, grilled tomatoes, toast, mushrooms",
    category: "Breakfast",
    country: "England",
    type: "Meat",
    description: "Traditional hearty breakfast with multiple cooked components, also called 'fry-up'"
  },

  // Scotland
  {
    id: "9",
    dish: "Haggis",
    region: "Scotland (National)",
    ingredients: "Sheep's heart, liver, lungs, oatmeal, suet, onions, spices, sheep's stomach",
    category: "Main Course",
    country: "Scotland",
    type: "Meat",
    description: "Scotland's national dish - savory pudding containing sheep's offal, traditionally served with neeps and tatties"
  },
  {
    id: "10",
    dish: "Cullen Skink",
    region: "Aberdeenshire",
    ingredients: "Smoked haddock, potatoes, onions, milk, butter",
    category: "Soup",
    country: "Scotland",
    type: "Fish",
    description: "Thick Scottish soup made with smoked haddock, potatoes and onions"
  },
  {
    id: "11",
    dish: "Shortbread",
    region: "Scotland (National)",
    ingredients: "Butter, sugar, flour",
    category: "Snack",
    country: "Scotland",
    type: "Baked",
    description: "Traditional Scottish biscuit made with just three ingredients, often shaped in rounds"
  },
  {
    id: "12",
    dish: "Tablet",
    region: "Scotland (National)",
    ingredients: "Sugar, condensed milk, butter, vanilla",
    category: "Dessert",
    country: "Scotland",
    type: "Sweet",
    description: "Scottish confection similar to fudge but with a grainier texture and sweeter taste"
  },
  {
    id: "13",
    dish: "Neeps and Tatties",
    region: "Scotland (National)",
    ingredients: "Swede (neeps), potatoes (tatties), butter, black pepper",
    category: "Main Course",
    country: "Scotland",
    type: "Vegetarian",
    description: "Traditional Scottish side dish of mashed swede and potatoes, served with haggis"
  },
  {
    id: "14",
    dish: "Cock-a-Leekie Soup",
    region: "Scotland (National)",
    ingredients: "Chicken, leeks, rice or barley, prunes, parsley",
    category: "Soup",
    country: "Scotland",
    type: "Meat",
    description: "Traditional Scottish soup with chicken, leeks and sometimes prunes"
  },

  // Wales
  {
    id: "15",
    dish: "Welsh Rarebit",
    region: "Wales (National)",
    ingredients: "Cheese sauce, ale, mustard, Worcestershire sauce, bread",
    category: "Snack",
    country: "Wales",
    type: "Vegetarian",
    description: "Savory cheese sauce on toast, grilled until golden and bubbly"
  },
  {
    id: "16",
    dish: "Cawl",
    region: "Wales (National)",
    ingredients: "Lamb or beef, leeks, potatoes, carrots, swede, parsley",
    category: "Soup",
    country: "Wales",
    type: "Meat",
    description: "Wales' national soup - hearty broth with meat and vegetables, traditionally eaten in two courses"
  },
  {
    id: "17",
    dish: "Bara Brith",
    region: "Wales (National)",
    ingredients: "Mixed dried fruit, tea, flour, eggs, butter, mixed spice",
    category: "Bread",
    country: "Wales",
    type: "Sweet",
    description: "Welsh fruit bread ('speckled bread') made with tea-soaked dried fruit"
  },
  {
    id: "18",
    dish: "Welsh Cakes",
    region: "Wales (National)",
    ingredients: "Flour, butter, sugar, eggs, sultanas, milk, baking powder",
    category: "Snack",
    country: "Wales",
    type: "Baked",
    description: "Small round cakes cooked on a griddle, served warm with butter and sugar"
  },
  {
    id: "19",
    dish: "Laverbread",
    region: "Pembrokeshire/Gower",
    ingredients: "Seaweed (laver), oatmeal, bacon fat",
    category: "Breakfast",
    country: "Wales",
    type: "Vegetarian",
    description: "Welsh delicacy made from seaweed, often served with bacon and cockles"
  },

  // Northern Ireland
  {
    id: "20",
    dish: "Ulster Fry",
    region: "Northern Ireland (National)",
    ingredients: "Bacon, eggs, sausages, black pudding, white pudding, soda bread, potato bread",
    category: "Breakfast",
    country: "Northern Ireland",
    type: "Meat",
    description: "Northern Irish version of full breakfast including soda bread and potato bread"
  },
  {
    id: "21",
    dish: "Champ",
    region: "Northern Ireland (National)",
    ingredients: "Potatoes, spring onions, milk, butter, salt",
    category: "Main Course",
    country: "Northern Ireland",
    type: "Vegetarian",
    description: "Traditional mashed potato dish with spring onions, served with a well of butter"
  }
];

interface TraditionalFoodsMatchingProps {
  userId: string;
}

export default function TraditionalFoodsMatching({ userId }: TraditionalFoodsMatchingProps) {
  const [dishes, setDishes] = useState<FoodData[]>([]);
  const [regions, setRegions] = useState<FoodData[]>([]);
  const [ingredients, setIngredients] = useState<FoodData[]>([]);
  const [selectedDish, setSelectedDish] = useState<FoodData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<FoodData | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<FoodData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const countries = ['all', 'England', 'Scotland', 'Wales', 'Northern Ireland', 'UK Wide'];
  const categories = ['all', 'Main Course', 'Dessert', 'Snack', 'Breakfast', 'Bread', 'Soup', 'Pudding', 'Pastry'];

  const getFilteredData = () => {
    let filtered = traditionalFoodsData;
    
    if (filterCountry !== 'all') {
      filtered = filtered.filter(item => item.country === filterCountry);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    return filtered;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const filteredData = getFilteredData();
    setDishes(shuffleArray(filteredData));
    setRegions(shuffleArray(filteredData));
    setIngredients(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedDish(null);
    setSelectedRegion(null);
    setSelectedIngredient(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterCountry, filterCategory]);

  const handleDishClick = (dish: FoodData) => {
    if (matchedItems.has(dish.id)) return;
    setSelectedDish(dish);
    setIncorrectAttempts(new Set());
  };

  const handleRegionClick = (region: FoodData) => {
    if (matchedItems.has(region.id)) return;
    setSelectedRegion(region);
    setIncorrectAttempts(new Set());
  };

  const handleIngredientClick = (ingredient: FoodData) => {
    if (matchedItems.has(ingredient.id)) return;
    setSelectedIngredient(ingredient);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedDish && selectedRegion && selectedIngredient) {
      setAttempts(prev => prev + 1);
      
      if (selectedDish.id === selectedRegion.id && 
          selectedRegion.id === selectedIngredient.id) {
        // Correct match!
        celebrateWithTheme('general');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedDish.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('general'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedDish.id, selectedRegion.id, selectedIngredient.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedDish(null);
        setSelectedRegion(null);
        setSelectedIngredient(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedDish, selectedRegion, selectedIngredient, matchedItems.size]);

  const getButtonStyle = (item: FoodData, isSelected: boolean) => {
    const baseClasses = "w-full text-left p-3 rounded-lg border transition-all duration-300 hover:shadow-md";
    const isMatched = matchedItems.has(item.id);
    const isIncorrect = incorrectAttempts.has(item.id);
    
    if (isMatched) {
      return `${baseClasses} bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 cursor-default shadow-sm`;
    }
    
    if (isIncorrect) {
      return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 animate-pulse cursor-pointer`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer`;
  };

  const getCountryColor = (country: string) => {
    const colors = {
      England: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Scotland: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Wales: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Northern Ireland': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'UK Wide': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
    };
    return colors[country as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Main Course': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Dessert': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'Snack': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Breakfast': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Bread': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Soup': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      'Pudding': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      'Pastry': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-pink-600 rounded-lg flex items-center justify-center">
            <Utensils className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Traditional Foods Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match traditional dishes with their regions and ingredients</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">{score}/{filteredData.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Country:</span>
          {countries.map(country => (
            <Badge
              key={country}
              variant={filterCountry === country ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterCountry === country 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setFilterCountry(country)}
            >
              {country === 'all' ? 'All Countries' : country}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
          {categories.map(category => (
            <Badge
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterCategory === category 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2">
        <Button
          onClick={initializeGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
        <Button
          onClick={initializeGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          onClick={() => setShowReference(!showReference)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChefHat className="h-4 w-4" />
          {showReference ? 'Hide' : 'Show'} Food Reference
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">🍽️ Culinary Mastery Achieved!</h3>
            <p className="text-emerald-700 dark:text-emerald-300">
              You've successfully matched all {filteredData.length} traditional dishes with their regions and ingredients!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Food Reference Card */}
      {showReference && (
        <Card className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-pink-900 dark:text-pink-100">
              <div className="w-4 h-4 bg-pink-600 rounded flex items-center justify-center">
                <ChefHat className="h-3 w-3 text-white" />
              </div>
              Traditional British Foods Reference Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {filteredData.map((food) => (
                <div key={`ref-${food.id}`} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="font-semibold text-pink-800 dark:text-pink-200">{food.dish}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1 text-xs leading-relaxed">{food.description}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getCountryColor(food.country)}`}>
                      {food.country}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {food.region}
                    </Badge>
                    <Badge className={`text-xs ${getCategoryColor(food.category)}`}>
                      {food.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dishes Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-pink-600 rounded flex items-center justify-center">
                <Utensils className="h-3 w-3 text-white" />
              </div>
              Traditional Dishes ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dishes.map((dish) => (
              <div key={`dish-${dish.id}`} className="space-y-1">
                <button
                  onClick={() => handleDishClick(dish)}
                  className={getButtonStyle(dish, selectedDish?.id === dish.id)}
                  disabled={matchedItems.has(dish.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{dish.dish}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getCountryColor(dish.country)}`}>
                      {dish.country}
                    </Badge>
                    <Badge className={`text-xs ${getCategoryColor(dish.category)}`}>
                      {dish.category}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regions Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Utensils className="h-3 w-3 text-white" />
              </div>
              Regions ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {regions.map((region) => (
              <button
                key={`region-${region.id}`}
                onClick={() => handleRegionClick(region)}
                className={getButtonStyle(region, selectedRegion?.id === region.id)}
                disabled={matchedItems.has(region.id)}
              >
                <div className="font-bold text-center text-sm">
                  {region.region}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getCountryColor(region.country)}`}>
                  {region.country}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Ingredients Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <ChefHat className="h-3 w-3 text-white" />
              </div>
              Ingredients ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ingredients.map((ingredient) => (
              <button
                key={`ingredient-${ingredient.id}`}
                onClick={() => handleIngredientClick(ingredient)}
                className={getButtonStyle(ingredient, selectedIngredient?.id === ingredient.id)}
                disabled={matchedItems.has(ingredient.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {ingredient.ingredients}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-pink-900 dark:text-pink-200 mb-2">How to Play:</h4>
          <ul className="text-sm text-pink-800 dark:text-pink-300 space-y-1">
            <li>• Select one dish, one region, and one set of ingredients that all belong together</li>
            <li>• All three selections must match the same traditional food</li>
            <li>• Correct matches turn green and celebrate with confetti</li>
            <li>• Use country and category filters to focus on specific regions or food types</li>
            <li>• Click "Show Food Reference" for comprehensive information about each dish</li>
            <li>• Learn about British culinary heritage from fish and chips to haggis!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}