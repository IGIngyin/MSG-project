const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin"); // Optional middleware for role check

const router = express.Router();

// ✅ Admin Registration
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword });

        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Admin Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: "admin" },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        res.json({ bearerToken: `Bearer ${token}`, admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Admin Dashboard (protected)
router.get("/dashboard", verifyToken, isAdmin, async (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard" });
});

// ✅ Admin: View All Clients
router.get("/clients", verifyToken, isAdmin, async (req, res) => {
    try {
        const clients = await Client.find().populate("company");
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
