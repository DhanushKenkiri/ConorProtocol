# ThirdWeb Integration with Chronos Factory Contract

This guide provides specific instructions for integrating the ChronosFactory contract with ThirdWeb in the Chronos Protocol project.

## ChronosFactory Contract 

The `ChronosFactory` contract is the main entry point for creating and managing ChronoContract instances. It allows users to:

- Create new agreements
- Track all agreements created by a user 
- Find agreements where a user is the recipient
- Get all agreements created through the factory

## Configuration

### Important Files

- **Main ThirdWeb Config**: `apps/web/src/config/thirdweb.js`
- **Contract Addresses**: `apps/web/src/config/addresses.js`
- **Contract ABIs**: `apps/web/src/config/abis/` directory

### Required Environment Variables

Frontend environment variables in `apps/web/.env.local`:

```properties
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_BASE_CHAIN_ID=84532
VITE_CHRONOS_FACTORY_ADDRESS=0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

## Using ChronosFactory with ThirdWeb

### 1. Setup ThirdWeb Provider

The main app wrapper (`main.jsx`) includes the ThirdWeb provider with correct configuration:

```jsx
<ThirdwebProvider 
  activeChain={BaseSepoliaTestnet}
  clientId={THIRDWEB_CLIENT_ID}
  supportedChains={[BaseSepoliaTestnet]}
  dAppMeta={{
    name: "Chronos Protocol",
    description: "Blockchain-based time commitment platform",
    logoUrl: "/chronos-logo.svg",
    url: window.location.origin,
  }}
  sdkOptions={{
    alchemyApiKey: ALCHEMY_API_KEY,
    gasSettings: {
      maxPriceInGwei: 500,
      speed: "standard"
    },
  }}
>
  <WalletProvider>
    <App />
  </WalletProvider>
</ThirdwebProvider>
```

### 2. Connect to ChronosFactory

Use the `useChronosFactory` hook to interact with the ChronosFactory contract:

```javascript
import { useState, useEffect } from 'react';
import { useContract } from '@thirdweb-dev/react';
import { addresses } from '../config/addresses';
import ChronosFactoryABI from '../config/abis/ChronosFactory.json';
import { BASE_SEPOLIA_CHAIN_ID } from '../config/thirdweb';

export function useChronosFactory(provider) {
  const chainId = BASE_SEPOLIA_CHAIN_ID;
  const factoryAddress = addresses[chainId]?.ChronosFactory;
  
  // Get ThirdWeb contract instance
  const { contract: factoryContract, isLoading } = useContract(
    factoryAddress,
    ChronosFactoryABI
  );

  // Rest of the hook implementation...
}
```

### 3. Creating a New Agreement

```javascript
// Example of creating a new agreement
const createAgreement = async (recipient, description, deadline, value) => {
  try {
    const tx = await factoryContract.call(
      "createAgreement", 
      [recipient, description, deadline, { value }]
    );
    
    return {
      success: true,
      transactionHash: tx.receipt.transactionHash,
      agreementAddress: tx.receipt.logs[0].address // The address of the created agreement
    };
  } catch (error) {
    console.error("Error creating agreement:", error);
    return { success: false, error: error.message };
  }
};
```

### 4. Getting User Agreements

```javascript
// Example of getting agreements created by a user
const getCreatedAgreements = async (userAddress) => {
  try {
    const agreements = await factoryContract.call(
      "getCreatedAgreements", 
      [userAddress]
    );
    return agreements;
  } catch (error) {
    console.error("Error fetching created agreements:", error);
    return [];
  }
};

// Example of getting agreements where user is recipient
const getReceivedAgreements = async (userAddress) => {
  try {
    const agreements = await factoryContract.call(
      "getReceivedAgreements", 
      [userAddress]
    );
    return agreements;
  } catch (error) {
    console.error("Error fetching received agreements:", error);
    return [];
  }
};
```

### 5. Listening to Factory Events

```javascript
import { useContractEvents } from '@thirdweb-dev/react';

// Inside your component
const { data: events, isLoading: eventsLoading, error } = useContractEvents(
  factoryContract,
  "AgreementCreated", // Event name from the ChronosFactory contract
  {
    queryFilter: {
      fromBlock: blockNumber - 1000, // Last 1000 blocks
    },
    subscribe: true, // Subscribe to new events
  }
);
```

## ChronoContract Interaction

After a contract is created through the factory, you'll interact directly with the ChronoContract instance:

```javascript
// Getting a ChronoContract instance
const { contract: chronoContract } = useContract(
  agreementAddress,
  ChronoContractABI
);

// Accept an agreement
const acceptAgreement = async () => {
  try {
    const tx = await chronoContract.call("accept");
    return { success: true, transactionHash: tx.receipt.transactionHash };
  } catch (error) {
    console.error("Error accepting agreement:", error);
    return { success: false, error: error.message };
  }
};

// Complete an agreement
const completeAgreement = async () => {
  try {
    const tx = await chronoContract.call("complete");
    return { success: true, transactionHash: tx.receipt.transactionHash };
  } catch (error) {
    console.error("Error completing agreement:", error);
    return { success: false, error: error.message };
  }
};
```

## Gas Optimization Tips

ThirdWeb SDK already includes gas optimization, but for more efficiency:

1. **Batch Transactions**: If you need to make multiple calls, consider using a multicall contract

2. **Custom Gas Settings**: Override default gas settings for specific scenarios
   ```javascript
   const tx = await factoryContract.call(
     "createAgreement",
     [recipient, description, deadline],
     {
       gasLimit: 300000, // Custom gas limit
       maxPriceInGwei: 300 // Custom gas price
     }
   );
   ```

3. **Error Handling**: Always include comprehensive error handling for failed transactions

## Testing Contract Integration

1. **Deploy to Base Sepolia testnet**:
   ```bash
   npm run deploy:enhanced
   ```

2. **Check contract status**:
   ```bash
   npm run check:deployment
   ```

3. **Test in frontend**: Connect wallet and try creating an agreement

## Troubleshooting

### Common Issues

1. **Failed Transactions**: Check that your wallet has sufficient Base Sepolia ETH for gas

2. **Contract Not Found**: Verify the contract address is correct in `addresses.js`

3. **Wrong Network**: Ensure your wallet is connected to Base Sepolia (Chain ID: 84532)

4. **RPC Errors**: Verify your Alchemy API key is valid and has access to Base Sepolia

### Debugging Tools

- **BaseScan**: View transactions on [Base Sepolia Explorer](https://sepolia.basescan.org)
- **Alchemy Dashboard**: Monitor RPC usage and errors in your Alchemy dashboard
