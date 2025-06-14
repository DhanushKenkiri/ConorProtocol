// Enhanced script for deploying Chronos Protocol to Base Sepolia testnet
// With better error handling, verification support, and comprehensive checks
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration validation
const REQUIRED_ENV_VARS = [
  'PRIVATE_KEY', 
  'ALCHEMY_API_KEY', 
  'ALCHEMY_BASE_SEPOLIA_URL'
];

const OPTIONAL_ENV_VARS = [
  'BASESCAN_API_KEY',
  'THIRDWEB_CLIENT_ID',
  'THIRDWEB_SECRET_KEY'
];

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

// Function to update contract addresses in configuration files
function updateAddressesConfig(address) {
  // Update frontend addresses.js
  const addressesPath = path.join(__dirname, '../apps/web/src/config/addresses.js');
  if (fs.existsSync(addressesPath)) {
    let content = fs.readFileSync(addressesPath, 'utf8');
    
    // Update the Base Sepolia address with better regex pattern
    const updatedContent = content.replace(
      /(84532:\s*{\s*ChronosFactory:\s*")([^"]*)("),/,
      `$1${address}$3,`
    );
    
    fs.writeFileSync(addressesPath, updatedContent);
    console.log(`${COLORS.green}✓ Updated contract address in${COLORS.reset} ${addressesPath}`);
  } else {
    console.log(`${COLORS.yellow}Warning:${COLORS.reset} Could not find ${addressesPath}. Make sure to manually update contract address.`);
  }

  // Update frontend .env.local if it exists
  const frontendEnvPath = path.join(__dirname, '../apps/web/.env.local');
  if (fs.existsSync(frontendEnvPath)) {
    let envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    
    if (envContent.includes('VITE_CHRONOS_FACTORY_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_CHRONOS_FACTORY_ADDRESS=.*/,
        `VITE_CHRONOS_FACTORY_ADDRESS=${address}`
      );
    } else {
      envContent += `\nVITE_CHRONOS_FACTORY_ADDRESS=${address}\n`;
    }
    
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log(`${COLORS.green}✓ Updated contract address in${COLORS.reset} ${frontendEnvPath}`);
  }
}

// Function to check wallet balance before deployment
async function checkWalletBalance() {
  try {
    console.log(`${COLORS.blue}Checking wallet balance...${COLORS.reset}`);
    const output = runCommand('npx hardhat run scripts/check-wallet.js');
    
    if (output.includes('Insufficient funds')) {
      console.error(`${COLORS.red}Error:${COLORS.reset} Your wallet doesn't have enough Base Sepolia ETH for deployment.`);
      console.log(`Please get testnet ETH from: ${COLORS.cyan}https://www.base.org/faucet${COLORS.reset}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn(`${COLORS.yellow}Warning:${COLORS.reset} Could not check wallet balance. Proceeding anyway.`);
    return true;
  }
}

// Function to verify environment variables
function validateConfig() {
  console.log(`${COLORS.blue}Validating configuration...${COLORS.reset}`);
  let missingVars = [];
  
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error(`${COLORS.red}Error:${COLORS.reset} Missing required environment variables:`);
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    return false;
  }

  // Check optional vars
  let warningVars = [];
  OPTIONAL_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      warningVars.push(varName);
    }
  });
  
  if (warningVars.length > 0) {
    console.warn(`${COLORS.yellow}Warning:${COLORS.reset} Missing optional environment variables:`);
    warningVars.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
    
    if (warningVars.includes('BASESCAN_API_KEY')) {
      console.warn(`  ${COLORS.yellow}Note:${COLORS.reset} Without BASESCAN_API_KEY, contract verification will be skipped.`);
      console.warn(`  Get an API key at ${COLORS.cyan}https://basescan.org/myapikey${COLORS.reset}`);
    }
  }

  return true;
}

// Verify contract using BaseScan or Blockscout alternative
async function verifyContract(contractAddress) {
  // Check if using Blockscout alternative
  const useBlockscout = process.env.USE_BLOCKSCOUT === 'true';
  
  if (!process.env.BASESCAN_API_KEY && !useBlockscout) {
    console.warn(`${COLORS.yellow}Warning:${COLORS.reset} BASESCAN_API_KEY not set and USE_BLOCKSCOUT not enabled`);
    console.log(`Consider enabling USE_BLOCKSCOUT=true in your .env file to use Blockscout instead`);
    return false;
  }

  if (useBlockscout) {
    console.log(`\n${COLORS.blue}Using Blockscout for contract verification...${COLORS.reset}`);
    console.log(`${COLORS.cyan}Contract address:${COLORS.reset} ${contractAddress}`);
    console.log(`${COLORS.cyan}Blockscout URL:${COLORS.reset} https://base-sepolia.blockscout.com/address/${contractAddress}`);
    
    console.log(`\n${COLORS.yellow}To verify your contract on Blockscout:${COLORS.reset}`);
    console.log(`1. Go to https://base-sepolia.blockscout.com/address/${contractAddress}#code`);
    console.log(`2. Click "Verify & Publish"`);
    console.log(`3. Select compiler version: 0.8.20`);
    console.log(`4. Upload source code or enter it manually`);
    
    return true;
  } else {
    // Traditional BaseScan verification
    console.log(`\n${COLORS.blue}Verifying contract on BaseScan...${COLORS.reset}`);
    try {
      // First try with simple verification (no constructor args)
      runCommand(`npx hardhat verify --network baseSepolia ${contractAddress}`);
      console.log(`${COLORS.green}✓ Contract verification successful!${COLORS.reset}`);
      return true;
    } catch (error) {
      console.warn(`${COLORS.yellow}Warning:${COLORS.reset} Automatic contract verification failed.`);
      console.log(`You can verify manually with: npx hardhat verify --network baseSepolia ${contractAddress}`);
      return false;
    }
  }
}

// Main deployment function
async function deployToBaseSepolia() {
  try {
    console.log(`\n${COLORS.blue}========================================${COLORS.reset}`);
    console.log(`${COLORS.blue}Chronos Protocol - Base Sepolia Deployment${COLORS.reset}`);
    console.log(`${COLORS.blue}========================================${COLORS.reset}\n`);
    
    // 1. Validate environment configuration
    if (!validateConfig()) {
      return false;
    }
    
    // 2. Check wallet balance
    if (!(await checkWalletBalance())) {
      return false;
    }
    
    // 3. Deploy the contracts
    console.log(`\n${COLORS.blue}Deploying contracts to Base Sepolia...${COLORS.reset}`);
    const deployOutput = runCommand('npx hardhat run deployment/deploy.js --network baseSepolia');
    
    // 4. Extract contract address from output
    const addressMatch = deployOutput.match(/ChronosFactory deployed to: (0x[a-fA-F0-9]{40})/);
    if (!addressMatch) {
      console.error(`${COLORS.red}Error:${COLORS.reset} Could not find deployed contract address in output`);
      return false;
    }
    
    const contractAddress = addressMatch[1];
    console.log(`\n${COLORS.green}✓ ChronosFactory deployed successfully!${COLORS.reset}`);
    console.log(`  Contract address: ${COLORS.cyan}${contractAddress}${COLORS.reset}`);
    
    // 5. Update addresses in config files
    updateAddressesConfig(contractAddress);
    
    // 6. Verify contract on BaseScan
    const verified = await verifyContract(contractAddress);
    
    // 7. Show deployment summary
    console.log(`\n${COLORS.blue}=====================================${COLORS.reset}`);
    console.log(`${COLORS.blue}Deployment Summary${COLORS.reset}`);
    console.log(`${COLORS.blue}=====================================${COLORS.reset}\n`);
    console.log(`${COLORS.green}✓ Deployment completed!${COLORS.reset}`);
    console.log(`- Contract Address: ${COLORS.cyan}${contractAddress}${COLORS.reset}`);
    console.log(`- Network: ${COLORS.cyan}Base Sepolia (Chain ID: 84532)${COLORS.reset}`);
    console.log(`- Verification: ${verified ? COLORS.green + '✓ Verified' : COLORS.yellow + '⚠ Not verified'}${COLORS.reset}`);
    console.log(`- Explorer URL: ${COLORS.cyan}https://sepolia.basescan.org/address/${contractAddress}${COLORS.reset}\n`);
    
    console.log(`${COLORS.blue}Next Steps:${COLORS.reset}`);
    console.log(`1. Start your frontend application: ${COLORS.cyan}npm run dev${COLORS.reset}`);
    console.log(`2. Test interactions with your contract`);
    if (!verified) {
      console.log(`3. Verify your contract manually: ${COLORS.cyan}npx hardhat verify --network baseSepolia ${contractAddress}${COLORS.reset}`);
    }
    
    return true;
  } catch (error) {
    console.error(`\n${COLORS.red}Deployment failed:${COLORS.reset} ${error.message}`);
    return false;
  }
}

// Run the deployment
deployToBaseSepolia()
  .then(success => {
    if (!success) {
      console.error(`\n${COLORS.red}Deployment did not complete successfully.${COLORS.reset}`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n${COLORS.red}Deployment error:${COLORS.reset} ${error.message}`);
    process.exit(1);
  });
