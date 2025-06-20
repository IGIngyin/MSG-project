// routes/documentRoutes.js
const express = require("express");
const multer = require("multer");
const Company = require("../models/Company");
const verifyToken = require("../middleware/verifyToken");
const isClientCompany = require("../middleware/isClientCompany");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload a document to a company
router.post(
  "/upload",
  verifyToken,
  isClientCompany,
  upload.single("file"),
  async (req, res) => {
    try {
      const selectedCompany = req.header("selectedCompany");
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const company = await Company.findById(selectedCompany);
      if (!company) return res.status(404).json({ error: "Company not found" });

      company.documents.push({
        filename: req.file.originalname,
        path: req.file.buffer.toString("base64"),
        uploadedAt: new Date(),
      });

      await company.save();
      res.status(200).json({ message: "File uploaded", company });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// Delete a document by index
router.delete(
  "/:id/documents/:index",
  verifyToken,
  isClientCompany,
  async (req, res) => {
    try {
      const { id, index } = req.params;
      const company = await Company.findById(id);
      if (!company) return res.status(404).json({ error: "Company not found" });

      if (index < 0 || index >= company.documents.length) {
        return res.status(400).json({ error: "Invalid document index" });
      }

      company.documents.splice(index, 1);
      await company.save();

      res.status(200).json({ message: "Document deleted." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete document" });
    }
  }
);

module.exports = router;