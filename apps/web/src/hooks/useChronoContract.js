import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useContract, useContractEvents } from '@thirdweb-dev/react';
import { WalletContext } from '../context/WalletProvider';
import ChronoContractABI from '../config/abis/ChronoContract.json';

/**
 * Custom hook for interacting with a ChronoContract
 * Leveraging ThirdWeb SDK for smart contract interactions
 */
const useChronoContract = (contractAddress) => {
  const { provider } = useContext(WalletContext);
  const [contract, setContract] = useState(null);
  const [contractDetails, setContractDetails] = useState(null);
  const [contractState, setContractState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get contract with ThirdWeb hooks
  const { contract: thirdwebContract } = useContract(contractAddress, ChronoContractABI);
  
  // Listen to contract events with ThirdWeb
  const { data: stateChangedEvents } = useContractEvents(
    thirdwebContract,
    "StateChanged",
    { subscribe: true }
  );
  
  // Update state when new events come in
  useEffect(() => {
    if (stateChangedEvents && stateChangedEvents.length > 0) {
      const latestEvent = stateChangedEvents[0];
      setContractState(parseInt(latestEvent.data.toString()));
    }
  }, [stateChangedEvents]);
  
  // Initialize contract using API and ThirdWeb
  useEffect(() => {
    if (!contractAddress) return;
    
    const initContract = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (thirdwebContract) {
          // Use ThirdWeb contract if available
          console.log('Using ThirdWeb SDK for ChronoContract');
          setContract(thirdwebContract);
        } else if (provider) {
          // Fallback to ethers.js
          console.log('Using ethers.js for ChronoContract');
          const contractInstance = new ethers.Contract(
            contractAddress,
            ChronoContractABI,
            provider.getSigner()
          );
          
          setContract(contractInstance);
          
          // Listen for state changes with ethers.js
          const filter = contractInstance.filters.StateChanged();
          contractInstance.on(filter, (newState) => {
            setContractState(parseInt(newState.toString()));
          });
        }
        
        // Load contract data from API
        await loadContractDataFromAPI();
        
        return () => {
          // Clean up event listener
          if (contract) {
            contract.removeAllListeners();
          }
        };
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    initContract();
  }, [contractAddress, provider]);
  
  // Load contract data from API
  const loadContractDataFromAPI = async () => {
    try {      // Get details from API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/agreement/${contractAddress}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get agreement details');
      }
      
      const data = await response.json();
      
      // Set contract state
      setContractState(parseInt(data.state));
      
      // Set contract details
      setContractDetails({
        creator: data.owner,
        counterparty: data.counterparty,
        description: data.description,
        deadline: parseInt(data.deadline) * 1000, // Convert to milliseconds
        value: data.value
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading contract data from API:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  // Refresh contract data
  const refreshContractData = async () => {
    await loadContractDataFromAPI();
  };
  
  // Helper function for state updates via API
  const updateAgreementState = async (newState) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/agreement/${contractAddress}/state`, {
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
      
      const data = await response.json();
      
      // Refresh the contract data
      await refreshContractData();
      
      return {
        transactionHash: data.transactionHash
      };
    } catch (error) {
      console.error('Error updating agreement state:', error);
      throw error;
    }
  };
  
  // Contract actions via API
  const acceptAgreement = async () => {
    if (!contractDetails) {
      throw new Error('Contract details not loaded');
    }
    
    // State 1 = ACTIVE
    return updateAgreementState(1);
  };
  
  const rejectAgreement = async () => {
    // State 4 = VOIDED
    return updateAgreementState(4);
  };
  
  const markAsDone = async () => {
    // Since the API doesn't have a separate markAsDone endpoint,
    // we'll use the contract directly if available, otherwise use API
    if (contract) {
      const tx = await contract.markAsDone();
      await tx.wait();
      await refreshContractData();
      return { transactionHash: tx.hash };
    } else {
      // State 2 = COMPLETED (approximation, not exact)
      return updateAgreementState(2);
    }
  };
  
  const confirmCompletion = async () => {
    // State 2 = COMPLETED
    return updateAgreementState(2);
  };
  
  const reclaimOnExpiry = async () => {
    // Since the API doesn't have a specific endpoint for reclaiming,
    // we'll use the contract directly if available
    if (contract) {
      const tx = await contract.reclaimOnExpiry();
      await tx.wait();
      await refreshContractData();
      return { transactionHash: tx.hash };
    } else {
      throw new Error('Cannot reclaim without direct contract access');
    }
  };
  
  return {
    contract,
    contractDetails,
    contractState,
    loading,
    error,
    refreshContractData,
    acceptAgreement,
    rejectAgreement,
    markAsDone,
    confirmCompletion,
    reclaimOnExpiry
  };
};

export default useChronoContract;
