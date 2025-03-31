
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// TradingView widget interface
declare global {
  interface Window {
    TradingView: {
      widget: new (config: any) => any;
    };
  }
}

interface StockChartProps {
  symbol?: string;
  name?: string;
  data?: any[];
}

const StockChart: React.FC<StockChartProps> = ({ 
  symbol = "AAPL", 
  name = "Apple Inc.", 
  data 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];

  useEffect(() => {
    // Load TradingView widget script if it hasn't been loaded yet
    if (!document.getElementById('tradingview-widget-script')) {
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => createWidget();
      document.head.appendChild(script);
    } else if (window.TradingView) {
      // If script is already loaded, create widget directly
      createWidget();
    }

    return () => {
      // Clean up widget when component unmounts
      if (widgetRef.current) {
        // TradingView doesn't provide a clean destroy method, so we just clear the container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    };
  }, [symbol]);

  const createWidget = () => {
    if (!containerRef.current || !window.TradingView) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';

    // For Indian stocks, we'll use NSE: or BSE: prefix
    const formattedSymbol = symbol?.includes(':') ? symbol : `NSE:${symbol}`;

    widgetRef.current = new window.TradingView.widget({
      width: '100%',
      height: 400,
      symbol: formattedSymbol,
      interval: 'D',
      timezone: 'Asia/Kolkata',
      theme: 'light',
      style: '1',
      locale: 'in',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: containerRef.current.id,
      hide_side_toolbar: false,
    });
  };

  // Handle timeframe changes
  const handleTimeframeChange = (timeframe: string) => {
    if (!widgetRef.current) return;
    
    // Map timeframes to TradingView intervals
    let interval = 'D';
    switch (timeframe) {
      case '1D':
        interval = '30';
        break;
      case '5D':
        interval = '60';
        break;
      case '1M':
        interval = 'D';
        break;
      case '3M':
        interval = 'W';
        break;
      case '6M':
      case 'YTD':
      case '1Y':
        interval = 'W';
        break;
      case '5Y':
      case 'All':
        interval = 'M';
        break;
      default:
        interval = 'D';
    }
    
    // Change widget interval by recreating it
    if (containerRef.current) {
      createWidget();
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{symbol} | {name}</CardTitle>
        </div>
        <div className="flex gap-1">
          {timeframes.map((timeframe) => (
            <Button 
              key={timeframe} 
              variant="ghost" 
              size="sm"
              onClick={() => handleTimeframeChange(timeframe)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <div 
          id={`tradingview-widget-${symbol?.replace(/[^a-zA-Z0-9]/g, '-')}`} 
          ref={containerRef} 
          className="h-full w-full"
        />
      </CardContent>
    </Card>
  );
};

export default StockChart;
