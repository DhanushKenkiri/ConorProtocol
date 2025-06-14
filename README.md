# Chronos Protocol

A stateful onchain messaging app that turns chat messages into smart contracts on Base Sepolia testnet.

## Overview

Chronos Protocol combines a retro terminal-themed chat interface with Ethereum smart contracts to create a decentralized messaging platform where agreements between users are stored as immutable contracts on the Base Sepolia blockchain.

## Features

- Retro terminal-themed UI with Bootstrap styling
- Connect to Base Sepolia testnet using Web3 wallets via ThirdWeb
- Create and manage onchain agreements through the chat interface
- Real-time blockchain events through Alchemy Enhanced APIs
- Support for different agreement states (PROPOSED, ACTIVE, COMPLETED, etc.)
- Smart contract verification on BaseScan or Blockscout (no API key needed)

## Quick Start

```bash
# Initial setup
npm run setup

# Deploy contracts to Base Sepolia
npm run deploy:enhanced

# Check deployment status
npm run check:deployment

# Start development servers
npm run start:all
```

## Project Structure

```
chronos-protocol/
├── apps/web/             # Frontend React application
├── contracts/            # Smart contracts
├── deployment/           # Deployment scripts
├── scripts/              # Helper scripts
├── server/               # Backend API server
└── test/                 # Contract tests
```

## Smart Contracts

- `ChronosFactory.sol`: Creates and tracks ChronoContract instances
- `ChronoContract.sol`: Implements agreement functionality with state machine

## Backend API

The project includes a backend server that uses the thirdweb SDK to interact with smart contracts on the Base Sepolia testnet. This server provides RESTful API endpoints for:

- Creating new agreements
- Getting user agreements
- Retrieving agreement details
- Updating agreement states

## Getting Started

### Prerequisites

1. Node.js v16+
2. npm or yarn
3. A wallet with Base Sepolia ETH (see the Base Sepolia info in the app for faucet links)
4. `.env` file with the following configuration:
   ```
   PRIVATE_KEY=your-private-key
   THIRDWEB_CLIENT_ID=your-thirdweb-client-id
   THIRDWEB_SECRET_KEY=your-thirdweb-secret-key
   ```
5. `.env.local` file for frontend with:
   ```
   VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
   VITE_API_URL=http://localhost:3001/api
   ```
   
You can obtain your thirdweb API keys by signing up at [https://thirdweb.com/create-api-key](https://thirdweb.com/create-api-key)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install server dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Or use the launch script to start both:
   ```bash
   node scripts/launch.js
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port shown in the console)

### Testing

See the `TEST_INSTRUCTIONS.md` file for detailed steps on testing the application.
- `IChronoContract.sol`: Interface defining the contract structure

## Setup & Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chronos-protocol.git
cd chronos-protocol
```

2. Install dependencies:
```bash
npm install
```

3. Run the setup script to configure environment variables:
```bash
npm run setup
```

This interactive script will:
- Check and install required dependencies
- Guide you through setting up environment variables
- Create `.env` and `apps/web/.env.local` files with proper configuration

## Deploying to Base Sepolia

1. Get Base Sepolia ETH:
   - Visit [Base Sepolia Faucet](https://faucet.base.org) and request testnet ETH

2. Deploy contracts with our enhanced deployment script:
```bash
npm run deploy:enhanced
```

This script provides:
- Comprehensive error handling and feedback
- Configuration validation before deployment
- Automatic updates to all config files
- Contract verification on BaseScan (if API key is provided)
- Detailed deployment summary

3. Check deployment status:
```bash
npm run check:deployment
```

## Running the App

```bash
# Start just the frontend
npm run dev

# Start both frontend and backend servers
npm run start:all
```

Visit `http://localhost:5173` in your browser.

## Documentation

For detailed guides, check the `docs/` directory:

- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment instructions
- `THIRDWEB_GUIDE.md` - ThirdWeb integration documentation
- `BASESCAN_VERIFICATION.md` - BaseScan contract verification instructions
- `BLOCKSCOUT_GUIDE.md` - Blockscout as BaseScan alternative (no API key needed)
- `CHRONOS_FACTORY_THIRDWEB.md` - Factory contract integration guide

## Using the App

1. Connect your wallet (make sure you're on Base Sepolia testnet)
2. Use the chat interface to create agreements:
   - Type: `/task @recipient description due:YYYY-MM-DD value:0.1`
   - Example: `/task @0x123... Complete website redesign due:2024-07-01 value:0.5`
3. Interact with agreements directly within the chat interface

## Development

- Run tests: `npm test`
- Compile contracts: `npm run compile`
- Build frontend: `npm run build`

## Base Sepolia Network Details

- **Network Name**: Base Sepolia Testnet
- **Chain ID**: 84532
- **Currency Symbol**: ETH
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org

## License

[MIT](LICENSE)
