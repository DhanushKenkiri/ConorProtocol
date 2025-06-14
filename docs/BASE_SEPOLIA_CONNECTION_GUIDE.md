# Base Sepolia Network Connection Guide

This guide will help you connect to the Base Sepolia testnet within the Chronos Protocol application.

## Automatic Connection

The application will automatically attempt to switch your MetaMask wallet to the Base Sepolia network when needed. You should see a prompt from MetaMask asking to confirm the network switch.

## Manual Connection

If you encounter any issues with the automatic network switching, you can manually add the Base Sepolia network to MetaMask:

1. Open your MetaMask extension
2. Click on your network dropdown (where it may say "Ethereum Mainnet" or similar)
3. Click "Add Network"
4. Click "Add Network Manually" (at the bottom)
5. Fill in the following details:

```
Network Name: Base Sepolia Testnet
New RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer URL: https://sepolia.basescan.org
```

6. Click "Save"

## Troubleshooting

If you experience a "Unrecognized chain ID" error or other network switching issues:

1. Make sure your MetaMask is up to date
2. Try adding the network manually using the steps above
3. If you've previously added Base Sepolia with an incorrect configuration, you may need to:
   - Go to Settings > Networks in MetaMask
   - Find any existing Base Sepolia entries and remove them
   - Add the network again with the correct details

## Getting Base Sepolia ETH

To interact with the Chronos Protocol on Base Sepolia, you'll need test ETH:

1. Visit the [Base Sepolia Faucet](https://www.catnip.exchange/)
2. Connect your wallet
3. Request test ETH

## Need Help?

If you continue to experience issues connecting to Base Sepolia:
1. Check the console (F12) for specific error messages
2. Make sure your wallet is unlocked when attempting to switch networks
3. Contact support through our Discord channel
