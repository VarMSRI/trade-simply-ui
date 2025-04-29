
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { PortfolioStatusResponse } from '@/services/analyticsService';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioSummaryProps {
  portfolioData?: PortfolioStatusResponse;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolioData }) => {
  // If no data is provided, use default values
  const portfolioValue = portfolioData?.currentValue || 87429.42;
  const dayChange = 1345.67; // Mock day change (not in API)
  const dayChangePercent = 1.56; // Mock day change percent (not in API)
  const totalProfitLoss = portfolioData?.netPnL || 12547.89;
  const totalProfitLossPercent = portfolioData?.netPnLPercentage || 16.76;
  const isPositiveDayChange = dayChange > 0;
  const isPositiveTotalChange = totalProfitLoss > 0;
  const availableCash = 24895.12; // Mock cash (not in API)

  // Determine if data is loading
  const isLoading = portfolioData === undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="text-2xl font-bold">₹{portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Day Change</CardTitle>
          {isPositiveDayChange ? 
            <ArrowUpRight className="h-4 w-4 text-green-500" /> :
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          }
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-full mb-1" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className={`text-2xl font-bold ${isPositiveDayChange ? 'text-green-500' : 'text-red-500'}`}>
                {isPositiveDayChange ? '+' : ''}₹{dayChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className={`text-xs ${isPositiveDayChange ? 'text-green-500' : 'text-red-500'}`}>
                {isPositiveDayChange ? '+' : ''}{dayChangePercent}%
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
          {isPositiveTotalChange ? 
            <ArrowUpRight className="h-4 w-4 text-green-500" /> :
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          }
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-full mb-1" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className={`text-2xl font-bold ${isPositiveTotalChange ? 'text-green-500' : 'text-red-500'}`}>
                {isPositiveTotalChange ? '+' : ''}₹{totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className={`text-xs ${isPositiveTotalChange ? 'text-green-500' : 'text-red-500'}`}>
                {isPositiveTotalChange ? '+' : ''}{totalProfitLossPercent}%
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="text-2xl font-bold">₹{availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
