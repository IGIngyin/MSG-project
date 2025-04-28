## Steps to Run the Project

### 1. Setup Frontend

- Place the `index.html` file in your web server or open it directly in a browser.
- Ensure that the `txnReq` and `hmac` values are generated and sent to the eNETS server.

### 2. Setup Backend

1. Install Node.js (if you haven't already): [Download Node.js](https://nodejs.org/)
2. Navigate to the `backend` directory in your terminal and install dependencies:

   ```
   cd backend
   npm install
   ```

3. Start the backend server:

   ```
   npm start
   ```

4. The server will run on `http://localhost:3000`.

### 3. Testing the Integration

- The frontend will automatically submit the payment form when loaded.
- The backend server will listen for the response at the `/s2sTxnEnd` endpoint and verify the MAC value.

### Notes

- Replace the placeholder `your-secret-key` and `your-key-id` with actual values provided by eNETS.
- Ensure the URLs and other transaction data in the `txnReq` are accurate.
