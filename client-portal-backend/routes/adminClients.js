const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Company = require('../models/Company');
const { verifyAdminToken } = require('../middleware/authmiddleware');
const bcrypt = require('bcrypt');

// ===========================
// GET all clients
// ===========================
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const clients = await Client.find().populate('company', 'name');
    const result = clients.map(client => ({
      _id: client._id,
      email: client.email,
      companyCount: client.company.length
    }));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// GET one client by ID
// ===========================
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('company');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// CREATE new client (admin view)
// ===========================
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existing = await Client.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Client already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newClient = new Client({
      email,
      password: hashedPassword,
      company: []
    });

    await newClient.save();
    res.status(201).json({ message: 'Client created', client: newClient });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// UPDATE client details (email, password)
// ===========================
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { email, password } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (email) client.email = email;
    if (password) client.password = await bcrypt.hash(password, 10);

    await client.save();
    res.status(200).json({ message: 'Client updated', client });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// DELETE client + associated companies
// ===========================
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Delete all associated companies
    await Company.deleteMany({ _id: { $in: client.company } });

    // Delete the client
    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Client and associated companies deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
