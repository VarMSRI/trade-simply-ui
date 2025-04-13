import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import instrumentService from '@/services/instrumentService';
import { Instrument } from '@/types/watchlist';
import FundamentalsModal from '@/components/trading/FundamentalsModal';
import { useFundamentals } from '@/hooks/useFundamentals';

const AppHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Instrument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [showFundamentalsModal, setShowFundamentalsModal] = useState(false);
  
  const {
    fundamentals,
    isLoading: isLoadingFundamentals,
    error: fundamentalsError,
    fetchFundamentals,
    clearFundamentals
  } = useFundamentals();

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      setIsSearchOpen(true);
      
      try {
        const results = await instrumentService.searchInstruments(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching instruments:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchResults();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleInstrumentSelect = async (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setIsSearchOpen(false);
    setSearchQuery(''); // Clear search
    
    setShowFundamentalsModal(true);
    
    try {
      await fetchFundamentals(instrument.instrument_token);
    } catch (error) {
      console.error('Error fetching fundamentals:', error);
      // Error handling is managed in the modal
    }
  };
  
  const handleAddToWatchlist = (instrument: Instrument) => {
    setShowFundamentalsModal(false);
    setSelectedInstrument(null);
    clearFundamentals();
    
    navigate('/watchlist', { 
      state: { 
        addInstrument: {
          instrument_key: instrument.instrument_token,
          trading_symbol: instrument.tradingsymbol,
          instrument_name: instrument.name || instrument.tradingsymbol
        }
      }
    });
    
    toast.success(`${instrument.tradingsymbol} ready to be added to watchlist`);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowFundamentalsModal(false);
    setSelectedInstrument(null);
    clearFundamentals();
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-bold text-2xl text-primary">Intuitifi</div>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center relative w-80">
          <div className="w-full relative">
            <Popover 
              open={isSearchOpen && searchResults.length > 0} 
              onOpenChange={setIsSearchOpen}
            >
              <PopoverTrigger asChild>
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search for stocks..." 
                    className="w-full pl-8 bg-secondary"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80" align="end">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">Searching...</div>
                ) : (
                  <div className="max-h-[300px] overflow-auto">
                    {searchResults.map((instrument) => (
                      <div
                        key={instrument.instrument_token}
                        className="w-full p-2 hover:bg-accent border-b border-border last:border-none cursor-pointer"
                        onClick={() => handleInstrumentSelect(instrument)}
                      >
                        <div className="flex flex-col w-full">
                          <span className="font-medium">{instrument.tradingsymbol}</span>
                          <span className="text-sm text-muted-foreground">{instrument.name}</span>
                          {instrument.last_price && instrument.last_price > 0 && (
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              ₹{instrument.last_price}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.6rem] text-white">3</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.name || 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <FundamentalsModal 
        open={showFundamentalsModal}
        onOpenChange={handleCloseModal}
        selectedInstrument={selectedInstrument}
        fundamentals={fundamentals}
        isLoading={isLoadingFundamentals}
        error={fundamentalsError}
        onAddToWatchlist={handleAddToWatchlist}
      />
    </header>
  );
};

export default AppHeader;
