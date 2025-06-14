/**
 * Safe utility functions for handling BigNumber operations
 * Prevents errors when values are undefined or null
 */

/**
 * Safely convert a BigNumber to a regular number
 * Returns a default value if the input is undefined or not a BigNumber
 * 
 * @param {Object} bigNumber - The BigNumber object to convert
 * @param {number} defaultValue - Value to return if conversion fails
 * @returns {number} The converted number or default value
 */
export const safeToNumber = (bigNumber, defaultValue = 0) => {
  if (!bigNumber || typeof bigNumber.toNumber !== 'function') {
    return defaultValue;
  }
  
  try {
    return bigNumber.toNumber();
  } catch (error) {
    console.warn('Error converting BigNumber to number:', error);
    return defaultValue;
  }
};

/**
 * Format gas values to millions with M suffix
 * 
 * @param {Object} bigNumber - BigNumber to format
 * @param {number} defaultValue - Value to use if bigNumber is invalid
 * @returns {string} Formatted string with M suffix
 */
export const formatGasInMillions = (bigNumber, defaultValue = 0) => {
  const numberValue = safeToNumber(bigNumber, defaultValue);
  return `${(numberValue / 1000000).toFixed(2)}M`;
};

/**
 * Safely get nested property from an object
 * 
 * @param {Object} obj - The object to get property from
 * @param {string} path - Dot notation path to the property
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} The property value or default value
 */
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;
  
  const pathParts = path.split('.');
  let result = obj;
  
  for (const part of pathParts) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[part];
  }
  
  return result !== undefined ? result : defaultValue;
};
