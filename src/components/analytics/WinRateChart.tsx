
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { WinRateReportResponse } from '@/services/analyticsService';

interface WinRateChartProps {
  data?: WinRateReportResponse;
  isLoading: boolean;
}

const WinRateChart: React.FC<WinRateChartProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Win/Loss Rate</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Winning', value: data.winning_percentage, color: '#4BB543' },
    { name: 'Losing', value: data.losing_percentage, color: '#FF3A30' },
    { name: 'Break Even', value: data.break_even_percentage, color: '#3773f4' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win/Loss Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend layout="vertical" align="right" verticalAlign="middle" />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-medium">Total Positions</div>
            <div className="text-2xl font-bold">{data.total_positions_closed}</div>
          </div>
          <div>
            <div className="font-medium">Winning Positions</div>
            <div className="text-2xl font-bold text-green-500">{data.winning_positions}</div>
          </div>
          <div>
            <div className="font-medium">Losing Positions</div>
            <div className="text-2xl font-bold text-red-500">{data.losing_positions}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinRateChart;
