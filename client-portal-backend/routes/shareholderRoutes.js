// Import necessary modules
require("dotenv").config();
const express = require("express");
const Company = require("../models/Company");
const Shareholder = require("../models/Shareholder");
const verifyToken = require("../middleware/verifyToken");
const isCompanyShareholder = require("../middleware/isCompanyShareholder");

const router = express.Router();

//CREATE NEW SHAREHOLDER AND ASSIGN TO A NEW COMPANY
/**
 * @swagger
 * /api/shareholders/shareholders:
 *   post:
 *     description: Create a new shareholder and assign them to a company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the shareholder
 *                 example: "Jane Smith"
 *               id:
 *                 type: string
 *                 description: The ID of the shareholder
 *                 example: "12345"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the shareholder
 *                 example: "janesmith@example.com"
 *               contact:
 *                 type: string
 *                 description: The contact number of the shareholder
 *                 example: "+1234567890"
 *               ordinaryShareNumber:
 *                 type: number
 *                 description: The ordinary share number of the shareholder
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Shareholder created successfully
 *       400:
 *         description: Failed to create shareholder
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.post("/shareholders", verifyToken, async (req, res) => {
  const { name, id, email, contact, ordinaryShareNumber } = req.body;

  try {
    const newShareholder = new Shareholder({
      name,
      id,
      email,
      contact,
      ordinaryShareNumber,
    });

    const savedShareholder = await newShareholder.save();

    // Add shareholder to company's shareholder list
    const selectedCompany = req.header("selectedCompany");

    const company = await Company.findById(selectedCompany).populate(
      "shareholder"
    );
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    company.shareholder.push(savedShareholder._id);
    await company.save();

    res.status(201).json(savedShareholder);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create shareholder" });
  }
});

//GET ALL SHAREHOLDER FOR THE SELECTED COMPANY
/**
 * @swagger
 * /api/shareholders/shareholders:
 *   get:
 *     description: Get all shareholders for the selected company
 *     responses:
 *       200:
 *         description: List of shareholders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the shareholder
 *                     example: "Jane Smith"
 *                   id:
 *                     type: string
 *                     description: The ID of the shareholder
 *                     example: "12345"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The email address of the shareholder
 *                     example: "janesmith@example.com"
 *                   contact:
 *                     type: string
 *                     description: The contact number of the shareholder
 *                     example: "+1234567890"
 *                   ordinaryShareNumber:
 *                     type: number
 *                     description: The ordinary share number of the shareholder
 *                     example: 1500
 *       404:
 *         description: Company not found
 *       500:
 *         description: Failed to retrieve shareholders
 */

router.get("/shareholders", verifyToken, async (req, res) => {
  try {
    const selectedCompany = req.header("selectedCompany");

    const company = await Company.findById(selectedCompany).populate(
      "shareholder"
    );
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json(company.shareholder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve shareholders" });
  }
});

//GET A SPECIFIC SHAREHOLDER BY ID
/**
 * @swagger
 * /api/shareholders/shareholders/{id}:
 *   get:
 *     description: Get a shareholder by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the shareholder
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shareholder details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the shareholder
 *                     example: "Jane Smith"
 *                   id:
 *                     type: string
 *                     description: The ID of the shareholder
 *                     example: "12345"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The email address of the shareholder
 *                     example: "janesmith@example.com"
 *                   contact:
 *                     type: string
 *                     description: The contact number of the shareholder
 *                     example: "+1234567890"
 *                   ordinaryShareNumber:
 *                     type: number
 *                     description: The ordinary share number of the shareholder
 *                     example: 1500
 *       404:
 *         description: Shareholder not found
 *       500:
 *         description: Failed to retrieve shareholder
 */
router.get(
  "/shareholders/:id",
  verifyToken,
  isCompanyShareholder,
  async (req, res) => {
    try {
      const shareholder = await Shareholder.findById(req.params.id);
      if (!shareholder) {
        return res.status(404).json({ error: "Shareholder not found" });
      }

      res.status(200).json(shareholder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve shareholder" });
    }
  }
);

//UPDATE A SHAREHOLDER BY ID
/**
 * @swagger
 * /api/shareholders/shareholders/{id}:
 *   put:
 *     description: Update a shareholder by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the shareholder
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
 *                 description: The name of the shareholder
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the shareholder
 *                 example: "janesmith@example.com"
 *               contact:
 *                 type: string
 *                 description: The contact number of the shareholder
 *                 example: "+1234567890"
 *               ordinaryShareNumber:
 *                 type: number
 *                 description: The ordinary share number of the shareholder
 *                 example: 1500
 *     responses:
 *       200:
 *         description: Shareholder updated successfully
 *       404:
 *         description: Shareholder not found
 *       400:
 *         description: Failed to update shareholder
 *       500:
 *         description: Internal server error
 */
router.put(
  "/shareholders/:id",
  verifyToken,
  isCompanyShareholder,
  async (req, res) => {
    const { name, email, contact, ordinaryShareNumber } = req.body;

    try {
      const updatedShareholder = await Shareholder.findByIdAndUpdate(
        req.params.id,
        { name, email, contact, ordinaryShareNumber },
        { new: true }
      );

      if (!updatedShareholder) {
        return res.status(404).json({ error: "Shareholder not found" });
      }

      res.status(200).json(updatedShareholder);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to update shareholder" });
    }
  }
);

//DELETE A SHAREHOLDER BY ID
/**
 * @swagger
 * /api/shareholders/shareholders/{id}:
 *   delete:
 *     description: Delete a shareholder by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the shareholder
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shareholder deleted successfully
 *       404:
 *         description: Shareholder not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/shareholders/:id",
  verifyToken,
  isCompanyShareholder,
  async (req, res) => {
    try {
      const deletedShareholder = await Shareholder.findByIdAndDelete(
        req.params.id
      );
      if (!deletedShareholder) {
        return res.status(404).json({ error: "Shareholder not found" });
      }

      // Remove the shareholder from the company
      await Company.updateMany(
        { shareholder: req.params.id },
        { $pull: { shareholder: req.params.id } }
      );

      res.status(200).json({ message: "Shareholder deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete shareholder" });
    }
  }
);

module.exports = router;
