# Chronos Protocol - Deployment Guide

This guide provides detailed instructions for deploying the Chronos Protocol smart contracts to the Base Sepolia testnet and configuring the frontend application correctly.

## Prerequisites

Before deploying, ensure you have the following:

1. **Base Sepolia ETH**: Your wallet needs testnet ETH for gas fees
   - Get testnet ETH from [Base Sepolia Faucet](https://www.base.org/faucet)

2. **API Keys**:
   - **BaseScan API Key**: For contract verification
   - **Alchemy API Key**: For enhanced RPC connectivity
   - **ThirdWeb Client ID**: For ThirdWeb SDK integration

3. **Environment Variables**: Properly configured in both:
   - `.env` (root directory for contract deployment)
   - `apps/web/.env.local` (frontend environment variables)

## Deployment Steps

### Step 1: Configure Environment Variables

In the root `.env` file:

```properties
# Private Key for contract deployment and interactions
PRIVATE_KEY=your_wallet_private_key

# Alchemy configuration
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_BASE_SEPOLIA_URL=https://base-sepolia.g.alchemy.com/v2/your_alchemy_api_key

# ThirdWeb configuration
THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key

# BaseScan API Key
BASESCAN_API_KEY=your_basescan_api_key
```

In `apps/web/.env.local`:

```properties
VITE_API_URL=http://localhost:3001/api
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_BASE_CHAIN_ID=84532
VITE_CHRONOS_FACTORY_ADDRESS=0x... # Will be updated after deployment
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

### Step 2: Verify Your Configuration

Run configuration checks:

```bash
npm run check:thirdweb
npm run check:alchemy
```

### Step 3: Deploy Contracts

Use our streamlined deployment script:

```bash
npm run deploy:base-sepolia
```

This script will:
- Deploy the ChronosFactory contract to Base Sepolia
- Update the `addresses.js` configuration file
- Verify the contract on BaseScan (if BaseScan API key is provided)

### Step 4: Manual Verification (If Needed)

If automatic verification fails, you can verify manually:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

### Step 5: Update Frontend Configuration

The deployment script automatically updates `apps/web/src/config/addresses.js` with the new contract address. If you deployed manually, be sure to update this file yourself.

### Step 6: Build and Launch Frontend

```bash
npm run build
npm run start
```

## Advanced Deployment Options

### Deploy with ThirdWeb SDK

For more advanced deployment options using ThirdWeb SDK:

```javascript
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');
const { BaseSepoliaTestnet } = require('@thirdweb-dev/chains');

async function deployWithThirdweb() {
  // Initialize SDK with signer
  const sdk = ThirdwebSDK.fromSigner(wallet, BaseSepoliaTestnet);

  // Deploy contract
  const contract = await sdk.deployer.deployContract({
    name: "ChronosFactory",
    contractType: "custom",
    abi: ChronosFactoryABI,
    bytecode: ChronosFactoryBytecode,
  });
  
  console.log("Deployed at:", contract.address);
}
```

### Configuring Gas Optimization

For more efficient transactions, the following gas settings are used:

```javascript
{
  gasSettings: {
    maxPriceInGwei: 500,
    speed: "standard"
  }
}
```

You can adjust these in `apps/web/src/config/thirdweb.js` based on network conditions.

## Troubleshooting

### Deployment Failures

1. **Insufficient funds**: Ensure your wallet has enough Base Sepolia ETH
   - Check balance: `npx hardhat run scripts/check-wallet.js`

2. **Network issues**: Base Sepolia might be experiencing high traffic
   - Try increasing the `gasMultiplier` in `hardhat.config.js`
   - Wait and try again later

3. **Verification errors**: BaseScan can sometimes be slow or fail
   - Retry manual verification after a few minutes
   - Check compiler settings match in Hardhat config

## Next Steps After Deployment

1. Test your deployed contracts by interacting with them on BaseScan
2. Run the frontend application against the deployed contracts
3. Verify all application features work correctly with your deployed contracts
