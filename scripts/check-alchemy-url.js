#!/usr/bin/env node

/**
 * Check Alchemy URL to ensure it's configured for Base Sepolia
 */

require('dotenv').config();

const chalk = require('chalk');

console.log(chalk.cyan('\n=== Checking Alchemy URL Configuration ===\n'));

const alchemyUrl = process.env.ALCHEMY_BASE_SEPOLIA_URL;

if (!alchemyUrl) {
  console.log(chalk.yellow('ALCHEMY_BASE_SEPOLIA_URL is not defined in .env file'));
  console.log(chalk.yellow('Recommended format: https://base-sepolia.g.alchemy.com/v2/your-api-key'));
  process.exit(0);
}

// Check if URL is for Base Sepolia
if (!alchemyUrl.includes('base-sepolia')) {
  console.log(chalk.red('⚠️ WARNING: ALCHEMY_BASE_SEPOLIA_URL does not contain "base-sepolia"'));
  console.log(chalk.red('Your current URL appears to be configured for a different network:'));
  console.log(chalk.red(alchemyUrl));
  console.log(chalk.yellow('\nThe URL should contain "base-sepolia" for Base Sepolia testnet'));
  console.log(chalk.yellow('Example: https://base-sepolia.g.alchemy.com/v2/your-api-key'));
  console.log(chalk.yellow('\nPlease update your .env file with the correct URL'));
  process.exit(1);
} else {
  console.log(chalk.green('✓ ALCHEMY_BASE_SEPOLIA_URL is correctly configured for Base Sepolia testnet'));
}

// Check if API key is the same
const alchemyApiKey = process.env.ALCHEMY_API_KEY;

if (alchemyApiKey) {
  if (!alchemyUrl.includes(alchemyApiKey)) {
    console.log(chalk.yellow('⚠️ Note: ALCHEMY_API_KEY does not match the key in ALCHEMY_BASE_SEPOLIA_URL'));
    console.log(chalk.yellow('Make sure both are using the same API key'));
  } else {
    console.log(chalk.green('✓ API key in ALCHEMY_BASE_SEPOLIA_URL matches ALCHEMY_API_KEY'));
  }
}

console.log(chalk.cyan('\n=== Alchemy URL check completed ===\n'));
