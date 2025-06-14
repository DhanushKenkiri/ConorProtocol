import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { WalletContext } from '../../context/WalletProvider';
import { CHRONOS_FACTORY_ADDRESS } from '../../config/thirdweb';
import { useAddress, useContract, useContractRead } from '@thirdweb-dev/react';

/**
 * Component to check smart contract connection status
 */
const SmartContractChecker = () => {
  const [checking, setChecking] = useState(false);
  const [contractStatus, setContractStatus] = useState(null);
  const [error, setError] = useState(null);
  const { isBaseSepoliaChain } = useContext(WalletContext);
  const address = useAddress();
    // Get contract instance
  const { contract: factoryContract } = useContract(CHRONOS_FACTORY_ADDRESS);
  
  // Attempt to read contract data - get deployed agreements array
  const { data: deployedAgreements, isLoading: isLoadingCount } = useContractRead(
    factoryContract,
    "getDeployedAgreements"
  );

  const checkContractConnection = async () => {
    if (!isBaseSepoliaChain) {
      setError('Must be connected to Base Sepolia network');
      return;
    }
    
    if (!address) {
      setError('Wallet not connected');
      return;
    }
    
    setChecking(true);
    setError(null);
      try {
      // Attempt to interact with contract
      const agreementCount = deployedAgreements ? deployedAgreements.length : 0;
      
      const status = {
        factoryAddress: CHRONOS_FACTORY_ADDRESS,
        agreementCount: agreementCount.toString(),
        networkName: 'Base Sepolia',
        timestamp: new Date().toISOString()
      };
      
      setContractStatus(status);
    } catch (err) {
      console.error('Contract interaction error:', err);
      setError(err.message || 'Failed to interact with smart contract');
    } finally {
      setChecking(false);
    }
  };
  
  // Check when first loaded if conditions are met
  useEffect(() => {
    if (isBaseSepoliaChain && address && !contractStatus && !checking) {
      checkContractConnection();
    }
  }, [isBaseSepoliaChain, address, contractStatus, checking]);
  
  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Smart Contract Status</span>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={checkContractConnection}
          disabled={checking || !isBaseSepoliaChain || !address}
        >
          {checking ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Checking...
            </>
          ) : 'Check Connection'}
        </Button>
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {!isBaseSepoliaChain && (
          <Alert variant="warning">
            Please connect to Base Sepolia network first
          </Alert>
        )}
        
        {!address && (
          <Alert variant="warning">
            Please connect your wallet first
          </Alert>
        )}
        
        {contractStatus && (
          <>
            <Alert variant="success">
              <strong>✅ Contract Connected!</strong>
            </Alert>
            
            <Table striped bordered hover size="sm">
              <tbody>
                <tr>
                  <td><strong>Factory Address:</strong></td>
                  <td>
                    <a 
                      href={`https://sepolia.basescan.org/address/${contractStatus.factoryAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-break"
                    >
                      {contractStatus.factoryAddress}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><strong>Agreement Count:</strong></td>
                  <td>{isLoadingCount ? <Spinner animation="border" size="sm" /> : contractStatus.agreementCount}</td>
                </tr>
                <tr>
                  <td><strong>Network:</strong></td>
                  <td>{contractStatus.networkName}</td>
                </tr>
                <tr>
                  <td><strong>Last Checked:</strong></td>
                  <td>{new Date(contractStatus.timestamp).toLocaleTimeString()}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default SmartContractChecker;
