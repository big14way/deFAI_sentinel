#!/usr/bin/env python3
"""
DeFAI Sentinel ML Server - Application Entry Point
A Flask application that serves ML models for risk assessment and anomaly detection
"""
from flask import Flask, request, jsonify
import os
import logging
import json
import time
import sys
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    env_loaded = True
except ImportError:
    print("python-dotenv not installed, using default environment variables")
    env_loaded = False

# Import anomaly detector if it exists
try:
    from src.models.anomaly_detector import DeFiAnomalyDetector
    HAS_ANOMALY_DETECTOR = True
except ImportError:
    HAS_ANOMALY_DETECTOR = False
    print("Warning: Could not import anomaly detector module, using mock data only")

# Configure logging
log_level = os.environ.get('LOG_LEVEL', 'INFO')
numeric_level = getattr(logging, log_level.upper(), logging.INFO)

# Ensure log directory exists
log_dir = os.path.dirname(__file__)
log_file = os.path.join(log_dir, 'ml_server.log')

logging.basicConfig(
    level=numeric_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(log_file)
    ]
)
logger = logging.getLogger('ml-server')

def create_app():
    app = Flask(__name__)
    
    # Log startup information
    logger.info(f"Starting DeFAI Sentinel ML Server")
    logger.info(f"Environment variables loaded: {env_loaded}")
    logger.info(f"Anomaly detector module available: {HAS_ANOMALY_DETECTOR}")
    
    # Enable CORS if needed
    if os.environ.get('ENABLE_CORS', 'False').lower() == 'true':
        try:
            from flask_cors import CORS
            CORS(app)
            logger.info("CORS enabled for the application")
        except ImportError:
            logger.warning("flask-cors not installed, CORS is not enabled")
    
    # Load mock risk score data
    RISK_SCORES = {
        "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": 25,  # Aave
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": 40,  # Uniswap
        "0xc00e94cb662c3520282e6f5717214004a7f26888": 35,  # Compound
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": 30,  # MakerDAO
        "0x6b175474e89094c44da98b954eedeac495271d0f": 20,  # DAI
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": 15,  # Wrapped Bitcoin
        "0x514910771af9ca656af840dff83e8264ecf986ca": 72,  # Chainlink
        "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": 55,  # Yearn Finance
    }
    
    # Try to load the anomaly detector model
    anomaly_detector = None
    if HAS_ANOMALY_DETECTOR:
        model_path = os.environ.get('ANOMALY_MODEL_PATH', 'models/anomaly_detector.joblib')
        model_path = Path(__file__).parent / model_path
        
        logger.info(f"Looking for anomaly detector model at: {model_path}")
        
        if model_path.exists():
            try:
                anomaly_detector = DeFiAnomalyDetector.load_model(str(model_path))
                logger.info(f"Loaded anomaly detector model from {model_path}")
            except Exception as e:
                logger.error(f"Error loading anomaly detector model: {e}")
        else:
            logger.warning(f"Anomaly detector model not found at {model_path}. Using mock data.")
    
    @app.route('/')
    def home():
        return jsonify({
            "status": "ok",
            "message": "DeFAI Sentinel ML Server is running",
            "version": "1.0.0",
            "models_loaded": {
                "anomaly_detector": anomaly_detector is not None
            },
            "env_loaded": env_loaded
        })
    
    @app.route('/api/risk/score/<address>', methods=['GET'])
    def get_risk_score(address):
        """Get the risk score for a protocol"""
        # Lowercase the address for consistency
        address = address.lower()
        
        # If the address is in our mock data, return it
        if address in RISK_SCORES:
            score = RISK_SCORES[address]
        else:
            # Generate a random score between 20 and 80 for unknown addresses
            # In a real model, we would compute this using features
            import random
            score = random.randint(20, 80)
            RISK_SCORES[address] = score
        
        logger.info(f"Returning risk score {score} for {address}")
        
        # Simulate some processing time
        time.sleep(0.5)
        
        return jsonify({
            "address": address,
            "risk_score": score,
            "timestamp": int(time.time()),
            "confidence": 0.85
        })
    
    @app.route('/api/anomaly/detect', methods=['POST'])
    def detect_anomaly():
        """Detect anomalies in protocol data"""
        data = request.json
        
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid request format"}), 400
        
        # Extract protocol address
        address = data.get('address')
        if not address:
            return jsonify({"error": "Protocol address is required"}), 400
        
        # Extract features if available
        features = data.get('features', {})
        
        # Check if we should use the real model or mock data
        use_mock = os.environ.get('MOCK_DATA', 'True').lower() == 'true'
        
        # Check if we should use the real model
        if not use_mock and anomaly_detector and features and len(features) > 0:
            # Convert features to numpy array
            import numpy as np
            try:
                # This is simplified - in production you'd need proper feature extraction
                feature_array = np.array([float(v) for v in features.values()]).reshape(1, -1)
                anomaly_score = anomaly_detector.get_anomaly_score(feature_array)
                
                # Determine if it's an anomaly based on threshold
                has_anomaly = anomaly_score > 0.7
                
                logger.info(f"Using ML model for anomaly detection: {has_anomaly} (score: {anomaly_score})")
                
                if has_anomaly:
                    response = {
                        "address": address,
                        "timestamp": int(time.time()),
                        "anomaly_detected": True,
                        "anomaly_score": float(anomaly_score),
                        "anomaly_type": "ml_detected",
                        "severity": "high" if anomaly_score > 0.85 else "medium" if anomaly_score > 0.75 else "low",
                        "description": "Machine learning model detected unusual patterns in protocol data."
                    }
                    return jsonify(response)
            except Exception as e:
                logger.error(f"Error using anomaly detector model: {e}")
                # Fall back to mock implementation
        
        # Mock implementation (fallback)
        import random
        
        # Higher risk protocols are more likely to have anomalies
        base_score = RISK_SCORES.get(address.lower(), 50)
        anomaly_probability = base_score / 100
        
        has_anomaly = random.random() < anomaly_probability
        
        response = {
            "address": address,
            "timestamp": int(time.time()),
            "anomaly_detected": has_anomaly,
        }
        
        if has_anomaly:
            response.update({
                "anomaly_score": random.uniform(0.7, 0.95),
                "anomaly_type": random.choice(["price_spike", "liquidity_drop", "unusual_activity", "governance_risk"]),
                "severity": random.choice(["low", "medium", "high"]),
                "description": "Unusual activity detected in protocol operations."
            })
        
        logger.info(f"Anomaly detection result for {address}: {has_anomaly}")
        
        # Simulate processing time
        time.sleep(1)
        
        return jsonify(response)
    
    @app.route('/api/user/risk', methods=['POST'])
    def user_risk_assessment():
        """Assess the risk of a user's portfolio"""
        data = request.json
        
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid request format"}), 400
        
        # Extract user address
        user_address = data.get('user_address')
        if not user_address:
            return jsonify({"error": "User address is required"}), 400
        
        # Extract exposures if available
        exposures = data.get('exposures', [])
        
        # Calculate weighted risk score
        total_value = 0
        weighted_risk = 0
        
        for exposure in exposures:
            protocol_address = exposure.get('protocol_address')
            amount = exposure.get('amount', 0)
            
            if protocol_address and amount > 0:
                # Get risk score for this protocol
                risk_score = RISK_SCORES.get(protocol_address.lower(), 50)
                
                # Add to weighted calculation
                total_value += amount
                weighted_risk += amount * risk_score
        
        # Calculate final risk score
        if total_value > 0:
            final_risk_score = weighted_risk / total_value
        else:
            final_risk_score = 0
        
        response = {
            "user_address": user_address,
            "risk_score": round(final_risk_score, 2),
            "timestamp": int(time.time()),
            "exposure_count": len(exposures),
            "high_risk_exposure_count": sum(1 for e in exposures if 
                                          RISK_SCORES.get(e.get('protocol_address', '').lower(), 0) >= 70)
        }
        
        logger.info(f"User risk assessment for {user_address}: {final_risk_score}")
        
        # Simulate processing time
        time.sleep(0.8)
        
        return jsonify(response)

    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring"""
        return jsonify({
            "status": "healthy",
            "timestamp": int(time.time())
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting ML server on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug) 