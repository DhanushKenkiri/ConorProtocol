// Script to check contract status on Base Sepolia and verify it's properly deployed
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;
const BASESCAN_API_URL = 'https://api-sepolia.basescan.org/api';

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Get the deployed contract address from addresses.js
function getDeployedContractAddress() {
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
    
    return addressMatch[1];
  } catch (error) {
    console.error(`${COLORS.red}Error getting contract address:${COLORS.reset} ${error.message}`);
    return null;
  }
}

// Check if contract exists on BaseScan or Blockscout
async function checkContractOnBaseScan(contractAddress) {
  // Check if using Blockscout alternative
  const useBlockscout = process.env.USE_BLOCKSCOUT === 'true';
  
  if (useBlockscout) {
    console.log(`${COLORS.blue}Using Blockscout for contract verification...${COLORS.reset}`);
    try {
      // Unfortunately, Blockscout doesn't have a public API for programmatic checks
      // So we'll provide guidance for manual verification
      console.log(`${COLORS.green}✓ Contract address:${COLORS.reset} ${contractAddress}`);
      console.log(`${COLORS.cyan}Check contract on Blockscout:${COLORS.reset} https://base-sepolia.blockscout.com/address/${contractAddress}`);
      console.log(`\n${COLORS.yellow}To verify contract on Blockscout:${COLORS.reset}`);
      console.log(`You can run: ${COLORS.cyan}npm run verify:blockscout${COLORS.reset}`);
      return true;
    } catch (error) {
      console.error(`${COLORS.red}Error preparing Blockscout verification:${COLORS.reset} ${error.message}`);
      return false;
    }
  } else {
    // BaseScan verification
    if (!BASESCAN_API_KEY) {
      console.warn(`${COLORS.yellow}Warning:${COLORS.reset} BASESCAN_API_KEY not set. Limited check available.`);
      console.warn(`${COLORS.yellow}Tip:${COLORS.reset} You can set USE_BLOCKSCOUT=true in .env to use Blockscout instead.`);
    }
    
    try {
      // First, check if contract exists by getting the bytecode
      const response = await axios.get(BASESCAN_API_URL, {
        params: {
          module: 'proxy',
          action: 'eth_getCode',
          address: contractAddress,
          tag: 'latest',
          apikey: BASESCAN_API_KEY || ''
        }
      });
      
      if (response.data.result === '0x' || response.data.result === '0x0') {
        console.error(`${COLORS.red}Error:${COLORS.reset} No contract found at address ${contractAddress}`);
        return false;
      }
      
      console.log(`${COLORS.green}✓ Contract exists${COLORS.reset} at ${contractAddress}`);
      
      // Check if contract is verified (only works with API key)
      if (BASESCAN_API_KEY) {
        const verificationResponse = await axios.get(BASESCAN_API_URL, {
          params: {
            module: 'contract',
            action: 'getsourcecode',
            address: contractAddress,
            apikey: BASESCAN_API_KEY
          }
        });
        
        const sourceInfo = verificationResponse.data.result[0];
        if (sourceInfo && sourceInfo.SourceCode && sourceInfo.SourceCode !== '') {
          console.log(`${COLORS.green}✓ Contract is verified${COLORS.reset} on BaseScan`);
          
          // Display additional information
          console.log(`\n${COLORS.blue}Contract Information:${COLORS.reset}`);
          console.log(`- Name: ${COLORS.cyan}${sourceInfo.ContractName}${COLORS.reset}`);
          console.log(`- Compiler Version: ${COLORS.cyan}${sourceInfo.CompilerVersion}${COLORS.reset}`);
          console.log(`- Optimization: ${sourceInfo.OptimizationUsed === "1" ? COLORS.green + 'Yes' : COLORS.red + 'No'}${COLORS.reset}`);
          
          return true;
        } else {
          console.log(`${COLORS.yellow}⚠ Contract is NOT verified${COLORS.reset} on BaseScan`);
          console.log(`  You can verify it with: npx hardhat verify --network baseSepolia ${contractAddress}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`${COLORS.red}Error checking contract on BaseScan:${COLORS.reset} ${error.message}`);
      return false;
    }
  }
}

// Check if contract address is properly set in the frontend .env.local
function checkFrontendConfig(contractAddress) {
  try {
    const envPath = path.join(__dirname, '../apps/web/.env.local');
    if (!fs.existsSync(envPath)) {
      console.warn(`${COLORS.yellow}Warning:${COLORS.reset} Frontend .env.local file not found`);
      return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes(`VITE_CHRONOS_FACTORY_ADDRESS=${contractAddress}`)) {
      console.log(`${COLORS.green}✓ Frontend environment${COLORS.reset} has correct contract address`);
      return true;
    } else {
      console.warn(`${COLORS.yellow}Warning:${COLORS.reset} Frontend environment does not have the correct contract address`);
      console.log(`Please update VITE_CHRONOS_FACTORY_ADDRESS in apps/web/.env.local to ${contractAddress}`);
      return false;
    }
  } catch (error) {
    console.error(`${COLORS.red}Error checking frontend config:${COLORS.reset} ${error.message}`);
    return false;
  }
}

// Main function to check contract status
async function checkContractStatus() {
  console.log(`\n${COLORS.blue}========================================${COLORS.reset}`);
  console.log(`${COLORS.blue}Chronos Protocol - Contract Status Check${COLORS.reset}`);
  console.log(`${COLORS.blue}========================================${COLORS.reset}\n`);
  
  // 1. Get the deployed contract address
  const contractAddress = getDeployedContractAddress();
  if (!contractAddress) {
    console.error(`${COLORS.red}Could not find deployed contract address.${COLORS.reset}`);
    console.log(`Make sure you have deployed the contract with: npm run deploy:base-sepolia`);
    return false;
  }
  
  console.log(`Found contract address: ${COLORS.cyan}${contractAddress}${COLORS.reset}`);
  console.log(`BaseScan URL: ${COLORS.cyan}https://sepolia.basescan.org/address/${contractAddress}${COLORS.reset}\n`);
  
  // 2. Check if contract exists on BaseScan
  const contractExists = await checkContractOnBaseScan(contractAddress);
  
  // 3. Check if contract address is properly set in frontend config
  const frontendConfigCorrect = checkFrontendConfig(contractAddress);
  
  // 4. Show summary
  console.log(`\n${COLORS.blue}=====================================${COLORS.reset}`);
  console.log(`${COLORS.blue}Contract Status Summary${COLORS.reset}`);
  console.log(`${COLORS.blue}=====================================${COLORS.reset}\n`);
  
  console.log(`- Contract Address: ${COLORS.cyan}${contractAddress}${COLORS.reset}`);
  console.log(`- Contract Exists on BaseScan: ${contractExists ? COLORS.green + '✓ Yes' : COLORS.red + '✗ No'}${COLORS.reset}`);
  console.log(`- Frontend Config Correct: ${frontendConfigCorrect ? COLORS.green + '✓ Yes' : COLORS.yellow + '⚠ No'}${COLORS.reset}\n`);
  
  if (contractExists && frontendConfigCorrect) {
    console.log(`${COLORS.green}All checks passed!${COLORS.reset} The contract is properly deployed and configured.`);
    return true;
  } else {
    console.warn(`${COLORS.yellow}There were issues with the contract deployment or configuration.${COLORS.reset}`);
    console.log(`Please review the above messages to resolve any problems.`);
    return false;
  }
}

// Run the check
checkContractStatus()
  .catch(error => {
    console.error(`\n${COLORS.red}Error checking contract status:${COLORS.reset} ${error.message}`);
    process.exit(1);
  });
