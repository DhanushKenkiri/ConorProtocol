# Chronos Protocol - Quick Start Guide

This guide will get you up and running with the Chronos Protocol project as quickly as possible.

## Prerequisites

- Node.js (v16+)
- npm
- MetaMask or another Web3 wallet (with Base Sepolia network configured)
- Base Sepolia testnet ETH (get from [Base Sepolia Faucet](https://www.base.org/faucet))

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/chronos-protocol.git
cd chronos-protocol

# Install dependencies
npm install
```

## Step 2: Setup Environment

Run the setup script which will guide you through setting up the necessary environment variables:

```bash
npm run setup
```

This script will ask for:
- Your wallet private key (for deployment)
- Alchemy API key (for enhanced RPC)
- ThirdWeb client ID (for ThirdWeb SDK)
- BaseScan API key (for contract verification)

> Note: You can leave fields blank during initial setup and update them later.

## Step 3: Deploy Contracts (Optional)

If you want to deploy your own contracts instead of using existing ones:

```bash
# Deploy to Base Sepolia testnet
npm run deploy:enhanced

# Check deployment status
npm run check:deployment
```

## Step 4: Start the Application

```bash
# Start frontend and backend servers
npm run start:all
```

Visit `http://localhost:5173` in your browser.

## Step 5: Connect Your Wallet

1. Make sure your wallet is connected to Base Sepolia network
2. Click "Connect Wallet" in the application
3. Approve the connection request in your wallet

## Step 6: Create Your First Agreement

In the chat interface, type a command to create an agreement:

```
/task @0x1234...abcd Complete project documentation due:2025-06-30 value:0.1
```

This creates a smart contract with:
- Recipient: `0x1234...abcd` (replace with an actual wallet address)
- Description: "Complete project documentation"
- Deadline: June 30, 2025
- Value: 0.1 ETH

## Common Issues

### "Wrong Network"
Make sure your wallet is connected to Base Sepolia (Chain ID: 84532)

### "Transaction Failed"
Ensure you have enough Base Sepolia ETH for gas

### "Contract Not Found"
Check that the contract address in `apps/web/src/config/addresses.js` is correct

## Next Steps

- Review the `docs/` directory for detailed documentation
- Try different agreement states (accept, complete, reject)
- Explore the smart contract code in `contracts/`

For more detailed instructions, check out the full documentation in the `docs/` folder.
