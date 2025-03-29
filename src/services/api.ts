
import { CreateWatchlistRequest, UpdateWatchlistRequest, AddInstrumentDTO, Watchlist } from "@/types/watchlist";

const BASE_URL = 'https://app.intuitifi.com';

const api = {
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
  },

  watchlist: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/api/watchlists/all`, {
        headers: api.getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Return empty array for 404 responses
          return [];
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch watchlists');
      }
      
      try {
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Clean up the response by extracting only the needed fields
        const cleanWatchlists = data.map((watchlist: any) => ({
          id: watchlist.id,
          user_id: watchlist.user_id,
          name: watchlist.name,
          created_at: watchlist.created_at,
          items: (watchlist.items || []).map((item: any) => ({
            id: item.id,
            watchlist_id: item.watchlist_id,
            instrument_key: item.instrument_key,
            created_at: item.created_at,
            trading_symbol: item.trading_symbol,
            instrument_name: item.instrument_name,
            lastPrice: item.lastPrice || null,
            change: item.change || null,
            changePercent: item.changePercent || null
          }))
        }));
        
        return cleanWatchlists;
      } catch (error) {
        console.error('Error parsing watchlist response:', error);
        throw new Error('Invalid JSON response from watchlist API');
      }
    },

    create: async (data: CreateWatchlistRequest) => {
      const response = await fetch(`${BASE_URL}/api/watchlists?name=${encodeURIComponent(data.name)}`, {
        method: 'POST',
        headers: {
          ...api.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create watchlist');
      }
      try {
        const text = await response.text();
        const responseData = JSON.parse(text);
        
        // Clean up the response similar to get method
        return {
          id: responseData.id,
          user_id: responseData.user_id,
          name: responseData.name,
          created_at: responseData.created_at,
          items: (responseData.items || []).map((item: any) => ({
            id: item.id,
            watchlist_id: item.watchlist_id,
            instrument_key: item.instrument_key,
            created_at: item.created_at,
            trading_symbol: item.trading_symbol,
            instrument_name: item.instrument_name,
            lastPrice: item.lastPrice || null,
            change: item.change || null,
            changePercent: item.changePercent || null
          }))
        };
      } catch (error) {
        console.error('Error parsing watchlist create response:', error);
        throw new Error('Invalid JSON response from watchlist API');
      }
    },

    get: async (id: number) => {
      const response = await fetch(`${BASE_URL}/api/watchlists/${id}`, {
        headers: api.getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch watchlist');
      }
      try {
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Clean up the response by extracting only the needed fields
        const cleanWatchlist = {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          created_at: data.created_at,
          items: (data.items || []).map((item: any) => ({
            id: item.id,
            watchlist_id: item.watchlist_id,
            instrument_key: item.instrument_key,
            created_at: item.created_at,
            trading_symbol: item.trading_symbol,
            instrument_name: item.instrument_name,
            lastPrice: item.lastPrice || null,
            change: item.change || null,
            changePercent: item.changePercent || null
          }))
        };
        
        return cleanWatchlist;
      } catch (error) {
        console.error('Error parsing watchlist response:', error);
        throw new Error('Invalid JSON response from watchlist API');
      }
    },

    update: async (id: number, data: UpdateWatchlistRequest) => {
      const response = await fetch(`${BASE_URL}/api/watchlists/${id}`, {
        method: 'PUT',
        headers: {
          ...api.getAuthHeaders(),
          'Content-Type': 'text/plain',
        },
        body: data.name,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update watchlist');
      }
      try {
        const text = await response.text();
        const responseData = JSON.parse(text);
        
        // Clean up the response similar to get method
        return {
          id: responseData.id,
          user_id: responseData.user_id,
          name: responseData.name,
          created_at: responseData.created_at,
          items: (responseData.items || []).map((item: any) => ({
            id: item.id,
            watchlist_id: item.watchlist_id,
            instrument_key: item.instrument_key,
            created_at: item.created_at,
            trading_symbol: item.trading_symbol,
            instrument_name: item.instrument_name,
            lastPrice: item.lastPrice || null,
            change: item.change || null,
            changePercent: item.changePercent || null
          }))
        };
      } catch (error) {
        console.error('Error parsing watchlist update response:', error);
        throw new Error('Invalid JSON response from watchlist API');
      }
    },

    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/api/watchlists/${id}`, {
        method: 'DELETE',
        headers: api.getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete watchlist');
      }
      // Return void for successful deletion (204 response)
      return;
    },

    removeItem: async (watchlistId: number, instrumentKey: number) => {
      const response = await fetch(`${BASE_URL}/api/watchlists/${watchlistId}/instruments/${instrumentKey}`, {
        method: 'DELETE',
        headers: api.getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to remove item from watchlist');
      }
      // Return void for successful deletion (204 response)
      return;
    },

    addInstrument: async (watchlistId: number, instrumentData: AddInstrumentDTO) => {
      const response = await fetch(`${BASE_URL}/api/watchlists/${watchlistId}/instruments`, {
        method: 'POST',
        headers: {
          ...api.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instrumentData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to add instrument to watchlist');
      }
      return response.json();
    },

    addInstrumentsBulk: async (watchlistId: number, instruments: AddInstrumentDTO[]) => {
      const response = await fetch(`${BASE_URL}/api/watchlists/${watchlistId}/instruments/bulk`, {
        method: 'POST',
        headers: {
          ...api.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instruments),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to add instruments to watchlist');
      }
      return response.json();
    },
  }
};

export default api;
