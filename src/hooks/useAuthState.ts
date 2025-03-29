
import { useState } from 'react';
import { User } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return {
    user,
    setUser,
    token,
    setToken,
    isLoading,
    setIsLoading,
    isAuthenticated: !!token
  };
};
