import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { ALCHEMY_API_KEY, CHRONOS_FACTORY_ADDRESS } from '../config/thirdweb.jsx';
import debugChainId from './chainDebugger';
import testAlchemyConnection from './alchemyTester';

/**
 * System health checker - runs diagnostic tests and reports issues
 */
export const runSystemHealthCheck = async () => {
  const results = {
    checks: [],
    status: 'success',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Check 1: Environment variables
    results.checks.push({
      name: 'Configuration',
      status: ALCHEMY_API_KEY ? 'success' : 'warning',
      message: ALCHEMY_API_KEY 
        ? 'Alchemy API key is configured' 
        : 'Alchemy API key not found in environment variables'
    });
    
    results.checks.push({
      name: 'Smart Contract',
      status: CHRONOS_FACTORY_ADDRESS ? 'success' : 'error',
      message: CHRONOS_FACTORY_ADDRESS
        ? `Factory contract address configured: ${CHRONOS_FACTORY_ADDRESS.substring(0, 8)}...` 
        : 'Chronos Factory address not configured'
    });
    
    // Check 2: API Server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/health`, {
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (response.ok) {
        const data = await response.json();
        results.checks.push({
          name: 'API Server',
          status: 'success',
          message: `API server running: ${data.status || 'OK'}`
        });
      } else {
        results.checks.push({
          name: 'API Server',
          status: 'warning',
          message: `API server returned status ${response.status}`
        });
      }
    } catch (error) {
      results.checks.push({
        name: 'API Server',
        status: 'error',
        message: error.name === 'AbortError' 
          ? 'API server connection timed out' 
          : `API server not reachable: ${error.message}`
      });
    }
    
    // Check 3: Network connection
    if (window.ethereum) {
      const chainInfo = await debugChainId();
      if (chainInfo) {
        results.checks.push({
          name: 'Network',
          status: chainInfo.isBaseSepoliaNetwork ? 'success' : 'warning',
          message: chainInfo.isBaseSepoliaNetwork
            ? 'Connected to Base Sepolia network'
            : `Connected to network ID ${chainInfo.parsedChainId} (not Base Sepolia)`
        });
      } else {
        results.checks.push({
          name: 'Network',
          status: 'warning',
          message: 'Unable to detect network'
        });
      }
    } else {
      results.checks.push({
        name: 'Network',
        status: 'warning',
        message: 'No Web3 provider detected'
      });
    }
    
    // Check 4: Alchemy API
    if (ALCHEMY_API_KEY) {
      try {
        const alchemyTest = await testAlchemyConnection();
        results.checks.push({
          name: 'Alchemy API',
          status: alchemyTest.success ? 'success' : 'error',
          message: alchemyTest.success
            ? `Connected to Alchemy API, latest block: ${alchemyTest.blockNumber}`
            : `Failed to connect to Alchemy: ${alchemyTest.error}`
        });
      } catch (error) {
        results.checks.push({
          name: 'Alchemy API',
          status: 'error',
          message: `Alchemy test failed: ${error.message}`
        });
      }
    }
    
    // Determine overall status (error if any check has error)
    if (results.checks.some(check => check.status === 'error')) {
      results.status = 'error';
    } else if (results.checks.some(check => check.status === 'warning')) {
      results.status = 'warning';
    }
    
    return results;
  } catch (error) {
    console.error('System health check failed:', error);
    return {
      checks: [{
        name: 'System',
        status: 'error',
        message: `System health check failed: ${error.message}`
      }],
      status: 'error',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * System Health Modal Component
 */
const SystemHealthChecker = () => {
  const [show, setShow] = useState(false);
  const [healthResults, setHealthResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      try {
        const results = await runSystemHealthCheck();
        setHealthResults(results);
        
        // Auto-show modal only if there are errors
        if (results.status === 'error') {
          setShow(true);
        }
      } catch (error) {
        console.error('Health check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Run the health check when component mounts
    checkHealth();
  }, []);
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const getBadgeVariant = (status) => {
    switch(status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'secondary';
    }
  };
  
  return (
    <>
      {healthResults && healthResults.status !== 'success' && (
        <Button 
          variant={healthResults.status === 'error' ? 'danger' : 'warning'}
          size="sm"
          onClick={handleShow}
          className="position-fixed bottom-0 end-0 m-3"
        >
          System Health Issues
        </Button>
      )}
      
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>System Health Check</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <p>Running system health checks...</p>
          ) : healthResults ? (
            <>
              <ListGroup>
                {healthResults.checks.map((check, index) => (
                  <ListGroup.Item 
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{check.name}: </strong>
                      {check.message}
                    </div>
                    <Badge bg={getBadgeVariant(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <p className="mt-3 small text-muted">
                Last checked: {new Date(healthResults.timestamp).toLocaleString()}
              </p>
            </>
          ) : (
            <p>No health data available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              setLoading(true);
              const results = await runSystemHealthCheck();
              setHealthResults(results);
              setLoading(false);
            }}
          >
            Run Checks Again
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SystemHealthChecker;
