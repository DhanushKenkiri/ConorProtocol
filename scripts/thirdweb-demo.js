// Demo script for interacting with ChronosFactory contract via ThirdWeb
// This script shows how to use ThirdWeb SDK to interact with the contract
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { BaseSepoliaTestnet } = require("@thirdweb-dev/chains");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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

// Function to prompt for user input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Load ChronosFactory ABI
const loadChronosFactoryABI = () => {
  try {
    const abiPath = path.join(__dirname, '../artifacts/contracts/ChronosFactory.sol/ChronosFactory.json');
    const contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    return contractData.abi;
  } catch (error) {
    console.error(`${COLORS.red}Error loading ChronosFactory ABI:${COLORS.reset} ${error.message}`);
    console.log(`Make sure you've compiled the contracts with: ${COLORS.cyan}npx hardhat compile${COLORS.reset}`);
    return null;
  }
};

// Get contract address from addresses.js
const getContractAddress = () => {
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
};

// Initialize ThirdWeb SDK
async function initializeSDK() {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    const thirdwebClientId = process.env.THIRDWEB_CLIENT_ID;
    
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not found in .env file");
    }
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    console.log(`${COLORS.green}Wallet loaded:${COLORS.reset} ${wallet.address}`);
    
    // Create SDK options
    const sdkOptions = {
      gasSettings: {
        maxPriceInGwei: 500,
        speed: "standard"
      }
    };
    
    if (alchemyKey) {
      console.log(`${COLORS.green}Using Alchemy API Key${COLORS.reset}`);
      sdkOptions.alchemyApiKey = alchemyKey;
    }
    
    if (thirdwebClientId) {
      console.log(`${COLORS.green}Using ThirdWeb Client ID${COLORS.reset}`);
      sdkOptions.clientId = thirdwebClientId;
    }
    
    // Initialize SDK with signer
    console.log(`${COLORS.blue}Initializing ThirdWeb SDK...${COLORS.reset}`);
    const sdk = ThirdwebSDK.fromSigner(wallet, BaseSepoliaTestnet, sdkOptions);
    console.log(`${COLORS.green}ThirdWeb SDK initialized successfully!${COLORS.reset}`);
    
    return { sdk, wallet };
  } catch (error) {
    console.error(`${COLORS.red}Error initializing ThirdWeb SDK:${COLORS.reset} ${error.message}`);
    return null;
  }
}

// Get contract instance
async function getChronosFactoryContract(sdk, address, abi) {
  try {
    console.log(`${COLORS.blue}Getting contract at ${address}...${COLORS.reset}`);
    const contract = await sdk.getContract(address, abi);
    console.log(`${COLORS.green}Contract loaded successfully!${COLORS.reset}`);
    return contract;
  } catch (error) {
    console.error(`${COLORS.red}Error getting contract:${COLORS.reset} ${error.message}`);
    return null;
  }
}

// Display agreement details
function displayAgreement(agreement) {
  const stateMap = ["Proposed", "Active", "Completed", "Expired", "Voided"];
  console.log(`\n${COLORS.blue}Agreement Details:${COLORS.reset}`);
  console.log(`- Address: ${COLORS.cyan}${agreement.agreementAddress}${COLORS.reset}`);
  console.log(`- Creator: ${COLORS.cyan}${agreement.creator}${COLORS.reset}`);
  console.log(`- Recipient: ${COLORS.cyan}${agreement.recipient}${COLORS.reset}`);
  console.log(`- Description: ${COLORS.cyan}${agreement.description}${COLORS.reset}`);
  console.log(`- Deadline: ${COLORS.cyan}${new Date(agreement.deadline * 1000).toLocaleString()}${COLORS.reset}`);
  console.log(`- Value: ${COLORS.cyan}${ethers.utils.formatEther(agreement.value)} ETH${COLORS.reset}`);
  console.log(`- State: ${COLORS.cyan}${stateMap[agreement.state] || agreement.state}${COLORS.reset}`);
}

// Main function
async function main() {
  try {
    console.log(`\n${COLORS.magenta}=========================================${COLORS.reset}`);
    console.log(`${COLORS.magenta}Chronos Protocol - ThirdWeb Demo${COLORS.reset}`);
    console.log(`${COLORS.magenta}=========================================${COLORS.reset}\n`);
    
    // Load ABI
    const abi = loadChronosFactoryABI();
    if (!abi) return;
    
    // Get contract address
    const contractAddress = getContractAddress();
    if (!contractAddress) {
      console.log(`\n${COLORS.yellow}No contract address found.${COLORS.reset}`);
      console.log(`Please deploy the contract first with: ${COLORS.cyan}npm run deploy:enhanced${COLORS.reset}`);
      return;
    }
    
    // Initialize SDK
    const sdkData = await initializeSDK();
    if (!sdkData) return;
    const { sdk, wallet } = sdkData;
    
    // Get contract instance
    const contract = await getChronosFactoryContract(sdk, contractAddress, abi);
    if (!contract) return;
    
    console.log(`\n${COLORS.blue}ThirdWeb connection established!${COLORS.reset}`);
    console.log(`- Network: ${COLORS.cyan}Base Sepolia Testnet${COLORS.reset}`);
    console.log(`- ChronosFactory: ${COLORS.cyan}${contractAddress}${COLORS.reset}`);
    console.log(`- Connected wallet: ${COLORS.cyan}${wallet.address}${COLORS.reset}`);
    
    // Display menu
    while (true) {
      console.log(`\n${COLORS.blue}=============================${COLORS.reset}`);
      console.log(`${COLORS.blue}Available Actions:${COLORS.reset}`);
      console.log(`1. Create a new agreement`);
      console.log(`2. Get agreements created by you`);
      console.log(`3. Get agreements where you are recipient`);
      console.log(`4. Get all agreements`);
      console.log(`5. Exit demo`);
      console.log(`${COLORS.blue}=============================${COLORS.reset}\n`);
      
      const choice = await prompt(`${COLORS.cyan}Select an option (1-5):${COLORS.reset} `);
      
      switch (choice) {
        case '1': {
          // Create agreement
          console.log(`\n${COLORS.blue}Create a new agreement:${COLORS.reset}`);
          const recipient = await prompt(`${COLORS.cyan}Recipient address:${COLORS.reset} `);
          const description = await prompt(`${COLORS.cyan}Description:${COLORS.reset} `);
          
          // Get deadline as days from now
          const daysFromNow = await prompt(`${COLORS.cyan}Deadline (days from now):${COLORS.reset} `);
          const deadline = Math.floor(Date.now() / 1000) + parseInt(daysFromNow) * 86400;
          
          // Get value in ETH
          const valueEth = await prompt(`${COLORS.cyan}Value (ETH):${COLORS.reset} `);
          const value = ethers.utils.parseEther(valueEth);
          
          try {
            console.log(`\n${COLORS.blue}Creating agreement...${COLORS.reset}`);
            const tx = await contract.call("createAgreement", [
              recipient,
              description,
              deadline
            ], { value });
            
            console.log(`${COLORS.green}Agreement created!${COLORS.reset}`);
            console.log(`Transaction hash: ${COLORS.cyan}${tx.receipt.transactionHash}${COLORS.reset}`);
            console.log(`View on BaseScan: ${COLORS.cyan}https://sepolia.basescan.org/tx/${tx.receipt.transactionHash}${COLORS.reset}`);
            
            // Try to extract the created agreement address from logs
            const logs = tx.receipt.logs;
            if (logs && logs.length > 0) {
              // The first address in the logs is typically the created contract
              const possibleAddress = logs[0].address;
              console.log(`\nCreated agreement address: ${COLORS.cyan}${possibleAddress}${COLORS.reset}`);
            }
          } catch (error) {
            console.error(`${COLORS.red}Error creating agreement:${COLORS.reset} ${error.message}`);
          }
          break;
        }
        
        case '2': {
          // Get created agreements
          try {
            console.log(`\n${COLORS.blue}Fetching agreements created by you...${COLORS.reset}`);
            const agreements = await contract.call("getCreatedAgreements", [wallet.address]);
            
            if (agreements.length === 0) {
              console.log(`${COLORS.yellow}No agreements found.${COLORS.reset}`);
            } else {
              console.log(`${COLORS.green}Found ${agreements.length} agreements:${COLORS.reset}`);
              for (const agreement of agreements) {
                displayAgreement(agreement);
              }
            }
          } catch (error) {
            console.error(`${COLORS.red}Error fetching agreements:${COLORS.reset} ${error.message}`);
          }
          break;
        }
        
        case '3': {
          // Get received agreements
          try {
            console.log(`\n${COLORS.blue}Fetching agreements where you are recipient...${COLORS.reset}`);
            const agreements = await contract.call("getReceivedAgreements", [wallet.address]);
            
            if (agreements.length === 0) {
              console.log(`${COLORS.yellow}No agreements found.${COLORS.reset}`);
            } else {
              console.log(`${COLORS.green}Found ${agreements.length} agreements:${COLORS.reset}`);
              for (const agreement of agreements) {
                displayAgreement(agreement);
              }
            }
          } catch (error) {
            console.error(`${COLORS.red}Error fetching agreements:${COLORS.reset} ${error.message}`);
          }
          break;
        }
        
        case '4': {
          // Get all agreements
          try {
            console.log(`\n${COLORS.blue}Fetching all agreements...${COLORS.reset}`);
            const agreements = await contract.call("getAllAgreements");
            
            if (agreements.length === 0) {
              console.log(`${COLORS.yellow}No agreements found.${COLORS.reset}`);
            } else {
              console.log(`${COLORS.green}Found ${agreements.length} agreements:${COLORS.reset}`);
              for (const agreement of agreements) {
                displayAgreement(agreement);
              }
            }
          } catch (error) {
            console.error(`${COLORS.red}Error fetching agreements:${COLORS.reset} ${error.message}`);
          }
          break;
        }
        
        case '5': {
          console.log(`\n${COLORS.green}Exiting demo. Thank you for trying Chronos Protocol!${COLORS.reset}`);
          rl.close();
          return;
        }
        
        default:
          console.log(`${COLORS.yellow}Invalid option. Please select a number between 1 and 5.${COLORS.reset}`);
      }
    }
  } catch (error) {
    console.error(`${COLORS.red}Unexpected error:${COLORS.reset} ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(error => {
  console.error(`${COLORS.red}Unhandled error:${COLORS.reset} ${error.message}`);
  rl.close();
});
