// API service for Chronos Protocol
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get user agreements
 * @param {string} address - The user's Ethereum address
 * @returns {Promise<Object>} - Object containing agreements array and any warnings/errors
 */
export const getUserAgreements = async (address) => {
  try {
    console.log(`Fetching agreements for ${address}`);
    
    // Add timeout to prevent long wait when server is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_URL}/agreements/${address}`, {
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Handle non-OK responses
    if (!response.ok) {
      // Try to get the error message if it's JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get agreements');
      } catch (parseError) {
        // If parsing fails, use the status text
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }
    
    // Parse the response as JSON
    const data = await response.json();
    
    // Log any warnings from the server
    if (data.warning) {
      console.warn('Server warning:', data.warning);
    }
    
    // Return the full response object with agreements array
    return {
      agreements: data.agreements || [],
      warning: data.warning
    };
  } catch (error) {
    // Check if it's a network connection error or timeout
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      console.warn('API Service unavailable - backend server not running');
      
      // Safely call showToast with fallback if function doesn't exist yet
      if (typeof window.showToast === 'function') {
        window.showToast('Server', 'Backend server not running. Check server logs or restart it with npm run start:backend', {
          autohide: true,
          delay: 8000
        });
      } else {
        console.error('API Service unavailable');
      }
      console.error('API Error - getUserAgreements:', error);
      
      // Return empty result when server is unavailable
      return { agreements: [], warning: 'Backend server not available' };
    } else {
      console.error('API Error - getUserAgreements:', error);
      throw error;
    }
  }
};

/**
 * Create a new agreement
 * @param {Object} agreementData - Agreement data
 * @param {string} agreementData.counterparty - Counterparty address
 * @param {string} agreementData.description - Agreement description
 * @param {number} agreementData.deadline - Agreement deadline timestamp
 * @param {number} agreementData.value - Agreement value in wei
 * @returns {Promise<Object>} - Created agreement data
 */
export const createAgreement = async ({ counterparty, description, deadline, value }) => {
  try {
    // Add timeout to prevent long wait when server is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_URL}/agreements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        counterparty,
        description,
        deadline,
        value
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create agreement');
    }
    
    return await response.json();
  } catch (error) {
    // Check for connection errors
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.code === 'ERR_CONNECTION_REFUSED') {
      if (typeof window.showToast === 'function') {
        window.showToast('Server Error', 'Could not connect to backend server. Please check if the server is running.', {
          autohide: true,
          delay: 8000
        });
      }
    }
    console.error('API Error - createAgreement:', error);
    throw error;
  }
};

/**
 * Get agreement details
 * @param {string} address - The agreement contract address
 * @returns {Promise<Object>} - Agreement details
 */
export const getAgreementDetails = async (address) => {
  try {
    const response = await fetch(`${API_URL}/agreement/${address}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get agreement details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error - getAgreementDetails:', error);
    throw error;
  }
};

/**
 * Update agreement state
 * @param {string} address - The agreement contract address
 * @param {number} newState - The new state value
 * @returns {Promise<Object>} - Response with transaction hash and new state
 */
export const updateAgreementState = async (address, newState) => {
  try {
    const response = await fetch(`${API_URL}/agreement/${address}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newState })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update agreement state');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error - updateAgreementState:', error);
    throw error;
  }
};
