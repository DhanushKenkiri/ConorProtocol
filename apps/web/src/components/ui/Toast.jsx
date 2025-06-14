import React from 'react';
import { Toast as BootstrapToast, ToastContainer } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

/**
 * Toast notification component with retro styling
 */
const Toast = ({ show, onClose, title, message, autohide = true, delay = 5000 }) => {
  return (
    <BootstrapToast 
      show={show} 
      onClose={onClose}
      delay={delay}
      autohide={autohide}
      className="toast-retro"
    >
      <BootstrapToast.Header closeButton>
        <strong>{title}</strong>
      </BootstrapToast.Header>
      <BootstrapToast.Body>{message}</BootstrapToast.Body>
    </BootstrapToast>
  );
};

Toast.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  autohide: PropTypes.bool,
  delay: PropTypes.number,
};

/**
 * ToastManager for handling multiple toast notifications
 */
export const ToastManager = () => {
  const [toasts, setToasts] = useState([]);
    // Global toast notification function
  window.showToast = (title, message, options = {}) => {
    // Generate a truly unique ID using timestamp and random number
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, title, message, ...options }]);
    
    // Auto remove after delay if autohide is true
    if (options.autohide !== false) {
      setTimeout(() => {
        removeToast(id);
      }, options.delay || 5000);
    }
    
    return id; // Return id so it can be closed manually
  };
  
  // Remove a toast by id
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  useEffect(() => {
    // Initialize the global toast function
    return () => {
      // Clean up on unmount
      window.showToast = undefined;
    };
  }, []);
  
  return (
    <ToastContainer className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          show={true}
          onClose={() => removeToast(toast.id)}
          title={toast.title}
          message={toast.message}
          autohide={toast.autohide}
          delay={toast.delay}
        />
      ))}
    </ToastContainer>
  );
};

export default Toast;
