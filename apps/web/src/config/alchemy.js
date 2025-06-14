// Alchemy SDK Configuration for Base Sepolia
import { Alchemy, Network } from "alchemy-sdk";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Alchemy configuration for Base Sepolia
const baseSepoliaConfig = {
  apiKey: process.env.ALCHEMY_API_KEY || "your-alchemy-api-key-here",
  network: Network.BASE_SEPOLIA,
  // Optional settings
  maxRetries: 10,
};

// Initialize the Alchemy SDK
const alchemy = new Alchemy(baseSepoliaConfig);

export default alchemy;
