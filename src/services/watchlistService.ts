
import { BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';
import { CreateWatchlistRequest, UpdateWatchlistRequest, AddInstrumentDTO } from "@/types/watchlist";

const formatWatchlistData = (data: any) => {
  // Clean up response by extracting only needed fields
  return {
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
};

const watchlistService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/api/watchlists/all`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // If empty array was returned from 404 handler
    if (Array.isArray(data) && data.length === 0) {
      return [];
    }
    
    // Map and clean the watchlists data
    return data.map((watchlist: any) => formatWatchlistData(watchlist));
  },

  create: async (data: CreateWatchlistRequest) => {
    const response = await fetch(`${BASE_URL}/api/watchlists?name=${encodeURIComponent(data.name)}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    const responseData = await handleResponse(response);
    return formatWatchlistData(responseData);
  },

  get: async (id: number) => {
    const response = await fetch(`${BASE_URL}/api/watchlists/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return formatWatchlistData(data);
  },

  update: async (id: number, data: UpdateWatchlistRequest) => {
    const response = await fetch(`${BASE_URL}/api/watchlists/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'text/plain',
      },
      body: data.name,
    });
    const responseData = await handleResponse(response);
    return formatWatchlistData(responseData);
  },

  delete: async (id: number) => {
    const response = await fetch(`${BASE_URL}/api/watchlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
        ...getAuthHeaders(),
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
        ...getAuthHeaders(),
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
};

export default watchlistService;
