
import { IMessage } from '@stomp/stompjs';
import { BaseStompClient } from './baseClient';

export class SubscriptionManager extends BaseStompClient {
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  
  protected override handleConnect(frame: any): void {
    super.handleConnect(frame);
    this.resubscribeAll();
  }

  public subscribe(topic: string, userId?: string, instrumentToken?: number): boolean {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      console.warn("Cannot subscribe: STOMP client is not connected");
      return false;
    }
    
    const destination = instrumentToken && userId ? 
      `/topic/market/${userId}/${instrumentToken}` : topic;
    
    // Check if already subscribed
    if (this.subscriptions.has(destination)) {
      return true;
    }

    try {
      // Subscribe to STOMP destination
      const subscription = this.stompClient.subscribe(destination, (message) => {
        this.handleMessage(destination, message);
      });
      
      this.subscriptions.add(destination);
      console.log(`Subscribed to ${destination}`);
      return true;
    } catch (error) {
      console.error(`Error subscribing to ${destination}:`, error);
      return false;
    }
  }

  public unsubscribe(topic: string, userId?: string, instrumentToken?: number): boolean {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      return false;
    }

    const destination = instrumentToken && userId ? 
      `/topic/market/${userId}/${instrumentToken}` : topic;
    
    if (!this.subscriptions.has(destination)) {
      return true; // Already unsubscribed
    }

    try {
      // Find and unsubscribe from the specific subscription
      this.stompClient.unsubscribe(destination);
      
      this.subscriptions.delete(destination);
      return true;
    } catch (error) {
      console.error(`Error unsubscribing from ${destination}:`, error);
      return false;
    }
  }
  
  public addMessageHandler(topic: string, callback: (data: any) => void): () => void {
    // Initialize handler set if it doesn't exist
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, new Set());
    }
    
    const handlers = this.messageHandlers.get(topic);
    
    if (handlers) {
      handlers.add(callback);
    }
    
    // Return unsubscribe function
    return () => {
      if (handlers) {
        handlers.delete(callback);
      }
    };
  }
  
  protected handleMessage(destination: string, message: IMessage): void {
    try {
      const payload = JSON.parse(message.body);
      
      // Notify all handlers for this topic
      this.messageHandlers.forEach((handlers, topic) => {
        if (destination.includes(topic)) {
          handlers.forEach(handler => handler(payload));
        }
      });
    } catch (error) {
      console.error("Error handling STOMP message:", error);
    }
  }
  
  private resubscribeAll(): void {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      return;
    }

    // Re-establish all previous subscriptions
    this.subscriptions.forEach(topic => {
      try {
        this.stompClient?.subscribe(topic, (message) => {
          this.handleMessage(topic, message);
        });
        console.log(`Resubscribed to ${topic}`);
      } catch (error) {
        console.error(`Error resubscribing to ${topic}:`, error);
      }
    });
  }
}
