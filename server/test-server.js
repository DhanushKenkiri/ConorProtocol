// Basic server for testing
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create agreement endpoint
app.post('/api/agreements', (req, res) => {
  const { counterparty, description, deadline, value } = req.body;
  res.json({
    success: true,
    agreementAddress: "0x0000000000000000000000000000000000000000",
    transactionHash: "0x0000000000000000000000000000000000000000"
  });
});

// Get agreements endpoint
app.get('/api/agreements/:address', (req, res) => {
  const { address } = req.params;
  res.json({ 
    agreements: [],
    warning: "This is a test server" 
  });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
