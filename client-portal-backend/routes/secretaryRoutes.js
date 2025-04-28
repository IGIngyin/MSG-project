require("dotenv").config();
const express = require("express");
const Company = require("../models/Company");
const Secretary = require("../models/Secretary");
const verifyToken = require("../middleware/verifyToken");
const isCompanySecretary = require("../middleware/isCompanySecretary");

const router = express.Router();

//CREATE NEW SECRETARY AND ASSIGN TO A NEW COMPANY
/**
 * @swagger
 * /api/secretaries/secretaries:
 *   post:
 *     description: Create a new secretary and assign them to a company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the secretary
 *                 example: "Jane Smith"
 *               id:
 *                 type: string
 *                 description: The ID of the secretary
 *                 example: "12345"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the secretary
 *                 example: "janesmith@example.com"
 *               contact:
 *                 type: string
 *                 description: The contact number of the secretary
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Secretary created successfully
 *       400:
 *         description: Failed to create secretary
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.post("/secretaries", verifyToken, async (req, res) => {
  const { name, id, email, contact } = req.body;

  try {
    const newSecretary = new Secretary({
      name,
      id,
      email,
      contact,
    });

    const savedSecretary = await newSecretary.save();

    // Add secretary to company's secretary list
    const selectedCompany = req.header("selectedCompany");
    const company = await Company.findById(selectedCompany).populate(
      "secretary"
    );
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    company.secretary.push(savedSecretary._id);
    await company.save();

    res.status(201).json(savedSecretary);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create secretary" });
  }
});

//GET ALL SECRETARIES FOR THE SELECTED COMPANY
/**
 * @swagger
 * /api/secretaries/secretaries:
 *   get:
 *     description: Get all secretaries for the selected company
 *     responses:
 *       200:
 *         description: List of secretaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the secretary
 *                     example: "Jane Smith"
 *                   id:
 *                     type: string
 *                     description: The ID of the secretary
 *                     example: "12345"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The email address of the secretary
 *                     example: "janesmith@example.com"
 *                   contact:
 *                     type: string
 *                     description: The contact number of the secretary
 *                     example: "+1234567890"
 *       404:
 *         description: Company not found
 *       500:
 *         description: Failed to retrieve secretaries
 */
router.get("/secretaries", verifyToken, async (req, res) => {
  try {
    const selectedCompany = req.header("selectedCompany");

    const company = await Company.findById(selectedCompany).populate(
      "secretary"
    );
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json(company.secretary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve secretaries" });
  }
});

//GET A SPECIFIC SECRETARY BY ID
/**
 * @swagger
 * /api/secretaries/secretaries/{id}:
 *   get:
 *     description: Get a secretary by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the secretary
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Secretary details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the secretary
 *                     example: "Jane Smith"
 *                   id:
 *                     type: string
 *                     description: The ID of the secretary
 *                     example: "12345"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The email address of the secretary
 *                     example: "janesmith@example.com"
 *                   contact:
 *                     type: string
 *                     description: The contact number of the secretary
 *                     example: "+1234567890"
 *       404:
 *         description: Secretary not found
 *       500:
 *         description: Failed to retrieve secretary
 */
router.get(
  "/secretaries/:id",
  verifyToken,
  isCompanySecretary,
  async (req, res) => {
    try {
      const secretary = await Secretary.findById(req.params.id);
      if (!secretary) {
        return res.status(404).json({ error: "Secretary not found" });
      }

      res.status(200).json(secretary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve secretary" });
    }
  }
);

//UPDATE A SECRETARY BY ID
/**
 * @swagger
 * /api/secretaries/secretaries/{id}:
 *   put:
 *     description: Update a secretary by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the secretary
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
 *                 description: The name of the secretary
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the secretary
 *                 example: "janesmith@example.com"
 *               contact:
 *                 type: string
 *                 description: The contact number of the secretary
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Secretary updated successfully
 *       404:
 *         description: Secretary not found
 *       400:
 *         description: Failed to update secretary
 *       500:
 *         description: Internal server error
 */
router.put(
  "/secretaries/:id",
  verifyToken,
  isCompanySecretary,
  async (req, res) => {
    const { name, email, contact } = req.body;

    try {
      const updatedSecretary = await Secretary.findByIdAndUpdate(
        req.params.id,
        { name, email, contact },
        { new: true }
      );

      if (!updatedSecretary) {
        return res.status(404).json({ error: "Secretary not found" });
      }

      res.status(200).json(updatedSecretary);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to update secretary" });
    }
  }
);

//DELETE A SECRETARY BY ID AND REMOVE FROM COMPANY
/**
 * @swagger
 * /api/secretaries/secretaries/{id}:
 *   delete:
 *     description: Delete a secretary by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the secretary
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Secretary deleted successfully
 *       404:
 *         description: Secretary not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/secretaries/:id",
  verifyToken,
  isCompanySecretary,
  async (req, res) => {
    try {
      const deletedSecretary = await Secretary.findByIdAndDelete(req.params.id);
      if (!deletedSecretary) {
        return res.status(404).json({ error: "Secretary not found" });
      }

      // Remove the secretary from the company
      await Company.updateMany(
        { secretary: req.params.id },
        { $pull: { secretary: req.params.id } }
      );

      res.status(200).json({ message: "Secretary deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete secretary" });
    }
  }
);

module.exports = router;
