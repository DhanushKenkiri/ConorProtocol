// Alchemy SDK utility for server-side integrations
const { Alchemy, Network } = require("alchemy-sdk");
require('dotenv').config({ path: '../.env' });

/**
 * Initialize the Alchemy SDK for Base Sepolia
 * @returns {Alchemy|null} Configured Alchemy SDK instance or null if initialization fails
 */
const initializeAlchemySDK = () => {
  try {
    const apiKey = process.env.ALCHEMY_API_KEY;
    
    if (!apiKey) {
      console.warn('ALCHEMY_API_KEY not found in environment variables. Using fallback.');
      // Use a fallback API key if available
      const fallbackApiKey = "JHvJUBwzQXxjN9ByrpdPvHVJrKFO7OmW";
      
      // Configure Alchemy SDK with fallback
      const settings = {
        apiKey: fallbackApiKey,
        network: Network.BASE_SEPOLIA,
        maxRetries: 10
      };
      
      console.log("Using fallback Alchemy API key");
      return new Alchemy(settings);
    }
    
    // Configure Alchemy SDK
    const settings = {
      apiKey,
      network: Network.BASE_SEPOLIA,
      maxRetries: 10
    };
    
    // Return SDK instance
    console.log("Initializing Alchemy SDK with provided API key");
    return new Alchemy(settings);
  } catch (error) {
    console.error('Failed to initialize Alchemy SDK:', error);
    return null; // Return null instead of throwing
  }
};

/**
 * Get NFT metadata for a token
 * @param {string} contractAddress - The NFT contract address
 * @param {string} tokenId - The token ID
 * @returns {Promise<Object>} - NFT metadata
 */
const getNFTMetadata = async (contractAddress, tokenId) => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      return { error: 'Service unavailable', name: 'Unknown NFT', tokenId };
    }
    
    return await alchemy.nft.getNftMetadata(contractAddress, tokenId);
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return { error: error.message, name: 'Unknown NFT', tokenId };
  }
};

/**
 * Get all NFTs owned by an address
 * @param {string} ownerAddress - The owner's address
 * @returns {Promise<Array>} - Array of NFTs
 */
const getOwnedNFTs = async (ownerAddress) => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      return { ownedNfts: [] };
    }
    
    return await alchemy.nft.getNftsForOwner(ownerAddress);
  } catch (error) {
    console.error('Error fetching owned NFTs:', error);
    return { ownedNfts: [] };
  }
};

/**
 * Get transaction history for an address
 * @param {string} address - The address to get history for
 * @returns {Promise<Array>} - Array of transactions
 */
const getAddressHistory = async (address) => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      return [];
    }
    
    const result = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: address,
      category: ["external", "internal", "erc20", "erc721", "erc1155"],
    });
    
    return result?.transfers || [];
  } catch (error) {
    console.error('Error fetching address history:', error);
    return [];
  }
};

/**
 * Get the current gas price from Alchemy
 * @returns {Promise<BigNumber>} - Current gas price in wei
 */
const getGasPrice = async () => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      return 0;
    }
    
    return await alchemy.core.getGasPrice();
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return 0; // Return 0 instead of throwing
  }
};

/**
 * Get recommended gas settings for Base Sepolia
 * @returns {Promise<Object>} - Object with low, medium, high gas price recommendations
 */
const getGasRecommendations = async () => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      // Return default values
      return {
        low: { price: 0.1, estimatedSeconds: 60 },
        medium: { price: 0.2, estimatedSeconds: 30 },
        high: { price: 0.3, estimatedSeconds: 15 }
      };
    }
    
    const gasPrice = await alchemy.core.getGasPrice();
    
    // Convert BigNumber to number and then to gwei
    const gasPriceGwei = Number(gasPrice) / 1e9;
    
    // Create recommendations based on current gas price
    return {
      low: {
        price: gasPriceGwei * 0.9,
        estimatedSeconds: 60
      },
      medium: {
        price: gasPriceGwei,
        estimatedSeconds: 30
      },
      high: {
        price: gasPriceGwei * 1.1,
        estimatedSeconds: 15
      }
    };
  } catch (error) {
    console.error('Error creating gas recommendations:', error);
    // Return fallback values
    return {
      low: { price: 0.1, estimatedSeconds: 60 },
      medium: { price: 0.2, estimatedSeconds: 30 },
      high: { price: 0.3, estimatedSeconds: 15 }
    };
  }
};

/**
 * Monitor contract events using Alchemy's WebSocket
 * @param {string} contractAddress - The contract address to monitor
 * @param {Array<string>} eventNames - Array of event names to monitor
 * @param {Function} callback - Callback function when events are detected
 * @returns {Object} - Subscription object with unsubscribe method
 */
const monitorContractEvents = (contractAddress, eventNames, callback) => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      // Return a dummy subscription object
      return {
        unsubscribe: () => console.log('No subscription to unsubscribe from'),
        removeAllListeners: () => {}
      };
    }
    
    // Return dummy topics if ethers is not available
    const topics = eventNames.map(event => {
      try {
        return ethers.utils.id(event);
      } catch (err) {
        console.error('Error creating event topic:', err);
        return event; // Fallback to using the event name directly
      }
    });
    
    // Subscribe to contract events
    return alchemy.ws.on(
      {
        address: contractAddress,
        topics
      },
      callback
    );
  } catch (error) {
    console.error('Error monitoring contract events:', error);
    // Return a dummy subscription object
    return {
      unsubscribe: () => console.log('Error subscription - nothing to unsubscribe from'),
      removeAllListeners: () => {}
    };
  }
};

/**
 * Get transaction details with enhanced metadata
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} - Detailed transaction information
 */
const getEnhancedTransactionDetails = async (txHash) => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      return { 
        status: 'unknown',
        error: 'Alchemy service not available',
        transaction: null,
        confirmations: 0
      };
    }
    
    const [transaction, receipt, block] = await Promise.all([
      alchemy.core.getTransaction(txHash).catch(err => {
        console.error('Error getting transaction:', err);
        return null;
      }),
      alchemy.core.getTransactionReceipt(txHash).catch(err => {
        console.error('Error getting transaction receipt:', err);
        return null;
      }),
      alchemy.core.getBlock('latest').catch(err => {
        console.error('Error getting latest block:', err);
        return { number: 0, timestamp: Math.floor(Date.now() / 1000) };
      })
    ]);
    
    if (!transaction) {
      return { status: 'not-found' };
    }
    
    let status = 'pending';
    let confirmations = 0;
    let gasUsed = null;
    
    if (receipt) {
      status = receipt.status ? 'confirmed' : 'failed';
      confirmations = transaction.blockNumber && block.number ? 
        block.number - transaction.blockNumber : 0;
      gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : '0';
    }
    
    return {
      status,
      confirmations,
      transaction,
      receipt,
      gasUsed,
      timestamp: block.timestamp || Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Error getting enhanced transaction details:', error);
    return {
      status: 'error',
      error: error.message || 'Unknown error',
      transaction: null,
      confirmations: 0
    };
  }
};

/**
 * Get transaction count and nonce for an address
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} - Transaction count and nonce
 */
const getAccountNonce = async (address) => {
  try {
    const alchemy = initializeAlchemySDK();
    if (!alchemy) {
      console.warn('Alchemy SDK not initialized properly');
      return {
        confirmed: 0,
        pending: 0,
        error: 'Alchemy service not available'
      };
    }
    
    const [transactionCount, pendingNonce] = await Promise.all([
      alchemy.core.getTransactionCount(address).catch(err => {
        console.error('Error getting transaction count:', err);
        return 0;
      }),
      alchemy.core.getTransactionCount(address, 'pending').catch(err => {
        console.error('Error getting pending nonce:', err);
        return 0;
      })
    ]);
    
    return {
      confirmed: transactionCount,
      pending: pendingNonce
    };
  } catch (error) {
    console.error('Error getting account nonce:', error);
    return {
      confirmed: 0,
      pending: 0,
      error: error.message || 'Unknown error'
    };
  }
};

// Export all functions
module.exports = {
  initializeAlchemySDK,
  getNFTMetadata,
  getOwnedNFTs,
  getGasPrice,
  getGasRecommendations,
  monitorContractEvents,
  getEnhancedTransactionDetails,
  getAccountNonce
};
