import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import useXmtpMessaging from '../../hooks/useXmtpMessaging';
import { useContext } from 'react';
import { WalletContext } from '../../context/WalletProvider';
import { ethers } from 'ethers';

/**
 * XmtpMessenger component for wallet-to-wallet messaging
 * Allows users to send messages to other Ethereum addresses
 */
const XmtpMessenger = ({ recipientAddress, onClose }) => {
  const { account } = useContext(WalletContext);
  const { 
    isConnected, 
    isLoading, 
    error, 
    sendMessage, 
    getMessages, 
    listenForMessages, 
    canMessage 
  } = useXmtpMessaging();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [canReceiveMessages, setCanReceiveMessages] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Format addresses for display
  const formatAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };
  
  // Check if address is valid
  const isValidEthereumAddress = (address) => {
    return ethers.utils.isAddress(address);
  };
  
  // Target address to message
  const targetAddress = recipientAddress || '';
  
  // Load messages when component mounts or recipient changes
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!isConnected || !targetAddress || !isValidEthereumAddress(targetAddress)) {
        return;
      }
      
      setLoadingMessages(true);
      try {
        // Check if recipient can receive messages
        const canReceive = await canMessage(targetAddress);
        setCanReceiveMessages(canReceive);
        
        if (canReceive) {
          // Load existing messages
          const existingMessages = await getMessages(targetAddress);
          setMessages(existingMessages);
          setStatusMessage('');
        } else {
          setStatusMessage(`${formatAddress(targetAddress)} has not enabled XMTP messaging`);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setStatusMessage('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    if (isConnected) {
      loadInitialMessages();
    }
  }, [isConnected, targetAddress, getMessages, canMessage]);
  
  // Set up message streaming for real-time updates
  useEffect(() => {
    let unsubscribe = null;
    
    const setupMessageStreaming = async () => {
      if (!isConnected || !targetAddress || !canReceiveMessages) return;
      
      try {
        // Set up listener for new messages
        unsubscribe = await listenForMessages(targetAddress, (newMsg) => {
          setMessages(prevMessages => [...prevMessages, newMsg]);
        });
      } catch (err) {
        console.error('Error setting up message stream:', err);
      }
    };
    
    if (isConnected && canReceiveMessages) {
      setupMessageStreaming();
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isConnected, targetAddress, canReceiveMessages, listenForMessages]);
  
  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !targetAddress) {
      return;
    }
    
    try {
      const sent = await sendMessage(targetAddress, newMessage);
      if (sent) {
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setStatusMessage('Failed to send message');
    }
  };
  
  // Render loading state
  if (isLoading || loadingMessages) {
    return (
      <Card className="xmtp-messenger">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>Messaging {formatAddress(targetAddress)}</span>
            {onClose && <Button variant="close" onClick={onClose} />}
          </div>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Connecting to XMTP...</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="xmtp-messenger">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>Messaging Error</span>
            {onClose && <Button variant="close" onClick={onClose} />}
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }
  
  // Render main component
  return (
    <Card className="xmtp-messenger">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span>
            {targetAddress 
              ? `Messaging ${formatAddress(targetAddress)}` 
              : 'Messaging'}
          </span>
          {onClose && <Button variant="close" onClick={onClose} />}
        </div>
      </Card.Header>
      <div className="messages-container p-3" style={{ height: '300px', overflowY: 'auto' }}>
        {statusMessage && (
          <Alert variant="info" className="text-center">
            {statusMessage}
          </Alert>
        )}
        
        {messages.length === 0 && !statusMessage && (
          <div className="text-center text-muted py-5">
            <p>No messages yet</p>
            <p>Start the conversation by sending a message</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`message-bubble p-2 mb-2 rounded ${msg.senderAddress === account ? 'sent' : 'received'}`}
            style={{
              alignSelf: msg.senderAddress === account ? 'flex-end' : 'flex-start',
              backgroundColor: msg.senderAddress === account ? '#007bff' : '#f1f1f1',
              color: msg.senderAddress === account ? 'white' : 'black',
              maxWidth: '75%',
              marginLeft: msg.senderAddress === account ? 'auto' : '0',
              marginRight: msg.senderAddress === account ? '0' : 'auto',
              display: 'block'
            }}
          >
            <div className="message-content">{msg.content}</div>
            <small className="message-timestamp text-muted" style={{ fontSize: '0.7rem' }}>
              {new Date(msg.sent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Card.Footer className="p-2">
        <Form onSubmit={handleSendMessage}>
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected || !canReceiveMessages}
            />
            <Button 
              variant="primary" 
              type="submit"
              disabled={!isConnected || !canReceiveMessages || !newMessage.trim()}
              className="ms-2"
            >
              Send
            </Button>
          </div>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default XmtpMessenger;
