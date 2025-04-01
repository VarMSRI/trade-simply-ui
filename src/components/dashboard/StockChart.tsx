
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/ThemeProvider';

interface StockChartProps {
  symbol?: string;
  name?: string;
  data?: any[];
}

const StockChart: React.FC<StockChartProps> = ({ 
  symbol = "RELIANCE", 
  name = "Reliance Industries Ltd.", 
  data 
}) => {
  const [currentTimeframe, setCurrentTimeframe] = useState<string>('1M');
  const timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];
  const { theme } = useTheme();

  // Format the symbol for Google Finance
  const getFormattedSymbol = () => {
    let formattedSymbol = symbol || "RELIANCE";
    // For Indian stocks (NSE)
    if (!formattedSymbol.includes(':')) {
      formattedSymbol = `NSE:${formattedSymbol}`;
    }
    return formattedSymbol.replace(/[^a-zA-Z0-9:\.]/g, '');
  };

  // Map timeframes to Google Finance periods
  const getChartPeriod = () => {
    switch (currentTimeframe) {
      case '1D': return '1d';
      case '5D': return '5d';
      case '1M': return '1m';
      case '3M': return '3m';
      case '6M': return '6m';
      case 'YTD': return 'ytd';
      case '1Y': return '1y';
      case '5Y': return '5y';
      case 'All': return 'max';
      default: return '1m';
    }
  };

  // Generate Google Finance chart URL
  const getChartUrl = () => {
    const formattedSymbol = getFormattedSymbol();
    const period = getChartPeriod();
    const darkMode = theme === 'dark' ? '&tz=dark' : '';
    
    return `https://www.gstatic.com/finance/chart/finance_${theme === 'dark' ? 'dark' : 'light'}_${period}.svg?cid=${formattedSymbol}${darkMode}`;
  };

  // Generate Google Finance URL for iframe backup
  const getGoogleFinanceUrl = () => {
    const formattedSymbol = getFormattedSymbol();
    return `https://www.google.com/finance/quote/${formattedSymbol}?embed=true`;
  };

  // Handle timeframe changes
  const handleTimeframeChange = (timeframe: string) => {
    setCurrentTimeframe(timeframe);
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{symbol} | {name}</CardTitle>
        </div>
        <div className="flex gap-1 flex-wrap">
          {timeframes.map((timeframe) => (
            <Button 
              key={timeframe} 
              variant={timeframe === currentTimeframe ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTimeframeChange(timeframe)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <div className="h-full w-full overflow-hidden relative bg-card">
          {/* Primary Google Finance Chart Embed */}
          <iframe
            src={getGoogleFinanceUrl()}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            className="absolute inset-0"
            title={`${symbol} stock chart`}
            loading="lazy"
          />
        </div>
        
        {/* Fallback display in case iframe doesn't load properly */}
        <div className="hidden">
          <img 
            src={getChartUrl()} 
            alt={`${symbol} stock chart`} 
            className="w-full h-full object-contain" 
          />
          <p className="text-center text-sm text-muted-foreground mt-2">
            Data from Google Finance
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
