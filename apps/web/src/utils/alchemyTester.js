// Alchemy API Connection Tester
import { Alchemy, Network } from "alchemy-sdk";
import { ALCHEMY_API_KEY } from "../config/thirdweb.jsx";

/**
 * Tests the connection to Alchemy API and returns diagnostic information
 * @returns {Promise<Object>} Test results
 */
export const testAlchemyConnection = async () => {
  console.group('Alchemy API Connection Test');
  console.log('Using API Key:', ALCHEMY_API_KEY ? `${ALCHEMY_API_KEY.substring(0, 6)}...` : 'Not configured');
  
  try {
    // Configure Alchemy SDK
    const settings = {
      apiKey: ALCHEMY_API_KEY,
      network: Network.BASE_SEPOLIA
    };
    
    console.log('Network:', settings.network);
    
    // Initialize Alchemy SDK instance
    const alchemy = new Alchemy(settings);
    
    // Test basic API functionality
    console.log('Testing Alchemy connection...');
    
    // 1. Get latest block number
    const blockNumber = await alchemy.core.getBlockNumber();
    console.log('✅ Got latest block number:', blockNumber);
    
    // 2. Get current gas price
    const gasPrice = await alchemy.core.getGasPrice();
    const gasPriceGwei = (parseFloat(gasPrice) / 1e9).toFixed(2);
    console.log('✅ Got gas price:', gasPriceGwei, 'Gwei');
    
    // 3. Get chain ID
    const chainId = Network.BASE_SEPOLIA;
    console.log('✅ Using Chain ID:', chainId);
    
    console.log('✅ All Alchemy API tests passed!');
    console.groupEnd();
    
    return {
      success: true,
      blockNumber,
      gasPrice: gasPriceGwei,
      chainId,
      message: 'Successfully connected to Alchemy API'
    };
  } catch (error) {
    console.error('❌ Alchemy API test failed:', error);
    console.groupEnd();
    
    return {
      success: false,
      error: error.message || 'Failed to connect to Alchemy API',
      message: 'Alchemy API connection failed'
    };
  }
};

// Add this to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.testAlchemyConnection = testAlchemyConnection;
}

export default testAlchemyConnection;
