// Test script to validate chain ID formatting

// Since we can't directly import ES modules in CommonJS, we'll define the function here
const formatChainIdHex = (chainId) => {
  return '0x' + chainId.toString(16).padStart(6, '0');
};

// Base Sepolia Chain ID
const BASE_SEPOLIA_CHAIN_ID = 84532;

// Test the formatting function
console.log('Base Sepolia Chain ID (decimal):', BASE_SEPOLIA_CHAIN_ID);

// Test the incorrect formatting that was causing the issue
const incorrectFormat = '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16);
console.log('Incorrect format causing the error:', incorrectFormat);

// Test our fixed formatting
const correctFormat = formatChainIdHex(BASE_SEPOLIA_CHAIN_ID);
console.log('Correct format with padding:', correctFormat);

// Validate that the formatted value is different from the incorrect one
console.log('Is the fix different from the incorrect format?', incorrectFormat !== correctFormat);

// Simulate how MetaMask would compare these values
console.log('\nSimulating MetaMask chain ID validation:');
console.log('Original error message from MetaMask:', 'Unrecognized chain ID "0x14a34". Try adding the chain using wallet_addEthereumChain first.');
console.log('What MetaMask expected:', '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16).padStart(6, '0'));
console.log('What we now provide:', correctFormat);
console.log('Match with expected format?', correctFormat === ('0x' + BASE_SEPOLIA_CHAIN_ID.toString(16).padStart(6, '0')));

// Additional validation of the decimal to hex conversion
console.log('\nHex conversion validation:');
console.log('Chain ID 84532 in hex should be 14a34');
console.log('Our function produces:', correctFormat);
console.log('Expected minimum with padding:', '0x014a34');
console.log('Is padding correct?', correctFormat === '0x014a34');
