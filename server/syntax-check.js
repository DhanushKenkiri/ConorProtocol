// Simple syntax verification for index.js
const startTime = new Date();
console.log(`[${startTime.toISOString()}] Starting syntax verification for server/index.js...`);

try {
  // Parse the file with Node.js parser to check for syntax errors
  const fs = require('fs');
  const path = require('path');
  
  console.log(`[${new Date().toISOString()}] Reading index.js file...`);
  const filePath = path.join(__dirname, 'index.js');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  console.log(`[${new Date().toISOString()}] File size: ${fileContent.length} bytes`);
  console.log(`[${new Date().toISOString()}] First 100 chars: ${fileContent.substring(0, 100).replace(/\n/g, '\\n')}`);
  
  console.log(`[${new Date().toISOString()}] Parsing index.js with Node.js parser...`);
  
  // Using the Function constructor to parse the code without executing it
  try {
    new Function(fileContent);
    console.log(`[${new Date().toISOString()}] Syntax validation successful! No syntax errors found.`);
  } catch (parseError) {
    console.error(`[${new Date().toISOString()}] Syntax error in parsing:`);
    console.error(parseError);
    throw parseError;
  }
  
  // Also try to require the file to check module-level syntax
  console.log(`[${new Date().toISOString()}] Attempting to require the file...`);
  const indexModule = require('./index.js');
  console.log(`[${new Date().toISOString()}] Successfully required index.js`);
  
} catch (error) {
  console.error(`[${new Date().toISOString()}] Error during test:`);
  console.error(error);
  process.exit(1);
}

const endTime = new Date();
const duration = (endTime - startTime) / 1000;
console.log(`[${endTime.toISOString()}] All tests passed successfully! (${duration} seconds)`);
console.log('================================================================');
