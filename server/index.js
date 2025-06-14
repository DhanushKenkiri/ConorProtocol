// Backend server configuration for Chronos Protocol using thirdweb and Alchemy SDK
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');
const { Base, BaseSepoliaTestnet } = require('@thirdweb-dev/chains');
const { ethers } = require('ethers');
const alchemyUtils = require('./utils/alchemy');

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize ThirdwebSDK with Base Sepolia network for smart contract interactions
const initializeSDK = () => {  
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY not found in .env file');
    }
    
    let chain;
    if (process.env.NETWORK === 'base') {
      chain = Base;
    } else {
      chain = BaseSepoliaTestnet; // Default to testnet
    }
    
    const sdk = ThirdwebSDK.fromPrivateKey(
      privateKey,
      chain,
      {
        clientId: process.env.THIRDWEB_CLIENT_ID,
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      }
    );
    
    console.log('ThirdwebSDK initialized successfully');
    return sdk;
  } catch (error) {
    console.error('SDK initialization error:', error.message);
    console.error(error.stack);
    return null;
  }
};

// Initialize contract instances
const loadContracts = async (sdk) => {
  try {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    
    const factoryAddress = process.env.FACTORY_CONTRACT_ADDRESS;
    if (!factoryAddress || !ethers.utils.isAddress(factoryAddress)) {
      throw new Error('Invalid factory contract address');
    }
    
    console.log('Loading factory contract from address:', factoryAddress);
    const factoryContract = await sdk.getContract(factoryAddress);
    
    return {
      chronosFactory: factoryContract,
    };
  } catch (error) {
    console.error('Contract loading error:', error.message);
    console.error(error.stack);
    return null;
  }
};

// Global variables to store SDK and contract instances
let sdkInstance = null;
let contracts = null;

// Initialize SDK and contracts on server start
const initializeBlockchainServices = async () => {
  try {
    sdkInstance = initializeSDK();
    if (sdkInstance) {
      contracts = await loadContracts(sdkInstance);
      console.log('Blockchain services initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize blockchain services:', error.message);
  }
};

// Initialize blockchain services on startup
initializeBlockchainServices();

// Endpoint to check server health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    chainConnected: !!sdkInstance,
    contractsLoaded: !!contracts
  });
});

// Endpoint to get blockchain connection status
app.get('/api/status', async (req, res) => {
  try {
    if (!sdkInstance) {
      return res.status(503).json({ error: 'Blockchain connection not initialized' });
    }
    
    // Get wallet information
    const address = await sdkInstance.wallet.getAddress();
    const balance = await sdkInstance.wallet.getBalance();
    
    // Check if contracts are loaded
    const contractStatus = contracts ? 'loaded' : 'not loaded';
    
    // Convert balance to ETH
    const balanceInEth = ethers.utils.formatEther(balance.value);
    
    res.status(200).json({
      connected: true,
      wallet: {
        address,
        balance: balanceInEth,
        currency: balance.symbol
      },
      contracts: contractStatus,
      chain: sdkInstance.getChainId()
    });
  } catch (error) {
    console.error('Error getting status:', error.message);
    res.status(500).json({ error: 'Failed to get blockchain status' });
  }
});

// Endpoint to get user agreements
app.get('/api/agreements', async (req, res) => {
  try {
    if (!sdkInstance || !contracts) {
      console.error('SDK or contracts not initialized');
      return res.status(503).json({ error: 'Blockchain connection not available' });
    }
    
    const address = req.query.address || await sdkInstance.wallet.getAddress();
    
    // Validate address format
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    console.log('Fetching agreements for address:', address);
    
    // Get user's agreement addresses from the factory contract
    const agreementAddresses = await contracts.chronosFactory.call(
      "getUserAgreements", 
      [address]
    );
    
    console.log('Found agreements:', agreementAddresses);
    
    if (!agreementAddresses || agreementAddresses.length === 0) {
      return res.status(200).json({ agreements: [] });
    }
    
    // Get detailed information about each agreement
    const agreementsPromises = agreementAddresses.map(async (agreementAddress) => {
      try {
        const agreementContract = await sdkInstance.getContract(agreementAddress);
        
        // Get agreement details
        const details = await agreementContract.call("getAgreementDetails");
        const status = await agreementContract.call("getStatus");
        
        // Format and normalize the results
        return {
          id: agreementAddress,
          creator: details.creator,
          counterparty: details.counterparty,
          description: details.description,
          deadline: parseInt(details.deadline.toString()),
          value: ethers.utils.formatEther(details.value),
          status: parseInt(status.toString()),
          // Add other relevant details here
        };
      } catch (error) {
        console.error(`Error fetching details for agreement ${agreementAddress}:`, error.message);
        // Return partial info if full details cannot be fetched
        return { id: agreementAddress, error: 'Failed to fetch details' };
      }
    });
    
    // Wait for all agreement details to be fetched
    const agreements = await Promise.all(agreementsPromises);
    
    res.status(200).json({ agreements });
  } catch (error) {
    console.error('Error fetching agreements:', error.message);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
});

// Endpoint to create an agreement 
app.post('/api/agreements', async (req, res) => {
  try {
    const { counterparty, description, deadline, value } = req.body;
    
    // Input validation
    if (!counterparty || !ethers.utils.isAddress(counterparty)) {
      return res.status(400).json({ error: 'Invalid counterparty address' });
    }
    
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Deadline must be a timestamp in the future
    const deadlineTimestamp = parseInt(deadline);
    if (isNaN(deadlineTimestamp) || deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
      return res.status(400).json({ error: 'Deadline must be a valid future timestamp' });
    }
    
    // Value must be a positive number
    const agreementValue = parseFloat(value);
    if (isNaN(agreementValue) || agreementValue <= 0) {
      return res.status(400).json({ error: 'Value must be a positive number' });
    }
    
    if (!sdkInstance || !contracts) {
      console.error('Contracts not properly initialized');
      return res.status(503).json({ error: 'Smart contract connection unavailable' });
    }
    
    console.log('Creating agreement with params:', {
      counterparty,
      description,
      deadline,
      value
    });
    
    try {
      // Create agreement using contract with alternate approach if needed
      const valueInWei = ethers.utils.parseEther(value.toString());
      let tx;
      try {
        // Try the standard ThirdwebSDK approach first
        tx = await contracts.chronosFactory.call("createAgreement", [counterparty, description, deadline, valueInWei]);
      } catch (callError) {
        console.error('Error with standard contract call:', callError.message);
        
        // Fallback to direct ethers.js approach if ThirdwebSDK call fails
        try {
          // Get contract ABI from artifacts
          const fs = require('fs');
          const path = require('path');
          const artifactPath = path.join(__dirname, '../artifacts/contracts/ChronosFactory.sol/ChronosFactory.json');
          const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
          
          // Create ethers contract instance
          const contract = new ethers.Contract(
            contracts.chronosFactory.getAddress(), 
            artifact.abi, 
            sdkInstance.wallet
          );
          
          console.log('Using direct ethers.js contract instance fallback');
          
          // Call the contract method directly
          const rawTx = await contract.createAgreement(
            counterparty,
            description,
            deadline,
            valueInWei,
            { gasLimit: 3000000 } // Set a reasonable gas limit
          );
          
          // Create a compatible tx object
          tx = {
            receipt: await rawTx.wait()
          };
          
          console.log('Direct ethers.js contract call succeeded');
        } catch (ethersError) {
          console.error('Ethers.js fallback also failed:', ethersError);
          throw new Error(`Contract interaction failed: ${callError.message}`);
        }
      }
      
      console.log('Transaction sent:', tx.receipt ? tx.receipt.transactionHash : 'No hash available');
      
      // Wait for transaction receipt
      const receipt = await tx.receipt;
      console.log('Transaction receipt received:', receipt.transactionHash);
      
      try {
        // Get agreement address from events with timeout
        let agreementAddress = null;
        let events;
        
        try {
          events = await Promise.race([
            contracts.chronosFactory.events.getAllEvents(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Events fetch timeout')), 5000))
          ]);
          
          const event = events.find(e => {
            return e.eventName === 'AgreementCreated' && 
                  e.transaction.transactionHash === receipt.transactionHash;
          });
          
          if (event) {
            agreementAddress = event.data.agreement;
          }
        } catch (eventError) {
          console.warn('Error fetching events:', eventError.message);
        }
        
        if (!agreementAddress) {
          console.warn('Agreement address not found in events, trying alternative method');
          // Alternative: try to get agreement by retrieving all user agreements and taking the latest one
          const userAgreements = await contracts.chronosFactory.call(
            "getUserAgreements", 
            [await sdkInstance.wallet.getAddress()]
          );
          
          if (userAgreements && userAgreements.length > 0) {
            // Get the latest agreement (last in array)
            agreementAddress = userAgreements[userAgreements.length - 1];
          }
        }
        
        if (!agreementAddress || !ethers.utils.isAddress(agreementAddress)) {
          console.error('Failed to determine agreement address');
          return res.status(200).json({ 
            success: true,
            transactionHash: receipt.transactionHash,
            message: 'Agreement created but address could not be determined'
          });
        }
        
        console.log('Agreement address:', agreementAddress);
        
        // Get agreement details to confirm creation
        const agreementContract = await sdkInstance.getContract(agreementAddress);
        const details = await agreementContract.call("getAgreementDetails");
        
        res.status(201).json({
          success: true,
          transactionHash: receipt.transactionHash,
          agreementAddress,
          details: {
            creator: details.creator,
            counterparty: details.counterparty,
            description: details.description,
            deadline: parseInt(details.deadline.toString()),
            value: ethers.utils.formatEther(details.value)
          }
        });
      } catch (detailsError) {
        console.error('Error getting agreement details:', detailsError.message);
        
        // Even if we can't get full details, return success with transaction hash
        res.status(201).json({
          success: true,
          transactionHash: receipt.transactionHash,
          message: 'Agreement created but details could not be retrieved'
        });
      }
    } catch (error) {
      console.error('Agreement creation failed:', error.message);
      res.status(500).json({ error: 'Failed to create agreement', details: error.message });
    }
  } catch (error) {
    console.error('Unhandled error in agreement creation:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to accept an agreement
app.post('/api/agreements/:address/accept', async (req, res) => {
  try {
    const agreementAddress = req.params.address;
    
    // Validate agreement address
    if (!agreementAddress || !ethers.utils.isAddress(agreementAddress)) {
      return res.status(400).json({ error: 'Invalid agreement address' });
    }
    
    if (!sdkInstance) {
      return res.status(503).json({ error: 'Blockchain connection not available' });
    }
    
    // Get the agreement contract
    const agreementContract = await sdkInstance.getContract(agreementAddress);
    
    // Call the accept method
    console.log('Accepting agreement:', agreementAddress);
    const tx = await agreementContract.call("accept");
    
    // Wait for transaction receipt
    const receipt = await tx.receipt;
    console.log('Agreement accepted, transaction hash:', receipt.transactionHash);
    
    res.status(200).json({
      success: true,
      transactionHash: receipt.transactionHash,
      message: 'Agreement accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting agreement:', error.message);
    res.status(500).json({ error: 'Failed to accept agreement', details: error.message });
  }
});

// Endpoint to get agreement detail by address
app.get('/api/agreements/:address', async (req, res) => {
  try {
    const agreementAddress = req.params.address;
    
    // Validate agreement address
    if (!agreementAddress || !ethers.utils.isAddress(agreementAddress)) {
      return res.status(400).json({ error: 'Invalid agreement address' });
    }
    
    if (!sdkInstance) {
      return res.status(503).json({ error: 'Blockchain connection not available' });
    }
    
    // Get the agreement contract
    const agreementContract = await sdkInstance.getContract(agreementAddress);
    
    // Get agreement details and status
    const details = await agreementContract.call("getAgreementDetails");
    const status = await agreementContract.call("getStatus");
    
    // Format the response
    const agreement = {
      address: agreementAddress,
      creator: details.creator,
      counterparty: details.counterparty, 
      description: details.description,
      deadline: parseInt(details.deadline.toString()),
      value: ethers.utils.formatEther(details.value),
      status: parseInt(status.toString())
    };
    
    res.status(200).json({ agreement });
  } catch (error) {
    console.error('Error fetching agreement details:', error.message);
    res.status(500).json({ error: 'Failed to fetch agreement details' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
