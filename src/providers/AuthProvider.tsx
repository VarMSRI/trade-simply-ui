
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { User } from '@/types/auth';

// Base URL and headers for API calls
const API_BASE_URL = 'https://app.intuitifi.com';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Origin': 'http://localhost:5173',
  'Referer': 'http://localhost:5173/'
};

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
          if (!userProfile.name || userProfile.email === 'default@example.com') {
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send OTP');
        return false;
      }
      
      toast.success('OTP sent successfully');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to send OTP');
      return false;
    }
  };

  const verifyOtp = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Invalid OTP');
        return false;
      }
      
      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      // Fetch user profile after successful verification
      const userProfile = await fetchUserProfile(data.token);
      setUser(userProfile);
      
      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Failed to verify OTP');
      return false;
    }
  };

  const fetchUserProfile = async (authToken?: string): Promise<User> => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) {
      throw new Error('No authentication token found');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          'Authorization': `Bearer ${tokenToUse}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userProfile = await response.json();
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (name: string, email: string): Promise<User | null> => {
    if (!token) {
      toast.error('You must be logged in to update your profile');
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          ...DEFAULT_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
        return null;
      }
      
      const updatedProfile = await response.json();
      setUser(updatedProfile);
      toast.success('Profile updated successfully');
      return updatedProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      return null;
    }
  };

  const deleteUserProfile = async (): Promise<boolean> => {
    if (!token) {
      toast.error('You must be logged in to delete your profile');
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          ...DEFAULT_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete profile');
        return false;
      }
      
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.success('Profile deleted successfully');
      return true;
    } catch (error) {
      console.error('Profile deletion error:', error);
      toast.error('Failed to delete profile');
      return false;
    }
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
      isAuthenticated: !!token,
      login,
      verifyOtp,
      fetchUserProfile: () => fetchUserProfile(),
      updateUserProfile,
      deleteUserProfile,
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
