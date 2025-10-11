import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Globe, Filter } from "lucide-react";
import { celebrateWithTheme } from "@/lib/confetti";

interface MembershipData {
  id: string;
  organization: string;
  role: string;
  details: string;
  category: 'International' | 'European' | 'Commonwealth' | 'Security' | 'Economic' | 'Cultural' | 'Environmental';
  joinedYear: string;
  status: 'Current' | 'Former' | 'Founding';
}

const ukMembershipsData: MembershipData[] = [
  // United Nations System
  {
    id: "1",
    organization: "United Nations (UN)",
    role: "Permanent Security Council Member",
    details: "One of five permanent members with veto power, founding member since 1945",
    category: "International",
    joinedYear: "1945",
    status: "Founding"
  },
  {
    id: "2",
    organization: "UNESCO",
    role: "Member State",
    details: "UN Educational, Scientific and Cultural Organization member since 1946",
    category: "Cultural",
    joinedYear: "1946",
    status: "Current"
  },
  {
    id: "3",
    organization: "World Health Organization (WHO)",
    role: "Member State",
    details: "UN specialized agency for international public health, member since 1948",
    category: "International",
    joinedYear: "1948",
    status: "Current"
  },

  // NATO and Security
  {
    id: "4",
    organization: "NATO",
    role: "Founding Member",
    details: "North Atlantic Treaty Organization founding member, Article 5 collective defense",
    category: "Security",
    joinedYear: "1949",
    status: "Founding"
  },
  {
    id: "5",
    organization: "Five Eyes Alliance",
    role: "Founding Member",
    details: "Intelligence sharing agreement with US, Canada, Australia, New Zealand",
    category: "Security",
    joinedYear: "1946",
    status: "Founding"
  },

  // Commonwealth
  {
    id: "6",
    organization: "Commonwealth of Nations",
    role: "Head of Commonwealth",
    details: "54 member states, British monarch as Head, evolved from British Empire",
    category: "Commonwealth",
    joinedYear: "1931",
    status: "Founding"
  },
  {
    id: "7",
    organization: "Commonwealth Games Federation",
    role: "Founding Member",
    details: "Multi-sport event held every four years, originally British Empire Games",
    category: "Commonwealth",
    joinedYear: "1930",
    status: "Founding"
  },

  // European Organizations (Current and Former)
  {
    id: "8",
    organization: "European Union (EU)",
    role: "Former Member",
    details: "Member 1973-2020, left following Brexit referendum and Article 50 process",
    category: "European",
    joinedYear: "1973",
    status: "Former"
  },
  {
    id: "9",
    organization: "Council of Europe",
    role: "Founding Member",
    details: "Human rights organization, separate from EU, member since 1949",
    category: "European",
    joinedYear: "1949",
    status: "Founding"
  },
  {
    id: "10",
    organization: "European Court of Human Rights",
    role: "Signatory State",
    details: "Subject to ECHR jurisdiction through Council of Europe membership",
    category: "European",
    joinedYear: "1953",
    status: "Current"
  },

  // Economic Organizations
  {
    id: "11",
    organization: "G7 (Group of Seven)",
    role: "Founding Member",
    details: "Major advanced economies forum, originally G6 then G7 with Canada",
    category: "Economic",
    joinedYear: "1975",
    status: "Founding"
  },
  {
    id: "12",
    organization: "G20",
    role: "Member",
    details: "Group of twenty major economies, represents 80% of global GDP",
    category: "Economic",
    joinedYear: "1999",
    status: "Current"
  },
  {
    id: "13",
    organization: "World Trade Organization (WTO)",
    role: "Founding Member",
    details: "Global trade rules organization, founding member since 1995",
    category: "Economic",
    joinedYear: "1995",
    status: "Founding"
  },
  {
    id: "14",
    organization: "International Monetary Fund (IMF)",
    role: "Founding Member",
    details: "International financial institution, fourth largest quota holder",
    category: "Economic",
    joinedYear: "1945",
    status: "Founding"
  },
  {
    id: "15",
    organization: "World Bank Group",
    role: "Founding Member",
    details: "International financial institution providing loans to developing countries",
    category: "Economic",
    joinedYear: "1945",
    status: "Founding"
  },

  // Environmental and Climate
  {
    id: "16",
    organization: "UN Framework Convention on Climate Change",
    role: "Signatory State",
    details: "International environmental treaty addressing climate change since 1992",
    category: "Environmental",
    joinedYear: "1992",
    status: "Current"
  },
  {
    id: "17",
    organization: "Paris Agreement",
    role: "Signatory State",
    details: "Climate accord within UNFCCC framework, committed to net zero by 2050",
    category: "Environmental",
    joinedYear: "2016",
    status: "Current"
  },

  // Other International Organizations
  {
    id: "18",
    organization: "International Olympic Committee",
    role: "National Olympic Committee",
    details: "British Olympic Association represents UK athletes in Olympic Games",
    category: "Cultural",
    joinedYear: "1905",
    status: "Current"
  },
  {
    id: "19",
    organization: "FIFA",
    role: "Four Separate Associations",
    details: "England, Scotland, Wales, Northern Ireland each have separate FIFA membership",
    category: "Cultural",
    joinedYear: "1905",
    status: "Current"
  },
  {
    id: "20",
    organization: "Organisation for Economic Co-operation and Development (OECD)",
    role: "Founding Member",
    details: "International economic organization promoting policies for prosperity",
    category: "Economic",
    joinedYear: "1961",
    status: "Founding"
  },
  {
    id: "21",
    organization: "Interpol",
    role: "Member Country",
    details: "International Criminal Police Organization for law enforcement cooperation",
    category: "Security",
    joinedYear: "1928",
    status: "Current"
  }
];

interface UKMembershipsMatchingProps {
  userId: string;
}

export default function UKMembershipsMatching({ userId }: UKMembershipsMatchingProps) {
  const [organizations, setOrganizations] = useState<MembershipData[]>([]);
  const [roles, setRoles] = useState<MembershipData[]>([]);
  const [details, setDetails] = useState<MembershipData[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<MembershipData | null>(null);
  const [selectedRole, setSelectedRole] = useState<MembershipData | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<MembershipData | null>(null);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [gameComplete, setGameComplete] = useState(false);

  const categories = ['all', 'International', 'European', 'Commonwealth', 'Security', 'Economic', 'Cultural', 'Environmental'];
  const statuses = ['all', 'Current', 'Former', 'Founding'];

  const getFilteredData = () => {
    let filtered = ukMembershipsData;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
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
    setOrganizations(shuffleArray(filteredData));
    setRoles(shuffleArray(filteredData));
    setDetails(shuffleArray(filteredData));
    setMatchedItems(new Set());
    setIncorrectAttempts(new Set());
    setSelectedOrganization(null);
    setSelectedRole(null);
    setSelectedDetail(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [filterCategory, filterStatus]);

  const handleOrganizationClick = (org: MembershipData) => {
    if (matchedItems.has(org.id)) return;
    setSelectedOrganization(org);
    setIncorrectAttempts(new Set());
  };

  const handleRoleClick = (role: MembershipData) => {
    if (matchedItems.has(role.id)) return;
    setSelectedRole(role);
    setIncorrectAttempts(new Set());
  };

  const handleDetailClick = (detail: MembershipData) => {
    if (matchedItems.has(detail.id)) return;
    setSelectedDetail(detail);
    setIncorrectAttempts(new Set());
  };

  useEffect(() => {
    if (selectedOrganization && selectedRole && selectedDetail) {
      setAttempts(prev => prev + 1);
      
      if (selectedOrganization.id === selectedRole.id && 
          selectedRole.id === selectedDetail.id) {
        // Correct match!
        celebrateWithTheme('international');
        setMatchedItems(prev => new Set(Array.from(prev).concat(selectedOrganization.id)));
        setScore(prev => prev + 1);
        
        // Check if game is complete
        const filteredData = getFilteredData();
        if (matchedItems.size + 1 >= filteredData.length) {
          setGameComplete(true);
          setTimeout(() => celebrateWithTheme('international'), 500);
        }
      } else {
        // Incorrect match
        const incorrectIds = new Set([selectedOrganization.id, selectedRole.id, selectedDetail.id]);
        setIncorrectAttempts(incorrectIds);
        
        setTimeout(() => {
          setIncorrectAttempts(new Set());
        }, 3000);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedOrganization(null);
        setSelectedRole(null);
        setSelectedDetail(null);
      }, incorrectAttempts.size > 0 ? 3000 : 1000);
    }
  }, [selectedOrganization, selectedRole, selectedDetail, matchedItems.size]);

  const getButtonStyle = (item: MembershipData, isSelected: boolean) => {
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
      return `${baseClasses} bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      International: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      European: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      Commonwealth: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Security: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Economic: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      Cultural: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      Environmental: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Current: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      Former: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Founding: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Game Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-600 rounded-lg flex items-center justify-center">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UK International Memberships Triple Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match organizations with UK's roles and membership details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">{score}/{filteredData.length}</div>
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
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Category:</span>
          {categories.map(category => (
            <Badge
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterCategory === category 
                  ? 'bg-slate-600 text-white' 
                  : 'hover:bg-slate-100'
              }`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Status:</span>
          {statuses.map(status => (
            <Badge
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filterStatus === status 
                  ? 'bg-emerald-600 text-white' 
                  : 'hover:bg-emerald-100'
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All Statuses' : status}
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
          className="flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
        <Button
          onClick={initializeGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {gameComplete && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">🎉 Congratulations!</h3>
            <p className="text-emerald-700 dark:text-emerald-400">
              You've successfully matched all {filteredData.length} UK international memberships!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Final Score: {score}/{filteredData.length} ({accuracy}% accuracy)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Matching Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-slate-600 rounded flex items-center justify-center">
                <Globe className="h-3 w-3 text-white" />
              </div>
              Organizations ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {organizations.map((org) => (
              <div key={`org-${org.id}`} className="space-y-1">
                <button
                  onClick={() => handleOrganizationClick(org)}
                  className={getButtonStyle(org, selectedOrganization?.id === org.id)}
                  disabled={matchedItems.has(org.id)}
                >
                  <div className="font-medium text-sm leading-relaxed">{org.organization}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getCategoryColor(org.category)}`}>
                      {org.category}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(org.status)}`}>
                      {org.status}
                    </Badge>
                    <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {org.joinedYear}
                    </Badge>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Roles Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
                <Globe className="h-3 w-3 text-white" />
              </div>
              UK's Role ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role) => (
              <button
                key={`role-${role.id}`}
                onClick={() => handleRoleClick(role)}
                className={getButtonStyle(role, selectedRole?.id === role.id)}
                disabled={matchedItems.has(role.id)}
              >
                <div className="font-bold text-center text-sm">
                  {role.role}
                </div>
                <Badge className={`text-xs w-full justify-center mt-1 ${getStatusColor(role.status)}`}>
                  {role.status} Member
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Details Column */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
                <Globe className="h-3 w-3 text-white" />
              </div>
              Membership Details ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {details.map((detail) => (
              <button
                key={`detail-${detail.id}`}
                onClick={() => handleDetailClick(detail)}
                className={getButtonStyle(detail, selectedDetail?.id === detail.id)}
                disabled={matchedItems.has(detail.id)}
              >
                <div className="font-medium text-sm leading-relaxed">
                  {detail.details}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-300 mb-2">How to Play:</h4>
          <ul className="text-sm text-slate-700 dark:text-slate-400 space-y-1">
            <li>• Select one organization, one UK role, and one detail that all belong together</li>
            <li>• All three selections must match the same international membership</li>
            <li>• Correct matches turn emerald and celebrate with confetti</li>
            <li>• Use category and status filters to focus on specific types of memberships</li>
            <li>• Learn about UK's role in global governance and international cooperation!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}