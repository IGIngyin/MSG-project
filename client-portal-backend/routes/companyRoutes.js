require("dotenv").config();
const express = require("express");
const Client = require("../models/Client");
const Company = require("../models/Company");
const verifyToken = require("../middleware/verifyToken");
const isClientCompany = require("../middleware/isClientCompany");

// Set up Multer
const multer = require("multer");
const storage = multer.memoryStorage(); // File stored in buffer (MongoDB will handle storage)
const upload = multer({ storage });

const router = express.Router();

// CREATE A NEW COMPANY  AND ASSIGN TO A NEW CILENT
/**
 * @swagger
 * /api/companies/companies:
 *   post:
 *     description: Create a new company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the company
 *               description:
 *                 type: string
 *                 description: The company description
 *               ssic:
 *                 type: string
 *                 description: SSIC code
 *               address:
 *                 type: string
 *                 description: The company address
 *               paidUpShareCapital:
 *                 type: number
 *                 description: The company paid up share capital
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Failed to create company
 *       500:
 *         description: Internal server error
 */
router.post("/companies", verifyToken, async (req, res) => {
  try {
    const { name, description, ssic, address, paidUpShareCapital } = req.body;
    const newCompany = new Company({
      name,
      description,
      ssic,
      address,
      paidUpShareCapital,
    });
    const savedCompany = await newCompany.save();

    // Add company to client's company list
    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    // Check if savedCompany has a valid ID before adding it to client
    if (!savedCompany || !savedCompany._id) {
      throw new Error("Invalid company ID");
    }
    client.company.push(savedCompany._id);
    await client.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create company" });
  }
});

// GET ALL COMPANIES
/**
 * @swagger
 * /api/companies/companies:
 *   get:
 *     description: Get all companies
 *     responses:
 *       200:
 *         description: List of companies
 *       500:
 *         description: Failed to retrieve companies
 */
router.get("/companies", verifyToken, async (req, res) => {
  try {
    const companies = await Company.find().populate(
      "secretary shareholder services"
    );
    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve companies" });
  }
});

// GET A COMPANY BY ID
/**
 * @swagger
 * /api/companies/companies/{id}:
 *   get:
 *     description: Get a company by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 *       500:
 *         description: Failed to retrieve company
 */
router.get("/companies/:id", verifyToken, isClientCompany, async (req, res) => {
  try {
    const selectedCompany = req.header("selectedCompany");
    const company = await Company.findById(selectedCompany).populate(
      "secretary shareholder services"
    );

    if (!company) return res.status(404).json({ error: "Company not found" });
    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve company" });
  }
});

// UPDATE A COMPANY
/**
 * @swagger
 * /api/companies/companies/{id}:
 *   put:
 *     description: Update a company
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               ssic:
 *                 type: string
 *               address:
 *                 type: string
 *               paidUpShareCapital:
 *                 type: number
 *                 description: The company paid up share capital
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Company not found
 *       400:
 *         description: Failed to update company
 */
router.put("/companies/:id", verifyToken, isClientCompany, async (req, res) => {
  try {
    const { name, description, ssic, address, paidUpShareCapital } = req.body;
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, description, ssic, address, paidUpShareCapital },
      { new: true }
    );

    if (!updatedCompany)
      return res.status(404).json({ error: "Company not found" });

    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to update company" });
  }
});

/**
 * @swagger
 * /api/companies/companies/{id}:
 *   delete:
 *     description: Delete a company by ID and remove it from associated clients
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *       404:
 *         description: Company not found
 *       500:
 *         description: Failed to delete company
 */
router.delete(
  "/companies/:id",
  verifyToken,
  isClientCompany,
  async (req, res) => {
    try {
      // 1. Find the company to delete
      const companyId = req.params.id;
      const deletedCompany = await Company.findByIdAndDelete(companyId);

      if (!deletedCompany) {
        return res.status(404).json({ error: "Company not found" });
      }

      // 2. Remove company from all clients
      await Client.updateMany(
        { company: companyId }, // Find clients who have this company ID
        { $pull: { company: companyId } } // Remove the company ID from their company array
      );

      // 3. Send success response
      res.status(200).json({
        message: "Company deleted successfully and removed from clients",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete company" });
    }
  }
);

// UPLOAD FILE AND STORE IN COMPANY DOCUMENTS
/**
 * @swagger
 * /api/companies/companies/upload:
 *   post:
 *     summary: Upload a file and store it in the company's documents
 *     description: Uploads a file and associates it with a company by storing it in the documents array.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 company:
 *                   type: object
 *                   description: The updated company document
 *       400:
 *         description: No file uploaded
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */

router.post(
  "/companies/upload",
  verifyToken,
  isClientCompany,
  upload.single("file"),
  async (req, res) => {
    try {
      const selectedCompany = req.header("selectedCompany");
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const company = await Company.findById(selectedCompany);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Store file details in the company's documents array
      company.documents.push({
        filename: req.file.originalname,
        path: req.file.buffer.toString("base64"), // Convert to Base64 for MongoDB storage
        uploadedAt: new Date(),
      });

      // Save the updated company document
      await company.save();

      res.status(200).json({ message: "File uploaded successfully", company });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "File upload failed" });
    }
  }
);

module.exports = router;
