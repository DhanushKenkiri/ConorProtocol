import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { ethers } from 'ethers';
import Tag from '../ui/Tag';
import Button from '../ui/Button';
import PropTypes from 'prop-types';
import { ContractState } from '../../config/addresses';
import ChronoContractABI from '../../config/abis/ChronoContract.json';

/**
 * ChronoContractCard component displays a smart contract agreement in the chat
 */
const ChronoContractCard = ({ contractAddress, userAddress, provider }) => {
  const [contract, setContract] = useState(null);
  const [details, setDetails] = useState(null);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
    // Initialize contract using API
  useEffect(() => {
    const initContract = async () => {
      if (!contractAddress) return;
      
      try {
        // Still create contract instance for event listening if provider available
        if (provider) {
          const signer = provider.getSigner();
          const contractInstance = new ethers.Contract(
            contractAddress,
            ChronoContractABI,
            signer
          );
          
          setContract(contractInstance);
          
          // Listen for state change events
          const filter = contractInstance.filters.StateChanged();
          contractInstance.on(filter, async (newState) => {
            setState(newState);
            window.showToast('Status Updated', `Agreement status changed to ${getStateLabel(newState)}`, {
              autohide: true
            });
            // Refresh data when state changes
            await loadContractDataFromAPI();
          });
        }
        
        // Load initial data from API
        await loadContractDataFromAPI();
      } catch (error) {
        console.error('Error initializing contract:', error);
        window.showToast('Contract Error', 'Failed to load agreement details', {
          autohide: true
        });
      }
    };
    
    initContract();
    
    return () => {
      // Clean up event listener
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, [contractAddress, provider]);
    // Load contract data from API
  const loadContractDataFromAPI = async () => {
    try {
      setLoading(true);
      
      // Get agreement details from API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/agreement/${contractAddress}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get agreement details');
      }
      
      const data = await response.json();
      
      // Set state
      setState(parseInt(data.state));
      
      // Set details
      setDetails({
        creator: data.owner,
        counterparty: data.counterparty,
        description: data.description,
        deadline: parseInt(data.deadline) * 1000, // Convert to milliseconds
        value: data.value
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading contract data from API:', error);
      setLoading(false);
    }
  };
  
  // Helper to format addresses
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Helper to format dates
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Helper for state labels
  const getStateLabel = (stateNum) => {
    const states = ['Proposed', 'Active', 'Completed', 'Expired', 'Voided'];
    return states[stateNum] || 'Unknown';
  };
  
  // Action handlers  // Helper function to update agreement state via API
  const updateAgreementState = async (newState, actionName, actionDescription) => {
    try {
      setActionLoading(true);
      window.showToast('Processing', actionDescription || `Updating agreement...`, {
        autohide: false
      });
      
      // Call API to update state
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/agreement/${contractAddress}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newState })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${actionName}`);
      }
      
      window.showToast('Transaction Sent', 'Please wait for confirmation...', {
        autohide: false
      });
      
      // Refresh data from API
      await loadContractDataFromAPI();
      
      window.showToast('Success', `Agreement ${actionName} successfully!`, {
        autohide: true
      });
    } catch (error) {
      console.error(`Error ${actionName}:`, error);
      window.showToast('Error', `Failed to ${actionName}: ${error.message}`, {
        autohide: true
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    // State 1 = ACTIVE
    await updateAgreementState(1, 'accepted', 'Accepting agreement and sending funds...');
  };
    const handleReject = async () => {
    // State 4 = VOIDED
    await updateAgreementState(4, 'rejected', 'Rejecting agreement...');
  };
    const handleMarkDone = async () => {
    // For simplicity, we'll use state 2 which is COMPLETED
    // This is an approximation since our API doesn't have a "mark as done" state
    await updateAgreementState(2, 'marked as done', 'Marking task as done...');
  };
    const handleConfirmCompletion = async () => {
    // State 2 = COMPLETED
    await updateAgreementState(2, 'completion confirmed', 'Confirming task completion...');
  };
    const handleReclaimOnExpiry = async () => {
    // State 3 = EXPIRED, for simplicity
    // This is an approximation since our API doesn't have a specific reclaim endpoint
    await updateAgreementState(3, 'funds reclaimed', 'Reclaiming funds...');
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card className="chrono-contract">
        <Card.Body>
          <div className="text-center">Loading agreement details...</div>
        </Card.Body>
      </Card>
    );
  }
  
  // Render error state if no details
  if (!details) {
    return (
      <Card className="chrono-contract">
        <Card.Body>
          <div className="text-center">Failed to load agreement</div>
        </Card.Body>
      </Card>
    );
  }
  
  // Render contract card
  return (
    <Card className="chrono-contract">
      <Card.Header className="chrono-contract-header">
        <div>Chronos Agreement</div>
        <Tag state={state} />
      </Card.Header>
      <Card.Body className="chrono-contract-body">
        <Row>
          <Col md={4}>
            <div className="mb-2">
              <strong>Creator:</strong> {formatAddress(details.creator)}
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-2">
              <strong>Counterparty:</strong> {formatAddress(details.counterparty)}
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-2">
              <strong>Value:</strong> {details.value} ETH
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="mb-2">
              <strong>Deadline:</strong> {formatDate(details.deadline)}
            </div>
            <div className="mb-2">
              <strong>Description:</strong> {details.description}
            </div>
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer className="chrono-contract-footer">
        {/* Action buttons based on role and state */}
        {userAddress === details.counterparty && state === ContractState.PROPOSED && (
          <>
            <Button 
              onClick={handleAccept} 
              disabled={actionLoading}
              className="btn-sm"
            >
              Accept & Fund
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={actionLoading}
              variant="danger"
              className="btn-sm"
            >
              Reject
            </Button>
          </>
        )}
        {userAddress === details.counterparty && state === ContractState.ACTIVE && (
          <Button 
            onClick={handleMarkDone} 
            disabled={actionLoading}
            className="btn-sm"
          >
            Mark as Done
          </Button>
        )}
        {userAddress === details.creator && state === ContractState.ACTIVE && (
          <Button 
            onClick={handleConfirmCompletion} 
            disabled={actionLoading}
            variant="success"
            className="btn-sm"
          >
            Confirm Completion
          </Button>
        )}
        {userAddress === details.creator && state === ContractState.ACTIVE && 
          new Date().getTime() > details.deadline && (
          <Button 
            onClick={handleReclaimOnExpiry} 
            disabled={actionLoading}
            variant="danger"
            className="btn-sm"
          >
            Reclaim Funds
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
};

ChronoContractCard.propTypes = {
  contractAddress: PropTypes.string.isRequired,
  userAddress: PropTypes.string.isRequired,
  provider: PropTypes.object.isRequired
};

export default ChronoContractCard;
