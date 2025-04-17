import { Protocol } from '../models/Protocol';
import { Transaction } from '../models/Transaction';
import * as tf from '@tensorflow/tfjs-node';
import { NotificationService } from './notification.service';

export class MLService {
    private model: tf.LayersModel | null = null;
    private isModelLoading: boolean = false;

    constructor(
        private notificationService: NotificationService,
        private modelPath: string = 'file://ml-models/anomaly_detection'
    ) {}

    async initialize() {
        if (!this.model && !this.isModelLoading) {
            this.isModelLoading = true;
            try {
                this.model = await tf.loadLayersModel(this.modelPath);
                console.log('ML model loaded successfully');
            } catch (error) {
                console.error('Error loading ML model:', error);
                throw error;
            } finally {
                this.isModelLoading = false;
            }
        }
    }

    private preprocessTransactions(transactions: Transaction[]): tf.Tensor {
        // Convert transactions to feature vectors
        const features = transactions.map(tx => [
            tx.value.toNumber(),
            tx.gasPrice.toNumber(),
            tx.timestamp.getTime(),
            // Add more relevant features
        ]);
        return tf.tensor2d(features);
    }

    async detectAnomalies(protocol: string, transactions: Transaction[]): Promise<void> {
        if (!this.model) {
            await this.initialize();
        }

        const features = this.preprocessTransactions(transactions);
        const predictions = this.model!.predict(features) as tf.Tensor;
        const anomalyScores = await predictions.array() as number[][];

        // Process anomalies and notify if necessary
        anomalyScores.forEach((score, index) => {
            if (score[0] > 0.8) { // Anomaly threshold
                const transaction = transactions[index];
                this.notificationService.notifyAnomaly(
                    protocol,
                    'TRANSACTION_ANOMALY',
                    `Unusual transaction pattern detected: ${transaction.hash}`,
                    this.calculateSeverity(score[0])
                );
            }
        });

        // Cleanup
        features.dispose();
        predictions.dispose();
    }

    async calculateRiskScore(protocol: string, metrics: ProtocolMetrics): Promise<number> {
        const riskFactors = {
            tvl: 0.3,
            userCount: 0.2,
            transactionVolume: 0.2,
            anomalyFrequency: 0.3
        };

        const normalizedMetrics = {
            tvl: this.normalize(metrics.tvl, 0, metrics.maxTVL),
            userCount: this.normalize(metrics.userCount, 0, metrics.maxUsers),
            transactionVolume: this.normalize(metrics.transactionVolume, 0, metrics.maxVolume),
            anomalyFrequency: this.normalize(metrics.anomalyCount, 0, metrics.maxAnomalies)
        };

        const riskScore = Object.entries(riskFactors).reduce((score, [key, weight]) => {
            return score + (normalizedMetrics[key] * weight);
        }, 0);

        return Math.min(Math.max(riskScore * 100, 0), 100);
    }

    private normalize(value: number, min: number, max: number): number {
        return (value - min) / (max - min);
    }

    private calculateSeverity(anomalyScore: number): number {
        if (anomalyScore > 0.9) return 3; // High
        if (anomalyScore > 0.8) return 2; // Medium
        return 1; // Low
    }
}

interface ProtocolMetrics {
    tvl: number;
    maxTVL: number;
    userCount: number;
    maxUsers: number;
    transactionVolume: number;
    maxVolume: number;
    anomalyCount: number;
    maxAnomalies: number;
} 