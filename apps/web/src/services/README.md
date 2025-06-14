# Chronos Protocol API Service

This module provides the API service for communication between the Chronos Protocol frontend and backend.

## Features

- RESTful API client for interacting with the backend server
- Error handling and response formatting
- Typed interface for agreement data

## Usage

```javascript
import api from '../services/api';

// Get user agreements
const getUserAgreements = async (address) => {
  try {
    const agreements = await api.getUserAgreements(address);
    // Use agreements data
  } catch (error) {
    console.error('Error fetching agreements:', error);
  }
};

// Create an agreement
const createAgreement = async (agreementData) => {
  try {
    const result = await api.createAgreement({
      counterparty: '0x...',
      description: 'Agreement description',
      deadline: 1730332800, // Unix timestamp
      value: '0.01' // ETH value
    });
    // Use result data
  } catch (error) {
    console.error('Error creating agreement:', error);
  }
};

// Get agreement details
const getAgreementDetails = async (contractAddress) => {
  try {
    const details = await api.getAgreementDetails(contractAddress);
    // Use details data
  } catch (error) {
    console.error('Error fetching agreement details:', error);
  }
};

// Update agreement state
const updateState = async (contractAddress, newState) => {
  try {
    const result = await api.updateAgreementState(contractAddress, newState);
    // Use result data
  } catch (error) {
    console.error('Error updating agreement state:', error);
  }
};
```

## API Methods

### `getUserAgreements(address)`
Gets all agreements associated with a user's address.

### `createAgreement(agreementData)`
Creates a new agreement on the blockchain.

### `getAgreementDetails(address)`
Gets the details of a specific agreement.

### `updateAgreementState(address, newState)`
Updates the state of an agreement (activate, complete, void).

## Configuration

The API service uses the `VITE_API_URL` environment variable to determine the API endpoint.
If not provided, it defaults to `http://localhost:3001/api`.

## Error Handling

All methods include error handling and will throw descriptive errors if the API requests fail.
Error objects include:
- Error message from the API
- HTTP status code
- Request details for debugging
