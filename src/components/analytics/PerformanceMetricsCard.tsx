
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { PnLReportResponse } from '@/services/analyticsService';

interface PerformanceMetricsCardProps {
  data?: PnLReportResponse;
  isLoading: boolean;
}

const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({ data, isLoading }) => {
  // Mock data for additional metrics
  const sharpeRatio = 1.35;
  const maxDrawdown = 8.75;
  const winningStreak = 5;

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isPositivePnL = data.realizedPnL >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Realized P&L</div>
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${isPositivePnL ? 'text-green-500' : 'text-red-500'}`}>
                {isPositivePnL ? '+' : ''}₹{data.realizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={`ml-2 flex items-center text-sm ${isPositivePnL ? 'text-green-500' : 'text-red-500'}`}>
                {isPositivePnL ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {isPositivePnL ? '+' : ''}{data.realizedPnLPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
            <div className="text-2xl font-bold">{sharpeRatio}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-500">-{maxDrawdown}%</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Longest Winning Streak</div>
            <div className="text-2xl font-bold text-green-500">{winningStreak}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;
