// Simple test file to verify that our fixed index.js can be parsed correctly
console.log('Starting test for index.js syntax...');
try {
  console.log('Attempting to require index.js...');
  const server = require('./index.js');
  console.log('Successfully parsed index.js - no syntax errors found');
  console.log('Server module properties:', Object.keys(server || {}).length ? Object.keys(server) : 'No exported properties');
} catch (error) {
  console.error('Error parsing index.js:', error);
}
