import React from 'react';
import { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner } from 'react-bootstrap';
import alchemyService from '../../services/alchemyService';
import { safeToNumber, formatGasInMillions } from '../../utils/numberUtils';

/**
 * AlchemyNetworkStatus component displays detailed network information from Alchemy
 */
const AlchemyNetworkStatus = () => {
  const [networkData, setNetworkData] = useState({
    loading: true,
    error: null,
    block: null,
    gasPrice: null,
    pending: 0
  });
  
  useEffect(() => {
    let mounted = true;
    
    const fetchNetworkData = async () => {
      if (!mounted) return;
      
      try {
        setNetworkData(prev => ({ ...prev, loading: true }));
        
        // Fetch latest block and gas price with direct calls to methods
        const [blockNumber, gasPrice] = await Promise.all([
          alchemyService.getBlockNumber(),
          alchemyService.getGasPrice()
        ]);
        
        // Use our method instead of direct alchemy access
        let block;
        try {
          if (alchemyService.isInitialized()) {
            block = await alchemyService.alchemy.core.getBlock(blockNumber);
          } else {
            block = { timestamp: Date.now() / 1000 }; // Fallback with current time
          }
        } catch (err) {
          console.warn('Failed to get block details:', err);
          block = { timestamp: Date.now() / 1000 }; // Fallback with current time
        }
        
        if (mounted) {
          setNetworkData({
            loading: false,
            block,
            blockNumber: blockNumber || 0,
            gasPrice: gasPrice || "0.00",
            pending: 0,
            timestamp: new Date(block.timestamp * 1000),
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching network data:', error);
        if (mounted) {
          setNetworkData(prev => ({ 
            ...prev, 
            loading: false,
            error: error.message || 'Failed to load network data'
          }));
        }
      }
    };
    
    // Initial fetch
    fetchNetworkData();
    
    // Set up polling for updates
    const intervalId = setInterval(fetchNetworkData, 15000);
    
    // Clean up
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(timestamp);
  };
    // Handle real-time monitoring for new blocks
  useEffect(() => {
    const subscription = alchemyService.monitorMempool(async (blockNumber) => {
      try {
        // Use safer approach
        let block;
        try {
          if (alchemyService.isInitialized()) {
            block = await alchemyService.alchemy.core.getBlock(blockNumber);
          } else {
            block = { timestamp: Date.now() / 1000 }; // Fallback
          }
        } catch (err) {
          console.warn('Failed to get block details in monitor:', err);
          block = { timestamp: Date.now() / 1000 }; // Fallback
        }
        
        setNetworkData(prev => ({
          ...prev,
          block,
          blockNumber,
          timestamp: new Date(block.timestamp * 1000)
        }));
      } catch (error) {
        console.error('Error fetching new block data:', error);
      }
    });
    
    // Clean up subscription
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
          <span>Alchemy Network Status</span>
        </div>
        {networkData.loading && (
          <Spinner animation="border" size="sm" />
        )}
      </Card.Header>
      
      <Card.Body>
        {networkData.error ? (
          <div className="text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {networkData.error}
          </div>
        ) : (
          <>
            <div className="d-flex mb-3">
              <Badge bg="primary" className="me-2 p-2">
                <i className="bi bi-layers me-1"></i>
                Block #{networkData.blockNumber?.toLocaleString() || '...'}
              </Badge>
              
              <Badge bg="info" className="me-2 p-2">
                <i className="bi bi-fuel-pump me-1"></i>
                {networkData.gasPrice || '...'} Gwei
              </Badge>
              
              <Badge bg="secondary" className="p-2">
                <i className="bi bi-clock me-1"></i>
                {networkData.timestamp ? formatTime(networkData.timestamp) : '...'}
              </Badge>
            </div>
            
            <Table size="sm" striped borderless>
              <tbody>
                <tr>
                  <td>Gas Used</td>
                  <td className="text-end">                    {networkData.block && networkData.block.gasUsed ? 
                      formatGasInMillions(networkData.block.gasUsed) : 
                      '...'}
                  </td>
                </tr>
                <tr>
                  <td>Gas Limit</td>
                  <td className="text-end">                    {networkData.block && networkData.block.gasLimit ? 
                      formatGasInMillions(networkData.block.gasLimit) : 
                      '...'}
                  </td>
                </tr>
                <tr>
                  <td>Utilization</td>
                  <td className="text-end">                    {networkData.block && networkData.block.gasUsed && networkData.block.gasLimit ? 
                      `${(safeToNumber(networkData.block.gasUsed) / safeToNumber(networkData.block.gasLimit) * 100).toFixed(2)}%` : 
                      '...'}
                  </td>
                </tr>
                <tr>
                  <td>Transactions</td>
                  <td className="text-end">
                    {networkData.block?.transactions?.length || '...'}
                  </td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default AlchemyNetworkStatus;
