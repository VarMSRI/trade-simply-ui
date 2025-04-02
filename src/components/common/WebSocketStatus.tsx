
import React from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { Wifi, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WebSocketStatusProps {
  className?: string;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ className = '' }) => {
  const { isConnected } = useWebSocket();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center ${className}`}>
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="ml-1 text-xs">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isConnected ? 'Connected to market data stream' : 'Market data stream offline'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WebSocketStatus;
