# DeFAI Sentinel ML Server

This component provides machine learning-based risk assessment and anomaly detection for DeFi protocols. It serves risk scores, detects anomalies, and calculates user portfolio risks.

## Features

- Protocol risk scoring API
- Anomaly detection for protocol activities
- User portfolio risk assessment
- Integration with ML models for production deployments
- Fallback to simulated data when models are not available

## Setup

### Requirements

- Python 3.8+
- Virtual environment (recommended)

### Installation

1. Create a virtual environment:
   ```
   python3 -m venv venv
   ```

2. Activate the virtual environment:
   ```
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Configuration

The server can be configured using environment variables or a `.env` file with the following options:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DEBUG | Enable debug mode | True |
| ANOMALY_MODEL_PATH | Path to anomaly detection model | models/anomaly_detector.joblib |
| RISK_MODEL_PATH | Path to risk scoring model | models/risk_model.joblib |
| ENABLE_CORS | Enable CORS for API | False |
| LOG_LEVEL | Logging level (INFO, DEBUG, etc.) | INFO |
| MOCK_DATA | Use mock data when models unavailable | True |

## Running the Server

### Development

```
python server.py
```

### Production

For production deployments, it's recommended to use Gunicorn or uWSGI:

```
gunicorn -w 4 'app:create_app()'
```

## API Endpoints

### GET /

Home endpoint that returns server status.

### GET /api/risk/score/{address}

Get risk score for a protocol address.

### POST /api/anomaly/detect

Detect anomalies in protocol data.

**Request body:**
```json
{
  "address": "0x1234...",
  "features": {
    "tvl": 1000000,
    "volume": 50000,
    "tx_count": 120
  }
}
```

### POST /api/user/risk

Calculate risk for a user portfolio.

**Request body:**
```json
{
  "user_address": "0xabcd...",
  "exposures": [
    {
      "protocol_address": "0x1234...",
      "amount": 1000
    }
  ]
}
```

### GET /health

Health check endpoint for monitoring.

## Development

The codebase is structured to make it easy to enhance and extend:

- `server.py`: Legacy entry point (forwards to app.py)
- `app.py`: Main application using Flask factory pattern
- `src/models/`: ML model implementations
- `src/features/`: Feature extraction utilities

## License

Copyright © 2023 DeFAI Sentinel 