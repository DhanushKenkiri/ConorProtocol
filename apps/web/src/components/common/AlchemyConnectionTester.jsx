import React, { useState } from 'react';
import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';
import testAlchemyConnection from '../../utils/alchemyTester';

/**
 * Component for testing and displaying Alchemy API connection status
 */
const AlchemyConnectionTester = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runTest = async () => {
    setTesting(true);
    try {
      const testResults = await testAlchemyConnection();
      setResults(testResults);
    } catch (error) {
      setResults({
        success: false,
        error: error.message || 'Test failed',
        message: 'Failed to run Alchemy connection test'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Alchemy API Connection Tester</span>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={runTest}
          disabled={testing}
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
          ) : 'Test Connection'}
        </Button>
      </Card.Header>
      
      {results && (
        <Card.Body>
          <div className={`alert ${results.success ? 'alert-success' : 'alert-danger'}`}>
            <strong>{results.success ? '✅ Connected!' : '❌ Connection Failed'}</strong>
            <p className="mb-0">{results.message}</p>
          </div>
          
          {results.success && (
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Latest Block:</strong> {results.blockNumber}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Current Gas Price:</strong> {results.gasPrice} Gwei
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Network:</strong> Base Sepolia Testnet
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
                Verify your Alchemy API key is correctly configured in your environment variables
                or config file.
              </p>
            </div>
          )}
        </Card.Body>
      )}
    </Card>
  );
};

export default AlchemyConnectionTester;