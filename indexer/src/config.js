const dotenv = require('dotenv');
dotenv.config();

// Default values
const defaults = {
  port: 3002,
  logLevel: 'info',
  mongoUri: 'mongodb://localhost:27017/defai-sentinel',
  networks: {
    mainnet: {
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      chainId: 1,
      contractAddress: '0x0000000000000000000000000000000000000000', // Update with actual contract address
      startBlock: 0
    },
    sepolia: {
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      chainId: 11155111,
      contractAddress: '0x0000000000000000000000000000000000000000', // Update with actual contract address
      startBlock: 0
    },
    localhost: {
      rpcUrl: 'http://localhost:8545',
      chainId: 31337,
      contractAddress: '0x0000000000000000000000000000000000000000', // Update with actual contract address
      startBlock: 0
    }
  },
  api: {
    baseUrl: 'http://localhost:3000'
  },
  indexing: {
    batchSize: 500,
    maxBlocksPerRun: 1000,
    pollingInterval: 15000 // 15 seconds
  }
};

const config = {
  // Server config
  port: process.env.PORT || defaults.port,
  logLevel: process.env.LOG_LEVEL || defaults.logLevel,
  
  // MongoDB URI
  mongoUri: process.env.MONGO_URI || defaults.mongoUri,
  
  // Default network to use
  network: process.env.NETWORK || 'localhost',
  
  // Network configurations
  networks: {
    mainnet: {
      rpcUrl: process.env.MAINNET_RPC_URL || defaults.networks.mainnet.rpcUrl,
      chainId: 1,
      contractAddress: process.env.MAINNET_CONTRACT_ADDRESS || defaults.networks.mainnet.contractAddress,
      startBlock: parseInt(process.env.MAINNET_START_BLOCK || defaults.networks.mainnet.startBlock)
    },
    sepolia: {
      rpcUrl: process.env.SEPOLIA_RPC_URL || defaults.networks.sepolia.rpcUrl,
      chainId: 11155111,
      contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS || defaults.networks.sepolia.contractAddress,
      startBlock: parseInt(process.env.SEPOLIA_START_BLOCK || defaults.networks.sepolia.startBlock)
    },
    localhost: {
      rpcUrl: process.env.LOCALHOST_RPC_URL || defaults.networks.localhost.rpcUrl,
      chainId: 31337,
      contractAddress: process.env.LOCALHOST_CONTRACT_ADDRESS || defaults.networks.localhost.contractAddress,
      startBlock: parseInt(process.env.LOCALHOST_START_BLOCK || defaults.networks.localhost.startBlock)
    }
  },
  
  // API config
  api: {
    baseUrl: process.env.API_BASE_URL || defaults.api.baseUrl
  },
  
  // Indexing configuration
  indexing: {
    batchSize: parseInt(process.env.INDEXING_BATCH_SIZE || defaults.indexing.batchSize),
    maxBlocksPerRun: parseInt(process.env.INDEXING_MAX_BLOCKS_PER_RUN || defaults.indexing.maxBlocksPerRun),
    pollingInterval: parseInt(process.env.INDEXING_POLLING_INTERVAL || defaults.indexing.pollingInterval)
  }
};

module.exports = config; 