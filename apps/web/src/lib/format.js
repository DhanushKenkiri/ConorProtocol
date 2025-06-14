/**
 * Formatting utility functions
 */

/**
 * Format an Ethereum address to short form
 * @param {string} address Full Ethereum address
 * @returns {string} Shortened address (e.g., 0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format ETH amount with proper decimals
 * @param {string|number} amount Amount in ETH
 * @returns {string} Formatted amount string
 */
export const formatEth = (amount) => {
  if (!amount) return '0 ETH';
  
  // Convert to number and format to max 4 decimal places
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = parsed.toFixed(4).replace(/\.0000$/, '');
  
  return `${formatted} ETH`;
};

/**
 * Format date to human readable string
 * @param {number} timestamp Timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export const formatDateFromMs = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};
