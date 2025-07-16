const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Secretary = require('../models/Secretary');

const { verifyAdminToken } = require('../middleware/authmiddleware');

// ===========================
// GET all secretaries for a company
// ===========================
router.get('/:companyId', verifyAdminToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId).populate('secretary');
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company.secretary || []);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ===========================
// ADD a secretary to a company
// ===========================
router.post('/:companyId', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, contact } = req.body;

    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Create a new Secretary document
    const newSecretary = new Secretary({
      name,
      email,
      contact
    });

    await newSecretary.save();

    // Push the secretary ID to the company
    company.secretary.push(newSecretary._id);
    await company.save();

    res.status(201).json({ message: "Secretary added", secretary: newSecretary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding secretary", error: error.message });
  }
});

router.put('/:secretaryId', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, contact } = req.body;

    const updatedSecretary = await Secretary.findByIdAndUpdate(
      req.params.secretaryId,
      { name, email, contact },
      { new: true } // return the updated document
    );

    if (!updatedSecretary) {
      return res.status(404).json({ message: "Secretary not found" });
    }

    res.status(200).json({ message: "Secretary updated", secretary: updatedSecretary });
  } catch (error) {
    res.status(500).json({ message: "Error updating secretary", error: error.message });
  }
});

router.delete('/:secretaryId', verifyAdminToken, async (req, res) => {
  try {
    const secretaryId = req.params.secretaryId;

    // Delete the secretary document
    const deleted = await Secretary.findByIdAndDelete(secretaryId);

    if (!deleted) {
      return res.status(404).json({ message: "Secretary not found" });
    }

    // Also remove it from any company's `secretary` array
    await Company.updateMany(
      { secretary: secretaryId },
      { $pull: { secretary: secretaryId } }
    );

    res.status(200).json({ message: "Secretary deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting secretary", error: error.message });
  }
});


module.exports = router;
