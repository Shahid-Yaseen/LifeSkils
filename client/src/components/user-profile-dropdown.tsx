import { useState } from 'react';
import { User, CreditCard, Settings, LogOut, Crown } from 'lucide-react';
// Updated interface for responsive design
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserProfileDropdownProps {
  user: {
    id: string;
    name: string;
    overallProgress?: number;
    subscriptionType?: string;
    subscriptionStatus?: string;
  };
}

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  const getSubscriptionDisplay = () => {
    if (!user.subscriptionType || user.subscriptionStatus !== 'active') {
      return (
        <Badge variant="outline" className="text-xs">
          Free Access
        </Badge>
      );
    }

    const subscriptionLabels = {
      basic: 'Learning App (3mo)',
      group: 'Group Sessions',
      guidance: 'Application Guide'
    };

    return (
      <Badge variant="default" className="text-xs bg-uk-blue">
        <Crown className="w-3 h-3 mr-1" />
        {subscriptionLabels[user.subscriptionType as keyof typeof subscriptionLabels] || 'Premium'}
      </Badge>
    );
  };

  const handlePaymentClick = () => {
    setLocation('/payment');
  };

  const handleProfileClick = () => {
    // Navigate to user profile/settings page
    setLocation('/profile');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login even if logout API fails
      setLocation('/login');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-8 h-8 bg-uk-blue rounded-full flex items-center justify-center p-0 hover:bg-uk-blue/90"
        >
          <User className="text-white text-sm" size={16} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 sm:w-64">
        <div className="p-3 border-b">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-uk-blue rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm truncate">{user.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getSubscriptionDisplay()}
              </div>
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{user.overallProgress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-uk-blue h-1.5 sm:h-2 rounded-full transition-all duration-300" 
                style={{ width: `${user.overallProgress || 0}%` }}
              />
            </div>
          </div>
        </div>

        <DropdownMenuItem onClick={handlePaymentClick} className="p-2 sm:p-3">
          <CreditCard className="w-4 h-4 mr-2 sm:mr-3" />
          <div className="flex-1">
            <div className="font-medium text-sm">Payment & Plans</div>
            <div className="text-xs text-gray-500">Upgrade your learning experience</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleProfileClick} className="p-2 sm:p-3">
          <Settings className="w-4 h-4 mr-2 sm:mr-3" />
          <div className="flex-1">
            <div className="font-medium text-sm">Profile Settings</div>
            <div className="text-xs text-gray-500">Manage your account</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="p-2 sm:p-3 text-red-600">
          <LogOut className="w-4 h-4 mr-2 sm:mr-3" />
          <div className="font-medium text-sm">Sign Out</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}