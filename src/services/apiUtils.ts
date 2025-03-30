
const BASE_URL = 'https://app.intuitifi.com';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
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

export { BASE_URL };
