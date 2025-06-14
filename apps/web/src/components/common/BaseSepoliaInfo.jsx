import React, { useState } from 'react';
import { Alert, Button, Collapse } from 'react-bootstrap';
import { useContext } from 'react';
import { WalletContext } from '../../context/WalletProvider';
import AlchemyNetworkStatus from './AlchemyNetworkStatus';
import AlchemyConnectionTester from './AlchemyConnectionTester';
import SmartContractChecker from './SmartContractChecker';

/**
 * Component that displays info about Base Sepolia testnet and links to a faucet
 */
const BaseSepoliaInfo = () => {
  const { isBaseSepoliaChain, switchToBaseSepolia, account } = useContext(WalletContext);
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);

  return (
    <>      <Alert variant={isBaseSepoliaChain ? "success" : "warning"} className="mb-4">
        <Alert.Heading className="d-flex justify-content-between align-items-center">
          <span>
            {isBaseSepoliaChain ? 
              'Connected to Base Sepolia Testnet ✓' : 
              'Base Sepolia Testnet Required'
            }
          </span>
          {isBaseSepoliaChain && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setShowNetworkDetails(!showNetworkDetails)}
            >
              {showNetworkDetails ? 'Hide Details' : 'Show Network Details'}
            </Button>
          )}
        </Alert.Heading>
        <p>
          {isBaseSepoliaChain ? 
            'You are correctly connected to the Base Sepolia testnet. You can use the application now.' : 
            'This application runs on Base Sepolia testnet. You need to switch networks and get Base Sepolia ETH to use this app.'
          }
        </p>
        
        {!isBaseSepoliaChain && (
          <div className="mb-3">
            <Button 
              variant="primary" 
              onClick={switchToBaseSepolia}
              className="me-2"
            >
              Switch to Base Sepolia
            </Button>
          </div>
        )}
        
        {account && isBaseSepoliaChain && (
          <div>
            <p>Need testnet ETH?</p>
            <Button 
              variant="success" 
              href="https://faucet.base.org" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Get Base Sepolia ETH
            </Button>
          </div>
        )}
      </Alert>      {isBaseSepoliaChain && (
        <Collapse in={showNetworkDetails}>
          <div>
            <AlchemyConnectionTester />
            <SmartContractChecker />
            <AlchemyNetworkStatus />
          </div>
        </Collapse>
      )}</>
  );
};

export default BaseSepoliaInfo;
