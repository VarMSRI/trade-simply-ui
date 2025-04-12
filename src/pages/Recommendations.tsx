
import React from 'react';
import { useTradeAlerts } from '@/hooks/useTradeAlerts';
import AlertCard from '@/components/trading/AlertCard';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  AlertCircle, 
  BellRing, 
  TrendingUp
} from 'lucide-react';

const Recommendations: React.FC = () => {
  const { alerts, isConnected, error } = useTradeAlerts();
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BellRing className="h-7 w-7 text-primary" />
          Trade Recommendations
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time trading alerts based on market analysis and patterns
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!isConnected && !error && (
        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to alerts feed...
        </div>
      )}
      
      {isConnected && alerts.length === 0 && (
        <Card className="p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No trade alerts yet</h2>
          <p className="text-muted-foreground">
            We'll notify you when new trade recommendations are available.
          </p>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert, index) => (
          <AlertCard 
            key={`${alert.security}-${index}`} 
            alert={alert} 
          />
        ))}
      </div>
    </>
  );
};

export default Recommendations;
