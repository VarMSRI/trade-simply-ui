
import React, { useState } from 'react';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import PortfolioHoldings from '@/components/dashboard/PortfolioHoldings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileBarChart } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AssetAllocation {
  name: string;
  value: number;
  color: string;
}

const Portfolio: React.FC = () => {
  // Get portfolio status from analytics API
  const { portfolioStatus } = useAnalytics();
  
  // This would come from your API in a real application
  const assetAllocation: AssetAllocation[] = [
    { name: 'Technology', value: 45, color: '#3773f4' },
    { name: 'Financial', value: 20, color: '#4BB543' },
    { name: 'Healthcare', value: 15, color: '#FF3A30' },
    { name: 'Consumer', value: 10, color: '#FFD700' },
    { name: 'Energy', value: 5, color: '#9C27B0' },
    { name: 'Other', value: 5, color: '#607D8B' },
  ];

  // Mock data for performance chart
  const generatePerformanceData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    for (let i = 0; i <= 180; i += 7) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Generate a somewhat realistic growth curve with some volatility
      const baseValue = 75000 + (i * 70); // Base portfolio value with growth
      const randomVariation = Math.random() * 5000 - 2500; // Random variation
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.round(baseValue + randomVariation),
      });
    }
    
    return data;
  };

  const performanceData = generatePerformanceData();

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Manage your investments and track performance
          </p>
        </div>
        <Button asChild>
          <Link to="/analytics">
            <FileBarChart className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <PortfolioSummary portfolioData={portfolioStatus} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Allocation']}
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
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
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
                        return `${date.toLocaleDateString('en-US', { month: 'short' })}`;
                      }}
                      ticks={performanceData
                        .filter((_, i) => i % 4 === 0)
                        .map(item => item.date)}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
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
                      dataKey="value"
                      stroke="#3773f4"
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <PortfolioHoldings />
      </div>
    </>
  );
};

export default Portfolio;
