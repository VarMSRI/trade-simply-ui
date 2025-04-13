
import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchInstruments } from '@/hooks/useSearchInstruments';
import { useFundamentals } from '@/hooks/useFundamentals';
import SearchBar from '@/components/trading/SearchBar';
import SearchResults from '@/components/trading/SearchResults';
import StockDetail from '@/components/trading/StockDetail';
import FundamentalsCard from '@/components/trading/FundamentalsCard';
import instrumentService from '@/services/instrumentService';
import { toast } from 'sonner';

interface AssetInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  instrumentToken: number;
}

const Trading: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);
  const [showFundamentals, setShowFundamentals] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { 
    results: searchResults, 
    isLoading: isSearching, 
    error: searchError 
  } = useSearchInstruments(debouncedSearch);
  
  const {
    fundamentals,
    isLoading: isLoadingFundamentals,
    error: fundamentalsError,
    fetchFundamentals,
    clearFundamentals
  } = useFundamentals();

  // Handle URL parameter for symbol
  useEffect(() => {
    const symbolFromUrl = searchParams.get('symbol');
    if (symbolFromUrl && !selectedAsset) {
      loadInstrumentFromSymbol(symbolFromUrl);
    }
  }, [searchParams]);

  const loadInstrumentFromSymbol = async (symbol: string) => {
    try {
      const results = await instrumentService.searchInstruments(symbol);
      if (results.length > 0) {
        const instrument = results[0];
        handleAssetSelect({
          token: instrument.instrument_token,
          symbol: instrument.tradingsymbol,
          name: instrument.name || instrument.tradingsymbol,
          lastPrice: instrument.last_price || 500
        });
      }
    } catch (error) {
      console.error('Failed to load instrument from URL:', error);
    }
  };

  const handleAssetSelect = (result: any) => {
    // Clear fundamentals when selecting a new asset
    clearFundamentals();
    setShowFundamentals(false);
    
    // In a real app, you would fetch additional data for the selected asset
    // For now, creating a sample asset with data from the search result
    setSelectedAsset({
      symbol: result.symbol,
      name: result.name,
      price: result.lastPrice || 500.25, // Default price if not available
      change: result.change || 5.75,
      changePercent: result.changePercent || 1.20,
      volume: result.volume || 325460,
      marketCap: result.marketCap || 18600000000000,
      pe: result.pe || 24.6,
      dividend: result.dividendYield || 0.78,
      instrumentToken: result.token
    });
  };
  
  const handleFundamentalsRequest = async (instrumentToken: number) => {
    try {
      setShowFundamentals(true);
      await fetchFundamentals(instrumentToken);
    } catch (error) {
      toast.error('Failed to fetch fundamentals');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Trading</h1>
        <p className="text-muted-foreground mt-1">
          Research stocks and place trades on NSE/BSE
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Bar */}
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          searchError={searchError}
          onRequestFundamentals={selectedAsset ? handleFundamentalsRequest : undefined}
          selectedInstrumentToken={selectedAsset?.instrumentToken}
          isFundamentalsVisible={showFundamentals}
        />
        
        {/* Search Results */}
        {searchResults && searchResults.length > 0 && !selectedAsset && (
          <SearchResults 
            searchResults={searchResults} 
            onSelect={handleAssetSelect} 
          />
        )}
        
        {/* Stock Detail */}
        {selectedAsset && <StockDetail selectedAsset={selectedAsset} />}
        
        {/* Fundamentals Card */}
        {showFundamentals && (
          <FundamentalsCard 
            fundamentals={fundamentals}
            isLoading={isLoadingFundamentals}
            error={fundamentalsError}
          />
        )}
      </div>
    </>
  );
};

export default Trading;
