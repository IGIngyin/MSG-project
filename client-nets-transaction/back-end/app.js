const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path'); // Import path module for serving static files


const app = express();
app.use(bodyParser.json());

// S2S Transaction Endpoint
app.post('/s2sTxnEnd', (req, res) => {
  const txnRes = req.body;  // Transaction Response from eNETS
  const macFromGW = req.headers['hmac'];  // MAC value from the headers

  const secretKey = process.env.NETS_SECRET_KEY; 
  const generatedHmac = generateMAC(JSON.stringify(txnRes), secretKey);

  // Compare the generated HMAC with the HMAC from eNETS
  if (generatedHmac === macFromGW) {
    console.log('Transaction verified successfully');
    // Handle success or failure based on txnRes
    res.status(200).send('Transaction verified');
  } else {
    console.log('MAC value mismatch');
    res.status(400).send('Invalid MAC value');
  }
});

// Helper function to generate MAC value
const generateMAC = (txnRes, secretKey) => {
  const concatPayloadAndSecretKey = txnRes + secretKey;
  const hash = crypto.createHash('sha256').update(concatPayloadAndSecretKey).digest('base64');
  return hash;
};

// Serve static files (index.html, CSS, JS) from another project folder
app.use(express.static(path.join(__dirname, '../front-end')));


// Start the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
