// Utility for testing ThirdWeb smart contract interactions
import { useSDK } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { CHRONOS_FACTORY_ADDRESS } from "../config/thirdweb";
import ChronosFactoryAbi from "../config/abis/ChronosFactory.json";

/**
 * Tests the connection to ThirdWeb and smart contract functionality
 * @returns {Promise<Object>} Test results
 */
export const testContractConnection = async (sdk) => {
  console.group('ThirdWeb Smart Contract Connection Test');
  
  try {
    if (!sdk) {
      throw new Error('ThirdWeb SDK not initialized');
    }
    
    console.log('Testing ThirdWeb SDK connection...');
    
    // 1. Check if connected to the right network
    const network = await sdk.getChainId();
    console.log('✅ Connected to network ID:', network);
    
    // 2. Check if we can get the signer
    const signer = await sdk.getSigner();
    console.log('✅ Got signer address:', await signer.getAddress());
    
    // 3. Attempt to connect to the ChronosFactory contract
    console.log('Attempting to connect to ChronosFactory at:', CHRONOS_FACTORY_ADDRESS);
    const contract = await sdk.getContract(
      CHRONOS_FACTORY_ADDRESS, 
      ChronosFactoryAbi
    );
    
    console.log('✅ Successfully connected to contract');
    
    // 4. Try a read-only method to verify contract interaction
    const name = await contract.call("name");
    console.log('✅ Contract name:', name);
    
    // 5. Get contract owner
    const owner = await contract.call("owner");
    console.log('✅ Contract owner:', owner);
    
    console.log('✅ All ThirdWeb contract tests passed!');
    console.groupEnd();
    
    return {
      success: true,
      contractName: name,
      contractOwner: owner,
      networkId: network,
      message: 'Successfully connected to ThirdWeb SDK and smart contract'
    };
  } catch (error) {
    console.error('❌ ThirdWeb contract test failed:', error);
    console.groupEnd();
    
    return {
      success: false,
      error: error.message || 'Failed to connect to smart contract',
      message: 'ThirdWeb SDK or contract connection failed'
    };
  }
};

// Hook for testing ThirdWeb contract interactions
export const useContractTest = () => {
  const sdk = useSDK();
  
  const runTest = async () => {
    if (!sdk) {
      return {
        success: false,
        error: 'ThirdWeb SDK not initialized',
        message: 'Connect your wallet first'
      };
    }
    
    return await testContractConnection(sdk);
  };
  
  return { runTest };
};

export default useContractTest;
