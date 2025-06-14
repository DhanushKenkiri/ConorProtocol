# Chronos Protocol Backend

This is the backend server for Chronos Protocol, built with Express.js and thirdweb SDK to interact with smart contracts on Base Sepolia testnet.

## Features

- RESTful API for interacting with Chronos Protocol smart contracts
- Thirdweb SDK integration for simplified blockchain interactions
- Base Sepolia testnet support

## API Endpoints

### Get User Agreements

```
GET /api/agreements/:address
```

Returns all agreements associated with a specific user address.

### Create Agreement

```
POST /api/agreements
```

Create a new agreement on the blockchain.

**Request Body:**
```json
{
  "counterparty": "0x...",
  "description": "Agreement description",
  "deadline": 1725000000,
  "value": "0.1"
}
```

### Get Agreement Details

```
GET /api/agreement/:address
```

Returns detailed information about a specific agreement.

### Update Agreement State

```
POST /api/agreement/:address/state
```

Update the state of an existing agreement.

**Request Body:**
```json
{
  "newState": 1
}
```

State values:
- 1: ACTIVE
- 2: COMPLETED
- 4: VOIDED

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Make sure the parent directory's `.env` file contains:
```
PRIVATE_KEY=your_private_key_here
```

3. Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server will run on port 3001 by default.
