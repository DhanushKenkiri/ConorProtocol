// Script for verifying smart contracts using Blockscout explorer for Base Sepolia
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  magenta: '\x1b[35m'
};

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to run a command and return the output
function runCommand(command) {
  console.log(`${COLORS.cyan}Running:${COLORS.reset} ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return output;
  } catch (error) {
    console.error(`${COLORS.red}Error executing command:${COLORS.reset} ${error.message}`);
    throw error;
  }
}

// Get flattened contract source code for verification
async function getFlattenedSource(contractPath) {
  try {
    console.log(`${COLORS.blue}Flattening contract:${COLORS.reset} ${contractPath}`);
    const output = runCommand(`npx hardhat flatten ${contractPath}`);
    
    // Remove duplicate SPDX license identifiers
    let flattened = output.replace(/\/\/ SPDX-License-Identifier: MIT\s+/g, '');
    flattened = '// SPDX-License-Identifier: MIT\n' + flattened;
    
    return flattened;
  } catch (error) {
    console.error(`${COLORS.red}Error flattening contract:${COLORS.reset} ${error.message}`);
    return null;
  }
}

// Get the contract address from addresses.js or user input
async function getContractAddress() {
  try {
    const addressesPath = path.join(__dirname, '../apps/web/src/config/addresses.js');
    if (!fs.existsSync(addressesPath)) {
      throw new Error('addresses.js not found');
    }
    
    const addressesContent = fs.readFileSync(addressesPath, 'utf8');
    const addressMatch = addressesContent.match(/84532:\s*{\s*ChronosFactory:\s*"(0x[a-fA-F0-9]{40})"/);
    
    if (!addressMatch) {
      throw new Error('Could not find ChronosFactory address in addresses.js');
    }
    
    const contractAddress = addressMatch[1];
    const useAddress = await prompt(`${COLORS.cyan}Found contract address: ${contractAddress}. Use this address? (y/n):${COLORS.reset} `);
    
    if (useAddress.toLowerCase() === 'y') {
      return contractAddress;
    }
  } catch (error) {
    console.warn(`${COLORS.yellow}Warning:${COLORS.reset} ${error.message}`);
  }
  
  // If we're here, either there was an error or user chose not to use the found address
  return await prompt(`${COLORS.cyan}Enter contract address to verify:${COLORS.reset} `);
}

// Main function to verify contract using Blockscout
async function verifyWithBlockscout() {
  console.log(`\n${COLORS.magenta}=========================================${COLORS.reset}`);
  console.log(`${COLORS.magenta}Chronos Protocol - Blockscout Verification${COLORS.reset}`);
  console.log(`${COLORS.magenta}=========================================${COLORS.reset}\n`);
  
  try {
    // 1. Get contract address
    const contractAddress = await getContractAddress();
    if (!contractAddress || !contractAddress.startsWith('0x')) {
      console.error(`${COLORS.red}Error:${COLORS.reset} Invalid contract address`);
      return false;
    }
    
    // 2. Ask for contract path
    const defaultContractPath = 'contracts/ChronosFactory.sol';
    const contractPathInput = await prompt(`${COLORS.cyan}Enter contract file path (default: ${defaultContractPath}):${COLORS.reset} `);
    const contractPath = contractPathInput || defaultContractPath;
    
    if (!fs.existsSync(contractPath)) {
      console.error(`${COLORS.red}Error:${COLORS.reset} Contract file not found at ${contractPath}`);
      return false;
    }
    
    // 3. Get compiler version from hardhat.config.js
    let compilerVersion = '0.8.20'; // Default version
    try {
      const hardhatConfigPath = path.join(__dirname, '../hardhat.config.js');
      const hardhatConfig = fs.readFileSync(hardhatConfigPath, 'utf8');
      const versionMatch = hardhatConfig.match(/version:\s*["']([^"']+)["']/);
      if (versionMatch) {
        compilerVersion = versionMatch[1];
      }
    } catch (error) {
      console.warn(`${COLORS.yellow}Warning:${COLORS.reset} Could not determine compiler version from hardhat.config.js, using default: ${compilerVersion}`);
    }
    
    // 4. Flatten the contract
    const flattenedSource = await getFlattenedSource(contractPath);
    if (!flattenedSource) {
      console.error(`${COLORS.red}Error:${COLORS.reset} Failed to flatten contract source`);
      return false;
    }
    
    // 5. Save flattened source to file
    const flattenedPath = path.join(__dirname, '../flattened-contract.sol');
    fs.writeFileSync(flattenedPath, flattenedSource);
    console.log(`${COLORS.green}✓ Flattened contract saved to:${COLORS.reset} ${flattenedPath}`);
    
    // 6. Provide instructions for manual verification
    console.log(`\n${COLORS.blue}=====================================${COLORS.reset}`);
    console.log(`${COLORS.blue}Blockscout Verification Instructions${COLORS.reset}`);
    console.log(`${COLORS.blue}=====================================${COLORS.reset}\n`);
    
    console.log(`${COLORS.green}Contract is ready for Blockscout verification!${COLORS.reset}\n`);
    console.log(`1. Visit: ${COLORS.cyan}https://base-sepolia.blockscout.com/address/${contractAddress}#code${COLORS.reset}`);
    console.log(`2. Click on "${COLORS.cyan}Verify & Publish${COLORS.reset}"`);
    console.log(`3. Enter the following information:`);
    console.log(`   - Contract Name: ${COLORS.cyan}ChronosFactory${COLORS.reset}`);
    console.log(`   - Compiler Version: ${COLORS.cyan}v${compilerVersion}${COLORS.reset}`);
    console.log(`   - Optimization: ${COLORS.cyan}Yes${COLORS.reset}`);
    console.log(`   - Optimization runs: ${COLORS.cyan}200${COLORS.reset}`);
    
    console.log(`\n4. For the contract source, open:${COLORS.reset} ${COLORS.cyan}${flattenedPath}${COLORS.reset}`);
    console.log(`5. Copy and paste the full content into the Blockscout verification page`);
    console.log(`6. Submit the form to verify your contract`);
    
    console.log(`\n${COLORS.blue}=====================================${COLORS.reset}`);
    
    const openBrowser = await prompt(`\n${COLORS.cyan}Would you like to open Blockscout in your default browser? (y/n):${COLORS.reset} `);
    if (openBrowser.toLowerCase() === 'y') {
      const url = `https://base-sepolia.blockscout.com/address/${contractAddress}#code`;
      try {
        console.log(`${COLORS.blue}Opening browser to:${COLORS.reset} ${url}`);
        if (process.platform === 'win32') {
          runCommand(`start ${url}`);
        } else if (process.platform === 'darwin') {
          runCommand(`open ${url}`);
        } else {
          runCommand(`xdg-open ${url}`);
        }
      } catch (error) {
        console.warn(`${COLORS.yellow}Warning:${COLORS.reset} Could not open browser automatically`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Error during Blockscout verification:${COLORS.reset} ${error.message}`);
    return false;
  } finally {
    rl.close();
  }
}

// Run the verification process
verifyWithBlockscout()
  .then(success => {
    if (!success) {
      console.error(`\n${COLORS.red}Verification preparation did not complete successfully.${COLORS.reset}`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n${COLORS.red}Unexpected error:${COLORS.reset} ${error.message}`);
    process.exit(1);
  });
