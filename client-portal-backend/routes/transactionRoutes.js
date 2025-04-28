require("dotenv").config();
const express = require("express");
const Client = require("../models/Client");
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// CREATE NEW TRANSACTION
/**
 * @swagger
 * /api/transactions/transactions:
 *   post:
 *     description: Create a new transaction and update the client's credit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of the credit change (positive or negative)
 *                 example: 100
 *               type:
 *                 type: string
 *                 enum: ['credit', 'debit']
 *                 description: The type of transaction (credit or debit)
 *                 example: "debit"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Failed to create transaction
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.post("/transactions/", verifyToken, async (req, res) => {
  const { amount, type } = req.body;

  try {
    // Find the client making the transaction
    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Calculate the new credit balance
    const newCreditBalance =
      type === "credit" ? client.credits + amount : client.credits - amount;

    // Create the transaction record
    const transaction = new Transaction({
      clientId: client._id,
      amount,
      creditAfterTransaction: newCreditBalance,
      type,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create transaction" });
  }
});

// GET ALL TRANSACTIONS FOR THE AUTHENTICATED CLIENT
/**
 * @swagger
 * /api/transactions/transactions:
 *   get:
 *     description: Get all transactions for the authenticated client
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     description: The amount of the credit change (positive or negative)
 *                     example: 100
 *                   creditAfterTransaction:
 *                     type: number
 *                     description: The credit balance after the transaction
 *                     example: 80
 *                   type:
 *                     type: string
 *                     description: The type of transaction (credit or debit)
 *                     example: "debit"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp of the transaction
 *                     example: "2025-02-28T12:00:00Z"
 *       500:
 *         description: Failed to retrieve transactions
 */
router.get("/transactions", verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ clientId: req.user.id }).sort(
      { createdAt: -1 }
    );
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
});

// GET A SPECIFIC TRANSACTION BY ID
/**
 * @swagger
 * /api/transactions/transactions/{id}:
 *   get:
 *     description: Get a specific transaction by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the transaction
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Failed to retrieve transaction
 */
router.get("/transactions/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve transaction" });
  }
});

// UPDATE A TRANSACTION BY ID
/**
 * @swagger
 * /api/transactions/transactions/{id}:
 *   put:
 *     description: Update a transaction by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the transaction
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of the credit change (positive or negative)
 *                 example: 50
 *               type:
 *                 type: string
 *                 enum: ['credit', 'debit']
 *                 description: The type of transaction (credit or debit)
 *                 example: "credit"
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 *       400:
 *         description: Failed to update transaction
 *       500:
 *         description: Internal server error
 */
router.put("/transactions/:id", verifyToken, async (req, res) => {
  const { amount, type } = req.body;

  try {
    // Find the transaction and the associated client
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const client = await Client.findById(transaction.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Update the credit balance based on the new transaction details
    const newCreditBalance =
      type === "credit" ? client.credits + amount : client.credits - amount;

    // Update the transaction record
    transaction.amount = amount;
    transaction.type = type;
    transaction.creditAfterTransaction = newCreditBalance;
    await transaction.save();

    // Update the client's credit balance
    client.credits = newCreditBalance;
    await client.save();

    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE A TRANSACTION BY ID
/**
 * @swagger
 * /api/transactions/transactions/{id}:
 *   delete:
 *     description: Delete a transaction by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the transaction
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.delete("/transactions/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Find the client associated with the transaction
    const client = await Client.findById(transaction.clientId);
    if (client) {
      // Update the client's credit balance by reversing the transaction
      client.credits =
        transaction.type === "credit"
          ? client.credits - transaction.amount
          : client.credits + transaction.amount;
      await client.save();
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

module.exports = router;
