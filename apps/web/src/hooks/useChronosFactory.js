import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useContract } from '@thirdweb-dev/react';
import { WalletContext } from '../context/WalletProvider';
import { addresses } from '../config/addresses';
import { THIRDWEB_SDK_OPTIONS } from '../config/thirdweb';
import ChronosFactoryABI from '../config/abis/ChronosFactory.json';

/**
 * Custom hook for interacting with the ChronosFactory contract
 * Using ThirdWeb for enhanced smart contract interactions
 */
const useChronosFactory = () => {
  const { provider, account, chainId } = useContext(WalletContext);
  const [factoryContract, setFactoryContract] = useState(null);
  const [factoryAddress, setFactoryAddress] = useState(null);
  
  // Get factory address for the current network
  useEffect(() => {
    if (!chainId) return;
    
    try {
      const networkAddresses = addresses[chainId];
      if (!networkAddresses) {
        console.error(`No addresses configured for chainId ${chainId}`);
        return;
      }
      
      const factoryAddr = networkAddresses.ChronosFactory;
      if (!factoryAddr) {
        console.error('ChronosFactory address not found for this network');
        return;
      }
      
      setFactoryAddress(factoryAddr);
    } catch (error) {
      console.error('Error setting factory address:', error);
    }
  }, [chainId]);
  
  // Get ThirdWeb contract instance
  const { contract: thirdwebContract } = useContract(factoryAddress, ChronosFactoryABI);
    // Initialize contract using either ThirdWeb SDK or ethers.js as fallback
  useEffect(() => {
    if (!provider || !factoryAddress) return;
    
    try {
      if (thirdwebContract) {
        // Use ThirdWeb contract if available
        console.log('Using ThirdWeb SDK for ChronosFactory contract');
        
        // Verify that the contract has the required functions
        const hasCreateAgreement = typeof thirdwebContract.call === 'function';
        
        if (hasCreateAgreement) {
          console.log('ThirdWeb contract instance is valid with required methods');
          setFactoryContract(thirdwebContract);
        } else {
          console.warn('ThirdWeb contract instance missing required methods, falling back to ethers.js');
          throw new Error('Missing required methods');
        }
      } else {
        throw new Error('ThirdWeb contract not available');
      }
    } catch (error) {
      console.warn('ThirdWeb contract initialization failed, using ethers.js fallback:', error);
      
      // Fallback to ethers.js
      try {
        console.log('Using ethers.js for ChronosFactory contract');
        
        // Get ABI from imported JSON
        const abi = Array.isArray(ChronosFactoryABI) ? ChronosFactoryABI : ChronosFactoryABI.abi;
        if (!abi) {
          throw new Error('Invalid ABI format in config');
        }
        
        const contract = new ethers.Contract(
          factoryAddress,
          abi,
          provider.getSigner()
        );
        
        // Wrap ethers contract with a compatible interface
        const wrappedContract = {
          ...contract,
          call: async (functionName, args) => {
            const result = await contract[functionName](...args);
            return {
              receipt: await result.wait(),
              data: result
            };
          },
          events: {
            getAllEvents: async () => {
              // This is a simplified implementation
              const filter = contract.filters.AgreementCreated();
              return await contract.queryFilter(filter);
            }
          }
        };
        
        setFactoryContract(wrappedContract);
      } catch (ethersError) {
        console.error('Error initializing ethers contract fallback:', ethersError);
      }
    }
  }, [provider, factoryAddress, thirdwebContract]);
  
  /**
   * Create a new agreement using backend API
   */  const createAgreement = async (counterparty, description, deadline, value) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // First try to use the web3 contract directly if available
      if (factoryContract) {
        try {
          console.log('Attempting to create agreement directly with web3 contract');
          const valueInWei = ethers.utils.parseEther(value.toString());
          
          // Create agreement using web3 contract
          const tx = await factoryContract.call(
            "createAgreement", 
            [counterparty, description, deadline, valueInWei]
          );

          console.log('Contract transaction successful:', tx);
          
          return {
            tx: tx,
            wait: async () => {
              const receipt = await tx.receipt;
              console.log('Transaction receipt:', receipt);
              
              // Try to get the agreement address from events
              let agreementAddress = null;
              try {
                const events = await factoryContract.events.getAllEvents();
                const event = events.find(e => 
                  e.eventName === 'AgreementCreated' && 
                  e.transaction.transactionHash === receipt.transactionHash
                );
                
                if (event) {
                  agreementAddress = event.data.agreementAddress;
                  console.log('Found agreement address from events:', agreementAddress);
                }
              } catch (eventError) {
                console.warn('Could not get events:', eventError);
              }
              
              // If we couldn't get from events, try to get user agreements
              if (!agreementAddress) {
                try {
                  const userAgreements = await factoryContract.call("getUserAgreements", [account]);
                  if (userAgreements && userAgreements.length > 0) {
                    // Take the latest one
                    agreementAddress = userAgreements[userAgreements.length - 1];
                    console.log('Using latest user agreement:', agreementAddress);
                  }
                } catch (userAgreementsError) {
                  console.warn('Could not get user agreements:', userAgreementsError);
                }
              }
              
              return {
                transactionHash: receipt.transactionHash,
                logs: receipt.logs || [],
                agreementAddress: agreementAddress 
              };
            }
          };
        } catch (contractError) {
          console.warn('Direct contract call failed, falling back to API:', contractError);
          // Fall back to API call if direct contract call fails
        }
      }
      
      // Call API to create agreement (fallback)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      console.log('Sending create agreement request with:', {
        counterparty,
        description,
        deadline: new Date(deadline * 1000).toISOString(),
        value
      });
      
      const response = await fetch(`${API_URL}/agreements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counterparty,
          description,
          deadline,
          value
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to create agreement';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || 'Failed to create agreement';
          console.error('Server returned error:', errorData);
        } catch (jsonError) {
          console.error('Error parsing server response:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Agreement creation successful:', data);
      
      if (!data.transactionHash) {
        console.warn('No transaction hash in server response');
      }
      
      if (!data.agreementAddress && !data.note) {
        console.warn('No agreement address in server response and no note explaining why');
      }
      
      // Create a transaction-like object to maintain compatibility
      return {
        tx: {
          hash: data.transactionHash || 'unknown'
        },
        wait: async () => {
          // Return a receipt-like object
          return {
            transactionHash: data.transactionHash || 'unknown',
            logs: [],
            agreementAddress: data.agreementAddress || null
          };
        }
      };
    } catch (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }
  };
  
  /**
   * Get all agreements for the current account using backend API
   */
  const getUserAgreements = async () => {
    if (!account) {
      return [];
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/agreements/${account}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get agreements');
      }
      
      const data = await response.json();
      return data.agreements.map(agreement => agreement.address);
    } catch (error) {
      console.error('Error getting user agreements:', error);
      return [];
    }
  };
  
  return {
    factoryContract,
    factoryAddress,
    createAgreement,
    getUserAgreements
  };
};

export default useChronosFactory;
