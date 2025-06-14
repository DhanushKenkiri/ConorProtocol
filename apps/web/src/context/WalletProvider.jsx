import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import PropTypes from 'prop-types';
import { useAddress, useDisconnect, useMetamask, useSDK } from "@thirdweb-dev/react";
import { 
  BASE_SEPOLIA_CHAIN_ID, 
  BASE_SEPOLIA_CHAIN_ID_HEX, 
  BASE_SEPOLIA_PARAMS, 
  ALCHEMY_API_KEY 
} from '../config/thirdweb.jsx';
import { debugChainId } from '../utils/chainDebugger';

// Create the wallet context
export const WalletContext = createContext();

/**
 * Get a provider based on available options
 * Prioritizes Alchemy if API key is available
 */
const getReadOnlyProvider = () => {
  if (ALCHEMY_API_KEY) {
    // Base Sepolia is not directly supported by AlchemyProvider name-based networks
    // Use JsonRpcProvider with Alchemy URL instead
    return new ethers.providers.JsonRpcProvider(
      `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        chainId: BASE_SEPOLIA_CHAIN_ID,
        name: 'base-sepolia'
      }
    );
  }
  
  return new ethers.providers.JsonRpcProvider(
    BASE_SEPOLIA_PARAMS.rpcUrls[0],
    {
      chainId: BASE_SEPOLIA_CHAIN_ID,
      name: 'base-sepolia'
    }
  );
};

/**
  * WalletProvider component for managing wallet connection state
 * Enhanced with ThirdWeb wallet connection hooks
 */
const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use ThirdWeb hooks
  const thirdwebSDK = useSDK();
  const connectWithMetamask = useMetamask();
  const thirdwebDisconnect = useDisconnect();
  const thirdwebAddress = useAddress();
  
  // Helper function to normalize chain IDs for comparison regardless of format
  const normalizeChainId = (chainId) => {
    if (typeof chainId === 'string') {
      // If it's a hex string (starts with 0x)
      if (chainId.startsWith('0x')) {
        return parseInt(chainId, 16);
      }
      // If it's a string but not hex
      return parseInt(chainId, 10);
    }
    // If it's already a number
    return chainId;
  };
  const [account, setAccount] = useState(thirdwebAddress);
  
  // Update account when ThirdWeb address changes
  useEffect(() => {
    if (thirdwebAddress) {
      setAccount(thirdwebAddress);
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [thirdwebAddress]);
    // Check current network on load
  useEffect(() => {
    const checkCurrentNetwork = async () => {
      // Check if MetaMask is available
      if (window.ethereum) {
        try {
          // Use the debugger utility to log detailed chain info
          console.log('Checking current network status...');
          const chainInfo = await debugChainId();
          
          if (chainInfo) {
            // Update chainId state with the parsed value
            setChainId(chainInfo.parsedChainId);
            
            // If already on Base Sepolia, log this information
            if (chainInfo.isBaseSepoliaNetwork) {
              console.log('Already connected to Base Sepolia network');
              window.showToast('Network', 'Already connected to Base Sepolia network', {
                autohide: true,
                delay: 3000
              });
            }
          }
        } catch (error) {
          console.error('Error detecting current network:', error);
        }
      }
    };
    
    // Run the check when component mounts
    checkCurrentNetwork();
  }, []);
  
  // Initialize Web3Modal (as fallback)
  const getWeb3Modal = () => {
    return new Web3Modal({
      cacheProvider: true,
      providerOptions: {}, // Add more wallet providers here
    });
  };  // Switch network to Base Sepolia
  const switchToBaseSepolia = async () => {
    console.log('Attempting to switch to Base Sepolia network...');
    
    try {      // Direct approach using window.ethereum (MetaMask API)
      if (window.ethereum) {
        try {          
          console.log('Switching to Base Sepolia using MetaMask directly...');
          console.log('Using chain ID hex:', BASE_SEPOLIA_CHAIN_ID_HEX);
          
          // Show modal display for switch request
          window.showToast('Network', 'Requesting network switch to Base Sepolia...', {
            autohide: true,
            delay: 3000
          });
          
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
          });
          
          // Update chainId state immediately after successful network switch
          setChainId(BASE_SEPOLIA_CHAIN_ID);
          console.log('Successfully switched to Base Sepolia network!');
          return true;
        } catch (directError) {
          console.log('Direct MetaMask switch attempt error:', directError);
          // Continue to other methods if direct approach fails
        }
      }
      
      // Fallback to ThirdWeb method
      if (thirdwebSDK) {
        // Use ThirdWeb SDK to switch network
        console.log('Switching to Base Sepolia using ThirdWeb SDK...');
        // The SDK v4 uses switchChainAsync method or wallet.switchChain
        if (thirdwebSDK.wallet && typeof thirdwebSDK.wallet.switchChain === 'function') {
          await thirdwebSDK.wallet.switchChain(BASE_SEPOLIA_CHAIN_ID);
          return true;
        }
      }
      
      // Last resort fallback to provider method  
      if (provider) {        // Fallback to provider request method
        console.log('Switching to Base Sepolia using provider...');
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
        });
        return true;
      }    } catch (switchError) {
      console.error('Error switching to Base Sepolia network:', switchError);
      
      // Handle user rejection specifically
      if (switchError.code === 4001 || 
          (switchError.message && switchError.message.includes("User rejected"))) {
        console.log('User rejected network switch');
        if (typeof window.showToast === 'function') {
          window.showToast('Network Switch Cancelled', 'You declined to switch networks. Some features may not work correctly without switching to Base Sepolia.', {
            autohide: true, 
            delay: 5000
          });
        }
        return false;
      }
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902 || 
          (switchError.message && switchError.message.includes("Unrecognized chain ID"))) {
        try {
          console.log('Base Sepolia not found, attempting to add network...');
          window.showToast('Network', 'Base Sepolia network not found. Adding it to your wallet...', {
            autohide: true,
            delay: 3000
          });
          
          // Try to add the network directly with MetaMask
          if (window.ethereum) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BASE_SEPOLIA_PARAMS]
            });
              // Try switching again after adding
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
            });
            return true;
          }
          // Only try thirdweb methods if direct attempt fails
          else if (thirdwebSDK) {
            // Use ThirdWeb to add chain if possible
            if (thirdwebSDK.wallet && typeof thirdwebSDK.wallet.switchChain === 'function') {
              await thirdwebSDK.wallet.switchChain(BASE_SEPOLIA_CHAIN_ID);
              return true;
            }
          } 
          else if (provider) {
            // Fallback to provider method
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [BASE_SEPOLIA_PARAMS],
            });
              // Try switching again after adding
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
            });
            return true;
          }
        } catch (addError) {
          console.error('Error adding Base Sepolia network:', addError);
          return false;
        }
      } else {
        console.error('Error switching to Base Sepolia network:', switchError);
      }
    }
  };
    // Connect wallet
  const connect = async () => {
    try {      // Check if MetaMask is installed
      const isMetaMaskInstalled = typeof window !== 'undefined' && 
        window.ethereum && 
        window.ethereum.isMetaMask;
      
      if (!isMetaMaskInstalled) {
        console.warn('MetaMask not detected. Please install MetaMask extension.');
        if (typeof window.showToast === 'function') {
          window.showToast('Wallet Error', 'MetaMask not detected. Please install MetaMask extension to connect your wallet.', {
            autohide: true,
            delay: 8000
          });
        }
      }
      
      // Try connecting with ThirdWeb first (which handles MetaMask connection internally)
      if (connectWithMetamask) {
        try {
          console.log('Attempting to connect with ThirdWeb/MetaMask...');
          const data = await connectWithMetamask();
          console.log('ThirdWeb connection successful:', data);
          if (data) return; // If successful, return early
        } catch (thirdWebError) {
          console.warn('ThirdWeb connection failed:', thirdWebError);
          
          // Check if the error is related to the user rejecting the connection
          if (thirdWebError.message && thirdWebError.message.includes('User rejected')) {
            if (typeof window.showToast === 'function') {
              window.showToast('Connection Cancelled', 'You rejected the connection request. Please connect your MetaMask wallet to use this application.', {
                autohide: true,
                delay: 5000
              });
            }
            return null; // Return early, don't try fallback method
          }
          
          console.warn('Falling back to Web3Modal...');
          // Continue to fallback method for other errors
        }
      }
      
      // Fallback to Web3Modal
      const web3Modal = getWeb3Modal();
      
      try {
        const connection = await web3Modal.connect();
        
        // Use Web3Provider for connected wallet
        const provider = new ethers.providers.Web3Provider(connection);
        const accounts = await provider.listAccounts();
        const network = await provider.getNetwork();
        
        // Store provider references
        setWeb3Provider(provider);
        setProvider(connection);
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        }
        
        setChainId(network.chainId);
        setIsConnected(true);
        
        // If not on Base Sepolia, prompt to switch
        if (network.chainId !== BASE_SEPOLIA_CHAIN_ID) {
          try {
            await switchToBaseSepolia();
          } catch (switchError) {
            console.warn('Failed to switch to Base Sepolia:', switchError);
            // Continue anyway, don't block the connection
          }
        }
        
        // Log provider type
        console.log(`Using ${ALCHEMY_API_KEY ? 'Alchemy' : 'default'} RPC provider for Base Sepolia`);
      } catch (modalError) {
        console.error('Web3Modal connection failed:', modalError);
        
        // Fall back to read-only provider if all connection attempts fail
        setReadOnlyProvider(getReadOnlyProvider());
        throw modalError;
      }
    } catch (error) {
      console.error('Connection error:', error);
      // Don't throw here to prevent uncaught promise rejections
      return null;
    }
  };
    // Disconnect wallet
  const disconnect = async () => {
    try {
      // Try ThirdWeb disconnect first
      if (thirdwebDisconnect) {
        await thirdwebDisconnect();
      }
      
      // Also clear Web3Modal cached provider as fallback
      const web3Modal = getWeb3Modal();
      await web3Modal.clearCachedProvider();
      
      if (provider?.disconnect && typeof provider.disconnect === 'function') {
        await provider.disconnect();
      }
      
      setAccount(null);
      setChainId(null);
      setWeb3Provider(null);
      setProvider(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
  
  // Handle chain and account changes
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length) {
          setAccount(accounts[0]);
        } else {
          disconnect();
        }
      };      const handleChainChanged = (chainId) => {
        // Parse chainId from hex to decimal using our normalization helper
        const parsedChainId = normalizeChainId(chainId);
        console.log('Chain changed to:', parsedChainId);
        console.log('Raw chain ID value:', chainId);
        console.log('Expected Base Sepolia Chain ID:', BASE_SEPOLIA_CHAIN_ID);
        console.log('Expected Base Sepolia Chain ID (hex):', BASE_SEPOLIA_CHAIN_ID_HEX);
        
        setChainId(parsedChainId);
        
        // Check if this is the Base Sepolia chain
        if (parsedChainId === BASE_SEPOLIA_CHAIN_ID) {
          console.log('Successfully switched to Base Sepolia!');
          // No need to reload the page - just update state
          // This prevents a full page refresh which improves user experience
        } else {
          // Only reload if not on Base Sepolia, as a fallback
          window.location.reload();
        }
      };
      
      const handleDisconnect = () => {
        disconnect();
      };
      
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);
      
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);
  
  // Auto-connect if provider is cached
  useEffect(() => {
    const web3Modal = getWeb3Modal();
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, []);
    // Initialize a read-only provider for use when no wallet is connected
  const [readOnlyProvider, setReadOnlyProvider] = useState(null);
  
  useEffect(() => {
    setReadOnlyProvider(getReadOnlyProvider());
  }, []);
  // Debug info
  console.log('Current chainId:', chainId, 'Base Sepolia Chain ID:', BASE_SEPOLIA_CHAIN_ID, 'Is match:', chainId === BASE_SEPOLIA_CHAIN_ID);
  
  // Explicitly check if chainId (numeric) matches the expected Base Sepolia Chain ID
  const isOnBaseSepoliaNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;
  
  // Context value
  const contextValue = {
    provider: web3Provider,
    rawProvider: provider,
    readOnlyProvider: web3Provider || readOnlyProvider, // Use connected wallet if available, otherwise use read-only provider
    account,
    chainId,
    isConnected,
    connect,
    disconnect,
    switchToBaseSepolia,
    isBaseSepoliaChain: isOnBaseSepoliaNetwork,
    isUsingAlchemy: ALCHEMY_API_KEY ? true : false
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default WalletProvider;
