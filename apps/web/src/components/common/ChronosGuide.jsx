import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import ChronosGuideModal from './ChronosGuideModal';

/**
 * A sleek button component that opens the Chronos guide modal when clicked
 * Shows automatically for new users
 */
const ChronosGuide = () => {
  const [showGuide, setShowGuide] = useState(false);
  
  // Register a global function to show the guide
  useEffect(() => {
    window.showChronosGuide = () => setShowGuide(true);
    
    // Clean up
    return () => {
      delete window.showChronosGuide;
    };
  }, []);
  
  // Check if this is the user's first time
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('chronos_has_seen_guide');
    if (!hasSeenGuide) {
      // Show guide automatically after a short delay for new users
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleShow = () => setShowGuide(true);
  
  const handleHide = () => {
    setShowGuide(false);
    // Mark guide as seen
    localStorage.setItem('chronos_has_seen_guide', 'true');
  };

  return (
    <>
      <Button 
        variant="dark" 
        onClick={handleShow} 
        className="chronos-guide-button"
        title="Learn Chronos Protocol"
      >
        <i className="bi bi-lightbulb me-1"></i> Guide
      </Button>

      <ChronosGuideModal 
        show={showGuide} 
        onHide={handleHide} 
      />
    </>
  );
};

export default ChronosGuide;
