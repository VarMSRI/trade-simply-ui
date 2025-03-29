
import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { requestOtp, verifyOtp } from '@/services/authService';
import { fetchUserProfile, updateUserProfile, deleteUserProfile } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
  fetchUserProfile: () => Promise<User | null>;
  updateUserProfile: (name: string, email: string) => Promise<User | null>;
  deleteUserProfile: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    user, setUser, 
    token, setToken, 
    isLoading, setIsLoading, 
    isAuthenticated 
  } = useAuthState();
  const navigate = useNavigate();

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const userProfile = await fetchUserProfile(storedToken);
          setUser(userProfile);
          
          // Check if profile is incomplete
          if (userProfile && (!userProfile.name || userProfile.email === 'default@example.com')) {
            navigate('/complete-profile');
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (phoneNumber: string): Promise<boolean> => {
    return await requestOtp(phoneNumber);
  };

  const handleVerifyOtp = async (phoneNumber: string, otp: string): Promise<boolean> => {
    const result = await verifyOtp(phoneNumber, otp);
    
    if (result.success && result.token) {
      setToken(result.token);
      localStorage.setItem('token', result.token);
      
      // Fetch user profile after successful verification
      try {
        const userProfile = await fetchUserProfile(result.token);
        setUser(userProfile);
        return true;
      } catch (error) {
        console.error('Failed to fetch profile after OTP verification:', error);
        return false;
      }
    }
    
    return false;
  };

  const handleFetchUserProfile = async (): Promise<User | null> => {
    try {
      const userProfile = await fetchUserProfile(token);
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  const handleUpdateUserProfile = async (name: string, email: string): Promise<User | null> => {
    const updatedProfile = await updateUserProfile(token, name, email);
    if (updatedProfile) {
      setUser(updatedProfile);
    }
    return updatedProfile;
  };

  const handleDeleteUserProfile = async (): Promise<boolean> => {
    const success = await deleteUserProfile(token);
    if (success) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
    return success;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      verifyOtp: handleVerifyOtp,
      fetchUserProfile: handleFetchUserProfile,
      updateUserProfile: handleUpdateUserProfile,
      deleteUserProfile: handleDeleteUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
