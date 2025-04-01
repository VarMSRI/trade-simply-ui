
import { useEffect } from 'react';
import { Watchlist } from '@/types/watchlist';
import subscriptionService from '@/services/subscriptionService';
import { toast } from 'sonner';

export const useWatchlistSubscriptions = () => {
  // Function to sync watchlist instruments with the subscription service
  const syncWatchlistSubscriptions = async (watchlists: Watchlist[]) => {
    try {
      // Step 1: Get all currently subscribed tokens
      const subscriptions = await subscriptionService.getSubscriptions();
      const subscribedTokens = new Set(subscriptions.instrument_tokens);
      
      // Step 2: Extract all unique instrument tokens from watchlists
      const watchlistTokens = new Set<number>();
      watchlists.forEach(watchlist => {
        watchlist.items.forEach(item => {
          watchlistTokens.add(item.instrument_key);
        });
      });
      
      // Step 3: Find tokens that need to be subscribed to
      const tokensToSubscribe: number[] = [];
      watchlistTokens.forEach(token => {
        if (!subscribedTokens.has(token)) {
          tokensToSubscribe.push(token);
        }
      });
      
      // Step 4: If there are new tokens, update subscriptions
      if (tokensToSubscribe.length > 0) {
        console.log(`Subscribing to ${tokensToSubscribe.length} new instruments:`, tokensToSubscribe);
        
        // Get all tokens (existing + new)
        const allTokens = [...Array.from(subscribedTokens), ...tokensToSubscribe];
        
        // Update subscriptions
        await subscriptionService.updateSubscriptions(allTokens);
        console.log('Successfully updated market data subscriptions');
      } else {
        console.log('All watchlist instruments are already subscribed');
      }
    } catch (error) {
      console.error('Error syncing watchlist subscriptions:', error);
      toast.error('Failed to subscribe to market data for watchlist instruments');
    }
  };

  return {
    syncWatchlistSubscriptions,
  };
};
