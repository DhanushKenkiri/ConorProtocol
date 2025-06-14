# Smart Contract Interactions with ThirdWeb in Chronos Protocol

This document provides a comprehensive guide on how to properly implement ThirdWeb for smart contract interactions in the Chronos Protocol application.

## Overview of ThirdWeb Implementation

In Chronos Protocol, we use ThirdWeb in several key areas:

1. **Frontend Components**: For wallet connection, contract interactions, and UI components
2. **Server-Side**: For secure contract interactions, transaction signing, and event monitoring
3. **Smart Contract Deployment**: For deploying and verifying contracts on Base Sepolia testnet

## Key ThirdWeb Components Used

### 1. ThirdWeb Provider

```jsx
// In main.jsx
<ThirdwebProvider 
  activeChain={BaseSepoliaTestnet}
  clientId={THIRDWEB_CLIENT_ID}
  supportedChains={[BaseSepoliaTestnet]}
  sdkOptions={{
    alchemyApiKey: ALCHEMY_API_KEY,
    gasSettings: {
      maxPriceInGwei: 500,
      speed: "standard"
    },
  }}
>
  <App />
</ThirdwebProvider>
```

### 2. React Hooks for Frontend

```jsx
// Contract interaction hooks
import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react";

// Wallet connection hooks
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";

// Contract events hooks
import { useContractEvents } from "@thirdweb-dev/react";
```

### 3. Server-Side SDK Initialization

```javascript
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');
const { BaseSepoliaTestnet } = require('@thirdweb-dev/chains');

// Initialize with a signer for transactions
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
const contract = await sdk.getContract("0xYourContractAddress");
```

## Best Practices for Smart Contract Interactions

### Reading Contract Data

```jsx
// In a React component
import { useContractRead } from "@thirdweb-dev/react";

function ContractDataDisplay({ contractAddress }) {
  const { contract } = useContract(contractAddress);
  
  const { data: agreementDetails, isLoading, error } = useContractRead(
    contract, 
    "getAgreementDetails"
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h3>Agreement Details</h3>
      <p>Creator: {agreementDetails.creator}</p>
      <p>Description: {agreementDetails.description}</p>
      {/* Display other data */}
    </div>
  );
}
```

### Writing to Contracts

```jsx
// In a React component
import { useContractWrite } from "@thirdweb-dev/react";

function CompleteAgreementButton({ contractAddress }) {
  const { contract } = useContract(contractAddress);
  
  const { mutateAsync: completeAgreement, isLoading } = useContractWrite(
    contract,
    "complete"
  );
  
  const handleComplete = async () => {
    try {
      const tx = await completeAgreement();
      console.log("Transaction successful:", tx);
      alert("Agreement marked as complete!");
    } catch (err) {
      console.error("Failed to complete agreement:", err);
      alert("Error: " + err.message);
    }
  };
  
  return (
    <button 
      onClick={handleComplete}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Mark as Complete"}
    </button>
  );
}
```

### Listening to Contract Events

```jsx
// In a React component
import { useContractEvents } from "@thirdweb-dev/react";

function EventListener({ contractAddress }) {
  const { contract } = useContract(contractAddress);
  
  const { data: events, isLoading, error } = useContractEvents(
    contract,
    "StateChanged",
    { subscribe: true }
  );
  
  useEffect(() => {
    if (events && events.length > 0) {
      console.log("New state change event:", events[0]);
      // Update UI based on new events
    }
  }, [events]);
  
  // Render UI
}
```

### Server-Side Contract Interactions

```javascript
// In server/index.js
app.post('/api/agreement/:address/complete', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get contract instance
    const contract = await sdkInstance.sdk.getContract(address);
    
    // Call contract method
    const tx = await contract.call("complete");
    
    // Wait for transaction confirmation
    const receipt = await tx.receipt;
    
    res.json({ 
      success: true, 
      transactionHash: receipt.transactionHash
    });
  } catch (error) {
    console.error('Error completing agreement:', error);
    res.status(500).json({ error: 'Failed to complete agreement' });
  }
});
```

## Wallet Connection

The WalletProvider component has been enhanced to use ThirdWeb's wallet hooks:

```jsx
// In WalletProvider.jsx
const connectWithMetamask = useMetamask();
const thirdwebDisconnect = useDisconnect();
const thirdwebAddress = useAddress();

// Connect function
const connect = async () => {
  try {
    // Try connecting with ThirdWeb
    if (connectWithMetamask) {
      const data = await connectWithMetamask();
      if (data) return;
    }
    
    // Fallback to Web3Modal
    // ...
  } catch (error) {
    // Handle error
  }
};
```

## Contract Deployment with ThirdWeb

For deploying new contracts:

```javascript
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');

// Initialize SDK with signer
const sdk = ThirdwebSDK.fromSigner(wallet, BaseSepoliaTestnet);

// Deploy a new contract
const deployedContract = await sdk.deployer.deployContract({
  name: "ChronosFactory",
  contractType: "custom",
  abi: ChronosFactoryABI,
  bytecode: ChronosFactoryBytecode,
});

console.log("Contract deployed at:", deployedContract.address);
```

## Additional Tips

1. **Error Handling**: Always wrap contract interactions in try/catch blocks to handle errors gracefully

2. **Gas Optimization**: Use the `gasSettings` option in ThirdWeb SDK to optimize gas fees

3. **Caching**: Use ThirdWeb's caching features to improve performance for frequently accessed data

4. **Event Monitoring**: Set up real-time event monitoring for important contract events

5. **TypeScript Support**: ThirdWeb provides full TypeScript support for better type safety

## Conclusion

By properly implementing ThirdWeb for smart contract interactions, Chronos Protocol benefits from:

- Simplified contract interactions
- Enhanced user experience with wallet connection
- Real-time updates with contract events
- Gas optimization for transactions
- Secure server-side contract interactions

Remember to use the appropriate ThirdWeb hooks and functions for each use case, and always handle errors properly to provide a smooth user experience.
