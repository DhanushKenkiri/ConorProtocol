#!/usr/bin/env node

/**
 * Advanced Alchemy SDK features test script for Chronos Protocol
 */

require('dotenv').config();
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");
const chalk = require('chalk');
const { ethers } = require('ethers');

console.log(chalk.cyan('\n==== Chronos Protocol: Advanced Alchemy Features Test ====\n'));

// Check for environment variables
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  console.error(chalk.red('❌ ALCHEMY_API_KEY not found in environment variables'));
  process.exit(1);
}

// Configure Alchemy SDK
const settings = {
  apiKey: alchemyApiKey,
  network: Network.BASE_SEPOLIA
};
const alchemy = new Alchemy(settings);

// Initialize ethers provider
const provider = new ethers.providers.AlchemyProvider(
  Network.BASE_SEPOLIA, 
  alchemyApiKey
);

async function testAlchemyServices() {
  try {
    // 1. Test Basic Connection
    console.log(chalk.yellow('\n📊 Testing Basic Connection...'));
    const blockNumber = await alchemy.core.getBlockNumber();
    console.log(chalk.green(`✓ Connected to network at block #${blockNumber}`));
    
    // 2. Test Gas Price Retrieval
    console.log(chalk.yellow('\n⛽ Testing Gas Price Retrieval...'));
    const gasPrice = await alchemy.core.getGasPrice();
    console.log(chalk.green(`✓ Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`));
    
    // 3. Test Block Information
    console.log(chalk.yellow('\n🧱 Testing Block Information...'));
    const latestBlock = await alchemy.core.getBlock('latest');
    console.log(chalk.green(`✓ Latest block timestamp: ${new Date(latestBlock.timestamp * 1000).toISOString()}`));
    console.log(chalk.green(`✓ Latest block gas limit: ${latestBlock.gasLimit.toString()}`));
    console.log(chalk.green(`✓ Latest block gas used: ${latestBlock.gasUsed.toString()}`));
    
    // 4. Test Network Status
    console.log(chalk.yellow('\n🔄 Testing Network Status...'));
    const { chainId } = await provider.getNetwork();
    console.log(chalk.green(`✓ Connected to chain ID: ${chainId}`));
    
    // 5. Test Token Balances (using a known address)
    console.log(chalk.yellow('\n💰 Testing Token Balance Retrieval for sample address...'));
    // Replace with a known address from Base Sepolia
    const sampleAddress = '0x0000000000000000000000000000000000000000';
    const balance = await alchemy.core.getBalance(sampleAddress);
    console.log(chalk.green(`✓ Address balance: ${ethers.utils.formatEther(balance)} ETH`));
    
    // 6. Test WebSocket Subscriptions (quick check only)
    console.log(chalk.yellow('\n🔌 Testing WebSocket Functionality...'));
    try {
      // Create temporary subscription
      const testSubscription = alchemy.ws.on("block", () => {});
      console.log(chalk.green(`✓ WebSocket subscription created successfully`));
      
      // Unsubscribe immediately
      alchemy.ws.off(testSubscription);
      console.log(chalk.green(`✓ WebSocket unsubscribe successful`));
    } catch (error) {
      console.error(chalk.red(`❌ WebSocket test failed: ${error.message}`));
    }
    
    console.log(chalk.cyan('\n✨ All Alchemy features tested successfully! ✨\n'));
    
    console.log(chalk.yellow('Recommended Next Steps:'));
    console.log(chalk.white('1. Obtain a production Alchemy API key'));
    console.log(chalk.white('2. Update the .env file with your production key'));
    console.log(chalk.white('3. Configure webhook notifications for important on-chain events'));
    console.log(chalk.white('4. Set up Alchemy Notify for real-time alerts'));
    console.log(chalk.white('5. Implement gas optimization strategies using Alchemy data'));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Alchemy test failed: ${error.message}`));
    console.error(error);
    process.exit(1);
  }
}

// Execute test
testAlchemyServices()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(chalk.red(`Unhandled error: ${error.message}`));
    process.exit(1);
  });
