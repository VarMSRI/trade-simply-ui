
import { User } from '@/types/auth';
import { toast } from "sonner";
import { API_BASE_URL, DEFAULT_HEADERS } from '@/constants/api';

export const fetchUserProfile = async (token: string | null): Promise<User | null> => {
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
};

export const updateUserProfile = async (token: string | null, name: string, email: string): Promise<User | null> => {
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
    toast.success('Profile updated successfully');
    return updatedProfile;
  } catch (error) {
    console.error('Profile update error:', error);
    toast.error('Failed to update profile');
    return null;
  }
};

export const deleteUserProfile = async (token: string | null): Promise<boolean> => {
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
    
    toast.success('Profile deleted successfully');
    return true;
  } catch (error) {
    console.error('Profile deletion error:', error);
    toast.error('Failed to delete profile');
    return false;
  }
};
