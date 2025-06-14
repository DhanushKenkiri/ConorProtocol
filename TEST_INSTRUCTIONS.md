# Chronos Protocol - Testing Instructions

This document provides step-by-step instructions for testing the Chronos Protocol dApp integration between the frontend and backend using thirdweb SDK.

## Prerequisites

1. Node.js v16+ installed
2. npm v7+ or yarn v1.22+ installed
3. Access to a wallet with Base Sepolia testnet ETH
4. thirdweb API keys (client ID and optional secret key)

### Environment Setup

1. Create or update `.env` file in the project root with:
   ```
   PRIVATE_KEY=your-private-key
   THIRDWEB_CLIENT_ID=your-thirdweb-client-id
   THIRDWEB_SECRET_KEY=your-thirdweb-secret-key
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   ```

2. Create or update `.env.local` file in the `apps/web` folder with:
   ```
   VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
   VITE_API_URL=http://localhost:3001/api
   VITE_BASE_CHAIN_ID=84532
   VITE_CHRONOS_FACTORY_ADDRESS=0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94
   ```

> **Note**: You can obtain your thirdweb client ID and secret key by signing up at [https://thirdweb.com/create-api-key](https://thirdweb.com/create-api-key)

### Getting Base Sepolia Testnet ETH

To test the application, you'll need some Base Sepolia testnet ETH:

1. Visit [https://www.base.org/faucet](https://www.base.org/faucet)
2. Connect your wallet
3. Request testnet ETH (may require a small amount of Sepolia ETH first)

Alternatively, you can use the Coinbase Wallet faucet or other Base Sepolia faucets.

## Installation and Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Check thirdweb configuration:
   ```bash
   node scripts/check-thirdweb-config.js
   ```

3. Start the backend server:
   ```bash
   cd server
   npm install
   npm start
   ```

4. In a new terminal window, start the frontend:
   ```bash
   npm run dev
   ```

5. Launch the full application with our helper script:
   ```bash
   node scripts/launch.js
   ```

## Testing Process

### Automated Testing

For quick verification of the system, run the system test script:

```bash
node scripts/test-system.js
```

This script will:
1. Initialize the thirdweb SDK
2. Test the API connection
3. Create a test agreement
4. Retrieve agreement details
5. Update agreement states

If all tests pass, your system is correctly configured and ready for manual testing.

### Manual Testing

#### 1. Wallet Connection

1. Open the application in your browser (the URL will be shown when you run `npm run dev`)
2. Click the "Connect Wallet" button in the top-right corner
3. Select your preferred wallet provider (MetaMask recommended)
4. If prompted to switch to Base Sepolia testnet, click "Switch Network"
5. Verify that:
   - Your wallet address appears in the UI
   - You see a "Base Sepolia" network badge
   - The wallet status shows "Connected"

#### 2. Creating an Agreement

1. In the chat input at the bottom of the screen, type the following command:
```
/task create counterparty:0x1234567890123456789012345678901234567890 description:"Test task" deadline:1730332800 value:0.01
```
   (Replace the counterparty address with a valid Ethereum address, and set a future timestamp for the deadline)

2. Press Enter to send the command
3. You should see a notification that the agreement is being created
4. Wait for the backend to process the transaction (this can take 15-30 seconds)
5. Verify that the new agreement card appears in the chat interface

#### 3. Viewing Agreement Details

1. The agreement card should display:
   - The agreement state (should be "Proposed")
   - Creator address (your connected wallet)
   - Counterparty address
   - Description
   - Deadline
   - Value in ETH

#### 4. Changing Agreement State

1. Find the contract card for your newly created agreement
2. Click "Activate" to change the state to "Active"
3. Confirm the transaction in your wallet
4. Wait for the backend to process the request (15-30 seconds)
5. Verify the agreement state changes to "Active"
6. Click "Complete" to change the state to "Completed"
7. Confirm the transaction in your wallet
8. Wait for the backend to process the request
9. Verify the agreement state changes to "Completed"

#### 5. Listing Your Agreements

1. In the chat input, type:
```
/task list
```
2. Press Enter to send the command
3. Verify that all your agreements are listed in the chat interface

#### 6. Testing Error Handling

1. Try creating an agreement with invalid parameters:
```
/task create counterparty:invalid-address description:"Test task" deadline:1730332800 value:0.01
```
2. Verify that you receive an appropriate error message

## Troubleshooting

### thirdweb Configuration Issues

If you see thirdweb API errors:

1. Verify your thirdweb client ID and secret key in the `.env` file
2. Verify your thirdweb client ID in the `apps/web/.env.local` file
3. Check that the API keys are valid by logging into your thirdweb dashboard
4. Run the configuration check script:
   ```bash
   node scripts/check-thirdweb-config.js
   ```

### Backend Issues

If you encounter backend server errors:

1. Check the server console for error messages
2. Verify the contract address is correct in the backend
3. Ensure your wallet has enough Base Sepolia ETH for gas fees

### Frontend Issues

If you encounter frontend errors:

1. Check the browser console for error messages
2. Verify that the API URL in the frontend code is correct (should point to http://localhost:3001)
3. Ensure you're connected to Base Sepolia testnet

## Data Flow Diagram

```
Frontend (React App)         Backend (Express + ThirdwebSDK)          Blockchain (Base Sepolia)
     |                                 |                                        |
     | User connects wallet            |                                        |
     |---------------------------→     |                                        |
     | User creates agreement          |                                        |
     |---------------------------→     |                                        |
     |                                 | Creates agreement via SDK              |
     |                                 |----------------------------------------→|
     |                                 | Transaction confirmed                   |
     |                                 |←----------------------------------------|
     | Agreement created               |                                        |
     |←---------------------------     |                                        |
     | User updates agreement state    |                                        |
     |---------------------------→     |                                        |
     |                                 | Updates state via SDK                  |
     |                                 |----------------------------------------→|
     |                                 | Transaction confirmed                   |
     |                                 |←----------------------------------------|
     | State updated                   |                                        |
     |←---------------------------     |                                        |
```

## Deployment Guide

To prepare the application for deployment:

1. Run the deployment script:
   ```bash
   node scripts/deploy.js
   ```

2. Follow the prompts to:
   - Build the frontend
   - Prepare the backend
   - Create a deployment package

3. The deployment package will be created in the `deployment-package` directory with:
   - Frontend build in `deployment-package/frontend`
   - Backend build in `deployment-package/backend`
   - Deployment instructions in `deployment-package/README.md`

4. For frontend deployment, options include:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

5. For backend deployment, options include:
   - Heroku
   - Render
   - Fly.io
   - AWS EC2 or Lambda
     |                                 | Updates agreement state via SDK        |
     |                                 |----------------------------------------→|
     |                                 | Transaction confirmed                   |
     |                                 |←----------------------------------------|
     | Agreement state updated         |                                        |
     |←---------------------------     |                                        |
```

This completes the testing process for the Chronos Protocol dApp. If all steps are successful, your application is properly integrated with the smart contract on the Base Sepolia testnet.
