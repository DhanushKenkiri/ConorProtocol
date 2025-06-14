#!/usr/bin/env node

/**
 * Test script for Chronos Protocol
 * This script tests the complete system with simulated user interactions
 */

const { ethers } = require('ethers');
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');
const { BaseSepoliaTestnet } = require('@thirdweb-dev/chains');
const axios = require('axios');
const chalk = require('chalk');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:3001/api';
const FACTORY_ADDRESS = '0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94';
const TEST_DESCRIPTION = 'Test Agreement - ' + new Date().toISOString();
const TEST_VALUE = '0.001'; // ETH
const TEST_DEADLINE = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

// ASCII art logo
const logo = `
${chalk.cyan}${chalk.bold}
   ______  __                                     ____             __                  __
  / ____/ / /_   _____ ____   ____   ____   ___ / __ \\   _____   / /_  ____   _____  ____   / /
 / /     / __ \\ / ___// __ \\ / __ \\ / __ \\ / __ \\ /_/ /  / ___/  / __ \\/ __ \\ / ___/ / __ \\ / /
/ /___  / / / // /   / /_/ // /_/ // / / //  __/ ____/  / /__   / /_/ / /_/ // /__  / /_/ // /
\\____/ /_/ /_//_/    \\____/ \\____//_/ /_/ \\___/_/       \\___/  /_.___/\\____/ \\___/  \\____//_/
${chalk.reset}
`;

console.log(logo);
console.log(`${chalk.bold}Chronos Protocol System Test${chalk.reset}\n`);

// Initialize SDK
async function initializeSDK() {
  try {
    console.log(chalk.yellow('Initializing ThirdwebSDK...'));
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY not found in .env file');
    }

    // Initialize provider for Base Sepolia
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.base.org"
    );

    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const clientId = process.env.THIRDWEB_CLIENT_ID;
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    
    const sdkOptions = {};
    if (clientId) {
      sdkOptions.clientId = clientId;
      console.log(chalk.green('✓ Using thirdweb client ID'));
    } else {
      console.log(chalk.red('✗ No thirdweb client ID found'));
    }
    
    if (secretKey) {
      sdkOptions.secretKey = secretKey;
      console.log(chalk.green('✓ Using thirdweb secret key'));
    } else {
      console.log(chalk.yellow('⚠ No thirdweb secret key found'));
    }
    
    const sdk = ThirdwebSDK.fromSigner(wallet, BaseSepoliaTestnet, sdkOptions);
    console.log(chalk.green('✓ ThirdwebSDK initialized successfully'));
    
    return { sdk, wallet, provider };
  } catch (error) {
    console.error(chalk.red('Error initializing SDK:'), error);
    throw error;
  }
}

// Test API endpoint
async function testAPIEndpoint() {
  try {
    console.log(chalk.yellow('\nTesting API endpoint...'));
    
    const response = await axios.get(`${API_URL}/agreements/${ethers.constants.AddressZero}`);
    console.log(chalk.green('✓ API is accessible'));
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('✗ API server is not running. Make sure to start the server with `cd server && npm start`'));
    } else {
      console.error(chalk.red('✗ API Error:'), error.message);
    }
    return false;
  }
}

// Test creating an agreement
async function testCreateAgreement(walletAddress) {
  try {
    console.log(chalk.yellow('\nTesting agreement creation...'));
    
    // Create a new wallet to be the counterparty
    const counterparty = ethers.Wallet.createRandom().address;
    
    console.log(`Creating agreement with:`);
    console.log(`- Owner: ${walletAddress}`);
    console.log(`- Counterparty: ${counterparty}`);
    console.log(`- Description: ${TEST_DESCRIPTION}`);
    console.log(`- Value: ${TEST_VALUE} ETH`);
    console.log(`- Deadline: ${new Date(TEST_DEADLINE * 1000).toLocaleString()}`);
    
    const response = await axios.post(`${API_URL}/agreements`, {
      counterparty,
      description: TEST_DESCRIPTION,
      deadline: TEST_DEADLINE,
      value: TEST_VALUE
    });
    
    console.log(chalk.green('✓ Agreement created successfully'));
    console.log(chalk.green(`✓ Agreement address: ${response.data.agreementAddress}`));
    console.log(chalk.green(`✓ Transaction hash: ${response.data.transactionHash}`));
    
    return response.data.agreementAddress;
  } catch (error) {
    console.error(chalk.red('✗ Error creating agreement:'), error.message);
    if (error.response) {
      console.error(chalk.red('API response:'), error.response.data);
    }
    return null;
  }
}

// Test retrieving agreement details
async function testGetAgreement(agreementAddress) {
  try {
    console.log(chalk.yellow('\nTesting agreement retrieval...'));
    
    const response = await axios.get(`${API_URL}/agreement/${agreementAddress}`);
    console.log(chalk.green('✓ Agreement retrieved successfully'));
    console.log('Agreement details:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error(chalk.red('✗ Error retrieving agreement:'), error.message);
    return null;
  }
}

// Test updating agreement state
async function testUpdateAgreementState(agreementAddress, newState) {
  try {
    console.log(chalk.yellow(`\nTesting agreement state update to ${newState}...`));
    
    const response = await axios.post(`${API_URL}/agreement/${agreementAddress}/state`, {
      newState
    });
    
    console.log(chalk.green(`✓ Agreement state updated to ${newState}`));
    console.log(chalk.green(`✓ Transaction hash: ${response.data.transactionHash}`));
    
    return true;
  } catch (error) {
    console.error(chalk.red(`✗ Error updating agreement state to ${newState}:`), error.message);
    if (error.response) {
      console.error(chalk.red('API response:'), error.response.data);
    }
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(chalk.cyan.bold('Running Chronos Protocol System Tests...\n'));
  
  // Step 1: Initialize SDK
  const { sdk, wallet, provider } = await initializeSDK();
  
  // Step 2: Test API endpoint
  const apiAvailable = await testAPIEndpoint();
  if (!apiAvailable) {
    console.error(chalk.red('\nTests failed: API not available. Please start the server first.'));
    return;
  }
  
  // Step 3: Create an agreement
  const agreementAddress = await testCreateAgreement(wallet.address);
  if (!agreementAddress) {
    console.error(chalk.red('\nTests failed: Could not create agreement.'));
    return;
  }
  
  // Step 4: Get agreement details
  const agreementDetails = await testGetAgreement(agreementAddress);
  if (!agreementDetails) {
    console.error(chalk.red('\nTests failed: Could not retrieve agreement details.'));
    return;
  }
  
  // Step 5: Update agreement state to ACTIVE
  const activateSuccess = await testUpdateAgreementState(agreementAddress, 1);
  if (!activateSuccess) {
    console.error(chalk.red('\nTests failed: Could not activate agreement.'));
    return;
  }
  
  // Step 6: Update agreement state to COMPLETED
  const completeSuccess = await testUpdateAgreementState(agreementAddress, 2);
  if (!completeSuccess) {
    console.error(chalk.red('\nTests failed: Could not complete agreement.'));
    return;
  }
  
  // All tests passed!
  console.log(chalk.green.bold('\n✓ All tests passed successfully!'));
  console.log(chalk.cyan('\nYou can now use the Chronos Protocol app with confidence.'));
}

// Run all tests
runTests().catch(err => {
  console.error(chalk.red('Fatal error during tests:'), err);
  process.exit(1);
});
