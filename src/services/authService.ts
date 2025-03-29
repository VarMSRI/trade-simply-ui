
import { toast } from "sonner";
import { API_BASE_URL, DEFAULT_HEADERS } from '@/constants/api';

export const requestOtp = async (phoneNumber: string): Promise<boolean> => {
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

export const verifyOtp = async (phoneNumber: string, otp: string): Promise<{ success: boolean; token?: string }> => {
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
      return { success: false };
    }
    
    const data = await response.json();
    return { 
      success: true,
      token: data.token
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    toast.error('Failed to verify OTP');
    return { success: false };
  }
};
