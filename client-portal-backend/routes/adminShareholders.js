// routes/adminShareholders.js
const express = require('express');
const router = express.Router();
const Shareholder = require('../models/Shareholder');
const Company = require('../models/Company');
const { verifyAdminToken } = require('../middleware/authmiddleware');

// ---- helpers ----
const normalizeBody = (b = {}) => ({
  name: (b.name ?? '').trim(),
  id: (b.id ?? '').trim(), // optional external ID
  email: (b.email ?? '').trim().toLowerCase(),
  contact: (b.contact ?? '').trim(),
  ordinaryShareNumber: Number(b.ordinaryShareNumber ?? 0),
});

async function ensureCompany(companyId) {
  const c = await Company.findById(companyId);
  if (!c) {
    const err = new Error('Company not found');
    err.status = 404;
    throw err;
  }
  return c;
}

// ==============================
// GET all shareholders of a company
// (keeps your existing path)  GET /api/admin/shareholders/:companyId
// alias (clearer):            GET /api/admin/shareholders/company/:companyId
// ==============================
async function listByCompany(req, res) {
  try {
    const company = await Company.findById(req.params.companyId).populate('shareholder');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company.shareholder || []);
  } catch (error) {
    console.error('GET shareholders error:', error);
    res.status(500).json({ message: 'Error fetching shareholders', error: error.message });
  }
}
router.get('/:companyId', verifyAdminToken, listByCompany);
router.get('/company/:companyId', verifyAdminToken, listByCompany);

// ==============================
// CREATE shareholder + attach to company
// (keeps your existing path)  POST /api/admin/shareholders/:companyId
// alias (clearer):            POST /api/admin/shareholders/company/:companyId
// ==============================
async function createForCompany(req, res) {
  try {
    const company = await ensureCompany(req.params.companyId);
    const payload = normalizeBody(req.body);

    // Basic validation (mirror client expectations)
    if (!payload.name || !payload.email) {
      return res.status(400).json({ message: 'name and email are required' });
    }

    const created = await Shareholder.create(payload);

    // Link to company
    company.shareholder.push(created._id);
    await company.save();

    res.status(201).json({ message: 'Shareholder added', shareholder: created });
  } catch (error) {
    console.error('POST shareholder error:', error);
    const status = error.status || 500;
    res.status(status).json({ message: 'Error adding shareholder', error: error.message });
  }
}
router.post('/:companyId', verifyAdminToken, createForCompany);
router.post('/company/:companyId', verifyAdminToken, createForCompany);

// ==============================
// UPDATE shareholder
// (keeps your existing path)  PUT /api/admin/shareholders/:shareholderId
// alias (clearer):            PUT /api/admin/shareholders/item/:shareholderId
// ==============================
async function updateShareholder(req, res) {
  try {
    const payload = normalizeBody(req.body);
    const updated = await Shareholder.findByIdAndUpdate(
      req.params.shareholderId,
      payload,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Shareholder not found' });

    res.status(200).json({ message: 'Shareholder updated', shareholder: updated });
  } catch (error) {
    console.error('PUT shareholder error:', error);
    res.status(500).json({ message: 'Error updating shareholder', error: error.message });
  }
}
router.put('/:shareholderId', verifyAdminToken, updateShareholder);
router.put('/item/:shareholderId', verifyAdminToken, updateShareholder);

// (optional) GET one shareholder (avoids conflicting with the "companyId" route)
router.get('/item/:shareholderId', verifyAdminToken, async (req, res) => {
  try {
    const s = await Shareholder.findById(req.params.shareholderId);
    if (!s) return res.status(404).json({ message: 'Shareholder not found' });
    res.status(200).json(s);
  } catch (error) {
    console.error('GET shareholder error:', error);
    res.status(500).json({ message: 'Error fetching shareholder', error: error.message });
  }
});

// ==============================
// DELETE shareholder (+ unlink from any company)
// (keeps your existing path)  DELETE /api/admin/shareholders/:shareholderId
// alias (clearer):            DELETE /api/admin/shareholders/item/:shareholderId
// ==============================
async function deleteShareholder(req, res) {
  try {
    const deleted = await Shareholder.findByIdAndDelete(req.params.shareholderId);
    if (!deleted) return res.status(404).json({ message: 'Shareholder not found' });

    await Company.updateMany(
      { shareholder: req.params.shareholderId },
      { $pull: { shareholder: req.params.shareholderId } }
    );

    res.status(200).json({ message: 'Shareholder deleted' });
  } catch (error) {
    console.error('DELETE shareholder error:', error);
    res.status(500).json({ message: 'Error deleting shareholder', error: error.message });
  }
}
router.delete('/:shareholderId', verifyAdminToken, deleteShareholder);
router.delete('/item/:shareholderId', verifyAdminToken, deleteShareholder);

module.exports = router;
