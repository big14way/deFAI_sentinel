import { WebSocketService } from './websocket.service';
import { UserPreference } from '../models/UserPreference';
import { Alert } from '../models/Alert';

export class NotificationService {
    constructor(
        private wsService: WebSocketService,
        private userPreferenceModel: typeof UserPreference,
        private alertModel: typeof Alert
    ) {}

    async notifyRiskThresholdExceeded(protocol: string, riskScore: number) {
        // Get users who have subscribed to this protocol
        const affectedUsers = await this.userPreferenceModel.find({
            'protocols': protocol,
            'riskThreshold': { $lt: riskScore }
        });

        // Create and store alerts
        const alerts = await Promise.all(affectedUsers.map(async (user) => {
            const alert = new this.alertModel({
                userId: user._id,
                protocol,
                type: 'RISK_THRESHOLD_EXCEEDED',
                message: `Risk score for ${protocol} has exceeded your threshold (${riskScore})`,
                severity: this.calculateSeverity(riskScore),
                timestamp: new Date()
            });
            await alert.save();
            return { user, alert };
        }));

        // Send notifications via WebSocket
        alerts.forEach(({ user, alert }) => {
            this.wsService.broadcastUserAlert(user._id, alert);
        });
    }

    async notifyAnomaly(protocol: string, anomalyType: string, details: string, severity: number) {
        // Get users who have enabled anomaly notifications for this protocol
        const affectedUsers = await this.userPreferenceModel.find({
            'protocols': protocol,
            'anomalyNotifications': true
        });

        // Create and store alerts
        const alerts = await Promise.all(affectedUsers.map(async (user) => {
            const alert = new this.alertModel({
                userId: user._id,
                protocol,
                type: 'ANOMALY_DETECTED',
                message: `Anomaly detected in ${protocol}: ${details}`,
                severity,
                timestamp: new Date()
            });
            await alert.save();
            return { user, alert };
        }));

        // Send notifications via WebSocket
        alerts.forEach(({ user, alert }) => {
            this.wsService.broadcastUserAlert(user._id, alert);
        });

        // Broadcast anomaly to all connected clients
        this.wsService.broadcastAnomaly(protocol, anomalyType, severity);
    }

    private calculateSeverity(riskScore: number): number {
        if (riskScore >= 80) return 3; // High
        if (riskScore >= 50) return 2; // Medium
        return 1; // Low
    }

    async getUserAlerts(userId: string, status: 'unread' | 'all' = 'unread') {
        const query = { userId };
        if (status === 'unread') {
            query['read'] = false;
        }
        return await this.alertModel.find(query).sort({ timestamp: -1 });
    }

    async markAlertAsRead(alertId: string) {
        return await this.alertModel.findByIdAndUpdate(alertId, { read: true });
    }
}

export default NotificationService; 