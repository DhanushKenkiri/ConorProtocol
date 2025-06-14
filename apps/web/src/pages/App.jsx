import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ethers } from 'ethers';
import Header from '../components/common/Header';
import BaseSepoliaInfo from '../components/common/BaseSepoliaInfo';
import ChatInput from '../components/chat/ChatInput';
import ChatMessage from '../components/chat/ChatMessage';
import ChronoContractCard from '../components/chat/ChronoContractCard';
import XmtpMessenger from '../components/chat/XmtpMessenger';
import { ToastManager } from '../components/ui/Toast';
import { WalletContext } from '../context/WalletProvider';
import useChronosFactory from '../hooks/useChronosFactory';
import useChainEvents from '../hooks/useChainEvents';
import { parseTaskCommand } from '../lib/parser';
import { getUserAgreements } from '../services/api.jsx';
import SystemHealthChecker from '../utils/SystemHealthChecker';
import ChronosGuide from '../components/common/ChronosGuide';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/index.css';

/**
 * Main App component
 */
const App = () => {
  // Context and hooks
  const { account, provider, isConnected } = useContext(WalletContext);
  const { createAgreement } = useChronosFactory();
  const { factoryEvents } = useChainEvents();
  
  // State
  const [messages, setMessages] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [currentUser, setCurrentUser] = useState('Alice'); // Default to Alice
  const [serverStatus, setServerStatus] = useState('unknown'); // 'unknown', 'online', 'offline'
  const [showMessenger, setShowMessenger] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  
  // Toggle between Alice and Bob for demo
  const toggleUser = () => {
    setCurrentUser(prev => prev === 'Alice' ? 'Bob' : 'Alice');
  };
    // Refresh agreements list from server
  const refreshAgreements = async () => {
    if (!isConnected || !account) return;
    
    try {
      const userAgreementsList = await getUserAgreements(account);
      if (userAgreementsList && Array.isArray(userAgreementsList.agreements)) {
        setAgreements(userAgreementsList.agreements.map(agreement => ({
          id: Date.now() + Math.random(),
          address: agreement.address
        })));
        
        // If we got a warning, display it
        if (userAgreementsList.warning) {
          console.warn('Server warning:', userAgreementsList.warning);
        }
      }
    } catch (error) {
      console.error('Error refreshing agreements:', error);
    }
  };
  
  // Handle sending a chat message
  const handleSendMessage = (message, user) => {
    const newMessage = {
      id: Date.now(),
      message,
      user,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
    // Handle opening the wallet-to-wallet messenger
  const handleWalletMessaging = (address = '') => {
    if (address) {
      setRecipientAddress(address);
    }
    setShowMessenger(true);
  };
  
  // Handle closing the messenger
  const closeMessenger = () => {
    setShowMessenger(false);
    setRecipientAddress('');
  };
  
  // Handle starting a wallet-to-wallet messaging conversation
  const handleStartMessaging = (address) => {
    if (!isConnected) {
      window.showToast('Error', 'Please connect your wallet first', {
        autohide: true
      });
      return;
    }
    
    if (!address || !ethers.utils.isAddress(address)) {
      window.showToast('Error', 'Invalid Ethereum address', {
        autohide: true
      });
      return;
    }
    
    // Add system message about starting a conversation
    handleSendMessage(`Starting wallet-to-wallet conversation with ${address.slice(0, 6)}...${address.slice(-4)}`, 'System');
    
    // Open the messenger with the recipient address
    setRecipientAddress(address);
    setShowMessenger(true);
  };

  // Handle creating a new task using backend API
  const handleCreateTask = async (taskData) => {
    if (!isConnected) {
      window.showToast('Error', 'Please connect your wallet first', {
        autohide: true
      });
      return;
    }
    
    try {
      window.showToast('Processing', 'Creating agreement on-chain...', {
        autohide: false
      });
      
      const { counterparty, description, deadline, value } = taskData;
      
      // Add message about task creation
      handleSendMessage(`Creating task: ${description}`, currentUser);      try {
        window.showToast('Processing', 'Creating agreement...', {
          autohide: false
        });
        
        // Create agreement via contract or backend API
        const { tx, wait } = await createAgreement(
          counterparty,
          description,
          deadline,
          value
        );
        
        window.showToast('Transaction Sent', 'Please wait for confirmation...', {
          autohide: false
        });
        
        try {
          // Wait for transaction confirmation
          const receipt = await wait();
          
          console.log('Transaction confirmation received:', receipt);
          
          // Get the agreement address from the receipt
          const contractAddress = receipt.agreementAddress;
          
          if (contractAddress) {
            // Add agreement to the list
            setAgreements(prev => [...prev, {
              id: Date.now(),
              address: contractAddress
            }]);
            
            window.showToast('Success', 'Agreement created successfully!', {
              autohide: true
            });
            
            // Refresh agreements list
            setTimeout(() => {
              refreshAgreements();
            }, 1000);
          } else {
            console.warn('No contract address in receipt:', receipt);
            // Even without an address, the transaction might have succeeded
            window.showToast('Warning', 'Transaction confirmed but address not returned. Refreshing agreements list...', {
              autohide: true
            });
            
            // Force refresh agreements to check if it was actually created
            setTimeout(() => {
              refreshAgreements();
            }, 1000);
          }
        } catch (waitError) {
          console.error('Error waiting for transaction:', waitError);
          
          // Try to recover by refreshing the agreements list anyway
          window.showToast('Warning', `Transaction status uncertain: ${waitError.message}. Refreshing agreements list...`, {
            autohide: true
          });
          
          setTimeout(() => {
            refreshAgreements();
          }, 1000);
        }
      } catch (createError) {
        console.error('Error creating agreement:', createError);
        window.showToast('Error', `Failed to create agreement: ${createError.message}`, {
          autohide: true
        });
      }
    } catch (error) {
      console.error('Error creating agreement:', error);
      window.showToast('Error', `Failed to create agreement: ${error.message}`, {
        autohide: true
      });
    }
  };
  // Load user agreements from API when connected
  useEffect(() => {
    const loadUserAgreements = async () => {
      if (!isConnected || !account) return;
      
      try {
        window.showToast('Loading', 'Fetching your agreements...', {
          autohide: true
        });
        
        // Use the refreshAgreements function
        await refreshAgreements();
      } catch (error) {
        console.error('Error loading user agreements:', error);
        window.showToast('Error', `Failed to load agreements: ${error.message}`, {
          autohide: true
        });
      }
    };
    
    loadUserAgreements();
    
    // Set up interval to periodically refresh agreements
    const refreshInterval = setInterval(() => {
      if (isConnected && account) {
        refreshAgreements().catch(error => {
          console.error('Error in periodic agreement refresh:', error);
        });
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [account, isConnected]);
  
  // Watch for factory events to add agreements
  useEffect(() => {
    if (factoryEvents.length > 0) {
      // Check for new agreements that aren't already in our list
      factoryEvents.forEach(event => {
        const exists = agreements.some(a => a.address === event.agreementAddress);
        if (!exists) {
          setAgreements(prev => [...prev, {
            id: Date.now(),
            address: event.agreementAddress
          }]);
        }
      });
    }
  }, [factoryEvents, agreements]);  // Initialize toast function if it doesn't exist yet
  useEffect(() => {
    if (typeof window.showToast !== 'function') {
      window.showToast = (title, message, options = {}) => {
        console.log(`Toast: ${title} - ${message}`);
        // This fallback will be replaced by the actual implementation
        // when ToastManager mounts
      };
    }
  }, []);
  
  // Check if the server is running on app start
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Add timeout to prevent long wait when server is down
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/health`, { 
          signal: controller.signal 
        }).finally(() => clearTimeout(timeoutId));
        
        if (response.ok) {
          setServerStatus('online');
          console.log('Server is online');
        } else {
          setServerStatus('offline');
          if (typeof window.showToast === 'function') {
            window.showToast('Server Warning', 'Backend server responded with an error. Some features might not work correctly.', {
              delay: 10000
            });
          }
        }
      } catch (error) {
        setServerStatus('offline');
        console.warn('Server connection error:', error);
        if (typeof window.showToast === 'function') {
          window.showToast('Server Offline', 'Cannot connect to backend server. Please start the server with: npm run start:backend', {
            delay: 10000
          });
        }
      }
    };
    
    // Run the check after a short delay to ensure toast is initialized
    const timeoutId = setTimeout(checkServerStatus, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="app">
      <ToastManager />
      <Header />
      <SystemHealthChecker />
      <ChronosGuide />
      
      <Container fluid className="mt-4 mb-4">
        {isConnected && <Row className="mb-3">
          <Col>
            <BaseSepoliaInfo />
          </Col>
        </Row>}

        <Row className="mb-3 justify-content-end">
          <Col xs="auto">
            <button 
              className="btn btn-retro btn-sm"
              onClick={toggleUser}
            >
              Switch to {currentUser === 'Alice' ? 'Bob' : 'Alice'}
            </button>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <Card className="terminal">
              <Card.Header className="terminal-header">
                <div>Chronos Terminal - {currentUser}</div>
                <div>
                  {isConnected ? `Connected: ${account.substring(0, 6)}...` : 'Not Connected'}
                </div>
              </Card.Header>
              
              <div className="chat-container">
                {messages.map(msg => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.message}
                    timestamp={msg.timestamp}
                    user={msg.user}
                  />
                ))}
                
                {agreements.map(agreement => (
                  <ChronoContractCard
                    key={agreement.id}
                    contractAddress={agreement.address}
                    userAddress={account}
                    provider={provider}
                  />
                ))}
                
                {/* XMTP Messenger Component - Uncomment to use
                <XmtpMessenger
                  userAddress={account}
                  provider={provider}
                />
                */}
              </div>
                <ChatInput
                onSendMessage={handleSendMessage}
                onCreateTask={handleCreateTask}
                onStartMessaging={handleStartMessaging}
                currentUser={currentUser}
              />
            </Card>
          </Col>
        </Row>
        
        {/* XMTP Wallet-to-Wallet Messaging */}
        {isConnected && (
          <Row className="mb-3">
            <Col>
              <Card className="messaging-control">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Wallet-to-Wallet Messaging</h5>
                    <Button 
                      variant="primary" 
                      onClick={() => handleWalletMessaging()}
                      disabled={!isConnected}
                    >
                      Open Messenger
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        {/* XMTP Messenger Modal */}
        {showMessenger && (
          <Row className="mb-3">
            <Col>
              <XmtpMessenger 
                recipientAddress={recipientAddress} 
                onClose={closeMessenger} 
              />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default App;
