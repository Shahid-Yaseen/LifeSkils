import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DebugAuth: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const token = localStorage.getItem('accessToken');

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Auth State</h3>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user ? `${user.username} (${user.role})` : 'None'}</div>
      <div>Token: {token ? 'Present' : 'Missing'}</div>
      <div>Token Preview: {token ? token.substring(0, 20) + '...' : 'None'}</div>
    </div>
  );
};

export default DebugAuth;
