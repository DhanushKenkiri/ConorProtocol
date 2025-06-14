# Verifying Smart Contracts with BaseScan API

This document explains how to verify your smart contracts on BaseScan using the BaseScan API key.

## What is BaseScan?

BaseScan is the block explorer for the Base blockchain, similar to how Etherscan works for Ethereum. It allows users to:
- Browse and search for transactions, addresses, and blocks
- View and verify smart contract source code
- Track token transfers and balances
- Monitor network activity

## Why Verify Your Smart Contracts?

Verifying your smart contracts on BaseScan provides several benefits:
1. **Transparency**: Users can read the source code and verify it matches the deployed bytecode
2. **Trust**: Users can confirm the contract works as advertised
3. **Interaction**: The BaseScan UI makes it easier for users to interact with your contract's functions
4. **Documentation**: ABI and contract functions become visible and accessible 

## Getting a BaseScan API Key

To verify contracts on BaseScan, you need an API key. Here's how to get one:

1. **Create an account on BaseScan**:
   - Go to [https://basescan.org/register](https://basescan.org/register)
   - Complete the registration process

2. **Generate an API key**:
   - After logging in, navigate to [https://basescan.org/myapikey](https://basescan.org/myapikey)
   - Click "Add" to create a new API key
   - Enter a name for your API key (e.g., "Chronos Protocol Verification")
   - Complete the CAPTCHA if required
   - Click "Create New API Key"

3. **Add the API key to your project**:
   - Copy the API key from BaseScan
   - Add it to your `.env` file:
     ```
     BASESCAN_API_KEY=your-api-key-here
     ```

## Verifying Your Contracts

### Option 1: Using Hardhat's Verify Plugin

Our project is already configured with the Hardhat Etherscan plugin, which works with BaseScan. To verify a contract:

1. **Make sure your contract is deployed**:
   ```bash
   npx hardhat run deployment/deploy.js --network baseSepolia
   ```

2. **Verify the contract** (replace with your actual contract address and constructor arguments):
   ```bash
   npx hardhat verify --network baseSepolia 0xYourContractAddress "Constructor Arg 1" "Constructor Arg 2"
   ```

### Option 2: Verify Your Factory Contract

To verify the ChronosFactory contract specifically:

```bash
npx hardhat verify --network baseSepolia 0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94
```

### Troubleshooting Verification Issues

If you encounter issues during verification:

1. **Compiler version mismatch**: Make sure the compiler version in Hardhat matches the one used for deployment
   ```javascript
   // In hardhat.config.js
   module.exports = {
     solidity: {
       version: "0.8.20", // Must match the version used for deployment
       // ...
     },
   };
   ```

2. **Constructor arguments**: Verify you're passing the correct constructor arguments in the correct format

3. **Already verified**: If the contract is already verified, you'll get an error. This is normal.

4. **API key rate limit**: BaseScan API keys have usage limits. If you hit a limit, wait a while before trying again.

## Additional Commands

### Check if Your BaseScan API Key is Configured

```bash
npm run check:thirdweb
```

This script will verify that your BaseScan API key is set in the `.env` file.

### Help with Contract Verification

For more details on contract verification options:

```bash
npx hardhat verify --help
```

## Conclusion

Verifying your smart contracts is an essential best practice for transparency and user trust. With your BaseScan API key properly configured, you can easily verify contracts as part of your deployment workflow.

If you have questions or encounter issues, refer to the [BaseScan documentation](https://docs.base.org/tools/basescan/) or reach out to the Base developer community for assistance.
