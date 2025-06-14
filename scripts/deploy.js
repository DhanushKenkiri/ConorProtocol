#!/usr/bin/env node

/**
 * Deployment script for Chronos Protocol
 * This script helps prepare the application for deployment to a hosting service
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ASCII art logo
const logo = `
${chalk.cyan}${chalk.bold}
   ______  __                                     ____             __                  __
  / ____/ / /_   _____ ____   ____   ____   ___ / __ \\   _____   / /_  ____   _____  ____   / /
 / /     / __ \\ / ___// __ \\ / __ \\ / __ \\ / __ \\ /_/ /  / ___/  / __ \\/ __ \\ / ___/ / __ \\ / /
/ /___  / / / // /   / /_/ // /_/ // / / //  __/ ____/  / /__   / /_/ / /_/ // /__  / /_/ // /
\\____/ /_/ /_//_/    \\____/ \\____//_/ /_/ \\___/_/       \\___/  /_.___/\\____/ \\___/  \\____//_/
${chalk.reset}
`;

console.log(logo);
console.log(`${chalk.bold}Chronos Protocol Deployment Helper${chalk.reset}\n`);

// Function to prompt for yes/no
const promptYesNo = (question) => {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

// Function to prompt for input
const prompt = (question, defaultValue = '') => {
  return new Promise((resolve) => {
    const defaultPrompt = defaultValue ? ` [${defaultValue}]` : '';
    rl.question(`${question}${defaultPrompt}: `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
};

// Function to build the frontend
const buildFrontend = async () => {
  try {
    console.log(chalk.yellow('\nBuilding frontend application...'));
    execSync('npm run build', { stdio: 'inherit' });
    console.log(chalk.green('✓ Frontend built successfully'));
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Error building frontend:'), error.message);
    return false;
  }
};

// Function to build the backend
const buildBackend = async () => {
  try {
    console.log(chalk.yellow('\nPreparing backend for deployment...'));
    
    if (!fs.existsSync('server/dist')) {
      fs.mkdirSync('server/dist', { recursive: true });
    }
    
    // Copy necessary files
    fs.copyFileSync('server/index.js', 'server/dist/index.js');
    fs.copyFileSync('server/package.json', 'server/dist/package.json');
    
    // Create production .env file
    const envFile = `
# Production environment variables for Chronos Protocol Backend
PRIVATE_KEY=${process.env.PRIVATE_KEY || 'your-private-key-here'}
THIRDWEB_CLIENT_ID=${process.env.THIRDWEB_CLIENT_ID || 'your-thirdweb-client-id-here'}
THIRDWEB_SECRET_KEY=${process.env.THIRDWEB_SECRET_KEY || 'your-thirdweb-secret-key-here'}
PORT=8080
`;
    
    fs.writeFileSync('server/dist/.env', envFile);
    
    // Create a simple startup script
    const startupScript = `
const { exec } = require('child_process');
const path = require('path');

// Start the server
console.log('Starting Chronos Protocol backend server...');
exec('node index.js', (error, stdout, stderr) => {
  if (error) {
    console.error('Error starting server:', error);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
`;
    
    fs.writeFileSync('server/dist/start.js', startupScript);
    
    console.log(chalk.green('✓ Backend prepared for deployment'));
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Error preparing backend:'), error.message);
    return false;
  }
};

// Function to create a deployment package
const createDeploymentPackage = async () => {
  try {
    console.log(chalk.yellow('\nCreating deployment package...'));
    
    // Create a deployment directory
    if (!fs.existsSync('deployment-package')) {
      fs.mkdirSync('deployment-package', { recursive: true });
    }
    
    // Copy frontend build
    execSync('xcopy /E /I /Y dist deployment-package\\frontend', { stdio: 'inherit' });
    
    // Copy backend build
    execSync('xcopy /E /I /Y server\\dist deployment-package\\backend', { stdio: 'inherit' });
    
    // Create a simple README for deployment
    const readmeContent = `# Chronos Protocol Deployment Package

This package contains the built frontend and backend for the Chronos Protocol application.

## Frontend

The frontend is a static site built with React and Vite. You can deploy it to any static site hosting service like Netlify, Vercel, or GitHub Pages.

## Backend

The backend is a Node.js Express server that connects to the Base Sepolia testnet using thirdweb SDK.

### Environment Setup

Make sure to set the following environment variables on your hosting platform:

- PRIVATE_KEY: Your Ethereum private key
- THIRDWEB_CLIENT_ID: Your thirdweb client ID
- THIRDWEB_SECRET_KEY: Your thirdweb secret key
- PORT: The port for the server (usually set by the hosting platform)

### Deployment Instructions

1. Deploy the backend to a Node.js hosting service like Heroku, Render, or Fly.io.
2. Deploy the frontend to a static site hosting service.
3. Set the VITE_API_URL environment variable on your frontend hosting to point to your backend URL.
`;
    
    fs.writeFileSync('deployment-package/README.md', readmeContent);
    
    console.log(chalk.green('✓ Deployment package created successfully'));
    console.log(chalk.cyan(`\nYour deployment package is available in the ${chalk.bold('deployment-package')} directory.`));
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Error creating deployment package:'), error.message);
    return false;
  }
};

// Main function
const main = async () => {
  try {
    console.log(chalk.yellow('This script will help you deploy the Chronos Protocol application.'));
    console.log(chalk.yellow('Make sure you have updated all environment variables with your production values.'));
    
    // Check thirdweb configuration
    console.log(chalk.yellow('\nChecking thirdweb configuration...'));
    if (!process.env.THIRDWEB_CLIENT_ID) {
      console.log(chalk.red('✗ THIRDWEB_CLIENT_ID not found in environment'));
      const shouldContinue = await promptYesNo('Do you want to continue without a thirdweb client ID?');
      if (!shouldContinue) {
        console.log(chalk.yellow('Please set up your thirdweb client ID and try again.'));
        rl.close();
        return;
      }
    } else {
      console.log(chalk.green('✓ THIRDWEB_CLIENT_ID found'));
    }
    
    // Ask for deployment configuration
    console.log(chalk.yellow('\nPlease provide deployment information:'));
    
    const deployFrontend = await promptYesNo('Do you want to build the frontend for deployment?');
    const deployBackend = await promptYesNo('Do you want to prepare the backend for deployment?');
    
    if (deployFrontend) {
      // Ask for production API URL
      const apiUrl = await prompt('Enter your production API URL (e.g., https://api.yourapp.com)', '');
      
      if (apiUrl) {
        // Update the .env.production file
        const envProductionContent = `VITE_API_URL=${apiUrl}
VITE_THIRDWEB_CLIENT_ID=${process.env.THIRDWEB_CLIENT_ID || 'your-thirdweb-client-id-here'}
VITE_BASE_CHAIN_ID=84532
VITE_CHRONOS_FACTORY_ADDRESS=0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94
`;
        fs.writeFileSync('apps/web/.env.production', envProductionContent);
        console.log(chalk.green('✓ Created .env.production with your settings'));
      }
      
      const success = await buildFrontend();
      if (!success) {
        console.log(chalk.red('Frontend build failed. Please fix the issues and try again.'));
        rl.close();
        return;
      }
    }
    
    if (deployBackend) {
      const success = await buildBackend();
      if (!success) {
        console.log(chalk.red('Backend preparation failed. Please fix the issues and try again.'));
        rl.close();
        return;
      }
    }
    
    if (deployFrontend || deployBackend) {
      const createPackage = await promptYesNo('Do you want to create a deployment package with both frontend and backend?');
      if (createPackage) {
        await createDeploymentPackage();
      }
    }
    
    console.log(chalk.green.bold('\n✓ Deployment preparation completed!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('1. Deploy your backend to a Node.js hosting service');
    console.log('2. Deploy your frontend to a static site hosting service');
    console.log('3. Ensure your environment variables are properly set on both services');
    
    rl.close();
  } catch (error) {
    console.error(chalk.red('Error during deployment preparation:'), error);
    rl.close();
    process.exit(1);
  }
};

// Run the main function
main();
