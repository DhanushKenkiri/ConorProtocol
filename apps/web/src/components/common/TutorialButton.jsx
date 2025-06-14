import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import TutorialModal from './TutorialModal';

/**
 * A button component that opens the tutorial modal when clicked
 * Shows automatically for new users
 */
const TutorialButton = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Register a global function to show the tutorial
  useEffect(() => {
    window.showTutorial = () => setShowTutorial(true);
    
    // Clean up
    return () => {
      delete window.showTutorial;
    };
  }, []);
  
  // Check if this is the user's first time
  useEffect(() => {
    const hasSeen = localStorage.getItem('chronos_has_seen_tutorial');
    if (!hasSeen) {
      // Show tutorial automatically after a short delay for new users
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleShow = () => setShowTutorial(true);
  
  const handleHide = () => {
    setShowTutorial(false);
    // Mark tutorial as seen
    localStorage.setItem('chronos_has_seen_tutorial', 'true');
  };

  return (
    <>
      <Button 
        variant="info" 
        onClick={handleShow} 
        className="tutorial-button"
        title="Learn how to use Chronos Protocol"
      >
        <i className="bi bi-question-circle me-1"></i> How to Use
      </Button>

      <TutorialModal 
        show={showTutorial} 
        onHide={handleHide} 
      />
    </>
  );
};

export default TutorialButton;
