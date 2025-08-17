const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Client = require('../models/Client');
const Company = require('../models/Company');
const { verifyAdminToken } = require('../middleware/authmiddleware');

// ===========================
// GET all clients (now also returns name & phone)
// ===========================
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const clients = await Client.find().populate('company', 'name');
    const result = clients.map(c => ({
      _id: c._id,
      email: c.email,
      name: c.name,
      phone: c.phone,
      companyCount: Array.isArray(c.company) ? c.company.length : 0,
    }));
    res.status(200).json(result);
  } catch (error) {
    console.error('GET /api/admin/clients error:', error);
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
    console.error('GET /api/admin/clients/:id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// CREATE new client (admin)
// requires: name, email, password, phone
// ===========================
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    let { name, email, password, phone } = req.body || {};

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'name, email, password, phone are required' });
    }

    email = String(email).trim().toLowerCase();
    name = String(name).trim();
    phone = String(phone).trim();

    // Duplicate check (email). If phone is unique in your schema, Mongoose will throw 11000 which we catch below.
    const existing = await Client.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Client already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await Client.create({
      name,
      email,
      password: hashedPassword,
      phone,
      company: [],
      // credits: 0, // uncomment if your schema has this with no default
    });

    return res.status(201).json({ message: 'Client created', client });
  } catch (error) {
    if (error?.code === 11000) {
      // unique index violation (email or phone)
      const fields = Object.keys(error.keyPattern || {});
      const field = fields[0] || 'field';
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    console.error('POST /api/admin/clients error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// ===========================
// UPDATE client (admin)
// accepts any subset of: name, email, password, phone
// ===========================
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (name !== undefined) client.name = String(name).trim();
    if (email !== undefined) client.email = String(email).trim().toLowerCase();
    if (phone !== undefined) client.phone = String(phone).trim();
    if (password) client.password = await bcrypt.hash(password, 10);

    await client.save();
    res.status(200).json({ message: 'Client updated', client });
  } catch (error) {
    if (error?.code === 11000) {
      const fields = Object.keys(error.keyPattern || {});
      const field = fields[0] || 'field';
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    console.error('PUT /api/admin/clients/:id error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// ===========================
// DELETE client + associated companies
// ===========================
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    await Company.deleteMany({ _id: { $in: client.company } });
    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Client and associated companies deleted' });
  } catch (error) {
    console.error('DELETE /api/admin/clients/:id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
