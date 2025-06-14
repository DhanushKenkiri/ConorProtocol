// This script demonstrates how to interact with the Base Sepolia faucet programmatically
// Note: The actual Base faucet may require captcha or other verification methods

const { ethers } = require('ethers');
require('dotenv').config();

// Get wallet from private key
function getWallet() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Private key not found in .env file');
  }
  
  return new ethers.Wallet(privateKey);
}

// Log wallet info
async function showWalletInfo() {
  try {
    const wallet = getWallet();
    const address = wallet.address;
    
    console.log('\nWallet Information:');
    console.log('-----------------');
    console.log(`Address: ${address}`);
    console.log(`\nTo fund this wallet with Base Sepolia ETH:`);
    console.log(`1. Visit: https://faucet.base.org`);
    console.log(`2. Paste your address: ${address}`);
    console.log(`3. Complete the captcha and submit\n`);
    
    // Connect to Base Sepolia
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
    const connectedWallet = wallet.connect(provider);
    
    try {
      const balance = await connectedWallet.getBalance();
      const balanceInEth = ethers.utils.formatEther(balance);
      console.log(`Current Balance: ${balanceInEth} ETH`);
    } catch (error) {
      console.error('Could not fetch balance:', error.message);
    }
    
    console.log('\nRemember to fund your wallet before deploying contracts or interacting with the app.');
    console.log('Once funded, you can deploy contracts with: npm run deploy:base-sepolia\n');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Run the script
showWalletInfo();
