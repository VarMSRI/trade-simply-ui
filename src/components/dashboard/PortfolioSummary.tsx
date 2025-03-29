
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

const PortfolioSummary: React.FC = () => {
  // This would come from your API in a real application
  const portfolioValue = 87429.42;
  const dayChange = 1345.67;
  const dayChangePercent = 1.56;
  const totalProfitLoss = 12547.89;
  const totalProfitLossPercent = 16.76;
  const isPositiveDayChange = dayChange > 0;
  const isPositiveTotalChange = totalProfitLoss > 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Day Change</CardTitle>
          {isPositiveDayChange ? 
            <ArrowUpRight className="h-4 w-4 text-profit" /> :
            <ArrowDownRight className="h-4 w-4 text-loss" />
          }
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositiveDayChange ? 'text-profit' : 'text-loss'}`}>
            {isPositiveDayChange ? '+' : ''}{dayChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className={`text-xs ${isPositiveDayChange ? 'text-profit' : 'text-loss'}`}>
            {isPositiveDayChange ? '+' : ''}{dayChangePercent}%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
          {isPositiveTotalChange ? 
            <ArrowUpRight className="h-4 w-4 text-profit" /> :
            <ArrowDownRight className="h-4 w-4 text-loss" />
          }
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositiveTotalChange ? 'text-profit' : 'text-loss'}`}>
            {isPositiveTotalChange ? '+' : ''}{totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className={`text-xs ${isPositiveTotalChange ? 'text-profit' : 'text-loss'}`}>
            {isPositiveTotalChange ? '+' : ''}{totalProfitLossPercent}%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$24,895.12</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
