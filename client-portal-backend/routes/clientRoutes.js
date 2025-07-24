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
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!email || !password || !password || !phone) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newClient = new Client({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
        });

        await newClient.save();
        res.status(201).json({ message: "Client registered successfully" });
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
        const client = await Client.findOne({
            email: email.toLowerCase(),
        }).populate("company");

        if (!client || !(await bcrypt.compare(password, client.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
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
        if (!client)
            return res.status(404).json({ message: "Client not found" });

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

const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Forgot password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const client = await Client.findOne({ email: email.toLowerCase() });
        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, {
            expiresIn: "10m",
        });
        const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;

        // Send email using Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Client Portal" <${process.env.EMAIL_USERNAME}>`,
            to: email.toLowerCase(),
            subject: "Reset your password",
            html: `
        <p>You requested to reset your password.</p>
        <p><a href="${resetLink}">Click here to reset it</a></p>
        <p>This link expires in 10 minutes.</p>
      `,
        });

        res.status(200).json({
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({
            error: "Something went wrong. Try again later.",
        });
    }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);

        await Client.findByIdAndUpdate(decoded.id, {
            password: hashedPassword,
        });

        res.status(200).json({
            message: "Password has been reset successfully.",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(400).json({ error: "Invalid or expired token." });
    }
});

router.post("/change-password", verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const client = await Client.findById(req.user.id);
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, client.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ message: "Old password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        client.password = hashedPassword;
        await client.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
module.exports = router;
