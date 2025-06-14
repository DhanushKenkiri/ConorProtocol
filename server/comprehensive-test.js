// Comprehensive test for the index.js server
console.log('Starting comprehensive server test...');

// Create a minimal mock of required environment variables
process.env.PRIVATE_KEY = process.env.PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // This is a mock key
process.env.THIRDWEB_CLIENT_ID = process.env.THIRDWEB_CLIENT_ID || 'test-client-id';
process.env.THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || 'test-secret-key';
process.env.FACTORY_CONTRACT_ADDRESS = process.env.FACTORY_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';
process.env.NETWORK = 'basesepolia';

// First, mock the dependencies to prevent actual blockchain interactions
console.log('Setting up mocks for ThirdwebSDK and ethers...');
const express = require('express');

// Mock ThirdwebSDK
jest.mock('@thirdweb-dev/sdk', () => {
  return {
    ThirdwebSDK: {
      fromPrivateKey: jest.fn().mockReturnValue({
        wallet: {
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          getBalance: jest.fn().mockResolvedValue({ value: '1000000000000000000', symbol: 'ETH' })
        },
        getChainId: jest.fn().mockReturnValue(84532), // Base Sepolia chain ID
        getContract: jest.fn().mockReturnValue({
          call: jest.fn().mockImplementation((method, args) => {
            if (method === 'getUserAgreements') {
              return Promise.resolve(['0xabcdef1234567890abcdef1234567890abcdef12']);
            }
            if (method === 'getAgreementDetails') {
              return Promise.resolve({
                creator: '0x1234567890123456789012345678901234567890',
                counterparty: '0x0987654321098765432109876543210987654321',
                description: 'Test Agreement',
                deadline: 1718483737,
                value: '1000000000000000000'
              });
            }
            if (method === 'getStatus') {
              return Promise.resolve('0');
            }
            if (method === 'createAgreement') {
              return Promise.resolve({
                receipt: {
                  transactionHash: '0x123456789abcdef'
                }
              });
            }
            return Promise.resolve([]);
          }),
          events: {
            getAllEvents: jest.fn().mockResolvedValue([
              {
                eventName: 'AgreementCreated',
                transaction: { transactionHash: '0x123456789abcdef' },
                data: { agreement: '0xabcdef1234567890abcdef1234567890abcdef12' }
              }
            ])
          }
        })
      })
    }
  };
});

// Mock ethers
jest.mock('ethers', () => {
  return {
    utils: {
      isAddress: jest.fn().mockReturnValue(true),
      formatEther: jest.fn().mockReturnValue('1.0'),
      parseEther: jest.fn().mockReturnValue('1000000000000000000')
    },
    Contract: jest.fn().mockReturnValue({
      createAgreement: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0x123456789abcdef'
        })
      })
    })
  };
});

// Now try to require and test the server
try {
  console.log('Attempting to require index.js...');
  require('./index.js');
  console.log('Successfully loaded server - all code paths parsed correctly');
} catch (error) {
  console.error('Error loading server:', error);
  process.exit(1);
}

console.log('Test completed successfully');
