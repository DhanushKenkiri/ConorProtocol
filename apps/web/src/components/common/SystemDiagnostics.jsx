import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Badge, Tab, Tabs } from 'react-bootstrap';
import { useAddress, useChainId, useSDK } from '@thirdweb-dev/react';
import validateSystem from '../../utils/systemValidator';
import testAlchemyConnection from '../../utils/alchemyTester';
import { debugChainId } from '../../utils/chainDebugger';
import { BASE_SEPOLIA_CHAIN_ID, ALCHEMY_API_KEY } from '../../config/thirdweb';

/**
 * SystemDiagnostics component for administrators to diagnose system issues
 */
const SystemDiagnostics = () => {
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const address = useAddress();
  const chainId = useChainId();
  const sdk = useSDK();
  
  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      // Collect all diagnostics
      console.group('📊 Running System Diagnostics');
      
      // 1. System Validation
      const systemValidation = await validateSystem();
      
      // 2. Chain Debugging
      const chainDebug = await debugChainId();
      
      // 3. Alchemy Connection Test (if on Base Sepolia)
      let alchemyTest = null;
      if (chainDebug?.isBaseSepoliaNetwork) {
        alchemyTest = await testAlchemyConnection();
      }
      
      // 4. Environment info
      const envInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        alchemyConfigured: !!ALCHEMY_API_KEY && ALCHEMY_API_KEY !== 'your-api-key-here',
        networkCorrect: chainId === BASE_SEPOLIA_CHAIN_ID,
        walletConnected: !!address
      };
      
      console.groupEnd();
      
      setDiagnosticResults({
        systemValidation,
        chainDebug,
        alchemyTest,
        envInfo
      });
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDiagnosticResults({
        error: error.message || 'Unknown error during diagnostics'
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  // Format issue status badges
  const getStatusBadge = (valid) => {
    return valid ? 
      <Badge bg="success">PASS</Badge> :
      <Badge bg="danger">FAIL</Badge>;
  };
  
  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>System Diagnostics</span>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={runDiagnostics}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </Card.Header>
      
      {!diagnosticResults && !isRunning && (
        <Card.Body>
          <p className="text-muted">
            Click "Run Diagnostics" to check the system configuration and connections.
            This will help identify any issues with the Chronos Protocol setup.
          </p>
        </Card.Body>
      )}
      
      {isRunning && (
        <Card.Body>
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-3">Running diagnostics...</span>
          </div>
        </Card.Body>
      )}
      
      {diagnosticResults && !isRunning && (
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
            fill
          >
            <Tab eventKey="summary" title="Summary">
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Configuration</span>
                  {getStatusBadge(diagnosticResults.systemValidation?.results.config.valid)}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Network Connection</span>
                  {getStatusBadge(diagnosticResults.systemValidation?.results.network.valid)}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Backend API</span>
                  {getStatusBadge(diagnosticResults.systemValidation?.results.api.valid)}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Alchemy Integration</span>
                  {getStatusBadge(diagnosticResults.alchemyTest?.success)}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Wallet Connection</span>
                  {getStatusBadge(!!address)}
                </ListGroup.Item>
              </ListGroup>
            </Tab>
            
            <Tab eventKey="details" title="Details">
              <div className="mb-4">
                <h6>Configuration Issues:</h6>
                {diagnosticResults.systemValidation?.results.config.issues.length === 0 ? (
                  <p className="text-success">No configuration issues found</p>
                ) : (
                  <ul className="text-danger">
                    {diagnosticResults.systemValidation?.results.config.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="mb-4">
                <h6>Network Issues:</h6>
                {diagnosticResults.systemValidation?.results.network.issues.length === 0 ? (
                  <p className="text-success">No network issues found</p>
                ) : (
                  <ul className="text-danger">
                    {diagnosticResults.systemValidation?.results.network.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="mb-4">
                <h6>API Issues:</h6>
                {diagnosticResults.systemValidation?.results.api.issues.length === 0 ? (
                  <p className="text-success">No API issues found</p>
                ) : (
                  <ul className="text-danger">
                    {diagnosticResults.systemValidation?.results.api.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Tab>
            
            <Tab eventKey="network" title="Network">
              <div className="mb-3">
                <h6>Chain Information:</h6>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Current Chain ID:</strong> {diagnosticResults.chainDebug?.parsedChainId || 'Unknown'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Expected Chain ID:</strong> {BASE_SEPOLIA_CHAIN_ID} (Base Sepolia)
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Is Correct Network:</strong> {diagnosticResults.chainDebug?.isBaseSepoliaNetwork ? 'Yes ✓' : 'No ✗'}
                  </ListGroup.Item>
                  {diagnosticResults.alchemyTest?.success && (
                    <>
                      <ListGroup.Item>
                        <strong>Latest Block:</strong> {diagnosticResults.alchemyTest.blockNumber}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Gas Price:</strong> {diagnosticResults.alchemyTest.gasPrice} Gwei
                      </ListGroup.Item>
                    </>
                  )}
                </ListGroup>
              </div>
            </Tab>
            
            <Tab eventKey="env" title="Environment">
              <div className="mb-3">
                <h6>Environment Information:</h6>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>User Agent:</strong> {diagnosticResults.envInfo?.userAgent}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Window Size:</strong> {diagnosticResults.envInfo?.windowSize}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Timestamp:</strong> {diagnosticResults.envInfo?.timestamp}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Wallet Address:</strong> {address || 'Not connected'}
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      )}
      
      {diagnosticResults?.error && (
        <Card.Footer className="text-danger">
          Error: {diagnosticResults.error}
        </Card.Footer>
      )}
    </Card>
  );
};

export default SystemDiagnostics;
