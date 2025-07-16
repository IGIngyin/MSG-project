const express = require('express');
const router = express.Router();
const Shareholder = require('../models/Shareholder');
const Company = require('../models/Company');
const { verifyAdminToken } = require('../middleware/authmiddleware');

// ==============================
// GET all shareholders of a company
// ==============================
router.get('/:companyId', verifyAdminToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId).populate('shareholder');
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company.shareholder || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shareholders", error: error.message });
  }
});

// ==============================
// ADD shareholder to a company
// ==============================
router.post('/:companyId', verifyAdminToken, async (req, res) => {
  try {
    const { name, id, email, contact, ordinaryShareNumber } = req.body;

    const newShareholder = new Shareholder({ name, id, email, contact, ordinaryShareNumber });
    const saved = await newShareholder.save();

    await Company.findByIdAndUpdate(req.params.companyId, {
      $push: { shareholder: saved._id }
    });

    res.status(201).json({ message: "Shareholder added", shareholder: saved });
  } catch (error) {
    res.status(500).json({ message: "Error adding shareholder", error: error.message });
  }
});

// ==============================
// UPDATE shareholder
// ==============================
router.put('/:shareholderId', verifyAdminToken, async (req, res) => {
  try {
    const { name, id, email, contact, ordinaryShareNumber } = req.body;

    const updated = await Shareholder.findByIdAndUpdate(
      req.params.shareholderId,
      { name, id, email, contact, ordinaryShareNumber },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Shareholder not found" });

    res.status(200).json({ message: "Shareholder updated", shareholder: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating shareholder", error: error.message });
  }
});

// ==============================
// DELETE shareholder
// ==============================
router.delete('/:shareholderId', verifyAdminToken, async (req, res) => {
  try {
    const deleted = await Shareholder.findByIdAndDelete(req.params.shareholderId);
    if (!deleted) return res.status(404).json({ message: "Shareholder not found" });

    await Company.updateMany(
      { shareholder: req.params.shareholderId },
      { $pull: { shareholder: req.params.shareholderId } }
    );

    res.status(200).json({ message: "Shareholder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shareholder", error: error.message });
  }
});

module.exports = router;
