
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
} from 'recharts';
import { Loader2 } from 'lucide-react';

// Mock data for PnL over time
// In a real app, this would come from the API
const generateMockPnLData = () => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Generate a somewhat realistic PnL that shows general upward trend with some volatility
    const baseValue = 5000 + (i * 200); // Base increasing trend
    const randomVariation = Math.random() * 1000 - 500; // Random variation between -500 and 500
    
    data.push({
      date: date.toISOString().split('T')[0],
      pnl: Math.round(baseValue + randomVariation),
    });
  }
  
  return data;
};

interface PnLChartProps {
  days?: number;
  isLoading?: boolean;
}

const PnLChart: React.FC<PnLChartProps> = ({ days = 30, isLoading = false }) => {
  const pnlData = generateMockPnLData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit & Loss Over Time ({days} Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={pnlData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value}`, 'P&L']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#3773f4"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PnLChart;
