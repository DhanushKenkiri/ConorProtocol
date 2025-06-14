// React hook for XMTP messaging integration
import { useState, useEffect, useCallback, useContext } from 'react';
import { WalletContext } from '../context/WalletProvider';
import xmtpService from '../services/xmtpService.jsx';

/**
 * Custom hook for using XMTP messaging in components
 * @returns {Object} XMTP messaging methods and state
 */
const useXmtpMessaging = () => {
  const { account, web3Provider } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  
  // Initialize XMTP client when wallet is connected
  useEffect(() => {
    const connectXmtp = async () => {
      if (!web3Provider || !account) {
        setIsConnected(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the signer from web3Provider
        const signer = web3Provider.getSigner();
        
        // Initialize XMTP client with signer
        const success = await xmtpService.init(signer);
        
        if (success) {
          setIsConnected(true);
          // Load existing conversations
          const convos = await xmtpService.listConversations();
          setConversations(convos);
        } else {
          setIsConnected(false);
          setError('Failed to initialize XMTP client');
        }
      } catch (err) {
        console.error('XMTP connection error:', err);
        setError(err.message || 'Failed to connect to XMTP');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    connectXmtp();
    
    // Clean up on unmount
    return () => {
      if (isConnected) {
        xmtpService.disconnect();
      }
    };
  }, [web3Provider, account]);
  
  // Check if an address can receive XMTP messages
  const canMessage = useCallback(async (address) => {
    if (!isConnected) return false;
    return await xmtpService.canMessage(address);
  }, [isConnected]);
  
  // Send a message to a specific address
  const sendMessage = useCallback(async (recipientAddress, content) => {
    if (!isConnected) {
      setError('XMTP client not connected');
      return null;
    }
    
    try {
      const sent = await xmtpService.sendMessage(recipientAddress, content);
      return sent;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      return null;
    }
  }, [isConnected]);
  
  // Get all messages from a conversation
  const getMessages = useCallback(async (recipientAddress) => {
    if (!isConnected) {
      setError('XMTP client not connected');
      return [];
    }
    
    try {
      const messages = await xmtpService.getMessages(recipientAddress);
      return messages;
    } catch (err) {
      setError(err.message || 'Failed to get messages');
      return [];
    }
  }, [isConnected]);
  
  // Create or get a conversation with an address
  const getConversation = useCallback(async (address) => {
    if (!isConnected) {
      setError('XMTP client not connected');
      return null;
    }
    
    try {
      return await xmtpService.getConversation(address);
    } catch (err) {
      setError(err.message || 'Failed to create conversation');
      return null;
    }
  }, [isConnected]);
  
  // Refresh the list of conversations
  const refreshConversations = useCallback(async () => {
    if (!isConnected) {
      return;
    }
    
    try {
      const convos = await xmtpService.listConversations();
      setConversations(convos);
      return convos;
    } catch (err) {
      setError(err.message || 'Failed to refresh conversations');
      return [];
    }
  }, [isConnected]);
  
  // Set up a stream to listen for new messages
  const listenForMessages = useCallback(async (address, onNewMessage) => {
    if (!isConnected) {
      setError('XMTP client not connected');
      return null;
    }
    
    try {
      return await xmtpService.streamMessages(address, onNewMessage);
    } catch (err) {
      setError(err.message || 'Failed to listen for messages');
      return null;
    }
  }, [isConnected]);
  
  return {
    isConnected,
    isLoading,
    error,
    conversations,
    canMessage,
    sendMessage,
    getMessages,
    getConversation,
    refreshConversations,
    listenForMessages,
  };
};

export default useXmtpMessaging;
