// Contract addresses for different networks
// Will be populated after deployment
export const addresses = {
  // Base Sepolia Testnet
  84532: {
    ChronosFactory: "0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94", // Add your deployed address here after deployment
  },
  // Hardhat Local Network
  31337: {
    ChronosFactory: "",
  }
};

// State enum mapping (matching the solidity enum)
export const ContractState = {
  PROPOSED: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  EXPIRED: 3,
  VOIDED: 4
};

// Human-readable state labels
export const StateLabels = {
  0: "Proposed",
  1: "Active",
  2: "Completed",
  3: "Expired", 
  4: "Voided"
};

// State colors for UI
export const StateColors = {
  0: "warning", // Proposed - yellow
  1: "primary", // Active - blue
  2: "success", // Completed - green
  3: "danger",  // Expired - red
  4: "secondary" // Voided - gray
};
