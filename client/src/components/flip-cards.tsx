import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";
import { celebrateCorrectMatch, celebrateGameComplete } from "@/lib/confetti";

interface FlipCard {
  id: string;
  front: string;
  back: string;
  category: string;
}

const flipCardsData: FlipCard[] = [
  {
    id: "1",
    front: "What is the capital of Scotland?",
    back: "Edinburgh",
    category: "Geography"
  },
  {
    id: "2", 
    front: "When did women get the right to vote in the UK?",
    back: "1918 (partial) and 1928 (full equality)",
    category: "History"
  },
  {
    id: "3",
    front: "What are the fundamental British values?",
    back: "Democracy, Rule of Law, Individual Liberty, Mutual Respect and Tolerance",
    category: "Values"
  },
  {
    id: "4",
    front: "Who is the head of state in the UK?",
    back: "The Monarch (currently King Charles III)",
    category: "Government"
  },
  {
    id: "5",
    front: "What is the Church of England also known as?",
    back: "The Anglican Church",
    category: "Religion"
  },
  {
    id: "6",
    front: "When is St. George's Day?",
    back: "April 23rd",
    category: "Culture"
  },
  {
    id: "7",
    front: "What does the Union Jack represent?",
    back: "The combination of England (St. George's Cross), Scotland (St. Andrew's Cross), and Northern Ireland (St. Patrick's Cross)",
    category: "Symbols"
  },
  {
    id: "8",
    front: "What is the highest court in the UK?",
    back: "The Supreme Court",
    category: "Government"
  }
];

interface FlipCardsProps {
  userId: string;
}

export default function FlipCards({ userId }: FlipCardsProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(flipCardsData.map(card => card.category)))];
  
  const filteredCards = selectedCategory === "All" 
    ? flipCardsData 
    : flipCardsData.filter(card => card.category === selectedCategory);

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleMarkComplete = (cardId: string) => {
    setCompletedCards(prev => {
      const newCompleted = new Set(Array.from(prev).concat(cardId));
      // Check if all filtered cards are complete
      if (newCompleted.size === filteredCards.length) {
        setTimeout(() => celebrateGameComplete(), 500);
      }
      return newCompleted;
    });
  };

  const resetProgress = () => {
    setFlippedCards(new Set());
    setCompletedCards(new Set());
  };

  const completedCardsArray = Array.from(completedCards);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Flip Cards</h2>
          <p className="text-gray-600 dark:text-gray-300">Test your knowledge with interactive flip cards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetProgress} className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <RotateCcw className="h-4 w-4" />
            Reset Progress
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 ${
              selectedCategory === category 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          const isCompleted = completedCards.has(card.id);
          
          return (
            <div key={card.id} className="relative h-48">
              <div 
                className={`flip-card w-full h-full cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => handleCardFlip(card.id)}
              >
                {/* Front of card */}
                <Card className={`absolute inset-0 backface-hidden shadow-lg !bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 ${
                  isCompleted ? 'ring-2 ring-green-500' : ''
                }`}>
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center text-center">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {card.front}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{card.category}</Badge>
                      {isCompleted && <Check className="h-5 w-5 text-green-500" />}
                    </div>
                  </CardContent>
                </Card>

                {/* Back of card */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 shadow-lg !bg-blue-50 dark:!bg-blue-900/20 !border-gray-200 dark:!border-gray-700">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center text-center">
                      <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
                        {card.back}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{card.category}</Badge>
                      {!isCompleted && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkComplete(card.id);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Got it!
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Progress: {completedCardsArray.length} / {filteredCards.length} cards completed
      </div>
    </div>
  );
}