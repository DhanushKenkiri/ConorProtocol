import React from 'react';
import { useState } from 'react';
import { InputGroup } from 'react-bootstrap';
import Input from '../ui/Input';
import Button from '../ui/Button';
import PropTypes from 'prop-types';

/**
 * Chat input component with command parsing for task creation
 */
const ChatInput = ({ onSendMessage, onCreateTask, onStartMessaging, currentUser }) => {
  const [message, setMessage] = useState('');
  
  /**
   * Parse the /task command
   * Format: /task @[address] [description] by [YYYY-MM-DD HH:MM] for [amount] [token_symbol]
   */
  const parseTaskCommand = (command) => {
    // Remove the '/task' prefix
    const taskText = command.substring(5).trim();
    
    try {
      // Extract counterparty address
      const addressMatch = taskText.match(/@(0x[a-fA-F0-9]{40})/);
      if (!addressMatch) throw new Error('Invalid counterparty address format');
      const counterparty = addressMatch[1];
      
      // Extract deadline
      const dateMatch = taskText.match(/by\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
      if (!dateMatch) throw new Error('Invalid date format. Use: YYYY-MM-DD HH:MM');
      const dateStr = dateMatch[1];
      const deadline = Math.floor(new Date(dateStr).getTime() / 1000);
      
      if (isNaN(deadline) || deadline <= Math.floor(Date.now() / 1000)) {
        throw new Error('Deadline must be in the future');
      }
      
      // Extract value
      const valueMatch = taskText.match(/for\s+(\d+(?:\.\d+)?)\s+(\w+)/);
      if (!valueMatch) throw new Error('Invalid value format. Use: for [amount] [token]');
      const amount = valueMatch[1];
      const token = valueMatch[2];
      
      if (token.toLowerCase() !== 'eth') {
        throw new Error('Only ETH is supported currently');
      }
      
      // Extract description - everything between address and "by"
      const descStart = taskText.indexOf(counterparty) + counterparty.length;
      const descEnd = taskText.indexOf('by', descStart);
      if (descStart === -1 || descEnd === -1) throw new Error('Invalid task description');
      const description = taskText.substring(descStart, descEnd).trim();
      
      return {
        counterparty,
        description,
        deadline,
        value: amount,
        token
      };
    } catch (error) {
      console.error('Error parsing task:', error);
      window.showToast('Parse Error', error.message, { autohide: true });
      return null;
    }
  };
  
  /**
   * Parse the /message command
   * Format: /message @[address]
   */
  const parseMessageCommand = (command) => {
    // Remove the '/message' prefix
    const messageText = command.substring(8).trim();
    
    try {
      // Extract wallet address
      const addressMatch = messageText.match(/@(0x[a-fA-F0-9]{40})/);
      if (!addressMatch) throw new Error('Invalid wallet address format');
      const recipient = addressMatch[1];
      
      return recipient;
    } catch (error) {
      console.error('Error parsing message command:', error);
      return null;
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Form event
   */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Check if this is a task command
    if (message.startsWith('/task')) {
      const taskData = parseTaskCommand(message);
      if (taskData) {
        onCreateTask(taskData);
      }
    } else if (message.startsWith('/message')) {
      // Handle /message command for XMTP
      const recipient = parseMessageCommand(message);
      if (recipient) {
        const xmtpMessage = message.substring(8 + recipient.length).trim();
        onStartMessaging(xmtpMessage, recipient);
      } else {
        window.showToast('Message Error', 'Invalid /message command format', { autohide: true });
      }
    } else {
      // Regular message
      onSendMessage(message, currentUser);
    }
    
    setMessage('');
  };
    return (
    <form onSubmit={handleSendMessage} className="chat-input-container">      <div className="mb-1 small text-muted">
        {message.startsWith('/task') ? (
          <span className="text-info">
            <i className="bi bi-info-circle"></i> Command format: /task @0x... description by YYYY-MM-DD HH:MM for 0.1 ETH
          </span>
        ) : message.startsWith('/message') ? (
          <span className="text-info">
            <i className="bi bi-info-circle"></i> Command format: /message @0x... (wallet address)
          </span>
        ) : null}
      </div>
      <InputGroup>        <Input
          type="text"
          placeholder="Type a message, /task @0x... for task, or /message @0x... for wallet messaging"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit">
          Send
        </Button>
      </InputGroup>
      <div className="mt-1 text-end">        <small>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            window.showChronosGuide ? window.showChronosGuide() : null;
          }}>Need help?</a>
        </small>
      </div>
    </form>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onCreateTask: PropTypes.func.isRequired,
  onStartMessaging: PropTypes.func.isRequired,
  currentUser: PropTypes.string.isRequired
};

export default ChatInput;
