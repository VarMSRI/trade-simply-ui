
import React from 'react';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import PortfolioHoldings from '@/components/dashboard/PortfolioHoldings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface AssetAllocation {
  name: string;
  value: number;
  color: string;
}

const Portfolio: React.FC = () => {
  // This would come from your API in a real application
  const assetAllocation: AssetAllocation[] = [
    { name: 'Technology', value: 45, color: '#3773f4' },
    { name: 'Financial', value: 20, color: '#4BB543' },
    { name: 'Healthcare', value: 15, color: '#FF3A30' },
    { name: 'Consumer', value: 10, color: '#FFD700' },
    { name: 'Energy', value: 5, color: '#9C27B0' },
    { name: 'Other', value: 5, color: '#607D8B' },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground mt-1">
          Manage your investments and track performance
        </p>
      </div>

      <div className="space-y-6">
        <PortfolioSummary />

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
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Performance chart would be displayed here (with historical data from API)
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
