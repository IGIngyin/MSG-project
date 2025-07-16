const express = require("express");
const router = express.Router();
const multer = require("multer");
const Company = require("../models/Company");
const { verifyAdminToken } = require("../middleware/authmiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin Get All Documents of a Company
// ==============================
router.get("/:companyId", verifyAdminToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ documents: company.documents });
  } catch (error) {
    console.error("Fetch documents error:", error);
    res.status(500).json({ message: "Failed to retrieve documents", error: error.message });
  }
});

// ==============================
// Admin Upload a Document to a Company
// ==============================
router.post("/:companyId", verifyAdminToken, upload.single("file"), async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    company.documents.push({
      filename: req.file.originalname,
      path: req.file.buffer.toString("base64"),
      uploadedAt: new Date(),
    });

    await company.save();

    res.status(200).json({ message: "Document uploaded successfully", document: req.file.originalname });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to upload document", error: error.message });
  }
});

// ==============================
// Admin Delete a Document by Index
// ==============================
router.delete("/:companyId/:index", verifyAdminToken, async (req, res) => {
  try {
    const { companyId, index } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= company.documents.length) {
      return res.status(400).json({ message: "Invalid document index" });
    }

    const removed = company.documents.splice(idx, 1);
    await company.save();

    res.status(200).json({ message: "Document deleted", removed });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete document", error: error.message });
  }
});

module.exports = router;
