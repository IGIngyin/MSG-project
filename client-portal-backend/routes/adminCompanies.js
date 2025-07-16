const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Client = require('../models/Client');
const { verifyAdminToken } = require('../middleware/authmiddleware');

// ===========================
// GET all companies (exclude documents & billing)
// ===========================
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const companies = await Company.find({}, 'name description address ssic paidUpShareCapital');
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching companies" });
  }
});

// ===========================
// GET companies by client ID
// ===========================
router.get('/client/:clientId/companies', verifyAdminToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId).populate({
      path: 'company',
      select: 'name description address ssic paidUpShareCapital'
    });

    if (!client) return res.status(404).json({ message: 'Client not found' });

    res.status(200).json(client.company);
  } catch (error) {
    res.status(500).json({ message: "Error fetching companies for client", error: error.message });
  }
});


// ===========================
// CREATE a new company
// ===========================
router.post('/:clientId', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, ssic, address, paidUpShareCapital } = req.body;

    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Create new company
    const newCompany = new Company({
      name,
      description,
      ssic,
      address,
      paidUpShareCapital
    });

    const savedCompany = await newCompany.save();

    // Link company to client
    client.company.push(savedCompany._id);
    await client.save();

    res.status(201).json({ message: "Company created and linked to client", company: savedCompany });
  } catch (error) {
    res.status(500).json({ message: "Error creating company", error: error.message });
  }
});

// ===========================
// UPDATE a company
// ===========================
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, ssic, address, paidUpShareCapital } = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, description, ssic, address, paidUpShareCapital },
      { new: true }
    );

    if (!updatedCompany) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ message: "Company updated", company: updatedCompany });
  } catch (error) {
    res.status(500).json({ message: "Error updating company", error: error.message });
  }
});

// ===========================
// DELETE a company
// ===========================
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const companyId = req.params.id;

    // Remove from any clients who reference this company
    await Client.updateMany(
      { company: companyId },
      { $pull: { company: companyId } }
    );

    const deletedCompany = await Company.findByIdAndDelete(companyId);
    if (!deletedCompany) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ message: "Company deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error: error.message });
  }
});

module.exports = router;
