import React from 'react';
import { useState, useContext, useEffect } from 'react';
import Button from '../ui/Button';
import { WalletContext } from '../../context/WalletProvider';
import { Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import alchemyService from '../../services/alchemyService';

/**
 * Wallet connection component
 */
const WalletConnect = () => {
  const { 
    account, 
    connect, 
    disconnect,
    switchToBaseSepolia,
    isBaseSepoliaChain,
    chainId
  } = useContext(WalletContext);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gasPrice, setGasPrice] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({ loading: false });
  
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
      setIsConnecting(false);
    } catch (error) {
      console.error('Connection error:', error);
      window.showToast('Connection Error', error.message, {
        autohide: true
      });
      setIsConnecting(false);
    }
  };
  
  const handleSwitchNetwork = async () => {
    try {
      await switchToBaseSepolia();
    } catch (error) {
      console.error('Network switch error:', error);
      window.showToast('Network Error', 'Failed to switch network', {
        autohide: true
      });
    }
  };  // Fetch gas price using Alchemy SDK with enhanced error handling
  useEffect(() => {
    if (isBaseSepoliaChain) {
      // Keep track of consecutive errors
      let errorCount = 0;
      const MAX_ERRORS = 3;
      
      // Cache for storing last successful values
      const cache = {
        blockNumber: null,
        gasPrice: null,
        lastUpdated: 0
      };
      
      const fetchBlockData = async () => {
        try {
          // Check if we're experiencing network issues
          if (!window._alchemyNetworkIssues) {
            setNetworkStatus({ loading: true });
            
            // Use the safer method implementations with custom timeouts
            if (alchemyService.isInitialized()) {
              // Use Promise.race to implement timeout with a cleaner pattern
              const withTimeout = (promise, timeoutMs) => {
                const timeoutPromise = new Promise((_, reject) => {
                  const id = setTimeout(() => {
                    clearTimeout(id);
                    reject(new Error(`Request timed out after ${timeoutMs}ms`));
                  }, timeoutMs);
                });
                return Promise.race([promise, timeoutPromise]);
              };
              
              // Attempt to get both block number and gas price
              try {
                const [blockNum, gasRecommendations] = await Promise.all([
                  withTimeout(alchemyService.getBlockNumber(), 5000),
                  withTimeout(alchemyService.getGasPrice(), 5000)
                ]);
                
                // Reset error count on success
                errorCount = 0;
                
                // Update cache
                cache.blockNumber = blockNum;
                cache.gasPrice = gasRecommendations;
                cache.lastUpdated = Date.now();
                
                // Update state
                setBlockNumber(blockNum);
                setGasPrice(gasRecommendations);
                setNetworkStatus({ 
                  loading: false, 
                  blockNumber: blockNum,
                  gasPrice: gasRecommendations,
                  timestamp: new Date().toISOString()
                });
              } catch (timeoutErr) {
                console.warn('Network timeout:', timeoutErr);
                errorCount++;
                
                // Use cached data if available
                if (cache.blockNumber && cache.gasPrice) {
                  setNetworkStatus({
                    loading: false,
                    blockNumber: cache.blockNumber,
                    gasPrice: cache.gasPrice,
                    cached: true,
                    timestamp: new Date(cache.lastUpdated).toISOString(),
                    warning: 'Using cached data due to timeout'
                  });
                } else {
                  throw timeoutErr; // Re-throw to be caught by outer catch
                }
              }
            } else {
              setNetworkStatus({ 
                loading: false, 
                error: 'Alchemy service not available'
              });
            }
          } else {
            // Use cached data when network issues detected
            setNetworkStatus({
              loading: false,
              error: 'Network issues detected',
              cached: true,
              ...(cache.blockNumber && cache.gasPrice ? {
                blockNumber: cache.blockNumber,
                gasPrice: cache.gasPrice,
                timestamp: new Date(cache.lastUpdated).toISOString()
              } : {})
            });
          }
        } catch (error) {
          console.error('Error fetching network data:', error);          errorCount++;
          
          // If we have too many consecutive errors, stop trying for a while
          if (errorCount >= MAX_ERRORS) {
            // Mark for global network issues
            window._alchemyNetworkIssues = true;
            
            // Set an auto-recovery timer
            setTimeout(() => {
              window._alchemyNetworkIssues = false;
              console.log('Network cool-down period ended, resuming normal operations');
            }, 60000); // 1 minute cool-down
            
            setNetworkStatus({
              loading: false,
              error: 'Too many consecutive errors, pausing requests',
              cached: true,
              ...(cache?.blockNumber ? {
                blockNumber: cache.blockNumber,
                gasPrice: cache.gasPrice,
                timestamp: new Date(cache.lastUpdated).toISOString()
              } : {})
            });
          }          // Note: We already have the errorCount handling above, so we can remove the duplicate code here
          setNetworkStatus({ 
            loading: false, 
            error: 'Failed to load network data'
          });
        }
      };
        // Initial fetch
      fetchBlockData();
      
      // Set up interval for periodic updates with adaptive interval based on network health
      const intervalId = setInterval(() => {
        // Use longer interval when network issues are detected
        if (window._alchemyNetworkIssues) {
          console.log('Network issues detected, using longer polling interval');
          // We'll let the automatic recovery handle resuming normal operations
          return;
        }
        fetchBlockData();
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [isBaseSepoliaChain]);  // Handle websocket subscription for new blocks with enhanced error handling
  useEffect(() => {
    if (!isBaseSepoliaChain) return;
    
    let subscription = null;
    let retryCount = 0;
    const MAX_RETRY = 3;
    
    const setupSubscription = () => {
      // Don't try to set up if we're in network cooldown
      if (window._alchemyNetworkIssues) {
        console.log('Network issues detected, skipping websocket setup');
        return;
      }
      
      // Only set up the mempool monitoring if Alchemy is properly initialized
      if (alchemyService.isInitialized()) {
        try {
          subscription = alchemyService.monitorMempool((blockNumber) => {
            if (blockNumber) {
              setBlockNumber(blockNumber);
              
              // Successfully receiving blocks means we can reset retry count
              retryCount = 0;
            }
          });
        } catch (error) {
          console.error('Error setting up mempool monitoring:', error);
          retryCount++;
          
          // Try again with exponential backoff if we haven't exceeded max retries
          if (retryCount < MAX_RETRY) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Will retry websocket setup in ${delay}ms`);
            setTimeout(setupSubscription, delay);
          }
        }
      }
    };
    
    // Initial setup
    setupSubscription();
    
    return () => {
      // Safe cleanup of subscription
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from mempool:', error);
        }
      }
    };
  }, [isBaseSepoliaChain]);
  
  // Format account address for display
  const formatAccount = (account) => {
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };
    // Render network badges
  const renderNetworkBadges = () => {
    if (!isBaseSepoliaChain) return null;
    
    return (
      <div className="d-flex align-items-center gap-2 my-2">
        {gasPrice && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Current gas price from Alchemy API</Tooltip>}
          >
            <Badge bg="info" className="d-flex align-items-center">
              <i className="bi bi-fuel-pump me-1"></i>
              {gasPrice} Gwei
            </Badge>
          </OverlayTrigger>
        )}
        
        {blockNumber && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Latest block from Alchemy API</Tooltip>}
          >
            <Badge bg="secondary" className="d-flex align-items-center">
              <i className="bi bi-layers me-1"></i>
              Block #{typeof blockNumber.toLocaleString === 'function' 
                ? blockNumber.toLocaleString() 
                : blockNumber}
            </Badge>
          </OverlayTrigger>
        )}
        
        {networkStatus.loading && (
          <Spinner animation="border" size="sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        )}
        
        {networkStatus.error && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{networkStatus.error}</Tooltip>}
          >
            <Badge bg="warning" className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Network Issue
            </Badge>
          </OverlayTrigger>
        )}
      </div>
    );
  };
  
  return (
    <div className="d-flex flex-column">
      {account ? (
        <div className="d-flex flex-column align-items-start">
          <div className="d-flex align-items-center mb-2">
            <Badge bg="success" className="me-2">Connected</Badge>
            <span className="text-truncate">{formatAccount(account)}</span>
          </div>
            {renderNetworkBadges()}
          
          {!isBaseSepoliaChain ? (
            <Button 
              variant="warning" 
              className="my-2" 
              size="sm"
              onClick={handleSwitchNetwork}
            >
              Switch to Base Sepolia
            </Button>
          ) : (
            <Badge bg="success" className="d-flex align-items-center my-2">
              <i className="bi bi-check-circle me-1"></i>
              Base Sepolia Connected
            </Badge>
          )}
          
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={disconnect}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          variant="primary" 
          onClick={handleConnect} 
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Spinner 
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;
