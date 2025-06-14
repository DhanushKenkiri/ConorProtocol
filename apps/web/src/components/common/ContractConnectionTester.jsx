import React, { useState } from 'react';
import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';
import useContractTest from '../../utils/contractTester';
import { useAddress } from '@thirdweb-dev/react';

/**
 * Component for testing ThirdWeb smart contract interactions
 */
const ContractConnectionTester = () => {
  const { runTest } = useContractTest();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const address = useAddress();

  const handleTest = async () => {
    setTesting(true);
    try {
      const testResults = await runTest();
      setResults(testResults);
    } catch (error) {
      setResults({
        success: false,
        error: error.message || 'Test failed',
        message: 'Failed to run contract connection test'
      });
    } finally {
      setTesting(false);
    }
  };

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return 'None';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Smart Contract Connection Tester</span>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={handleTest}
          disabled={testing || !address}
        >
          {testing ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Testing...
            </>
          ) : 'Test Contract'}
        </Button>
      </Card.Header>
      
      {!address && (
        <Card.Body>
          <div className="alert alert-info">
            Connect your wallet to test smart contract interactions
          </div>
        </Card.Body>
      )}
      
      {results && (
        <Card.Body>
          <div className={`alert ${results.success ? 'alert-success' : 'alert-danger'}`}>
            <strong>{results.success ? '✅ Contract Connected!' : '❌ Connection Failed'}</strong>
            <p className="mb-0">{results.message}</p>
          </div>
          
          {results.success && (
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Contract Name:</strong> {results.contractName}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Contract Owner:</strong> {formatAddress(results.contractOwner)}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Network ID:</strong> {results.networkId}
              </ListGroup.Item>
            </ListGroup>
          )}
          
          {!results.success && (
            <div className="mt-3">
              <h6>Error Details:</h6>
              <pre className="bg-light p-3 text-danger">
                {results.error}
              </pre>
              <p>
                Verify that you are connected to Base Sepolia and that the contract address is correct.
              </p>
            </div>
          )}
        </Card.Body>
      )}
    </Card>
  );
};

export default ContractConnectionTester;
