# Chronos Protocol: Alchemy SDK Integration

This document provides an overview of the Alchemy SDK integration in the Chronos Protocol project.

## Overview

The Chronos Protocol integrates with Alchemy SDK to enhance Base Sepolia testnet RPC access and provide advanced blockchain capabilities. Alchemy provides superior reliability, performance, and additional features compared to standard RPC endpoints.

## Features Implemented

### Base Functionality
- **Enhanced RPC Provider**: More reliable and faster provider for the Base Sepolia testnet
- **Gas Price Monitoring**: Real-time gas price tracking and display
- **Block Monitoring**: Real-time block updates and network status

### Frontend Features
- **WalletConnect Component**: Enhanced with Alchemy-powered gas price and network information
- **AlchemyNetworkStatus Component**: Detailed network dashboard showing Base Sepolia status
- **Enhanced Transaction Management**: Better transaction tracking and status updates

### Backend Features
- **Optimized Gas Estimation**: Smart gas price recommendations based on network conditions
- **Contract Event Monitoring**: Efficient websocket-based event monitoring
- **Enhanced Transaction Analytics**: Detailed transaction information and status tracking

### Developer Tools
- **Optimal Gas Script**: Helper script for calculating optimal gas prices
- **Alchemy Config Check**: Validation script for Alchemy SDK configuration
- **Advanced Feature Testing**: Script to test and demonstrate Alchemy's capabilities

## API Endpoints

The following API endpoints leverage Alchemy's capabilities:

- `GET /api/gas-price`: Get current gas price in Gwei and Wei
- `GET /api/gas-recommendations`: Get recommended gas prices (low, medium, high)
- `GET /api/nft/:contractAddress/:tokenId`: Get NFT metadata
- `GET /api/nfts/owner/:address`: Get NFTs owned by an address
- `GET /api/transaction/:txHash`: Get enhanced transaction details
- `GET /api/account/:address/nonce`: Get transaction count and nonce for an address

## Configuration

### Environment Variables

The following environment variables are required:

```
# Alchemy configuration
ALCHEMY_API_KEY=your-alchemy-api-key-here
ALCHEMY_BASE_SEPOLIA_URL=https://base-sepolia.g.alchemy.com/v2/your-alchemy-api-key-here
```

### Initialization

The Alchemy SDK is initialized in multiple places:

1. **Frontend**: `apps/web/src/config/alchemy.js`
2. **Server**: `server/utils/alchemy.js`
3. **Scripts**: Various scripts in the `scripts` directory

## Usage Examples

### Get Current Gas Price

```javascript
const gasPrice = await alchemyService.getGasPrice();
console.log(`Current gas price: ${gasPrice} Gwei`);
```

### Monitor Mempool for New Transactions

```javascript
const subscription = alchemyService.monitorMempool((blockNumber) => {
  console.log(`New block detected: ${blockNumber}`);
});

// Later, unsubscribe when done
subscription.unsubscribe();
```

### Send Transaction with Optimal Gas

```javascript
const { sendTransactionWithOptimalGas } = require('./scripts/optimal-gas');

// Transaction parameters
const txParams = {
  to: recipientAddress,
  value: ethers.utils.parseEther("0.01")
};

// Send with medium priority gas (can also use 'low' or 'high')
const result = await sendTransactionWithOptimalGas(txParams, 'medium');
console.log(`Transaction confirmed in block ${result.receipt.blockNumber}`);
```

## Testing

### Verify Configuration

Run the configuration test script:

```
npm run check:alchemy
```

### Test Advanced Features

Test the advanced Alchemy features:

```
npm run test:alchemy-features
```

## Troubleshooting

If you encounter issues with the Alchemy integration:

1. Verify your API key in the `.env` file
2. Check that your Alchemy subscription has enough units
3. Run the `check:alchemy` script to validate your configuration
4. Monitor the Alchemy dashboard for rate limits or other issues

## Upgrading to Alchemy's Premium Features

For production use, consider upgrading to Alchemy's premium plans for:

- Higher rate limits
- Enhanced reliability
- Access to Notify API for webhooks
- Enhanced analytics dashboard
- NFT API access
- Debug and Trace API access

## References

- [Alchemy SDK Documentation](https://docs.alchemy.com/reference/alchemy-sdk-quickstart)
- [Base Sepolia Documentation](https://docs.base.org/guides/tools/network-faucets)
- [Ethereum Gas Price Strategies](https://docs.ethers.org/v5/api/utils/display-logic/#utils-parseUnits)
