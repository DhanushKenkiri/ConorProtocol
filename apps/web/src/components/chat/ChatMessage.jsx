import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';

/**
 * Chat message component
 */
const ChatMessage = ({ message, timestamp, user }) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className={`chat-message ${user.toLowerCase()}`}>
      <div className="timestamp">
        <span className="user">{user}</span> • {formatTime(timestamp)}
      </div>
      <div className="message">{message}</div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  user: PropTypes.string.isRequired
};

export default ChatMessage;
