// Verify that the server code has no syntax errors

console.log('Starting server syntax verification');

try {
  console.log('Loading server code...');
  
  // This will parse the file but not execute the server
  const fs = require('fs');
  const code = fs.readFileSync('./index.js', 'utf8');
  
  // Parse the code to verify syntax
  Function(code);
  
  console.log('Server code parsed successfully! No syntax errors.');
  
  // Try to require the file
  console.log('Attempting to require the server module...');
  const server = require('./index.js');
  console.log('Server required successfully!');
  
  console.log('All tests passed. The syntax has been fixed.');
} catch (error) {
  console.error('Error during verification:', error);
  process.exit(1);
}
