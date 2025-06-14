// System validation script for Chronos Protocol
import { ALCHEMY_API_KEY, BASE_SEPOLIA_CHAIN_ID, CHRONOS_FACTORY_ADDRESS } from '../config/thirdweb';
import { debugChainId } from './chainDebugger';

/**
 * Validates the system configuration and reports any issues
 * @returns {Promise<Object>} Validation results
 */
export const validateSystem = async () => {
  console.group('🧪 Chronos Protocol System Validation');
  const results = {
    config: {
      valid: true,
      issues: []
    },
    network: {
      valid: false,
      issues: []
    },
    api: {
      valid: true,
      issues: []
    }
  };

  // 1. Config Validation
  console.log('Validating configuration...');
  
  if (!ALCHEMY_API_KEY) {
    results.config.valid = false;
    results.config.issues.push('Missing Alchemy API Key');
    console.warn('⚠️ No Alchemy API key found in configuration');
  } else if (ALCHEMY_API_KEY === 'your-api-key-here' || ALCHEMY_API_KEY.includes('your-api-key')) {
    results.config.valid = false;
    results.config.issues.push('Using default/placeholder Alchemy API Key');
    console.warn('⚠️ Using default/placeholder Alchemy API Key');
  }
  
  if (!CHRONOS_FACTORY_ADDRESS) {
    results.config.valid = false;
    results.config.issues.push('Missing Chronos Factory contract address');
    console.warn('⚠️ No contract address found for ChronosFactory');
  }
  
  // 2. Network Validation
  console.log('Validating network connection...');
  
  try {
    if (window.ethereum) {
      const chainInfo = await debugChainId();
      
      if (chainInfo.isBaseSepoliaNetwork) {
        results.network.valid = true;
        console.log('✅ Connected to Base Sepolia network');
      } else {
        results.network.issues.push(`Connected to wrong network: ${chainInfo.parsedChainId} (expected: ${BASE_SEPOLIA_CHAIN_ID})`);
        console.warn(`⚠️ Not connected to Base Sepolia (chainId: ${chainInfo.parsedChainId})`);
      }
    } else {
      results.network.issues.push('No Web3 provider detected');
      console.warn('⚠️ No Web3 provider detected (e.g. MetaMask)');
    }
  } catch (error) {
    results.network.issues.push(`Network detection error: ${error.message}`);
    console.error('❌ Error detecting network:', error);
  }
  
  // 3. API Validation - basic connectivity check
  console.log('Validating API connections...');
  
  try {
    // Simple fetch to check if backend is running
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${apiUrl}/health`, { 
      signal: controller.signal 
    }).finally(() => clearTimeout(timeoutId));
    
    if (response.ok) {
      console.log('✅ Backend API is reachable');
    } else {
      results.api.valid = false;
      results.api.issues.push(`API returned error: ${response.status} ${response.statusText}`);
      console.warn(`⚠️ Backend API returned error: ${response.status}`);
    }
  } catch (error) {
    results.api.valid = false;
    
    if (error.name === 'AbortError') {
      results.api.issues.push('API request timed out - backend may be down');
      console.warn('⚠️ Backend API request timed out - is the server running?');
    } else {
      results.api.issues.push(`API error: ${error.message}`);
      console.warn('⚠️ Error connecting to backend API:', error.message);
    }
  }
  
  // Summarize results
  console.log('--- Validation Summary ---');
  console.log(`Configuration: ${results.config.valid ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`Network: ${results.network.valid ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`API: ${results.api.valid ? '✅ OK' : '❌ Issues Found'}`);
  console.groupEnd();
  
  return {
    valid: results.config.valid && results.network.valid && results.api.valid,
    results
  };
};

// Add this to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.validateSystem = validateSystem;
}

export default validateSystem;
