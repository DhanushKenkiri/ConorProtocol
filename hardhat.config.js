require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Required configuration values from .env
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
// BaseScan API Key required for contract verification on Base Sepolia
// Get this key from https://basescan.org/myapikey after registering
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";
// Alchemy API key for enhanced RPC access
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

// If BaseScan API key is missing but Blockscout is enabled, use Blockscout
const USE_BLOCKSCOUT = process.env.USE_BLOCKSCOUT === 'true';

if (!BASESCAN_API_KEY && !USE_BLOCKSCOUT) {
  console.warn("\x1b[33m%s\x1b[0m", "Warning: BASESCAN_API_KEY not set in .env file. You won't be able to verify contracts on BaseScan.");
  console.warn("\x1b[33m%s\x1b[0m", "Get your BaseScan API key at https://basescan.org/register and then https://basescan.org/myapikey");
  console.warn("\x1b[33m%s\x1b[0m", "Alternatively, set USE_BLOCKSCOUT=true in your .env file to use Blockscout instead.");
} else if (USE_BLOCKSCOUT) {
  console.log("\x1b[32m%s\x1b[0m", "Using Blockscout for contract verification instead of BaseScan.");
  console.log("\x1b[32m%s\x1b[0m", "Blockscout URL: https://base-sepolia.blockscout.com");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },  
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      chainId: 31337
    },
    baseSepolia: {
      url: ALCHEMY_API_KEY 
        ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 84532,
      gasMultiplier: 1.2
    }
  },
  // This configuration enables contract verification on BaseScan (Base Sepolia block explorer)
  etherscan: {
    apiKey: {
      baseSepolia: BASESCAN_API_KEY
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
