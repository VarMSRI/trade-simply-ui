
import { Instrument, Watchlist } from '@/types/watchlist';

// State type definition
export interface WatchlistState {
  watchlists: Watchlist[];
  isLoading: boolean;
  error: Error | null;
  isAddingSymbol: boolean;
  isCreatingWatchlist: boolean;
  isEditingWatchlist: boolean;
  newWatchlistName: string;
  searchResults: Instrument[];
  isSearching: boolean;
  editingWatchlist: Watchlist | null;
  editingWatchlistName: string;
}

// Initial state
export const initialWatchlistState: WatchlistState = {
  watchlists: [],
  isLoading: false,
  error: null,
  isAddingSymbol: false,
  isCreatingWatchlist: false,
  isEditingWatchlist: false,
  newWatchlistName: '',
  searchResults: [],
  isSearching: false,
  editingWatchlist: null,
  editingWatchlistName: ''
};

// Action types
export type WatchlistAction =
  | { type: 'SET_WATCHLISTS'; payload: Watchlist[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_ADDING_SYMBOL'; payload: boolean }
  | { type: 'SET_CREATING_WATCHLIST'; payload: boolean }
  | { type: 'SET_EDITING_WATCHLIST'; payload: boolean }
  | { type: 'SET_NEW_WATCHLIST_NAME'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: Instrument[] }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'START_EDITING_WATCHLIST'; payload: Watchlist }
  | { type: 'SET_EDITING_WATCHLIST_NAME'; payload: string }
  | { type: 'RESET_SEARCH' }
  | { type: 'RESET_WATCHLIST_FORM' };

// Reducer function
export const watchlistReducer = (
  state: WatchlistState,
  action: WatchlistAction
): WatchlistState => {
  switch (action.type) {
    case 'SET_WATCHLISTS':
      return { ...state, watchlists: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ADDING_SYMBOL':
      return { ...state, isAddingSymbol: action.payload };
    case 'SET_CREATING_WATCHLIST':
      return { ...state, isCreatingWatchlist: action.payload };
    case 'SET_EDITING_WATCHLIST':
      return { ...state, isEditingWatchlist: action.payload };
    case 'SET_NEW_WATCHLIST_NAME':
      return { ...state, newWatchlistName: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_IS_SEARCHING':
      return { ...state, isSearching: action.payload };
    case 'START_EDITING_WATCHLIST':
      return { 
        ...state, 
        editingWatchlist: action.payload, 
        editingWatchlistName: action.payload.name,
        isEditingWatchlist: true
      };
    case 'SET_EDITING_WATCHLIST_NAME':
      return { ...state, editingWatchlistName: action.payload };
    case 'RESET_SEARCH':
      return { 
        ...state, 
        searchResults: [], 
        isSearching: false
      };
    case 'RESET_WATCHLIST_FORM':
      return { 
        ...state, 
        newWatchlistName: '', 
        isCreatingWatchlist: false 
      };
    default:
      return state;
  }
};
