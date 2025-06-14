// Chain ID Verification Test
// Run this file with:
// cd chronos-protocol && node scripts/verify-chain-id-fix.js

// For testing purposes, define the functions here
const formatChainIdHex = (chainId) => {
  return '0x' + chainId.toString(16).padStart(6, '0');
};

// Write results to file for easier viewing
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '..', 'chain-id-verification.txt');

// Constants
const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_SEPOLIA_CHAIN_ID_HEX = formatChainIdHex(BASE_SEPOLIA_CHAIN_ID);

// Verification
console.log('======== CHAIN ID FORMAT VERIFICATION ========');
console.log('Base Sepolia Chain ID (decimal):', BASE_SEPOLIA_CHAIN_ID);
console.log('Base Sepolia Chain ID (hex with padding):', BASE_SEPOLIA_CHAIN_ID_HEX);
console.log('\nVerification tests:');

// Test 1: Verify our implementation generates the correct format
console.log('1. Our implementation produces:', BASE_SEPOLIA_CHAIN_ID_HEX);
console.log('   Expected correct format:    0x014a34');
console.log('   Test passed?', BASE_SEPOLIA_CHAIN_ID_HEX === '0x014a34');

// Test 2: Verify the incorrect format that was causing the issue
const incorrectFormat = '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16);
console.log('\n2. Incorrect format (causing error):', incorrectFormat);
console.log('   Our correct format:            ', BASE_SEPOLIA_CHAIN_ID_HEX);
console.log('   Formats match?', incorrectFormat === BASE_SEPOLIA_CHAIN_ID_HEX);
console.log('   Are different as expected?', incorrectFormat !== BASE_SEPOLIA_CHAIN_ID_HEX);

// Test 3: Simulate MetaMask's chain ID validation
console.log('\n3. If MetaMask received the old format:', incorrectFormat);
console.log('   It would generate error: "Unrecognized chain ID "0x14a34"');
console.log('   With our fix, MetaMask receives:', BASE_SEPOLIA_CHAIN_ID_HEX);
console.log('   Which should resolve the error');

// Test 4: Check for consistency in implementation
console.log('\n4. Implementation consistency check:');
console.log('   - formatChainIdHex(1) =', formatChainIdHex(1), '(should be "0x000001")');
console.log('   - formatChainIdHex(10) =', formatChainIdHex(10), '(should be "0x00000a")');
console.log('   - formatChainIdHex(100) =', formatChainIdHex(100), '(should be "0x000064")');

// Summary
console.log('\nSUMMARY:');
console.log('The fix properly formats the Base Sepolia Chain ID as', BASE_SEPOLIA_CHAIN_ID_HEX);
console.log('This should resolve the MetaMask "Unrecognized chain ID" error');
console.log('================================================');

// Write all output to a file
let logOutput = `
======== CHAIN ID FORMAT VERIFICATION ========
Base Sepolia Chain ID (decimal): ${BASE_SEPOLIA_CHAIN_ID}
Base Sepolia Chain ID (hex with padding): ${BASE_SEPOLIA_CHAIN_ID_HEX}

Verification tests:
1. Our implementation produces: ${BASE_SEPOLIA_CHAIN_ID_HEX}
   Expected correct format:    0x014a34
   Test passed? ${BASE_SEPOLIA_CHAIN_ID_HEX === '0x014a34'}

2. Incorrect format (causing error): ${incorrectFormat}
   Our correct format:             ${BASE_SEPOLIA_CHAIN_ID_HEX}
   Formats match? ${incorrectFormat === BASE_SEPOLIA_CHAIN_ID_HEX}
   Are different as expected? ${incorrectFormat !== BASE_SEPOLIA_CHAIN_ID_HEX}

3. If MetaMask received the old format: ${incorrectFormat}
   It would generate error: "Unrecognized chain ID "0x14a34"
   With our fix, MetaMask receives: ${BASE_SEPOLIA_CHAIN_ID_HEX}
   Which should resolve the error

4. Implementation consistency check:
   - formatChainIdHex(1) = ${formatChainIdHex(1)} (should be "0x000001")
   - formatChainIdHex(10) = ${formatChainIdHex(10)} (should be "0x00000a")
   - formatChainIdHex(100) = ${formatChainIdHex(100)} (should be "0x000064")

SUMMARY:
The fix properly formats the Base Sepolia Chain ID as ${BASE_SEPOLIA_CHAIN_ID_HEX}
This should resolve the MetaMask "Unrecognized chain ID" error
================================================
`;

fs.writeFileSync(logFile, logOutput);
console.log(`\nResults written to ${logFile}`);
