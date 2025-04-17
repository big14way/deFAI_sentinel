import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

class DeFiAnomalyDetector:
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def preprocess_features(self, features):
        """
        Preprocess transaction features for anomaly detection
        Features include: transaction value, gas price, address activity frequency
        """
        return self.scaler.fit_transform(features)
        
    def train(self, transaction_data):
        """
        Train the anomaly detection model on historical transaction data
        """
        processed_features = self.preprocess_features(transaction_data)
        self.isolation_forest.fit(processed_features)
        
    def predict(self, transaction):
        """
        Predict if a transaction is anomalous
        Returns: -1 for anomaly, 1 for normal
        """
        processed = self.preprocess_features(transaction.reshape(1, -1))
        return self.isolation_forest.predict(processed)[0]
        
    def get_anomaly_score(self, transaction):
        """
        Get anomaly score for a transaction
        Higher negative values indicate stronger anomalies
        """
        processed = self.preprocess_features(transaction.reshape(1, -1))
        return -self.isolation_forest.score_samples(processed)[0]
        
    def save_model(self, path):
        """Save the trained model"""
        joblib.dump({
            'isolation_forest': self.isolation_forest,
            'scaler': self.scaler
        }, path)
        
    @classmethod
    def load_model(cls, path):
        """Load a trained model"""
        model = cls()
        saved_model = joblib.load(path)
        model.isolation_forest = saved_model['isolation_forest']
        model.scaler = saved_model['scaler']
        return model 