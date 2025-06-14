// Chain ID debugger utility
import { BASE_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID_HEX } from '../config/thirdweb.jsx';

// Helper function to check if on Base Sepolia network
export const debugChainId = async () => {
  try {
    // Check if MetaMask is available
    if (window.ethereum) {
      console.group('Chain Debugger');
      
      // Get current chainId from MetaMask
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const parsedChainId = parseInt(currentChainId, 16);
        console.log('Raw chainId from MetaMask:', currentChainId);
      console.log('Parsed chainId (decimal):', parsedChainId);
      console.log('Expected Base Sepolia Chain ID (decimal):', BASE_SEPOLIA_CHAIN_ID);
      console.log('Expected Base Sepolia Chain ID (hex):', BASE_SEPOLIA_CHAIN_ID_HEX);
      console.log('Is on Base Sepolia?', parsedChainId === BASE_SEPOLIA_CHAIN_ID);
      console.log('Raw hex comparison:', currentChainId === BASE_SEPOLIA_CHAIN_ID_HEX);
      
      console.groupEnd();
        return {
        rawChainId: currentChainId,
        parsedChainId,
        expectedChainId: BASE_SEPOLIA_CHAIN_ID, 
        expectedChainIdHex: BASE_SEPOLIA_CHAIN_ID_HEX,
        isBaseSepoliaNetwork: parsedChainId === BASE_SEPOLIA_CHAIN_ID,
        rawHexMatches: currentChainId.toLowerCase() === BASE_SEPOLIA_CHAIN_ID_HEX.toLowerCase()
      };
    }
    
    console.warn('MetaMask not available');
    return null;
  } catch (error) {
    console.error('Error debugging chain ID:', error);
    return null;
  }
};

// Add this to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.debugChainId = debugChainId;
}

export default debugChainId;
