// Chain ID utilities for Chronos Protocol
import { BASE_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID_HEX } from '../config/thirdweb';

/**
 * Format a chain ID as a properly padded hexadecimal string
 * This is important for wallet compatibility, especially MetaMask
 * 
 * @param {number} chainId - The chain ID as a decimal number
 * @returns {string} - The chain ID as a properly formatted hex string
 */
export const formatChainIdForWallet = (chainId) => {
  if (typeof chainId !== 'number') {
    try {
      chainId = parseInt(chainId);
    } catch (error) {
      console.error('Invalid chain ID format:', chainId);
      return null;
    }
  }
  
  // Convert to hex with proper padding (at least 6 characters after 0x)
  return '0x' + chainId.toString(16).padStart(6, '0');
};

/**
 * Normalize a chain ID to decimal format for consistent comparison
 * 
 * @param {string|number} chainId - The chain ID in any format (hex string, decimal string, or number)
 * @returns {number} - The chain ID as a decimal number
 */
export const normalizeChainId = (chainId) => {
  if (typeof chainId === 'string') {
    if (chainId.startsWith('0x')) {
      return parseInt(chainId, 16);
    }
    return parseInt(chainId, 10);
  }
  return chainId;
};

/**
 * For debugging purposes - analyze a chain ID and provide details
 * 
 * @param {string|number} chainId - The chain ID to analyze
 * @returns {object} - Chain ID analysis
 */
export const analyzeChainId = (chainId) => {
  const normalizedId = normalizeChainId(chainId);
  const formattedHex = formatChainIdForWallet(normalizedId);
  const incorrectHex = normalizedId ? '0x' + normalizedId.toString(16) : null;
  
  return {
    input: chainId,
    decimal: normalizedId,
    correctHexFormat: formattedHex,
    incorrectHexFormat: incorrectHex,
    isBaseSepoliaNetwork: normalizedId === BASE_SEPOLIA_CHAIN_ID,
    baseSepoliaDecimal: BASE_SEPOLIA_CHAIN_ID,
    baseSepoliaHex: BASE_SEPOLIA_CHAIN_ID_HEX,
    willWorkWithMetaMask: formattedHex === BASE_SEPOLIA_CHAIN_ID_HEX
  };
};

// Export a helper to check if a wallet error is related to chain ID formatting
export const isChainIdFormatError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  return (
    errorMessage.includes('Unrecognized chain ID') || 
    errorMessage.includes('wallet_switchEthereumChain') ||
    errorMessage.includes('Chain ID') ||
    errorMessage.includes('chainId')
  );
};

// Make debugging accessible globally for console use
if (typeof window !== 'undefined') {
  window.chainIdUtils = {
    formatChainIdForWallet,
    normalizeChainId,
    analyzeChainId,
    isChainIdFormatError,
    BASE_SEPOLIA_CHAIN_ID,
    BASE_SEPOLIA_CHAIN_ID_HEX
  };
}

export default {
  formatChainIdForWallet,
  normalizeChainId,
  analyzeChainId,
  isChainIdFormatError
};
