const tf = require('@tensorflow/tfjs-node');

class AnomalyDetector {
  constructor() {
    this.model = null;
    this.meanStd = null;
  }

  async buildModel() {
    // Create a simple autoencoder for anomaly detection
    const inputDim = 5; // Number of features

    // Encoder
    const input = tf.input({shape: [inputDim]});
    const encoded = tf.layers.dense({
      units: 3,
      activation: 'relu'
    }).apply(input);

    // Decoder
    const decoded = tf.layers.dense({
      units: inputDim,
      activation: 'sigmoid'
    }).apply(encoded);

    // Create the model
    this.model = tf.model({
      inputs: input,
      outputs: decoded
    });

    // Compile the model
    this.model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
  }

  async train(data) {
    if (!this.model) {
      await this.buildModel();
    }

    // Normalize data
    const tensorData = this.preprocessData(data);

    // Train the model
    await this.model.fit(tensorData, tensorData, {
      epochs: 50,
      batchSize: 32,
      shuffle: true,
      validationSplit: 0.2
    });
  }

  async detectAnomalies(transactions) {
    if (!this.model) {
      throw new Error('Model not trained');
    }

    // Preprocess new data
    const tensorData = this.preprocessData(transactions);

    // Get reconstruction error
    const predicted = this.model.predict(tensorData);
    const reconstructionError = tf.metrics.meanSquaredError(tensorData, predicted);
    
    // Convert to array
    const errors = await reconstructionError.array();

    // Calculate anomaly scores (0-1 range)
    const scores = errors.map(error => {
      // Normalize error to 0-1 range using sigmoid
      return 1 / (1 + Math.exp(-error * 10));
    });

    return scores;
  }

  preprocessData(data) {
    // Extract features
    const features = data.map(tx => [
      tx.value,           // Transaction value
      tx.gasPrice,        // Gas price
      tx.timestamp,       // Timestamp
      tx.nonce,          // Nonce
      tx.gasLimit        // Gas limit
    ]);

    // Convert to tensor
    return tf.tensor2d(features);
  }

  async save(path) {
    if (!this.model) {
      throw new Error('No model to save');
    }
    await this.model.save(`file://${path}`);
  }

  async load(path) {
    this.model = await tf.loadLayersModel(`file://${path}`);
  }
}

module.exports = AnomalyDetector; 