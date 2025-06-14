const { ethers } = require('ethers');
const { Alchemy, Network } = require('alchemy-sdk');
require('dotenv').config();

// Load environment variables
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!ALCHEMY_API_KEY) {
  console.error('ALCHEMY_API_KEY not found in environment variables');
  process.exit(1);
}

if (!PRIVATE_KEY) {
  console.error('PRIVATE_KEY not found in environment variables');
  process.exit(1);
}

// Initialize Alchemy SDK
const settings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.BASE_SEPOLIA,
};
const alchemy = new Alchemy(settings);

/**
 * Get optimal gas price using Alchemy data
 * @param {string} priority - 'low', 'medium', or 'high'
 * @returns {Promise<Object>} - Gas price information
 */
async function getOptimalGasPrice(priority = 'medium') {
  try {
    // Get current gas price
    const gasPrice = await alchemy.core.getGasPrice();
    const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
    
    // Calculate gas price based on priority
    let multiplier;
    switch (priority) {
      case 'low':
        multiplier = 0.9;
        break;
      case 'high':
        multiplier = 1.1;
        break;
      case 'medium':
      default:
        multiplier = 1.0;
    }
    
    const adjustedGasPrice = gasPriceGwei * multiplier;
    const maxFeePerGas = ethers.utils.parseUnits(adjustedGasPrice.toFixed(2), 'gwei');
    const maxPriorityFeePerGas = ethers.utils.parseUnits((adjustedGasPrice * 0.1).toFixed(2), 'gwei');
    
    return {
      gasPrice: ethers.utils.parseUnits(adjustedGasPrice.toFixed(2), 'gwei'),
      maxFeePerGas,
      maxPriorityFeePerGas,
      formatted: {
        gasPrice: `${adjustedGasPrice.toFixed(2)} Gwei`,
        maxFeePerGas: `${ethers.utils.formatUnits(maxFeePerGas, 'gwei')} Gwei`,
        maxPriorityFeePerGas: `${ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei')} Gwei`,
      }
    };
  } catch (error) {
    console.error('Error getting optimal gas price:', error);
    throw error;
  }
}

/**
 * Send a transaction with optimal gas price
 * @param {Object} txParams - Transaction parameters
 * @param {string} priority - Gas price priority
 * @returns {Promise<Object>} - Transaction result
 */
async function sendTransactionWithOptimalGas(txParams, priority = 'medium') {
  try {
    // Get optimal gas price
    const gasPriceData = await getOptimalGasPrice(priority);
    console.log(`Using optimal gas price (${priority} priority): ${gasPriceData.formatted.gasPrice}`);
    
    // Create provider and wallet
    const provider = new ethers.providers.AlchemyProvider(
      Network.BASE_SEPOLIA, 
      ALCHEMY_API_KEY
    );
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Prepare transaction with optimal gas
    const transaction = {
      ...txParams,
      gasPrice: gasPriceData.gasPrice
    };
    
    // Send transaction
    console.log('Sending transaction with the following params:');
    console.log(JSON.stringify({
      to: transaction.to,
      value: transaction.value?.toString() || '0',
      gasPrice: gasPriceData.formatted.gasPrice,
    }, null, 2));
    
    const tx = await wallet.sendTransaction(transaction);
    console.log(`Transaction sent: ${tx.hash}`);
    console.log('Waiting for confirmation...');
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    console.log('Transaction confirmed!');
    console.log(`Block number: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    return {
      hash: tx.hash,
      receipt,
      success: true
    };
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}

module.exports = {
  getOptimalGasPrice,
  sendTransactionWithOptimalGas,
  alchemy
};
