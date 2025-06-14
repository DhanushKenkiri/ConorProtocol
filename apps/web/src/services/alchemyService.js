import { Alchemy, Network } from "alchemy-sdk";
import { ALCHEMY_API_KEY } from "../config/thirdweb.jsx";

// Configure Alchemy SDK
const settings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.BASE_SEPOLIA
};

// Initialize Alchemy SDK instance with error handling
let alchemy;
let lastRetryTimestamp = 0;
const RETRY_INTERVAL = 30000; // 30 seconds between retry attempts

// Network health tracking
let networkHealthy = true;
let networkRetries = 0;
const MAX_RETRIES = 3;
const BACKOFF_MULTIPLIER = 1.5;

// Function to initialize Alchemy with advanced retry logic
const initAlchemy = async () => {
  try {
    alchemy = new Alchemy(settings);
    console.log("Alchemy SDK initialized successfully");
    networkHealthy = true;
    networkRetries = 0;
    return true;
  } catch (error) {
    console.error("Failed to initialize Alchemy SDK:", error);
    alchemy = null;
    networkHealthy = false;
    return false;
  }
};

// Function to handle auto-recovery from network issues
const autoRecovery = async () => {
  if (!networkHealthy && networkRetries < MAX_RETRIES) {
    const delay = Math.pow(BACKOFF_MULTIPLIER, networkRetries) * 1000; // Exponential backoff
    console.log(`Attempting Alchemy recovery in ${delay}ms (attempt ${networkRetries + 1}/${MAX_RETRIES})`);
    
    setTimeout(async () => {
      networkRetries++;
      const success = await initAlchemy();
      if (success) {
        console.log("Alchemy SDK recovered successfully");
      } else if (networkRetries < MAX_RETRIES) {
        autoRecovery(); // Try again with increased backoff
      } else {
        console.error("Max retries reached, Alchemy service unavailable");
      }
    }, delay);
  }
};

// Initial attempt
initAlchemy().then(success => {
  if (!success) {
    autoRecovery();
  }
});

// Create retryable Alchemy calls function with enhanced error handling
const withRetry = async (fn, fallback, maxAttempts = 2) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      attempts++;
      console.warn(`Alchemy operation failed (attempt ${attempts}/${maxAttempts}): ${error.message}`);
      
      // Mark network as unhealthy if we've exhausted retries
      if (attempts >= maxAttempts) {
        networkHealthy = false;
        
        // Check if we should retry initialization
        const now = Date.now();
        if (now - lastRetryTimestamp > RETRY_INTERVAL) {
          lastRetryTimestamp = now;
          console.log("Attempting to reinitialize Alchemy SDK...");
          const success = await initAlchemy();
          if (!success) {
            autoRecovery();
          }
        }
        
        // Return fallback value if all attempts failed
        return fallback;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Increasing delay
    }
  }
};

/**
 * AlchemyService class for handling Alchemy API interactions
 */
class AlchemyService {
  constructor() {
    this.alchemy = alchemy;
  }
  
  // Helper method to check if Alchemy is initialized
  isInitialized() {
    return this.alchemy !== null && this.alchemy !== undefined;
  }
  /**
   * Get transaction count for an address
   * @param {string} address - The wallet address
   * @returns {Promise<number>} - The transaction count
   */
  async getTransactionCount(address) {
    try {
      if (!this.isInitialized()) {
        console.warn('Alchemy SDK not initialized properly');
        return 0;
      }
      return await this.alchemy.core.getTransactionCount(address);
    } catch (error) {
      console.error('Error getting transaction count:', error);
      return 0;
    }
  }
  /**
   * Get tokens owned by an address
   * @param {string} address - The wallet address
   * @returns {Promise<Array>} - Array of tokens
   */
  async getTokenBalances(address) {
    try {
      if (!this.isInitialized()) {
        console.warn('Alchemy SDK not initialized properly');
        return [];
      }
      const { tokens } = await this.alchemy.core.getTokenBalances(address);
      return tokens;
    } catch (error) {
      console.error('Error getting token balances:', error);
      return [];
    }
  }
  /**
   * Get NFTs owned by an address
   * @param {string} address - The wallet address
   * @returns {Promise<Array>} - Array of NFTs
   */
  async getNftsForOwner(address) {
    try {
      if (!this.isInitialized()) {
        console.warn('Alchemy SDK not initialized properly');
        return { ownedNfts: [] };
      }
      const nfts = await this.alchemy.nft.getNftsForOwner(address);
      return nfts;
    } catch (error) {
      console.error('Error getting NFTs:', error);
      return { ownedNfts: [] };
    }
  }  /**
   * Get current gas price
   * @returns {Promise<string>} - The gas price in Gwei
   */
  async getGasPrice() {
    if (!this.isInitialized()) {
      console.warn('Alchemy SDK not initialized properly');
      return "0.00";
    }
    
    return withRetry(async () => {
      const gasPrice = await this.alchemy.core.getGasPrice();
      // Convert Wei to Gwei (divide by 10^9)
      return (Number(gasPrice) / 1e9).toFixed(2);
    }, "0.00");
  }  /**
   * Get latest block number
   * @returns {Promise<number>} - The latest block number
   */
  async getBlockNumber() {
    if (!this.isInitialized()) {
      console.warn('Alchemy SDK not initialized properly');
      return 0;
    }
    
    return withRetry(async () => {
      return await this.alchemy.core.getBlockNumber();
    }, 0); // Return 0 as fallback value to prevent UI errors
  }  /**
   * Set up a mempool monitor to watch for new blocks
   * @param {function} callback - Called when a new block is found
   * @returns {object} - The subscription object
   */
  monitorMempool(callback) {
    // Create dummy subscription object for fallback
    const dummySubscription = {
      unsubscribe: () => console.log('No subscription to unsubscribe from'),
      removeAllListeners: () => {},
      isActive: false
    };
    
    if (!this.isInitialized()) {
      console.warn('Alchemy SDK not initialized properly');
      return dummySubscription;
    }
    
    try {
      // Don't use websocket if network issues are detected
      if (window._alchemyNetworkIssues) {
        console.warn('Network issues detected, skipping mempool monitoring');
        return dummySubscription;
      }
      
      // Subscribe to pending transactions with error handling
      const subscription = this.alchemy.ws.on("block", (blockNumber) => {
        try {
          if (callback && typeof callback === 'function') {
            callback(blockNumber);
          }
        } catch (callbackError) {
          console.error('Error in mempool callback:', callbackError);
        }
      });
      
      // Add error handler to the websocket
      if (this.alchemy.ws._websocket) {
        this.alchemy.ws._websocket.onerror = (e) => {
          console.warn('Alchemy websocket error:', e);
          window._alchemyNetworkIssues = true;
          
          // Try to auto-recover after a timeout
          setTimeout(() => {
            window._alchemyNetworkIssues = false;
          }, 60000); // Reset after 1 minute
        };
      }
      
      return subscription;
    } catch (error) {
      console.error('Error monitoring mempool:', error);
      window._alchemyNetworkIssues = true;
      
      // Reset the flag after a timeout
      setTimeout(() => {
        window._alchemyNetworkIssues = false;
      }, 60000); // Reset after 1 minute
      
      return dummySubscription;
    }
  }
  /**
   * Get mempool transactions for an address
   * @param {string} address - The wallet address
   * @returns {Promise<Array>} - Array of pending transactions
   */
  async getPendingTransactions(address) {
    try {
      if (!this.isInitialized()) {
        console.warn('Alchemy SDK not initialized properly');
        return [];
      }
      
      const pendingTransactions = await this.alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: ["external", "internal", "erc20", "erc721", "erc1155"],
        excludeZeroValue: false,
        maxCount: 10,
        fromBlock: "0x0",
        toBlock: "latest"
      });
      
      return pendingTransactions?.transfers || [];
    } catch (error) {
      console.error('Error getting pending transactions:', error);
      return []; // Return empty array instead of throwing
    }
  }
  /**
   * Get contract metadata
   * @param {string} contractAddress - Contract address to query
   * @returns {Promise<Object>} - Contract metadata
   */
  async getContractMetadata(contractAddress) {
    try {
      if (!this.isInitialized()) {
        console.warn('Alchemy SDK not initialized properly');
        return { name: 'Unknown', symbol: 'N/A', decimals: 18, logo: null };
      }
      
      const metadata = await this.alchemy.core.getTokenMetadata(contractAddress);
      return metadata || { name: 'Unknown', symbol: 'N/A', decimals: 18, logo: null };
    } catch (error) {
      console.error('Error getting contract metadata:', error);
      return { name: 'Unknown', symbol: 'N/A', decimals: 18, logo: null }; // Return default data instead of throwing
    }
  }
  /**
   * Get transaction receipts
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} - Transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      if (!this.isInitialized()) {
        console.warn('Alchemy SDK not initialized properly');
        return null;
      }
      
      return await this.alchemy.core.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return null; // Return null instead of throwing
    }
  }
  /**
   * Get transaction confirmation status
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} - Transaction status with confirmations and details
   */
  async getTransactionStatus(txHash) {
    try {
      if (!this.isInitialized()) {
        console.warn('Alchemy SDK not initialized properly');
        return { status: 'unknown', error: 'Alchemy service not initialized' };
      }
      
      const tx = await this.alchemy.core.getTransaction(txHash);
      const receipt = await this.alchemy.core.getTransactionReceipt(txHash);
      const currentBlock = await this.alchemy.core.getBlockNumber();
      
      if (!tx) {
        return { status: 'not-found' };
      }
      
      if (!receipt) {
        return {
          status: 'pending',
          tx
        };
      }
      
      const confirmations = tx.blockNumber ? currentBlock - tx.blockNumber : 0;
      
      return {
        status: receipt.status ? 'confirmed' : 'failed',
        confirmations,
        receipt,
        tx
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { status: 'error', error: error.message || 'Unknown error' }; // Return error status instead of throwing
    }
  }
}

// Create and export a singleton instance
const alchemyService = new AlchemyService();
export default alchemyService;
