# Chronos Protocol - ThirdWeb Setup Guide

This guide explains how to properly set up and use ThirdWeb SDK for interacting with smart contracts in the Chronos Protocol project.

## What is ThirdWeb?

ThirdWeb is a development framework that makes it easier to build web3 applications. It provides a comprehensive suite of tools for:

- Smart contract deployment and interaction
- Wallet connection management
- Transaction handling
- NFT and token functionality
- Multi-chain compatibility

## Required Configuration

### 1. Environment Variables

Create/update your `.env` file in the project root:

```bash
# Private Key for contract deployment and interactions
PRIVATE_KEY=your-private-key-here

# ThirdWeb configuration (Get from https://thirdweb.com/create-api-key)
THIRDWEB_CLIENT_ID=your-thirdweb-client-id-here
THIRDWEB_SECRET_KEY=your-thirdweb-secret-key-here

# BaseScan API Key (Get from https://basescan.org/myapikey)
BASESCAN_API_KEY=your-basescan-api-key-here

# Base Sepolia RPC URL
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Alchemy configuration (recommended for better performance)
ALCHEMY_API_KEY=your-alchemy-api-key-here
ALCHEMY_BASE_SEPOLIA_URL=https://base-sepolia.g.alchemy.com/v2/your-alchemy-api-key-here
```

For the frontend in `apps/web/.env.local`:

```bash
VITE_API_URL=http://localhost:3001/api
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id-here
VITE_BASE_CHAIN_ID=84532
VITE_CHRONOS_FACTORY_ADDRESS=0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94
VITE_ALCHEMY_API_KEY=your-alchemy-api-key-here
```

### 2. Obtaining the Required API Keys

1. **ThirdWeb Client ID and Secret Key**:
   - Sign up at https://thirdweb.com/
   - Navigate to Dashboard → Settings → API Keys
   - Create a new API key
   - Copy the Client ID and Secret Key to your environment files

2. **BaseScan API Key (for contract verification)**:
   - Register at https://basescan.org/register
   - Go to https://basescan.org/myapikey
   - Create a new API key and copy it to your .env file

3. **Alchemy API Key (optional but recommended)**:
   - Sign up at https://www.alchemy.com/
   - Create a new project for Base Sepolia
   - Copy the API key to your environment files

## Smart Contract Integration

### Backend Integration (server/index.js)

The server uses ThirdWeb SDK to interact with deployed smart contracts:

```javascript
// Initialize ThirdwebSDK with proper configuration
const sdk = ThirdwebSDK.fromSigner(
  wallet,
  BaseSepoliaTestnet,
  {
    clientId: process.env.THIRDWEB_CLIENT_ID,
    secretKey: process.env.THIRDWEB_SECRET_KEY,
    gasSettings: {
      maxPriceInGwei: 500,
      speed: "standard"
    }
  }
);

// Get contract instance
const contract = await sdk.getContract("0x...");

// Interact with contract
const result = await contract.call("functionName", [param1, param2]);
```

### Frontend Integration (React components)

```jsx
import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react";

function MyComponent() {
  const { contract } = useContract("0x...");
  
  // Read contract data
  const { data, isLoading } = useContractRead(contract, "functionName", [param1]);
  
  // Write to contract
  const { mutateAsync, isLoading } = useContractWrite(contract, "functionName");
  
  const handleAction = async () => {
    try {
      const data = await mutateAsync({ args: [param1, param2] });
      console.log("Success:", data);
    } catch (err) {
      console.error("Failed:", err);
    }
  };
  
  return (
    <button onClick={handleAction} disabled={isLoading}>
      {isLoading ? "Processing..." : "Submit"}
    </button>
  );
}
```

## Contract Verification (Using BaseScan API Key)

The BaseScan API key is used to verify your smart contracts on the Base Sepolia block explorer. This makes your contract source code publicly readable and verifiable.

To verify a contract:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

This command will use the BaseScan API key from your `.env` file to verify your deployed contract.

## Troubleshooting

### Common Issues:

1. **"Missing or invalid ThirdWeb client ID"**:
   - Ensure you've created a valid API key at thirdweb.com
   - Check that the client ID is correctly copied into your .env files

2. **"Contract verification failed"**:
   - Make sure your BaseScan API key is valid and correctly set
   - Verify that the contract was compiled with the exact same settings as deployment
   - Ensure constructor arguments are provided in the correct format

3. **"Transaction failed"**:
   - Check that your wallet has sufficient ETH for gas fees
   - Ensure you're connected to the correct network (Base Sepolia)
   - Verify that function parameters match the expected types

## Testing Your Setup

Run the configuration check script to validate your setup:

```bash
npm run check:thirdweb
```

This will verify that all required environment variables and configurations are properly set.
