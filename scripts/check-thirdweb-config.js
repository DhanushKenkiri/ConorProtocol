// Check if thirdweb environment is properly configured
require('dotenv').config();
const chalk = require('chalk');

console.log(chalk.cyan('\n=== Checking thirdweb environment configuration ===\n'));

// Required environment variables
const requiredEnvVars = [
  { name: 'PRIVATE_KEY', desc: 'Private key for blockchain interactions' },
  { name: 'THIRDWEB_CLIENT_ID', desc: 'thirdweb client ID for API access' }
];

// Optional but recommended variables
const optionalEnvVars = [
  { name: 'THIRDWEB_SECRET_KEY', desc: 'thirdweb secret key (recommended for backend)' },
  { name: 'ALCHEMY_API_KEY', desc: 'Alchemy API key for enhanced RPC access' },
  { name: 'ALCHEMY_BASE_SEPOLIA_URL', desc: 'Alchemy URL for Base Sepolia', default: 'https://base-sepolia.g.alchemy.com/v2/your-api-key' },
  { name: 'BASE_SEPOLIA_RPC_URL', desc: 'Custom RPC URL for Base Sepolia', default: 'https://sepolia.base.org' },
  { name: 'BASESCAN_API_KEY', desc: 'API key for contract verification on BaseScan (from basescan.org/myapikey)' }
];

let hasErrors = false;

// Check required variables
console.log(chalk.yellow('Required environment variables:'));
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar.name];
  if (!value) {
    console.log(`  ${chalk.red('✗')} ${envVar.name}: ${chalk.red('Missing')} - ${envVar.desc}`);
    hasErrors = true;
  } else {
    const maskedValue = envVar.name.includes('KEY') || envVar.name.includes('SECRET') 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` 
      : value;
    console.log(`  ${chalk.green('✓')} ${envVar.name}: ${maskedValue} - ${envVar.desc}`);
  }
}

// Check optional variables
console.log(chalk.yellow('\nOptional environment variables:'));
for (const envVar of optionalEnvVars) {
  const value = process.env[envVar.name];
  if (!value) {
    console.log(`  ${chalk.yellow('○')} ${envVar.name}: ${chalk.yellow('Not set')} - ${envVar.desc}${envVar.default ? ` (default: ${envVar.default})` : ''}`);
  } else {
    const maskedValue = envVar.name.includes('KEY') || envVar.name.includes('SECRET') 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` 
      : value;
    console.log(`  ${chalk.green('✓')} ${envVar.name}: ${maskedValue} - ${envVar.desc}`);
  }
}

// Check for .env.local file (frontend)
const fs = require('fs');
console.log(chalk.yellow('\nFrontend configuration:'));
try {
  const envLocalExists = fs.existsSync('.env.local');
  if (envLocalExists) {
    console.log(`  ${chalk.green('✓')} .env.local: ${chalk.green('File exists')}`);
    
    // Simple parse of .env.local
    const envLocalContent = fs.readFileSync('.env.local', 'utf8');
    const envLocalVars = envLocalContent.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=')[0]);
    
    if (envLocalVars.includes('VITE_THIRDWEB_CLIENT_ID')) {
      console.log(`  ${chalk.green('✓')} VITE_THIRDWEB_CLIENT_ID: ${chalk.green('Found in .env.local')}`);
    } else {
      console.log(`  ${chalk.red('✗')} VITE_THIRDWEB_CLIENT_ID: ${chalk.red('Missing in .env.local')}`);
      hasErrors = true;
    }
    
    if (envLocalVars.includes('VITE_API_URL')) {
      console.log(`  ${chalk.green('✓')} VITE_API_URL: ${chalk.green('Found in .env.local')}`);
    } else {
      console.log(`  ${chalk.yellow('○')} VITE_API_URL: ${chalk.yellow('Not set in .env.local (will use default)')}`);
    }
  } else {
    console.log(`  ${chalk.red('✗')} .env.local: ${chalk.red('File does not exist')}`);
    hasErrors = true;
  }
} catch (error) {
  console.error(`  ${chalk.red('✗')} Error checking .env.local:`, error.message);
  hasErrors = true;
}

// Summary
console.log('\n' + chalk.cyan('=== Configuration Summary ==='));
if (hasErrors) {
  console.log(chalk.red('\n✗ There are missing required configurations. Please update your environment variables.\n'));
  console.log(`Refer to the ${chalk.bold('README.md')} file for setup instructions.\n`);
} else {
  console.log(chalk.green('\n✓ All required configurations are present.\n'));
}

// Instructions if there are errors
if (hasErrors) {
  console.log(chalk.yellow('To set up thirdweb API keys:'));
  console.log('1. Go to https://thirdweb.com/create-api-key');
  console.log('2. Sign up or log in to your account');
  console.log('3. Create a new API key');
  console.log('4. Copy the client ID and secret key');
  console.log('5. Add them to your .env and .env.local files\n');
}

// BaseScan API key information (always show this)
if (!process.env.BASESCAN_API_KEY) {
  console.log(chalk.yellow('\nBaseScan API Key Information:'));
  console.log('The BASESCAN_API_KEY is required for verifying smart contracts on BaseScan.');
  console.log('To obtain your BaseScan API key:');
  console.log('1. Register at https://basescan.org/register');
  console.log('2. Go to https://basescan.org/myapikey');
  console.log('3. Create a new API key');
  console.log('4. Add it to your .env file as BASESCAN_API_KEY=your-key-here\n');
}

module.exports = !hasErrors;
