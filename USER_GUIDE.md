# Chronos Protocol - User Guide

## Interactive Tutorial

The application includes an interactive tutorial to help you get started:

1. A "How to Use" button appears in the bottom-left corner
2. Click it to open a step-by-step guide explaining all features
3. For new users, the tutorial will automatically display on first visit
4. You can also access the tutorial by clicking "Need help?" below the chat input

## Setup Instructions

### Quick Start

To start both the backend server and frontend application with a single command:

1. Run the start batch file:
```
start.bat
```

OR

1. Use the npm script:
```
npm run dev:all
```

Both methods will start the backend server and frontend development server together.

### Manual Startup

If you prefer to start the applications separately:

1. Start the backend server:
```bash
cd server
npm start
```

2. In a second terminal, start the frontend app:
```bash
npm run dev
```

## Troubleshooting Guide

### Network Connection Issues

If you're experiencing issues with network connections to Base Sepolia:

1. Click "Show Network Details" in the Base Sepolia information banner
2. Check the connection status in the Alchemy Connection Tester
3. Verify your wallet is connected to Base Sepolia testnet (Chain ID: 84532)
4. If needed, click "Switch to Base Sepolia" button to switch networks

### Smart Contract Interaction Problems

If you're unable to interact with smart contracts:

1. Ensure your wallet is connected (look for your wallet address in the top right)
2. Verify you're on Base Sepolia testnet (check the network indicator)
3. Check smart contract status in the network details section
4. Make sure you have Base Sepolia ETH in your wallet

### Backend Server Connection Issues

If frontend can't connect to the backend:

1. Check that both servers are running (via terminals)
2. Verify the server health with the System Health Checker
3. Check the console for connection errors
4. Try restarting the servers with `start.bat`

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Switch to Base Sepolia" | Click the button or manually switch in your wallet to Base Sepolia network |
| "API Server connection timed out" | Ensure backend server is running with `start.bat` or `npm start` in server folder |
| "Failed to create agreement" | Ensure you have Base Sepolia ETH for gas fees |
| "No agreements found" | Create a new agreement or check wallet connection |

## Alchemy API Integration

The application uses Alchemy API for enhanced blockchain interactions:

1. Environment variables are configured for Alchemy API keys
2. Comprehensive error handling for when API calls fail
3. Network monitoring for real-time blockchain updates

## System Health Checker

If you encounter any issues, the System Health Checker can help diagnose problems:

1. It runs automatically at startup and shows issues if detected
2. Click on the System Health Issues button (if visible) to see diagnostic details
3. Run checks again after making environment changes

## Getting Base Sepolia ETH

To get testnet ETH for Base Sepolia:

1. Connect your wallet to the application
2. If already on Base Sepolia, you'll see a "Get Base Sepolia ETH" button
3. Click the button to open the faucet website
4. Follow the faucet instructions to receive test ETH

## Further Support

If you continue to experience issues:

1. Check the logs in the browser console (F12 or Command+Option+I)
2. Review the `server/logs` directory for backend errors
3. Try clearing your browser cache and local storage
4. Ensure your wallet extension is up to date
