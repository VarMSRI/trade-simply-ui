
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { TradeAlert } from '@/types/alert';
import { useNavigate } from 'react-router-dom';

interface AlertCardProps {
  alert: TradeAlert;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const navigate = useNavigate();
  
  const handleTradeClick = () => {
    navigate(`/trading?symbol=${alert.security}`);
  };
  
  // Determine event strength category based on event_score
  const getEventStrength = () => {
    if (alert.event_score > 70) return { label: 'Strong', className: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (alert.event_score > 50) return { label: 'Moderate', className: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Weak', className: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const eventStrength = getEventStrength();
  const isPositiveSentiment = alert.sentiment_score > 0;
  
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md border-l-4 ${
      alert.event_score > 70 ? 'border-l-purple-500' : 
      alert.event_score > 50 ? 'border-l-orange-500' : 
      'border-l-blue-500'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {alert.security}
            <Badge variant="outline" className={eventStrength.className}>
              {eventStrength.label}
            </Badge>
          </CardTitle>
          <div>
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm mb-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Entry</span>
            <span className="font-medium">₹{alert.entry_price.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium text-green-600">₹{alert.target_price.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Stop Loss</span>
            <span className="font-medium text-red-600">₹{alert.stop_loss.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleTradeClick}
          >
            <Info className="h-4 w-4" />
            Trade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
