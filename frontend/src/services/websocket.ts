import { Alert } from '../types/alert';
import { Anomaly } from '../types/anomaly';
import { Protocol } from '../types/protocol';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

type MessageHandler = (data: any) => void;
type EventType = 'protocol_update' | 'new_anomaly' | 'new_alert' | 'risk_score_update';

interface MessageHandlers {
  [key: string]: MessageHandler[];
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000; // 3 seconds
  private handlers: MessageHandlers = {};

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.socket?.close();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnect attempts reached. Please refresh the page.');
    }
  }

  private handleMessage(message: any): void {
    const { type, data } = message;
    
    if (!type || !data) {
      console.error('Invalid message format:', message);
      return;
    }

    const handlersForType = this.handlers[type] || [];
    handlersForType.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in handler for message type ${type}:`, error);
      }
    });
  }

  public subscribe(eventType: EventType, handler: MessageHandler): () => void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    
    this.handlers[eventType].push(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers[eventType] = this.handlers[eventType].filter(h => h !== handler);
    };
  }

  public subscribeToProtocolUpdates(handler: (protocol: Protocol) => void): () => void {
    return this.subscribe('protocol_update', handler);
  }

  public subscribeToNewAnomalies(handler: (anomaly: Anomaly) => void): () => void {
    return this.subscribe('new_anomaly', handler);
  }

  public subscribeToNewAlerts(handler: (alert: Alert) => void): () => void {
    return this.subscribe('new_alert', handler);
  }

  public subscribeToRiskScoreUpdates(handler: (data: { 
    protocolId: string; 
    oldScore: number; 
    newScore: number;
  }) => void): () => void {
    return this.subscribe('risk_score_update', handler);
  }

  public disconnect(): void {
    if (this.socket && this.isConnected) {
      this.socket.close();
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService; 