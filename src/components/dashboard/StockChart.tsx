import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/ThemeProvider';

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
  symbol = "RELIANCE", 
  name = "Reliance Industries Ltd.", 
  data 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [currentInterval, setCurrentInterval] = useState<string>('D');
  const timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];
  const { theme } = useTheme();

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
  }, [symbol, theme, currentInterval]);

  const createWidget = () => {
    if (!containerRef.current || !window.TradingView) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Format the symbol properly based on pattern
    // If it already contains a colon (like NSE:RELIANCE), use it as is
    // Otherwise, add NSE: prefix for Indian stocks
    let formattedSymbol = symbol || "RELIANCE";
    
    // Don't modify symbols that already contain an exchange prefix
    if (!formattedSymbol.includes(':')) {
      // Remove any special characters except alphanumeric and dots
      formattedSymbol = formattedSymbol.replace(/[^a-zA-Z0-9.]/g, '');
      formattedSymbol = `NSE:${formattedSymbol}`;
    }

    console.log("Creating TradingView widget with symbol:", formattedSymbol);

    widgetRef.current = new window.TradingView.widget({
      width: '100%',
      height: 400,
      symbol: formattedSymbol,
      interval: currentInterval,
      timezone: 'Asia/Kolkata',
      theme: theme === 'dark' ? 'dark' : 'light',
      style: '1', // '1' for line style
      locale: 'in',
      toolbar_bg: theme === 'dark' ? '#222222' : '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: containerRef.current.id,
      hide_side_toolbar: false,
      backgroundColor: theme === 'dark' ? '#222222' : '#ffffff',
      gridColor: theme === 'dark' ? '#333333' : '#e0e0e0',
      studies_overrides: {
        "volume.volume.color.0": theme === 'dark' ? "#FF3A30" : "#FF3A30",
        "volume.volume.color.1": theme === 'dark' ? "#4BB543" : "#4BB543",
      },
      overrides: {
        "paneProperties.background": theme === 'dark' ? "#222222" : "#ffffff",
        "paneProperties.vertGridProperties.color": theme === 'dark' ? "#333333" : "#e0e0e0",
        "paneProperties.horzGridProperties.color": theme === 'dark' ? "#333333" : "#e0e0e0",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": theme === 'dark' ? "#AAA" : "#333",
      },
      // Adding supported exchanges for Indian market
      supported_resolutions: ["1", "5", "15", "30", "60", "D", "W", "M"],
      supported_exchanges: ["NSE", "BSE"],
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["save_chart_properties_to_local_storage"]
    });
  };

  // Handle timeframe changes
  const handleTimeframeChange = (timeframe: string) => {
    let interval = 'D'; // Default interval
    
    switch (timeframe) {
      case '1D':
        interval = '30'; // 30 minutes for intraday
        break;
      case '5D':
        interval = '60'; // 1 hour for 5-day view
        break;
      case '1M':
        interval = 'D'; // Daily for 1 month
        break;
      case '3M':
      case '6M':
        interval = 'W'; // Weekly for 3-6 months
        break;
      case 'YTD':
      case '1Y':
        interval = 'W'; // Weekly for YTD/1Y
        break;
      case '5Y':
      case 'All':
        interval = 'M'; // Monthly for long term
        break;
      default:
        interval = 'D'; // Default to daily
    }
    
    // Update the interval state
    setCurrentInterval(interval);
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
