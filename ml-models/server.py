#!/usr/bin/env python3
"""
DeFAI Sentinel ML Server
A simple server to serve ML models for risk assessment and anomaly detection
"""
import os
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ml-server')

# Make sure we're in the right directory
current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_dir)

# Add current directory to path to ensure imports work
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import the Flask application from app.py
try:
    logger.info("Attempting to import create_app from app module")
    from app import create_app
    
    # Use the application factory pattern
    app = create_app()
    
    if __name__ == '__main__':
        port = int(os.environ.get('PORT', 5001))
        debug = os.environ.get('DEBUG', 'True').lower() == 'true'
        
        logger.info(f"Starting ML server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=debug)
        
except ImportError as e:
    logger.error(f"Error importing from app.py: {e}")
    logger.warning("Falling back to original implementation")
    
    # Fall back to the original implementation
    from flask import Flask, request, jsonify
    import json
    import time

    app = Flask(__name__)

    # Mock risk score data
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

    @app.route('/')
    def home():
        return jsonify({
            "status": "ok",
            "message": "DeFAI Sentinel ML Server is running",
            "version": "1.0.0"
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
        
        # In a real implementation, we would use a trained model to detect anomalies
        # Here we'll just return some mock data
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

    if __name__ == '__main__':
        port = int(os.environ.get('PORT', 5001))
        logger.info(f"Starting ML server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True) 