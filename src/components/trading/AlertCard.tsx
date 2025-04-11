
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';
import { TradeAlert } from '@/types/alert';
import { useNavigate } from 'react-router-dom';

interface AlertCardProps {
  alert: TradeAlert;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const navigate = useNavigate();
  
  const riskRewardRatio = (alert.target_price - alert.entry_price) / (alert.entry_price - alert.stop_loss);
  const isPositiveSentiment = alert.sentiment_score > 0;
  
  // Calculate a simple score from various metrics (0-100)
  const overallScore = Math.min(100, Math.max(0, Math.round(
    (alert.fundamental_score * 20) +
    (alert.volume_score * 20) +
    (alert.event_score * 20) +
    (alert.sentiment_score * 2)
  )));
  
  const handleTradeClick = () => {
    navigate(`/trading?symbol=${alert.security}`);
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {alert.security}
            {isPositiveSentiment ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Bullish
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <TrendingDown className="h-3 w-3 mr-1" />
                Bearish
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center">
            <Badge 
              className={`${
                overallScore > 70 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : overallScore > 40 
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              Score: {overallScore}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{alert.summary}</p>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry:</span>
            <span className="font-medium">₹{alert.entry_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium text-green-600">₹{alert.target_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stop Loss:</span>
            <span className="font-medium text-red-600">₹{alert.stop_loss.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">R:R Ratio:</span>
            <span className="font-medium">{riskRewardRatio.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleTradeClick}
          >
            <Info className="h-4 w-4" />
            Trade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
