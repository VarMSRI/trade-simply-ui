
const BASE_URL = 'https://app.intuitifi.com';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json',
  };
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 404) {
      // Return empty array for 404 responses
      return [];
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Request failed');
  }
  
  try {
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Invalid JSON response from API');
  }
};

// Extract user ID from JWT token
export const getUserIdFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Extract the payload part of the JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    return payload.sub || payload.user_id || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

export { BASE_URL };
