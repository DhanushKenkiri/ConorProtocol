/**
 * Time-related utility functions
 */

/**
 * Convert timestamp to human-readable format
 * @param {number} timestamp Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Check if a deadline has passed
 * @param {number} deadline Unix timestamp in seconds
 * @returns {boolean} True if the deadline has passed
 */
export const isExpired = (deadline) => {
  const now = Math.floor(Date.now() / 1000);
  return now > deadline;
};

/**
 * Get time remaining until a deadline
 * @param {number} deadline Unix timestamp in seconds
 * @returns {string} Human-readable time remaining
 */
export const getTimeRemaining = (deadline) => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = deadline - now;
  
  if (remaining <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
};
