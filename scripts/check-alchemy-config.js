#!/usr/bin/env node

/**
 * Script to test Alchemy SDK configuration for Chronos Protocol
 */

require('dotenv').config();
const { Alchemy, Network } = require("alchemy-sdk");
const chalk = require('chalk');
const { ethers } = require('ethers');

// ASCII art logo
const logo = `
   ______  __                                     ____             __                  __
  / ____/ / /_   _____ ____   ____   ____   ___ / __ \\   _____   / /_  ____   _____  ____   / /
 / /     / __ \\ / ___// __ \\ / __ \\ / __ \\ / __ \\ /_/ /  / ___/  / __ \\/ __ \\ / ___/ / __ \\ / /
/ /___  / / / // /   / /_/ // /_/ // / / //  __/ ____/  / /__   / /_/ / /_/ // /__  / /_/ // /
\\____/ /_/ /_//_/    \\____/ \\____//_/ /_/ \\___/_/       \\___/  /_.___/\\____/ \\___/  \\____//_/
`;

console.log(chalk.cyan(logo));
console.log(chalk.yellow('Checking Alchemy SDK Configuration...'));

// Check environment variables
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  console.error(chalk.red('❌ ALCHEMY_API_KEY not found in environment variables. Please set it in your .env file.'));
  process.exit(1);
}

console.log(chalk.green(`✓ ALCHEMY_API_KEY found: ${alchemyApiKey.substring(0, 5)}...${alchemyApiKey.substring(alchemyApiKey.length - 5)}`));

// Set up Alchemy SDK
const settings = {
  apiKey: alchemyApiKey,
  network: Network.BASE_SEPOLIA
};

// Initialize SDK
const alchemy = new Alchemy(settings);

// Check connection
async function testAlchemyConnection() {
  try {
    console.log(chalk.yellow('\nTesting connection to Alchemy Base Sepolia endpoint...'));
    
    // Get the latest block number
    const blockNumber = await alchemy.core.getBlockNumber();
    console.log(chalk.green(`✓ Successfully connected to Alchemy Base Sepolia endpoint`));
    console.log(chalk.green(`✓ Latest block number: ${blockNumber}`));
    
    // Get gas price
    const gasPrice = await alchemy.core.getGasPrice();
    console.log(chalk.green(`✓ Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`));
    
    // Get network stats
    console.log(chalk.yellow('\nTesting enhanced network features...'));
    try {
      // Get block details for more information
      const block = await alchemy.core.getBlock('latest');
      
      console.log(chalk.green(`✓ Block timestamp: ${new Date(block.timestamp * 1000).toISOString()}`));
      console.log(chalk.green(`✓ Gas limit: ${ethers.utils.formatUnits(block.gasLimit, 'gwei')} Gwei`));
      console.log(chalk.green(`✓ Gas used: ${ethers.utils.formatUnits(block.gasUsed, 'gwei')} Gwei`));
      console.log(chalk.green(`✓ Transaction count: ${block.transactions.length}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to get enhanced block data: ${error.message}`));
    }
    
    // Test gas optimization features
    console.log(chalk.yellow('\nTesting gas optimization features...'));
    
    // Import the optimal gas module
    try {
      const { getOptimalGasPrice } = require('./optimal-gas');
      
      // Test different priority levels
      const priorities = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        const gasData = await getOptimalGasPrice(priority);
        console.log(chalk.green(`✓ ${priority.toUpperCase()} priority gas: ${gasData.formatted.gasPrice}`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Failed to test gas optimization: ${error.message}`));
    }
    
    // Check Base Sepolia URL
    const baseSepUrl = process.env.ALCHEMY_BASE_SEPOLIA_URL;
    if (!baseSepUrl) {
      console.log(chalk.yellow('⚠️ ALCHEMY_BASE_SEPOLIA_URL not found in environment variables.'));
      console.log(chalk.yellow('⚠️ You can set it to: https://base-sepolia.g.alchemy.com/v2/your-alchemy-api-key-here'));
    } else {
      console.log(chalk.green(`✓ ALCHEMY_BASE_SEPOLIA_URL is configured correctly`));
    }
    
    // Success message
    console.log(chalk.green('\n✅ Alchemy SDK is configured correctly and working!'));
    
    return true;
  } catch (error) {
    console.error(chalk.red(`\n❌ Alchemy SDK connection test failed: ${error.message}`));
    console.error(error);
    return false;
  }
}

// Run the test
testAlchemyConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(chalk.red(`Unhandled error: ${error.message}`));
    process.exit(1);
  });
