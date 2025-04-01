
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/ThemeProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface StockChartProps {
  symbol?: string;
  name?: string;
  data?: any[];
}

interface StockData {
  date: string;
  value: number;
}

const API_KEY = 'ef31875bdaa05b02f9170b3fe7c04ce58cb065297ed7db262798fe9eeaae518b';

const StockChart: React.FC<StockChartProps> = ({ 
  symbol = "RELIANCE", 
  name = "Reliance Industries Ltd.",
  data 
}) => {
  const [currentTimeframe, setCurrentTimeframe] = useState<string>('1M');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];
  const { theme } = useTheme();

  // Format the symbol for SerpAPI
  const getFormattedSymbol = () => {
    let formattedSymbol = symbol || "RELIANCE";
    
    // For Indian stocks (NSE)
    if (!formattedSymbol.includes(':')) {
      formattedSymbol = `${formattedSymbol}:NSE`;
    }
    
    return formattedSymbol.replace(/[^a-zA-Z0-9:\.]/g, '');
  };

  // Map timeframes to period parameters
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

  // Generate mock data for the chart
  const generateMockData = (period: string) => {
    const data: StockData[] = [];
    let points = 30;
    
    switch (period) {
      case '1d': points = 24; break;
      case '5d': points = 5; break;
      case '1m': points = 30; break;
      case '3m': points = 90; break;
      case '6m': points = 180; break;
      case '1y': points = 365; break;
      case '5y': points = 60; break; // Monthly points for 5 years
      case 'max': points = 120; break; // Quarterly points for max
      default: points = 30;
    }
    
    // Generate starting value between 100 and 1000
    let baseValue = Math.floor(Math.random() * 900) + 100;
    
    // Generate mock trend with some volatility
    for (let i = 0; i < points; i++) {
      // Add some randomness to create realistic-looking price movements
      const change = (Math.random() - 0.48) * (baseValue * 0.03); // Up to 3% change
      baseValue += change;
      
      // Ensure value doesn't go below 20
      if (baseValue < 20) baseValue = 20;
      
      const date = new Date();
      date.setDate(date.getDate() - (points - i));
      
      data.push({
        date: date.toLocaleDateString(),
        value: parseFloat(baseValue.toFixed(2))
      });
    }
    
    return data;
  };

  // Fetch stock data with CORS handling
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Due to CORS issues with direct SerpAPI calls, we'll use mock data
        // In a production environment, you would:
        // 1. Use a backend proxy to make the SerpAPI call
        // 2. Or use SerpAPI's official backend SDKs
        // 3. Or create your own server endpoint that calls SerpAPI and returns the data
        
        console.log(`Generating mock data for ${symbol} with period ${getChartPeriod()}`);
        const formattedSymbol = getFormattedSymbol();
        const period = getChartPeriod();
        
        // Use mock data for now
        const mockData = generateMockData(period);
        setChartData(mockData);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStockData();
  }, [symbol, currentTimeframe]);

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
              disabled={isLoading}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        {isLoading ? (
          <div className="h-full w-full flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading chart data...</span>
          </div>
        ) : error ? (
          <div className="h-full w-full flex flex-col justify-center items-center">
            <div className="text-muted-foreground mb-2">Failed to load chart data</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                tickFormatter={(value) => {
                  // Show fewer ticks for better readability
                  return value;
                }}
              />
              <YAxis 
                tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                  border: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
                  color: theme === 'dark' ? '#fff' : '#333'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3773f4" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col justify-center items-center">
            <div className="text-muted-foreground mb-2">No chart data available</div>
            <div className="text-sm text-muted-foreground">Try a different timeframe or symbol</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockChart;
