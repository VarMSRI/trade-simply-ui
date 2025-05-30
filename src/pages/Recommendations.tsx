
import React from 'react';
import { useTradeAlerts } from '@/hooks/useTradeAlerts';
import AlertCard from '@/components/trading/AlertCard';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertCircle, 
  BellRing, 
  TrendingUp,
  Signal,
  WifiOff,
  ShieldAlert,
  RefreshCw,
  Bug
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Recommendations: React.FC = () => {
  const { alerts, isConnecting, isConnected, error, lastHeartbeat, getEventHistory } = useTradeAlerts();
  
  // Check if error contains CORS
  const isCorsError = error?.toLowerCase().includes('cors');
  
  // Force page reload to reconnect
  const handleReconnect = () => {
    window.location.reload();
  };
  
  // Print all event history to console
  const handleDebugEvents = () => {
    if (getEventHistory) {
      const events = getEventHistory();
      console.log('DEBUG - All SSE events received:', events);
      
      // Log event type counts
      const typeCounts = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('DEBUG - Event type counts:', typeCounts);
    }
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BellRing className="h-7 w-7 text-primary" />
          Trade Recommendations
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          Real-time trading alerts based on market analysis and patterns
          {isConnected && (
            <Badge variant="outline" className="ml-2 flex items-center gap-1">
              <Signal className="h-3 w-3 text-green-500" />
              <span className="text-xs">Connected</span>
              {lastHeartbeat && (
                <span className="text-xs ml-1">
                  (Last ping: {new Date(lastHeartbeat).toLocaleTimeString()})
                </span>
              )}
            </Badge>
          )}
        </p>
      </div>
      
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleDebugEvents}
        >
          <Bug className="h-3 w-3" />
          Show Event Debug Info
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          {isCorsError ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span>{error}</span>
              {isConnecting && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
            
            {isCorsError && (
              <div className="mt-2 text-xs">
                <p>This is typically caused by server configuration issues:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>The server needs to allow the 'Authorization' header in CORS</li>
                  <li>The server needs to allow your current origin ({window.location.origin})</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 flex items-center gap-1"
                  onClick={handleReconnect}
                >
                  <RefreshCw className="h-3 w-3" />
                  Try reconnecting
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {isConnecting && !error && (
        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to alerts feed...
        </div>
      )}
      
      {!isConnected && !isConnecting && !error && (
        <Alert variant="destructive" className="mb-6">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>Disconnected from alerts feed. Attempting to reconnect...</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleReconnect}
            >
              <RefreshCw className="h-3 w-3" />
              Try manually
            </Button>
          </AlertDescription>
        </Alert>
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
