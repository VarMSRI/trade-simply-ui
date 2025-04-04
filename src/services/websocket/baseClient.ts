
// Add global polyfill for sockjs-client
if (typeof window !== 'undefined' && !window.global) {
  (window as any).global = window;
}

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_CONFIG } from './config';

export type ConnectionListener = (status: boolean, error?: any) => void;

export class BaseStompClient {
  protected stompClient: Client | null = null;
  protected isConnected: boolean = false;
  protected reconnectTimer: number | null = null;
  protected reconnectAttempts: number = 0;
  private connectionListeners: Set<ConnectionListener> = new Set();
  
  public connect(token: string): void {
    if (this.stompClient && this.stompClient.connected) {
      return;
    }

    try {
      // Create a new STOMP client with SockJS
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_CONFIG.URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: function (str) {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      // Configure connection event handlers
      this.stompClient.onConnect = this.handleConnect.bind(this);
      this.stompClient.onStompError = this.handleStompError.bind(this);
      this.stompClient.onWebSocketError = this.handleWebSocketError.bind(this);
      this.stompClient.onWebSocketClose = this.handleWebSocketClose.bind(this);

      // Activate the connection
      this.stompClient.activate();

    } catch (error) {
      console.error("Error establishing STOMP connection:", error);
    }
  }
  
  protected handleConnect(frame: any): void {
    console.log("STOMP connection established");
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyConnectionListeners(true);
  }

  protected handleStompError(frame: any): void {
    console.error('STOMP protocol error:', frame);
    this.notifyConnectionListeners(false, frame);
  }

  protected handleWebSocketError(event: any): void {
    console.error('WebSocket error:', event);
    this.notifyConnectionListeners(false, event);
  }

  protected handleWebSocketClose(event: CloseEvent): void {
    this.isConnected = false;
    this.notifyConnectionListeners(false, event);

    if (this.reconnectAttempts < WS_CONFIG.RECONNECT.MAX_ATTEMPTS) {
      console.log(`WebSocket connection closed. Attempting to reconnect in ${WS_CONFIG.RECONNECT.INTERVAL / 1000}s`);
      this.reconnect();
    } else if (this.reconnectAttempts >= WS_CONFIG.RECONNECT.MAX_ATTEMPTS) {
      console.error("Maximum reconnection attempts reached");
    }
  }

  protected reconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.reconnectTimer = window.setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${WS_CONFIG.RECONNECT.MAX_ATTEMPTS}`);
      const token = localStorage.getItem("token") || '';
      this.connect(token);
    }, WS_CONFIG.RECONNECT.INTERVAL);
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.isConnected = false;
  }

  public isActive(): boolean {
    return this.isConnected;
  }

  public addConnectionListener(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  protected notifyConnectionListeners(isConnected: boolean, error?: any): void {
    this.connectionListeners.forEach(listener => {
      listener(isConnected, error);
    });
  }
}
