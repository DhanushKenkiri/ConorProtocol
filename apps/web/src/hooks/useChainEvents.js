import { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../context/WalletProvider';
import { addresses } from '../config/addresses';
import ChronosFactoryABI from '../config/abis/ChronosFactory.json';

/**
 * Custom hook for listening to blockchain events
 */
const useChainEvents = () => {
  const { provider, chainId } = useContext(WalletContext);
  const [factoryEvents, setFactoryEvents] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  // Start listening for events
  useEffect(() => {
    if (!provider || !chainId) return;
    
    const listenForEvents = async () => {
      try {
        // Get factory address
        const networkAddresses = addresses[chainId];
        if (!networkAddresses || !networkAddresses.ChronosFactory) {
          console.error('Factory address not found for this network');
          return;
        }
        
        const factoryAddress = networkAddresses.ChronosFactory;
        
        // Create read-only provider
        const factoryContract = new ethers.Contract(
          factoryAddress,
          ChronosFactoryABI,
          provider
        );
        
        // Listen for AgreementCreated events
        const filter = factoryContract.filters.AgreementCreated();
        factoryContract.on(filter, (creator, counterparty, agreementAddress, description, deadline, value, event) => {
          const newEvent = {
            creator,
            counterparty,
            agreementAddress,
            description,
            deadline: deadline.toNumber(),
            value: ethers.utils.formatEther(value),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: Date.now() // We'll use current time as an approximation
          };
          
          setFactoryEvents(prev => [...prev, newEvent]);
          
          // Notify via toast if available
          if (window.showToast) {
            window.showToast('New Agreement', `A new agreement has been created: ${description.substring(0, 20)}...`, {
              autohide: true
            });
          }
        });
        
        setIsListening(true);
        
        return () => {
          // Clean up event listeners
          factoryContract.removeAllListeners(filter);
          setIsListening(false);
        };
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
    };
    
    listenForEvents();
  }, [provider, chainId]);
  
  return {
    factoryEvents,
    isListening
  };
};

export default useChainEvents;
