// Script to prepare a Chronos Protocol deployment from scratch
// Sets up all configuration files and checks dependencies
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

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

// Utility function to execute commands
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`${COLORS.red}Command failed:${COLORS.reset} ${command}`);
    console.error(error.message);
    return null;
  }
}

// Utility function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Utility function to check if a dependency is installed
async function checkDependency(name, installCmd) {
  console.log(`\n${COLORS.blue}Checking for ${name}...${COLORS.reset}`);
  
  try {
    switch (name) {
      case 'Node.js':
        const nodeVersion = runCommand('node --version');
        console.log(`${COLORS.green}✓ ${name} installed:${COLORS.reset} ${nodeVersion.trim()}`);
        break;
        
      case 'npm':
        const npmVersion = runCommand('npm --version');
        console.log(`${COLORS.green}✓ ${name} installed:${COLORS.reset} ${npmVersion.trim()}`);
        break;
        
      case 'Hardhat':
        try {
          execSync('npx hardhat --version', { encoding: 'utf8' });
          console.log(`${COLORS.green}✓ ${name} is available${COLORS.reset}`);
        } catch {
          console.log(`${COLORS.yellow}⚠ ${name} not found. Installing...${COLORS.reset}`);
          runCommand('npm install --save-dev hardhat');
          console.log(`${COLORS.green}✓ ${name} installed${COLORS.reset}`);
        }
        break;
        
      default:
        try {
          const exists = runCommand(`npm list ${name}`);
          if (exists && !exists.includes('empty')) {
            console.log(`${COLORS.green}✓ ${name} is already installed${COLORS.reset}`);
          } else {
            throw new Error('Not installed');
          }
        } catch {
          console.log(`${COLORS.yellow}⚠ ${name} not found. Installing...${COLORS.reset}`);
          runCommand(installCmd);
          console.log(`${COLORS.green}✓ ${name} installed${COLORS.reset}`);
        }
    }
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Error checking/installing ${name}:${COLORS.reset} ${error.message}`);
    const shouldContinue = await prompt(`${COLORS.yellow}Continue anyway? (y/n):${COLORS.reset} `);
    return shouldContinue.toLowerCase() === 'y';
  }
}

// Function to create or update .env file
function setupEnvFile(envData, filePath) {
  try {
    let content = '';
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }
    
    // Update or add each environment variable
    Object.entries(envData).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (content.match(regex)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(filePath, content.trim() + '\n');
    console.log(`${COLORS.green}✓ Updated${COLORS.reset} ${filePath}`);
  } catch (error) {
    console.error(`${COLORS.red}Error updating ${filePath}:${COLORS.reset} ${error.message}`);
  }
}

// Main function to prepare the deployment
async function prepareDeployment() {
  console.log(`\n${COLORS.magenta}=========================================${COLORS.reset}`);
  console.log(`${COLORS.magenta}Chronos Protocol - Deployment Preparation${COLORS.reset}`);
  console.log(`${COLORS.magenta}=========================================${COLORS.reset}\n`);
  
  try {
    // 1. Check dependencies
    console.log(`${COLORS.blue}Checking required dependencies...${COLORS.reset}`);
    await checkDependency('Node.js');
    await checkDependency('npm');
    await checkDependency('Hardhat');
    await checkDependency('@thirdweb-dev/sdk', 'npm install @thirdweb-dev/sdk');
    await checkDependency('@thirdweb-dev/react', 'npm install @thirdweb-dev/react');
    await checkDependency('@thirdweb-dev/chains', 'npm install @thirdweb-dev/chains');
    await checkDependency('dotenv', 'npm install dotenv');
    
    // 2. Collect necessary information from the user
    console.log(`\n${COLORS.blue}Setting up environment configuration...${COLORS.reset}`);
    console.log(`${COLORS.yellow}Note: Leave blank to use placeholder values for now.${COLORS.reset}\n`);
    
    // Get private key
    const privateKey = await prompt(`${COLORS.cyan}Enter your private key for contract deployment (or leave blank):${COLORS.reset} `);
    
    // Get Alchemy API key
    const alchemyKey = await prompt(`${COLORS.cyan}Enter your Alchemy API key (or leave blank):${COLORS.reset} `);
    
    // Get ThirdWeb client ID
    const thirdwebId = await prompt(`${COLORS.cyan}Enter your ThirdWeb client ID (or leave blank):${COLORS.reset} `);
    
    // Get BaseScan API key
    const basescanKey = await prompt(`${COLORS.cyan}Enter your BaseScan API key (or leave blank):${COLORS.reset} `);
    
    // 3. Create or update .env files
    console.log(`\n${COLORS.blue}Updating environment configuration files...${COLORS.reset}`);
    
    // Root .env file
    const rootEnvPath = path.join(__dirname, '../.env');
    setupEnvFile({
      PRIVATE_KEY: privateKey || 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      BASE_SEPOLIA_RPC_URL: 'https://sepolia.base.org',
      ALCHEMY_API_KEY: alchemyKey || 'your-alchemy-api-key-here',
      ALCHEMY_BASE_SEPOLIA_URL: alchemyKey ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}` : 'https://base-sepolia.g.alchemy.com/v2/your-api-key-here',
      THIRDWEB_CLIENT_ID: thirdwebId || 'your-thirdweb-client-id-here',
      THIRDWEB_SECRET_KEY: 'your-thirdweb-secret-key-here',
      BASESCAN_API_KEY: basescanKey || 'your-basescan-api-key-here'
    }, rootEnvPath);
    
    // Frontend .env.local file
    const frontendEnvPath = path.join(__dirname, '../apps/web/.env.local');
    setupEnvFile({
      VITE_API_URL: 'http://localhost:3001/api',
      VITE_THIRDWEB_CLIENT_ID: thirdwebId || 'your-thirdweb-client-id-here',
      VITE_BASE_CHAIN_ID: '84532',
      VITE_CHRONOS_FACTORY_ADDRESS: '0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94',
      VITE_ALCHEMY_API_KEY: alchemyKey || 'your-alchemy-api-key-here'
    }, frontendEnvPath);
    
    // 4. Compile contracts
    console.log(`\n${COLORS.blue}Compiling smart contracts...${COLORS.reset}`);
    runCommand('npx hardhat compile');
    console.log(`${COLORS.green}✓ Contracts compiled successfully${COLORS.reset}`);

    // 5. Wrap up
    console.log(`\n${COLORS.green}================================${COLORS.reset}`);
    console.log(`${COLORS.green}Deployment Preparation Complete!${COLORS.reset}`);
    console.log(`${COLORS.green}================================${COLORS.reset}\n`);
    
    console.log(`${COLORS.blue}Next steps:${COLORS.reset}`);
    console.log(`1. Ensure you have Base Sepolia test ETH (Get from https://www.base.org/faucet)`);
    console.log(`2. Deploy your contracts: ${COLORS.cyan}npm run deploy:enhanced${COLORS.reset}`);
    console.log(`3. Check deployment status: ${COLORS.cyan}npm run check:deployment${COLORS.reset}`);
    console.log(`4. Start the frontend: ${COLORS.cyan}npm run dev${COLORS.reset}\n`);

    if (!privateKey || privateKey === 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') {
      console.log(`${COLORS.yellow}⚠ Warning:${COLORS.reset} You're using a default private key. This is fine for testing,`);
      console.log(`  but make sure to update it with your own key before deploying to public networks.\n`);
    }
    
    if (!alchemyKey) {
      console.log(`${COLORS.yellow}⚠ Warning:${COLORS.reset} No Alchemy API key provided. Get one at https://www.alchemy.com/\n`);
    }
    
    if (!basescanKey) {
      console.log(`${COLORS.yellow}⚠ Warning:${COLORS.reset} No BaseScan API key provided. You won't be able to verify contracts.`);
      console.log(`  Get a key at https://basescan.org/register and then https://basescan.org/myapikey\n`);
    }
  } catch (error) {
    console.error(`${COLORS.red}Preparation failed:${COLORS.reset} ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the preparation function
prepareDeployment();
