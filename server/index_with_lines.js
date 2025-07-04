// Line 1
// Backend server configuration for Chronos Protocol using thirdweb and Alchemy SDK
// Line 2
require('dotenv').config({ path: '../.env' });
// Line 3
const express = require('express');
// Line 4
const cors = require('cors');
// Line 5
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');
// Line 6
const { Base, BaseSepoliaTestnet } = require('@thirdweb-dev/chains');
// Line 7
const { ethers } = require('ethers');
// Line 8
const alchemyUtils = require('./utils/alchemy');
// Line 9

// Line 10
// Initialize express app
// Line 11
const app = express();
// Line 12
app.use(cors());
// Line 13
app.use(express.json());
// Line 14

// Line 15
// Initialize ThirdwebSDK with Base Sepolia network for smart contract interactions
// Line 16
const initializeSDK = () => {  
// Line 17
  try {
// Line 18
    const privateKey = process.env.PRIVATE_KEY;
// Line 19
    if (!privateKey) {
// Line 20
      throw new Error('PRIVATE_KEY not found in .env file');
// Line 21
    }
// Line 22

// Line 23
    // Get Alchemy API key
// Line 24
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
// Line 25
    if (!alchemyApiKey) {
// Line 26
      console.warn('ALCHEMY_API_KEY not found in .env file, falling back to default RPC');
// Line 27
    }    // Initialize provider for Base Sepolia using Alchemy if available
// Line 28
    // Base Sepolia might not be recognized by ethers.js directly, so we're using a custom RPC
// Line 29
    const rpcUrl = alchemyApiKey 
// Line 30
      ? `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
// Line 31
      : (process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
// Line 32
      
// Line 33
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
// Line 34

// Line 35
    // Create wallet from private key
// Line 36
    const wallet = new ethers.Wallet(privateKey, provider);
// Line 37
    
// Line 38
    // Initialize Thirdweb SDK with client ID and secret key for auth
// Line 39
    const clientId = process.env.THIRDWEB_CLIENT_ID;
// Line 40
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
// Line 41
    
// Line 42
    if (!clientId) {
// Line 43
      console.warn('THIRDWEB_CLIENT_ID not found in .env file. This is required for production use.');
// Line 44
    }
// Line 45
    
// Line 46
    // Configure ThirdwebSDK with proper options for smart contract interactions
// Line 47
    const sdkOptions = {
// Line 48
      gasSettings: {
// Line 49
        maxPriceInGwei: 500,
// Line 50
        speed: "standard" 
// Line 51
      }
// Line 52
    };
// Line 53
    
// Line 54
    if (clientId) {
// Line 55
      sdkOptions.clientId = clientId;
// Line 56
    }
// Line 57
    
// Line 58
    if (secretKey) {
// Line 59
      sdkOptions.secretKey = secretKey;
// Line 60
    }
// Line 61
    
// Line 62
    // Use fromSigner to create SDK with wallet authentication for contract interactions
// Line 63
    const sdk = ThirdwebSDK.fromSigner(
// Line 64
      wallet, 
// Line 65
      BaseSepoliaTestnet,
// Line 66
      sdkOptions
// Line 67
    );
// Line 68
    
// Line 69
    console.log('ThirdwebSDK initialized successfully with Base Sepolia Testnet');
// Line 70
    return { sdk, wallet, provider };
// Line 71
  } catch (error) {
// Line 72
    console.error('Error initializing ThirdwebSDK:', error);
// Line 73
    throw error;
// Line 74
  }
// Line 75
};
// Line 76

// Line 77
// Get deployed contract instances
// Line 78
const getContracts = async (sdk) => {
// Line 79
  try {
// Line 80
    // Import the ABI
// Line 81
    const { ChronosFactoryABI } = require('./utils/abi');
// Line 82
    
// Line 83
    // Get contract address from environment variable or use default
// Line 84
    const ChronosFactoryAddress = process.env.CHRONOS_FACTORY_ADDRESS || "0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94";
// Line 85
    
// Line 86
    console.log('Initializing ChronosFactory contract at:', ChronosFactoryAddress);
// Line 87
    
// Line 88
    // Initialize contract instances with explicit ABI
// Line 89
    const chronosFactory = await sdk.getContractFromAbi(
// Line 90
      ChronosFactoryAddress,
// Line 91
      ChronosFactoryABI
// Line 92
    );
// Line 93
    
// Line 94
    console.log('Contract instances loaded successfully with explicit ABI');
// Line 95
    return { chronosFactory };
// Line 96
  } catch (error) {
// Line 97
    console.error('Error getting contract instances:', error);
// Line 98
    throw error;
// Line 99
  }
// Line 100
};
// Line 101

// Line 102
// Initialize SDK and contracts
// Line 103
let sdkInstance;
// Line 104
let contracts;
// Line 105

// Line 106
// Initialize SDK and contracts on startup
// Line 107
(async () => {
// Line 108
  try {
// Line 109
    sdkInstance = initializeSDK();
// Line 110
    contracts = await getContracts(sdkInstance.sdk);
// Line 111
  } catch (error) {
// Line 112
    console.error('Failed to initialize SDK and contracts:', error);
// Line 113
  }
// Line 114
})();
// Line 115

// Line 116
// API Routes
// Line 117
// Get user agreements
// Line 118
app.get('/api/agreements/:address', async (req, res) => {
// Line 119
  try {
// Line 120
    const { address } = req.params;
// Line 121
    
// Line 122
    // Validate address
// Line 123
    if (!ethers.utils.isAddress(address)) {
// Line 124
      return res.status(400).json({ error: 'Invalid Ethereum address' });
// Line 125
    }
// Line 126
    
// Line 127
    if (!contracts || !contracts.chronosFactory) {
// Line 128
      console.error('Contracts not properly initialized');
// Line 129
      return res.json({ agreements: [], warning: 'Smart contract connection unavailable' });
// Line 130
    }
// Line 131
    
// Line 132
    try {
// Line 133
      // Get agreements from contract with timeout
// Line 134
      const agreements = await Promise.race([
// Line 135
        contracts.chronosFactory.call("getUserAgreements", [address]),
// Line 136
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 5000))
// Line 137
      ]);
// Line 138
      
// Line 139
      // Format agreements for response
// Line 140
      const formattedAgreements = Array.isArray(agreements) 
// Line 141
        ? agreements.map(agreement => ({
// Line 142
            address: agreement,
// Line 143
          }))
// Line 144
        : [];
// Line 145
      
// Line 146
      res.json({ agreements: formattedAgreements });
// Line 147
    } catch (contractError) {
// Line 148
      console.warn('Contract call error:', contractError);
// Line 149
      // Return empty array instead of error to prevent UI crashes
// Line 150
      res.json({ agreements: [], warning: 'Could not load agreements from blockchain' });
// Line 151
    }  } catch (error) {
// Line 152
    console.error('Error retrieving agreements:', error);
// Line 153
    // Return empty result with warning instead of error status
// Line 154
    res.json({ agreements: [], warning: 'Failed to retrieve agreements' });
// Line 155
    res.json({ agreements: [], error: 'Failed to retrieve agreements' });
// Line 156
  }
// Line 157
});
// Line 158

// Line 159
// Create agreement
// Line 160
app.post('/api/agreements', async (req, res) => {
// Line 161
  try {
// Line 162
    const { counterparty, description, deadline, value } = req.body;
// Line 163
    
// Line 164
    // Validate required fields
// Line 165
    if (!counterparty || !description || !deadline || !value) {
// Line 166
      return res.status(400).json({ error: 'Missing required fields' });
// Line 167
    }
// Line 168
    
// Line 169
    // Validate counterparty address
// Line 170
    if (!ethers.utils.isAddress(counterparty)) {
// Line 171
      return res.status(400).json({ error: 'Invalid counterparty address' });
// Line 172
    }
// Line 173
    
// Line 174
    // Check if contracts are properly initialized
// Line 175
    if (!contracts || !contracts.chronosFactory) {
// Line 176
      console.error('Contracts not properly initialized');
// Line 177
      return res.status(503).json({ error: 'Smart contract connection unavailable' });
// Line 178
    }
// Line 179
    
// Line 180
    console.log('Creating agreement with params:', {
// Line 181
      counterparty,
// Line 182
      description,
// Line 183
      deadline,
// Line 184
      value
// Line 185
    });
// Line 186
    
// Line 187
    try {
// Line 188
      // Create agreement using contract
// Line 189
      const valueInWei = ethers.utils.parseEther(value.toString());
// Line 190
      
// Line 191
      const tx = await contracts.chronosFactory.call(
// Line 192
        "createAgreement",
// Line 193
        [counterparty, description, deadline, valueInWei]
// Line 194
      );
// Line 195
      
// Line 196
      console.log('Transaction sent:', tx.receipt ? tx.receipt.transactionHash : 'No hash available');
// Line 197
      
// Line 198
      // Wait for transaction receipt
// Line 199
      const receipt = await tx.receipt;
// Line 200
      console.log('Transaction receipt received:', receipt.transactionHash);
// Line 201
      
// Line 202
      try {
// Line 203
        // Get agreement address from events with timeout
// Line 204
        const events = await Promise.race([
// Line 205
          contracts.chronosFactory.events.getAllEvents(),
// Line 206
          new Promise((_, reject) => setTimeout(() => reject(new Error('Events fetch timeout')), 5000))
// Line 207
        );
// Line 208
        
// Line 209
        const event = events.find(e => 
// Line 210
          e.eventName === 'AgreementCreated' && 
// Line 211
          e.transaction.transactionHash === receipt.transactionHash
// Line 212
        );
// Line 213
        
// Line 214
        if (!event) {          console.warn('Event not found in events list, trying alternative method');
// Line 215
          // Alternative: try to get agreement by retrieving all user agreements and taking the latest one
// Line 216
          const userAgreements = await contracts.chronosFactory.call(
// Line 217
            "getUserAgreements", 
// Line 218
            [sdkInstance.wallet.address]
// Line 219
          );
// Line 220
          
// Line 221
          let agreementAddress = null;
// Line 222
          if (userAgreements && userAgreements.length > 0) {
// Line 223
            // Get the latest agreement (last in array)
// Line 224
            agreementAddress = userAgreements[userAgreements.length - 1];
// Line 225
          }
// Line 226
          
// Line 227
          if (agreementAddress && ethers.utils.isAddress(agreementAddress)) {
// Line 228
            console.log('Retrieved agreement address using fallback method:', agreementAddress);
// Line 229
            return res.json({ 
// Line 230
              success: true, 
// Line 231
              agreementAddress,
// Line 232
              transactionHash: receipt.transactionHash 
// Line 233
            });
// Line 234
          }
// Line 235
          
// Line 236
          return res.status(500).json({ 
// Line 237
            error: 'Agreement created but address not found',
// Line 238
            transactionHash: receipt.transactionHash
// Line 239
          });
// Line 240
        }
// Line 241
        
// Line 242
        const agreementAddress = event.data.agreementAddress;
// Line 243
        console.log('Agreement created at address:', agreementAddress);
// Line 244
        
// Line 245
        res.json({ 
// Line 246
          success: true, 
// Line 247
          agreementAddress,
// Line 248
          transactionHash: receipt.transactionHash 
// Line 249
        });
// Line 250
      } catch (eventError) {
// Line 251
        console.error('Error fetching events:', eventError);
// Line 252
        // Return success anyway since transaction was confirmed
// Line 253
        res.json({ 
// Line 254
          success: true,
// Line 255
          note: 'Transaction confirmed but events retrieval failed',
// Line 256
          transactionHash: receipt.transactionHash 
// Line 257
        });
// Line 258
      }
// Line 259
    } catch (contractError) {
// Line 260
      console.error('Contract call error:', contractError);
// Line 261
      return res.status(500).json({ 
// Line 262
        error: 'Contract interaction failed', 
// Line 263
        message: contractError.message,
// Line 264
        details: contractError.toString()
// Line 265
      });
// Line 266
    }
// Line 267
  } catch (error) {
// Line 268
    console.error('Error creating agreement:', error);
// Line 269
    res.status(500).json({ 
// Line 270
      error: 'Failed to create agreement',
// Line 271
      message: error.message,
// Line 272
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
// Line 273
    });
// Line 274
  }
// Line 275
});
// Line 276

// Line 277
// Get agreement details with improved error handling and timeouts
// Line 278
app.get('/api/agreement/:address', async (req, res) => {
// Line 279
  try {
// Line 280
    const { address } = req.params;
// Line 281
    
// Line 282
    // Validate address
// Line 283
    if (!ethers.utils.isAddress(address)) {
// Line 284
      return res.status(400).json({ error: 'Invalid agreement address' });
// Line 285
    }
// Line 286
    
// Line 287
    if (!sdkInstance || !sdkInstance.sdk) {
// Line 288
      console.error('SDK not initialized');
// Line 289
      return res.json({
// Line 290
        address,
// Line 291
        owner: '0x0000000000000000000000000000000000000000',
// Line 292
        counterparty: '0x0000000000000000000000000000000000000000',
// Line 293
        description: 'Contract not available',
// Line 294
        deadline: '0',
// Line 295
        state: '0',
// Line 296
        value: '0',
// Line 297
        warning: 'Blockchain connection unavailable'
// Line 298
      });
// Line 299
    }
// Line 300
    
// Line 301
    try {
// Line 302
      // Get contract instance with timeout
// Line 303
      const agreementContract = await Promise.race([
// Line 304
        sdkInstance.sdk.getContract(address),
// Line 305
        new Promise((_, reject) => setTimeout(() => reject(new Error('Contract load timeout')), 5000))
// Line 306
      ]);
// Line 307
      
// Line 308
      // Helper function to safely call contract functions with timeout
// Line 309
      const safeContractCall = async (method, fallback) => {
// Line 310
        try {
// Line 311
          return await Promise.race([
// Line 312
            agreementContract.call(method),
// Line 313
            new Promise((_, reject) => setTimeout(() => reject(new Error(`${method} timeout`)), 5000))
// Line 314
          ]);
// Line 315
        } catch (err) {
// Line 316
          console.warn(`Error calling ${method}:`, err);
// Line 317
          return fallback;
// Line 318
        }
// Line 319
      };
// Line 320
      
// Line 321
      // Get agreement details with safer approach
// Line 322
      const [owner, counterparty, description, deadline, state, value] = await Promise.all([
// Line 323
        safeContractCall("owner", '0x0000000000000000000000000000000000000000'),
// Line 324
        safeContractCall("counterparty", '0x0000000000000000000000000000000000000000'),
// Line 325
        safeContractCall("description", 'Description unavailable'),
// Line 326
        safeContractCall("deadline", 0),
// Line 327
        safeContractCall("state", 0),
// Line 328
        safeContractCall("value", ethers.utils.parseEther('0'))
// Line 329
      ]);
// Line 330
      
// Line 331
      res.json({
// Line 332
        address,
// Line 333
        owner,
// Line 334
        counterparty,
// Line 335
        description,
// Line 336
        deadline: deadline.toString ? deadline.toString() : '0',
// Line 337
        state: state.toString ? state.toString() : '0',
// Line 338
        value: ethers.utils.formatEther(value || ethers.utils.parseEther('0'))
// Line 339
      });
// Line 340
    } catch (contractError) {
// Line 341
      console.warn('Contract call error:', contractError);
// Line 342
      // Return partial data instead of error to prevent UI crashes
// Line 343
      res.json({
// Line 344
        address,
// Line 345
        owner: '0x0000000000000000000000000000000000000000',
// Line 346
        counterparty: '0x0000000000000000000000000000000000000000',
// Line 347
        description: 'Error loading contract',
// Line 348
        deadline: '0',
// Line 349
        state: '0',
// Line 350
        value: '0',
// Line 351
        warning: contractError.message || 'Failed to load agreement data'
// Line 352
      });
// Line 353
    }
// Line 354
  } catch (error) {
// Line 355
    console.error('Error retrieving agreement details:', error);
// Line 356
    // Return empty data with warning instead of error
// Line 357
    res.json({
// Line 358
      address: req.params.address,
// Line 359
      owner: '0x0000000000000000000000000000000000000000',
// Line 360
      counterparty: '0x0000000000000000000000000000000000000000',
// Line 361
      description: 'Server error',
// Line 362
      deadline: '0',
// Line 363
      state: '0',
// Line 364
      value: '0',
// Line 365
      error: error.message || 'Failed to retrieve agreement details'
// Line 366
    });
// Line 367
  }
// Line 368
});
// Line 369

// Line 370
// Set agreement state with improved error handling
// Line 371
app.post('/api/agreement/:address/state', async (req, res) => {
// Line 372
  try {
// Line 373
    const { address } = req.params;
// Line 374
    const { newState } = req.body;
// Line 375
    
// Line 376
    // Validate address
// Line 377
    if (!ethers.utils.isAddress(address)) {
// Line 378
      return res.status(400).json({ error: 'Invalid agreement address' });
// Line 379
    }
// Line 380
    
// Line 381
    // Validate new state
// Line 382
    if (![1, 2, 4].includes(Number(newState))) {
// Line 383
      return res.status(400).json({ error: 'Invalid state value' });
// Line 384
    }
// Line 385
    
// Line 386
    if (!sdkInstance || !sdkInstance.sdk) {
// Line 387
      return res.status(503).json({ 
// Line 388
        error: 'Blockchain connection unavailable',
// Line 389
        recoverable: true
// Line 390
      });
// Line 391
    }
// Line 392
    
// Line 393
    try {
// Line 394
      // Get contract instance with timeout
// Line 395
      const agreementContract = await Promise.race([
// Line 396
        sdkInstance.sdk.getContract(address),
// Line 397
        new Promise((_, reject) => setTimeout(() => reject(new Error('Contract load timeout')), 5000))
// Line 398
      ]);
// Line 399
      
// Line 400
      // Update state based on the requested state
// Line 401
      let tx;
// Line 402
      const stateMethodMap = {
// Line 403
        1: "activate",    // ACTIVE
// Line 404
        2: "complete",    // COMPLETED
// Line 405
        4: "voidAgreement" // VOIDED
// Line 406
      };
// Line 407
      
// Line 408
      const method = stateMethodMap[Number(newState)];
// Line 409
      if (!method) {
// Line 410
        return res.status(400).json({ error: 'Unsupported state transition' });
// Line 411
      }
// Line 412
      
// Line 413
      // Call contract with timeout
// Line 414
      tx = await Promise.race([
// Line 415
        agreementContract.call(method),
// Line 416
        new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction timeout')), 15000))
// Line 417
      ]);
// Line 418
      
// Line 419
      // Wait for transaction receipt with timeout
// Line 420
      const receipt = await Promise.race([
// Line 421
        tx.receipt,
// Line 422
        new Promise((_, reject) => setTimeout(() => reject(new Error('Receipt timeout')), 30000))
// Line 423
      ]);
// Line 424
      
// Line 425
      res.json({ 
// Line 426
        success: true, 
// Line 427
        transactionHash: receipt.transactionHash,
// Line 428
        newState
// Line 429
      });
// Line 430
    } catch (contractError) {
// Line 431
      console.warn('Contract interaction error:', contractError);
// Line 432
      return res.status(502).json({ 
// Line 433
        error: contractError.message || 'Failed to update agreement state',
// Line 434
        recoverable: true
// Line 435
      });
// Line 436
    }
// Line 437
    } catch (error) {
// Line 438
    console.error('Error updating agreement state:', error);
// Line 439
    // Send a friendlier error with recovery guidance
// Line 440
    res.status(503).json({ 
// Line 441
      error: 'Server temporarily unavailable',
// Line 442
      message: 'Unable to process your request at this time. Please try again later.',
// Line 443
      recoverable: true
// Line 444
    });
// Line 445
  }
// Line 446
});
// Line 447

// Line 448
// Alchemy SDK endpoints
// Line 449

// Line 450
// Get current gas price
// Line 451
app.get('/api/gas-price', async (req, res) => {
// Line 452
  try {
// Line 453
    const gasPrice = await alchemyUtils.getGasPrice();
// Line 454
    res.json({ 
// Line 455
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
// Line 456
      gasPriceWei: gasPrice.toString()
// Line 457
    });
// Line 458
  } catch (error) {
// Line 459
    console.error('Error getting gas price:', error);
// Line 460
    res.status(500).json({ error: 'Failed to get gas price' });
// Line 461
  }
// Line 462
});
// Line 463

// Line 464
// Get gas price recommendations
// Line 465
app.get('/api/gas-recommendations', async (req, res) => {
// Line 466
  try {
// Line 467
    const gasRecommendations = await alchemyUtils.getGasRecommendations();
// Line 468
    res.json(gasRecommendations);
// Line 469
  } catch (error) {
// Line 470
    console.error('Error getting gas recommendations:', error);
// Line 471
    res.status(500).json({ error: 'Failed to get gas recommendations' });
// Line 472
  }
// Line 473
});
// Line 474

// Line 475
// Get NFT metadata
// Line 476
app.get('/api/nft/:contractAddress/:tokenId', async (req, res) => {
// Line 477
  try {
// Line 478
    const { contractAddress, tokenId } = req.params;
// Line 479
    
// Line 480
    if (!ethers.utils.isAddress(contractAddress)) {
// Line 481
      return res.status(400).json({ error: 'Invalid contract address' });
// Line 482
    }
// Line 483
    
// Line 484
    const metadata = await alchemyUtils.getNFTMetadata(contractAddress, tokenId);
// Line 485
    res.json(metadata);
// Line 486
  } catch (error) {
// Line 487
    console.error('Error getting NFT metadata:', error);
// Line 488
    res.status(500).json({ error: 'Failed to get NFT metadata' });
// Line 489
  }
// Line 490
});
// Line 491

// Line 492
// Get all NFTs owned by an address
// Line 493
app.get('/api/nfts/owner/:address', async (req, res) => {
// Line 494
  try {
// Line 495
    const { address } = req.params;
// Line 496
    
// Line 497
    if (!ethers.utils.isAddress(address)) {
// Line 498
      return res.status(400).json({ error: 'Invalid wallet address' });
// Line 499
    }
// Line 500
    
// Line 501
    const nfts = await alchemyUtils.getOwnedNFTs(address);
// Line 502
    res.json(nfts);
// Line 503
  } catch (error) {
// Line 504
    console.error('Error getting owned NFTs:', error);
// Line 505
    res.status(500).json({ error: 'Failed to get owned NFTs' });
// Line 506
  }
// Line 507
});
// Line 508

// Line 509
// Get transaction details with enhanced metadata
// Line 510
app.get('/api/transaction/:txHash', async (req, res) => {
// Line 511
  try {
// Line 512
    const { txHash } = req.params;
// Line 513
    const transactionDetails = await alchemyUtils.getEnhancedTransactionDetails(txHash);
// Line 514
    res.json(transactionDetails);
// Line 515
  } catch (error) {
// Line 516
    console.error('Error getting transaction details:', error);
// Line 517
    res.status(500).json({ error: 'Failed to get transaction details' });
// Line 518
  }
// Line 519
});
// Line 520

// Line 521
// Get account nonce information
// Line 522
app.get('/api/account/:address/nonce', async (req, res) => {
// Line 523
  try {
// Line 524
    const { address } = req.params;
// Line 525
    
// Line 526
    if (!ethers.utils.isAddress(address)) {
// Line 527
      return res.status(400).json({ error: 'Invalid wallet address' });
// Line 528
    }
// Line 529
    
// Line 530
    const nonceInfo = await alchemyUtils.getAccountNonce(address);
// Line 531
    res.json(nonceInfo);
// Line 532
  } catch (error) {
// Line 533
    console.error('Error getting account nonce:', error);
// Line 534
    res.status(500).json({ error: 'Failed to get account nonce' });
// Line 535
  }
// Line 536
});
// Line 537

// Line 538
// Health check endpoint
// Line 539
app.get('/api/health', async (req, res) => {
// Line 540
  try {
// Line 541
    // Initialize SDK and test connection
// Line 542
    const { provider } = await initializeSDK();
// Line 543
    
// Line 544
    // Get network information
// Line 545
    const network = await provider.getNetwork();
// Line 546
    
// Line 547
    // Get blockchain status
// Line 548
    const blockNumber = await provider.getBlockNumber();
// Line 549
    const gasPrice = await provider.getGasPrice();
// Line 550
    
// Line 551
    // Return health status with diagnostic information
// Line 552
    res.json({
// Line 553
      status: 'OK',
// Line 554
      timestamp: new Date().toISOString(),
// Line 555
      network: {
// Line 556
        name: network.name,
// Line 557
        chainId: network.chainId,
// Line 558
        ensAddress: network.ensAddress
// Line 559
      },
// Line 560
      blockchain: {
// Line 561
        blockNumber,
// Line 562
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei'
// Line 563
      },
// Line 564
      server: {
// Line 565
        uptime: Math.floor(process.uptime())
// Line 566
      },
// Line 567
      alchemy: {
// Line 568
        configured: !!process.env.ALCHEMY_API_KEY
// Line 569
      }
// Line 570
    });
// Line 571
  } catch (error) {
// Line 572
    console.error('Health check error:', error);
// Line 573
    res.status(500).json({
// Line 574
      status: 'ERROR',
// Line 575
      timestamp: new Date().toISOString(),
// Line 576
      error: error.message
// Line 577
    });
// Line 578
  }
// Line 579
});
// Line 580

// Line 581
// Test endpoint to verify contract functions
// Line 582
app.get('/api/contract-test', async (req, res) => {
// Line 583
  try {
// Line 584
    if (!contracts || !contracts.chronosFactory) {
// Line 585
      return res.status(503).json({ error: 'Contract not initialized' });
// Line 586
    }
// Line 587
    
// Line 588
    // Get available functions from the contract
// Line 589
    const functions = await contracts.chronosFactory.getContract().interface.functions;
// Line 590
    
// Line 591
    // Return available functions and contract address
// Line 592
    res.json({
// Line 593
      success: true,
// Line 594
      contractAddress: contracts.chronosFactory.getAddress(),
// Line 595
      availableFunctions: Object.keys(functions),
// Line 596
      contractType: typeof contracts.chronosFactory,
// Line 597
      hasCreateAgreement: !!functions['createAgreement(address,string,uint256,uint256)']
// Line 598
    });
// Line 599
  } catch (error) {
// Line 600
    console.error('Contract test error:', error);
// Line 601
    res.status(500).json({
// Line 602
      error: 'Contract test failed',
// Line 603
      message: error.message
// Line 604
    });
// Line 605
  }
// Line 606
});
// Line 607

// Line 608
// Start server
// Line 609
const PORT = process.env.PORT || 3001;
// Line 610
app.listen(PORT, () => {
// Line 611
  console.log(`Server running on port ${PORT}`);
// Line 612
  console.log(`Using Alchemy SDK for Base Sepolia RPC: ${process.env.ALCHEMY_API_KEY ? 'Yes' : 'No (using default RPC)'}`);
// Line 613
});
// Line 614

// Line 615
module.exports = app;
// Line 616

// Line 617

