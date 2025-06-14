# Using Blockscout as an Alternative to BaseScan

This guide explains how to use Blockscout as an alternative to BaseScan for contract verification and interaction on the Base Sepolia testnet.

## What is Blockscout?

Blockscout is an open-source block explorer and analytics platform for EVM-compatible blockchains. It provides a user-friendly interface to explore transactions, blocks, and contracts on the Base Sepolia testnet. Unlike BaseScan, Blockscout **doesn't require an API key** for manual contract verification, making it an excellent alternative.

## Benefits of Using Blockscout

1. **No API Key Required**: Verify contracts without needing to register and create an API key
2. **Open Source**: Built on open-source technology and free to use
3. **Feature Rich**: Offers transaction tracking, contract verification, and token transfers
4. **User-Friendly Interface**: Clear and intuitive UI for contract interaction

## Base Sepolia on Blockscout

Blockscout has a dedicated explorer for Base Sepolia testnet:

**Base Sepolia Blockscout**: [https://base-sepolia.blockscout.com](https://base-sepolia.blockscout.com)

## Enabling Blockscout in Chronos Protocol

To use Blockscout instead of BaseScan for contract verification:

1. Set the `USE_BLOCKSCOUT` flag in your `.env` file:

```properties
USE_BLOCKSCOUT=true
```

2. When you run `npm run deploy:enhanced`, the script will automatically use Blockscout for verification guidance instead of BaseScan.

## Manual Contract Verification with Blockscout

For manual verification, you can use our dedicated Blockscout verification script:

```bash
npm run verify:blockscout
```

This script will:
1. Ask for your contract address (or find it automatically from your project config)
2. Flatten your contract source code
3. Provide step-by-step instructions for verifying on Blockscout
4. Optionally open the Blockscout verification page in your browser

### Verification Steps

1. **Access Contract Page**: Go to `https://base-sepolia.blockscout.com/address/YOUR_CONTRACT_ADDRESS#code`
2. **Start Verification**: Click "Verify & Publish"
3. **Enter Contract Details**:
   - Contract Name (e.g., "ChronosFactory")
   - Compiler Version (same as in hardhat.config.js, typically "v0.8.20")
   - Optimization: Yes
   - Optimization runs: 200
4. **Input Source Code**: Paste the flattened contract source code
5. **Submit**: Click "Verify & Publish"

## Interacting with Verified Contracts

Once verified, you can:

1. **Read Contract State**: View public variables and call read-only functions
2. **Write to Contract**: Execute state-changing functions (requires a connected wallet)
3. **View Events**: See all emitted events from your contract
4. **Track Transactions**: Monitor all transactions to/from your contract

## Viewing Agreements in Blockscout

To view Chronos agreements in Blockscout:

1. Access the ChronosFactory contract on Blockscout
2. Go to the "Read Contract" tab
3. Call the `getAllAgreements()` function to see all agreements
4. For a specific agreement, copy its address and search for it in Blockscout

## Troubleshooting Verification Issues

### Contract Not Verifying

If verification fails:

1. **Check Compiler Version**: Make sure the selected compiler version matches what was used for deployment
2. **Confirm Optimization Settings**: Use the same optimization settings as in your Hardhat config
3. **Check Contract Name**: Ensure the contract name matches the main contract in your source file
4. **License Identifier**: Make sure SPDX license identifiers aren't duplicated in flattened code

### Contract Already Verified

You'll see a message indicating the contract is already verified. This is normal and you can proceed to interact with the contract.

## Comparing BaseScan and Blockscout

| Feature | BaseScan | Blockscout |
|---------|----------|------------|
| API Key Required | Yes | No |
| Automatic Verification via Script | Yes | No |
| Manual Verification | Yes | Yes |
| Contract Read/Write | Yes | Yes |
| Event Logs | Yes | Yes |
| Token Tracking | Yes | Yes |
| Open Source | No | Yes |

## Conclusion

Blockscout offers a great alternative to BaseScan, especially when you don't want to register for an API key. By setting `USE_BLOCKSCOUT=true` in your environment, you can easily switch to using Blockscout for your Base Sepolia contract verification needs.

For most development and testing purposes, Blockscout provides all the necessary features to interact with and verify your smart contracts on Base Sepolia testnet.
