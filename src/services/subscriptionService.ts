
import { BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';
import { toast } from 'sonner';

// Interface for subscription response
interface SubscriptionResponse {
  user_id: string;
  instrument_tokens: number[];
}

interface SubscriptionRequest {
  instrument_tokens: number[];
}

const subscriptionService = {
  // Get current subscriptions
  getSubscriptions: async (): Promise<SubscriptionResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/api/subscriptions`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return { user_id: '', instrument_tokens: [] };
    }
  },

  // Update subscriptions with new instrument tokens
  updateSubscriptions: async (instrumentTokens: number[]): Promise<string> => {
    try {
      const response = await fetch(`${BASE_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instrument_tokens: instrumentTokens }),
      });
      
      // Check if the response is OK but don't try to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update subscriptions');
      }
      
      // Return success message
      return 'Subscription updated successfully';
    } catch (error) {
      console.error('Error updating subscriptions:', error);
      throw error;
    }
  },
};

export default subscriptionService;
