require("dotenv").config();
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Client = require("../models/Client");
const Company = require("../models/Company");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: API endpoints for managing clients
 */

/**
 * @swagger
 * /api/clients/register:
 *   post:
 *     summary: Register a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client registered successfully
 *       400:
 *         description: Missing required fields
 */

/**
 * @swagger
 * /api/clients/verify-otp:
 *   post:
 *     summary: Verify OTP sent to user's email
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

const sendOtpEmail = require("../utils/sendOtpEmail"); // import

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await Client.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 50 * 60 * 1000); // 5 minutes expiry

    const newClient = new Client({
      email,
      password: hashedPassword,
      otp: { code: otp, expiresAt },
    });

    await newClient.save();
    console.log("Sending OTP to:", email, "OTP:", otp);

    await sendOtpEmail(email, otp);

    res.status(201).json({ message: "Client registered. OTP sent to email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const client = await Client.findOne({ email });

    if (!client || !client.otp || !client.otp.code) {
      return res.status(400).json({ message: "OTP not found. Please register again." });
    }

    // Check if OTP expired
    if (client.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check if OTP matches
    if (client.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    client.isVerified = true;
    client.otp = undefined;
    await client.save();

    res.status(200).json({ message: "OTP verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    client.otp = { code: otp, expiresAt };
    await client.save();

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /api/clients/login:
 *   post:
 *     summary: Authenticate a client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email }).populate("company");

    if (!client || !(await bcrypt.compare(password, client.password))) {
  return res.status(400).json({ message: "Invalid credentials" });
}

if (!client.isVerified) {
  return res.status(403).json({ message: "Please verify your email before logging in." });
}


    const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ bearerToken: `Bearer ${token}`, client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get client profile
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Client profile retrieved
 *       404:
 *         description: Client not found
 */
router.get("/clients", verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).populate("company");
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/clients/credits/purchase:
 *   post:
 *     summary: Purchase credits
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Credits purchased successfully
 *       404:
 *         description: Client not found
 */
router.post("/credits/purchase", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const client = await Client.findByIdAndUpdate(
      req.user.id,
      { $inc: { credits: amount } }, // Increment the credits
      { new: true } // Return the updated document
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Credits purchased successfully",
      credits: client.credits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
