
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { Button } from '@/components/ui/button';

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
  // Mock data - would come from your API in a real application
  const mockData = [
    { date: '9:30', price: 172.50 },
    { date: '10:00', price: 173.25 },
    { date: '10:30', price: 173.75 },
    { date: '11:00', price: 174.50 },
    { date: '11:30', price: 174.25 },
    { date: '12:00', price: 175.00 },
    { date: '12:30', price: 174.75 },
    { date: '13:00', price: 175.50 },
    { date: '13:30', price: 176.25 },
    { date: '14:00', price: 175.75 },
    { date: '14:30', price: 176.50 },
    { date: '15:00', price: 177.25 },
    { date: '15:30', price: 178.00 },
    { date: '16:00', price: 179.50 },
  ];

  const chartData = data || mockData;
  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const openPrice = chartData[0]?.price || 0;
  const priceChange = currentPrice - openPrice;
  const priceChangePercent = (priceChange / openPrice) * 100;
  const isPositiveChange = priceChange >= 0;

  const timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{symbol} | {name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
            <span className={`text-sm font-medium ${isPositiveChange ? 'text-profit' : 'text-loss'}`}>
              {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)} ({isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {timeframes.map((timeframe) => (
            <Button key={timeframe} variant="ghost" size="sm">
              {timeframe}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              width={60}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
            />
            <ReferenceLine y={openPrice} stroke="#888" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={isPositiveChange ? '#4BB543' : '#FF3A30'} 
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StockChart;
