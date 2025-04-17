import WebSocket from 'ws';
import { Server } from 'http';
import { EventEmitter } from 'events';

class WebSocketService extends EventEmitter {
    private wss: WebSocket.Server;
    private clients: Set<WebSocket> = new Set();

    constructor(server: Server) {
        super();
        this.wss = new WebSocket.Server({ server });
        this.initialize();
    }

    private initialize() {
        this.wss.on('connection', (ws: WebSocket) => {
            this.clients.add(ws);
            
            ws.on('message', (message: string) => {
                try {
                    const data = JSON.parse(message);
                    this.emit('message', data);
                } catch (error) {
                    console.error('WebSocket message parsing error:', error);
                }
            });

            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
    }

    public broadcast(event: string, data: any) {
        const message = JSON.stringify({ event, data });
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    // Methods for different event types
    public broadcastRiskUpdate(protocol: string, riskScore: number) {
        this.broadcast('risk-update', { protocol, riskScore });
    }

    public broadcastAnomaly(protocol: string, anomalyType: string, severity: number) {
        this.broadcast('anomaly-detected', { protocol, anomalyType, severity });
    }

    public broadcastProtocolUpdate(protocolData: any) {
        this.broadcast('protocol-update', protocolData);
    }

    public broadcastUserAlert(userId: string, alert: any) {
        // Send alert to specific user
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && (client as any).userId === userId) {
                client.send(JSON.stringify({
                    event: 'user-alert',
                    data: alert
                }));
            }
        });
    }
}

export default WebSocketService; 