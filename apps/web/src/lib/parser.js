/**
 * Parser utility functions for command parsing and data validation
 */

/**
 * Parse a task command string into structured data
 * Format: /task @[address] [description] by [YYYY-MM-DD HH:MM] for [amount] [token_symbol]
 * 
 * @param {string} command The full command string
 * @returns {Object|null} Parsed task data or null if parsing fails
 */
export const parseTaskCommand = (command) => {
  // Check if this is a task command
  if (!command.startsWith('/task ')) {
    return null;
  }
  
  // Remove the '/task' prefix
  const taskText = command.substring(5).trim();
  
  try {
    // Extract counterparty address
    const addressMatch = taskText.match(/@(0x[a-fA-F0-9]{40})/);
    if (!addressMatch) throw new Error('Invalid counterparty address format');
    const counterparty = addressMatch[1];
    
    // Extract deadline
    const dateMatch = taskText.match(/by\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
    if (!dateMatch) throw new Error('Invalid date format. Use: YYYY-MM-DD HH:MM');
    const dateStr = dateMatch[1];
    const deadline = Math.floor(new Date(dateStr).getTime() / 1000);
    
    if (isNaN(deadline) || deadline <= Math.floor(Date.now() / 1000)) {
      throw new Error('Deadline must be in the future');
    }
    
    // Extract value
    const valueMatch = taskText.match(/for\s+(\d+(?:\.\d+)?)\s+(\w+)/);
    if (!valueMatch) throw new Error('Invalid value format. Use: for [amount] [token]');
    const amount = valueMatch[1];
    const token = valueMatch[2];
    
    if (token.toLowerCase() !== 'eth') {
      throw new Error('Only ETH is supported currently');
    }
    
    // Extract description - everything between address and "by"
    const descStart = taskText.indexOf(counterparty) + counterparty.length;
    const descEnd = taskText.indexOf('by', descStart);
    if (descStart === -1 || descEnd === -1) throw new Error('Invalid task description');
    const description = taskText.substring(descStart, descEnd).trim();
    
    return {
      counterparty,
      description,
      deadline,
      value: amount,
      token
    };
  } catch (error) {
    console.error('Error parsing task:', error);
    // Re-throw for the caller to handle
    throw error;
  }
};

/**
 * Validate Ethereum address
 * @param {string} address Address to validate
 * @returns {boolean} True if address is valid
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
