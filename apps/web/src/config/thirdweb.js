// Thirdweb configuration for smart contract interactions
import { BaseSepoliaTestnet, Base } from '@thirdweb-dev/chains';

// API keys and configuration
// Hardcode ThirdWeb client ID as fallback to ensure it's always available
export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'a262c1f3f50486fab730c76223ec8a09';
export const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia Chain ID
// Hardcode Alchemy API Key as fallback to ensure it's always available
export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || 'JHvJUBwzQXxjN9ByrpdPvHVJrKFO7OmW';
export const CHRONOS_FACTORY_ADDRESS = import.meta.env.VITE_CHRONOS_FACTORY_ADDRESS || '0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94';

// Define custom Base Sepolia configuration
export const CustomBaseSepoliaChain = {
  ...BaseSepoliaTestnet,
  rpc: ALCHEMY_API_KEY 
    ? [`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] 
    : ['https://sepolia.base.org'],
};

// Enhanced configuration for ThirdWeb SDK
export const THIRDWEB_SDK_OPTIONS = {
  alchemyApiKey: ALCHEMY_API_KEY,
  gasSettings: {
    maxPriceInGwei: 500,
    speed: "standard"
  }
};

// Base Sepolia Chain configuration with Alchemy RPC if available
export const BASE_SEPOLIA_PARAMS = {
  chainId: '0x14a34', // 84532 in hexadecimal
  chainName: 'Base Sepolia Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ALCHEMY_API_KEY 
    ? [`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`] 
    : ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org']
};

// Export chain configurations for consistency with thirdweb SDK
export const CHAIN_CONFIG = CustomBaseSepoliaChain;
export const BASE_CHAINS = [CustomBaseSepoliaChain, Base];
