// System verification script to check if all components are properly configured
// Run this with: node verify-system.js

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables
dotenv.config({ path: './.env' });

// Check function for displaying check results
function check(name, condition, message = '', solution = '') {
  if (condition) {
    console.log(chalk.green(`✓ ${name}`));
    if (message) console.log('  ' + message);
    return true;
  } else {
    console.log(chalk.red(`✗ ${name}`));
    if (message) console.log(chalk.yellow('  ' + message));
    if (solution) console.log(chalk.blue('  Solution: ' + solution));
    return false;
  }
}

// Main verification function
async function verifySystem() {
  console.log(chalk.bold('\n=== Chronos Protocol System Verification ===\n'));
  
  // Array to track all check results
  const checks = [];
  
  // 1. Check for required files
  console.log(chalk.bold('Checking file structure:'));
  checks.push(check('Server files', 
    fs.existsSync('./server/index.js'), 
    '', 'Make sure you are in the correct directory'));
  
  checks.push(check('Frontend files', 
    fs.existsSync('./apps/web/src/pages/App.jsx'), 
    '', 'Check that the web application files are present'));
  
  checks.push(check('Smart contracts', 
    fs.existsSync('./contracts/ChronosFactory.sol'), 
    '', 'Ensure smart contract files are present'));
  
  // 2. Check environment variables
  console.log(chalk.bold('\nChecking environment variables:'));
  
  checks.push(check('.env file', 
    fs.existsSync('./.env'),
    'Environment configuration file found',
    'Create a .env file with required variables'));
  
  const requiredEnvVars = [
    'ALCHEMY_API_KEY', 
    'THIRDWEB_CLIENT_ID', 
    'CHRONOS_FACTORY_ADDRESS',
    'BASE_SEPOLIA_RPC_URL'
  ];
  
  // Optional but recommended env vars
  const optionalEnvVars = [
    'PRIVATE_KEY',
    'THIRDWEB_SECRET_KEY'
  ];
  
  // Check required env vars
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    checks.push(check(envVar, 
      value && value.length > 0,
      value ? `${envVar} is configured` : `${envVar} is missing`,
      `Set ${envVar} in your .env file`));
  }
  
  // Check optional env vars
  console.log(chalk.bold('\nChecking optional environment variables:'));
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    checks.push(check(envVar, 
      value && value.length > 0,
      value ? `${envVar} is configured` : `${envVar} is not configured (optional)`,
      `For production usage, consider setting ${envVar}`));
  }
  
  // 3. Check package dependencies
  console.log(chalk.bold('\nChecking package dependencies:'));
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    const requiredDeps = [
      '@thirdweb-dev/react',
      '@thirdweb-dev/sdk',
      'alchemy-sdk',
      'react',
      'react-bootstrap'
    ];
    
    for (const dep of requiredDeps) {
      checks.push(check(`Dependency: ${dep}`, 
        packageJson.dependencies[dep] !== undefined,
        packageJson.dependencies[dep] ? `Version ${packageJson.dependencies[dep]}` : '',
        `Run: npm install ${dep}`));
    }
  } catch (error) {
    console.log(chalk.red('Error reading package.json:'), error.message);
  }
  
  // 4. Check server package dependencies
  console.log(chalk.bold('\nChecking server dependencies:'));
  
  try {
    const serverPackageJson = JSON.parse(fs.readFileSync('./server/package.json', 'utf8'));
    
    const requiredServerDeps = [
      '@thirdweb-dev/sdk',
      'alchemy-sdk',
      'express',
      'cors'
    ];
    
    for (const dep of requiredServerDeps) {
      checks.push(check(`Server dependency: ${dep}`, 
        serverPackageJson.dependencies[dep] !== undefined,
        serverPackageJson.dependencies[dep] ? `Version ${serverPackageJson.dependencies[dep]}` : '',
        `Run: cd server && npm install ${dep}`));
    }
  } catch (error) {
    console.log(chalk.red('Error reading server/package.json:'), error.message);
  }
  
  // 5. Summary
  const passed = checks.filter(c => c).length;
  const failed = checks.filter(c => !c).length;
  const total = checks.length;
  
  console.log(chalk.bold('\n=== Verification Summary ==='));
  console.log(`Total checks: ${total}`);
  console.log(chalk.green(`Passed: ${passed}`));
  if (failed > 0) {
    console.log(chalk.red(`Failed: ${failed}`));
    console.log(chalk.yellow('\nPlease fix the failed checks before running the application.'));
    console.log(chalk.yellow('For more information, see the USER_GUIDE.md file.'));
  } else {
    console.log(chalk.green('\n✨ All checks passed! The system is properly configured. ✨'));
    console.log(chalk.green('You can start the application with:'));
    console.log(chalk.bold('\n  start.bat'));
    console.log('\nOr manually with:');
    console.log('  1. cd server && npm start');
    console.log('  2. npm run dev');
  }
  
  return failed === 0;
}

// Run the verification
verifySystem().then(success => {
  if (!success) {
    process.exit(1);
  }
});
