// Simplified version to test syntax
const express = require('express');
const app = express();

app.post('/test', async (req, res) => {
  try {
    console.log('Test');
    
    try {
      const result = await Promise.resolve('test');
      console.log(result);
    } catch (innerError) {
      console.error('Inner error');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Outer error');
    res.status(500).json({ error: 'Failed' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
