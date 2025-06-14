#!/usr/bin/env node

/**
 * Script to launch the Chronos Protocol application
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

// ASCII art logo
const logo = `
${colors.cyan}${colors.bright}
   ______  __                                     ____             __                  __
  / ____/ / /_   _____ ____   ____   ____   ___ / __ \\   _____   / /_  ____   _____  ____   / /
 / /     / __ \\ / ___// __ \\ / __ \\ / __ \\ / __ \\ /_/ /  / ___/  / __ \\/ __ \\ / ___/ / __ \\ / /
/ /___  / / / // /   / /_/ // /_/ // / / //  __/ ____/  / /__   / /_/ / /_/ // /__  / /_/ // /
\\____/ /_/ /_//_/    \\____/ \\____//_/ /_/ \\___/_/       \\___/  /_.___/\\____/ \\___/  \\____//_/
${colors.reset}
`;

console.log(logo);
console.log(`${colors.bright}Welcome to the Chronos Protocol Test Suite${colors.reset}\n`);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to check if a port is in use
const isPortInUse = async (port) => {
  return new Promise((resolve) => {
    const netstat = exec(`netstat -ano | findstr :${port}`);
    
    netstat.stdout.on('data', (data) => {
      if (data.toString().includes(`:${port}`)) {
        resolve(true);
      }
    });
    
    netstat.on('close', (code) => {
      resolve(false);
    });
  });
};

// Function to open URL in browser
const openBrowser = (url) => {
  const command = process.platform === 'win32' ? 'start' : 
                  process.platform === 'darwin' ? 'open' : 'xdg-open';
  
  exec(`${command} ${url}`);
};

// Main function
const main = async () => {
  console.log(`${colors.yellow}Checking if services are running...${colors.reset}`);

  // Check if backend server is running
  const backendRunning = await isPortInUse(3001);
  if (!backendRunning) {
    console.log(`${colors.yellow}Backend server is not running. Starting it now...${colors.reset}`);
    
    const serverProcess = exec('cd server && npm start');
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });
    
    // Give the server some time to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  } else {
    console.log(`${colors.green}Backend server is already running on port 3001.${colors.reset}`);
  }

  // Check if frontend is running (try ports 3000-3005)
  let frontendPort = null;
  for (let port = 3000; port <= 3005; port++) {
    const portInUse = await isPortInUse(port);
    if (portInUse) {
      // Try to determine if this is our frontend
      frontendPort = port;
      break;
    }
  }

  if (!frontendPort) {
    console.log(`${colors.yellow}Frontend is not running. Starting it now...${colors.reset}`);
    
    const frontendProcess = exec('npm run dev');
    
    frontendProcess.stdout.on('data', (data) => {
      console.log(`Frontend: ${data}`);
      
      // Extract the port from the output
      const portMatch = data.toString().match(/Local:\s+http:\/\/localhost:(\d+)/);
      if (portMatch && portMatch[1]) {
        frontendPort = parseInt(portMatch[1]);
        console.log(`${colors.green}Frontend is now running on port ${frontendPort}.${colors.reset}`);
        
        // Ask user if they want to open the app in browser
        rl.question(`${colors.bright}Would you like to open the application in your browser? (y/n) ${colors.reset}`, (answer) => {
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            openBrowser(`http://localhost:${frontendPort}`);
          }
          
          console.log(`\n${colors.cyan}${colors.bright}Thank you for using Chronos Protocol!${colors.reset}`);
          console.log(`${colors.cyan}Instructions for testing can be found in TEST_INSTRUCTIONS.md${colors.reset}\n`);
          
          rl.close();
        });
      }
    });
  } else {
    console.log(`${colors.green}Frontend is already running on port ${frontendPort}.${colors.reset}`);
    
    // Ask user if they want to open the app in browser
    rl.question(`${colors.bright}Would you like to open the application in your browser? (y/n) ${colors.reset}`, (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        openBrowser(`http://localhost:${frontendPort}`);
      }
      
      console.log(`\n${colors.cyan}${colors.bright}Thank you for using Chronos Protocol!${colors.reset}`);
      console.log(`${colors.cyan}Instructions for testing can be found in TEST_INSTRUCTIONS.md${colors.reset}\n`);
      
      rl.close();
    });
  }
};

// Run the main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
