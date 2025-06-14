const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and return the output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    throw error;
  }
}

// Function to update the addresses.js file with the deployed contract address
function updateAddressesFile(address) {
  const addressesPath = path.join(__dirname, '../apps/web/src/config/addresses.js');
  const content = fs.readFileSync(addressesPath, 'utf8');
  
  // Update the Base Sepolia address
  const updatedContent = content.replace(
    /84532: {\s*ChronosFactory: ".*?",/,
    `84532: {\n    ChronosFactory: "${address}",`
  );
  
  fs.writeFileSync(addressesPath, updatedContent);
  console.log(`Updated address in ${addressesPath}`);
}

// Main function
async function main() {
  try {
    console.log('Starting deployment process to Base Sepolia testnet...');
    
    // Check if .env file exists
    if (!fs.existsSync(path.join(__dirname, '../.env'))) {
      console.error('Error: .env file not found. Please create one based on .env.example');
      process.exit(1);
    }
    
    // Deploy contracts
    console.log('\nDeploying contracts to Base Sepolia...');
    const deployOutput = runCommand('npx hardhat run deployment/deploy.js --network baseSepolia');
    
    // Extract contract address from output
    const addressMatch = deployOutput.match(/ChronosFactory deployed to: (0x[a-fA-F0-9]{40})/);
    if (!addressMatch) {
      throw new Error('Could not find deployed contract address in output');
    }
    
    const contractAddress = addressMatch[1];
    console.log(`\nDeployed ChronosFactory address: ${contractAddress}`);
    
    // Update addresses.js file
    updateAddressesFile(contractAddress);
    
    // Verify contract on BaseScan
    console.log('\nVerifying contract on BaseScan...');
    try {
      runCommand(`npx hardhat verify --network baseSepolia ${contractAddress}`);
      console.log('\nContract verification successful!');
    } catch (error) {
      console.warn('Contract verification failed. You may need to verify manually.');
    }
    
    console.log('\nDeployment process completed!');
    console.log(`ChronosFactory deployed and set to: ${contractAddress}`);
    console.log('\nRemember to fund your wallet with Base Sepolia ETH before using the app.');
    console.log('You can get Base Sepolia ETH from https://faucet.base.org/');
    
  } catch (error) {
    console.error(`\nDeployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
