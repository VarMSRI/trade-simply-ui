
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { getJson } from 'serpapi';

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

  // Fetch stock data from SerpAPI
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const formattedSymbol = getFormattedSymbol();
        const period = getChartPeriod();
        
        const params = {
          engine: "google_finance",
          q: formattedSymbol,
          period: period,
          api_key: API_KEY
        };
        
        const data = await getJson(params);
        
        // Process data for the chart
        if (data.finance_chart_data && data.finance_chart_data.length > 0) {
          const processedData = data.finance_chart_data.map((point: any) => ({
            date: new Date(point[0]).toLocaleDateString(),
            value: point[1]
          }));
          
          setChartData(processedData);
        } else {
          throw new Error('No chart data available');
        }
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
