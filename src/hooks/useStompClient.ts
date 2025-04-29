
import { useEffect, useRef } from 'react';
import { Client, Frame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAuthHeaders } from '@/services/apiUtils';

export interface MarketUpdate {
  instrument_token: number;
  lastTradedPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export function useStompClient({
  jwt,
  userId,
  instrumentTokens,
  onMarketUpdate,
}: {
  jwt: string;
  userId: string;
  instrumentTokens: number[];
  onMarketUpdate: (data: MarketUpdate) => void;
}) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!instrumentTokens.length || !jwt || !userId) {
      console.log('Missing required parameters for WebSocket connection');
      return;
    }

    try {
      const socket = new SockJS('https://app.intuitifi.com/ws');
      
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${jwt}`,
        },
        debug: (str) => console.log('[STOMP]', str),
        reconnectDelay: 5000,
        onConnect: (frame: Frame) => {
          console.log('[Connected]', frame);
          
          // Subscribe to each instrument
          instrumentTokens.forEach((token) => {
            const dest = `/topic/market/${userId}/${token}`;
            client.subscribe(dest, (msg) => {
              try {
                const data = JSON.parse(msg.body);
                onMarketUpdate(data);
              } catch (error) {
                console.error('Error parsing market update:', error);
              }
            });
          });
          
          // Send subscription
          client.publish({
            destination: '/app/subscribe',
            body: JSON.stringify({ userId, instrumentTokens }),
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
        }
      });
      
      client.activate();
      clientRef.current = client;
      
      return () => {
        if (clientRef.current && clientRef.current.connected) {
          clientRef.current.deactivate();
          console.log('WebSocket connection closed');
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
    }
  }, [jwt, userId, instrumentTokens, onMarketUpdate]);

  return () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }
  };
}
