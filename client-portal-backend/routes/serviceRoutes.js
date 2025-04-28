require("dotenv").config();
const express = require("express");
const Service = require("../models/Service");
const Client = require("../models/Client");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// GET ALL SERVICES
/**
 * @swagger
 * /api/service/services:
 *   get:
 *     description: Get all available services
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 */
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET A SINGLE SERVICE BY ID
/**
 * @swagger
 * /api/service/services/{serviceId}:
 *   get:
 *     description: Get a specific service by its ID
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
router.get("/services/:serviceId", async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE A SERVICE
/**
 * @swagger
 * /api/service/services:
 *   post:
 *     description: Create a new service
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
 *               category:
 *                 type: string
 *               cost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Service created successfully
 */
router.post("/services", async (req, res) => {
  try {
    const { name, description, category, cost } = req.body;

    if (!name || !description || !category || cost === undefined) {
      return res
        .status(400)
        .json({ message: "Name, description, category and cost are required" });
    }

    const newService = new Service({
      name,
      description,
      category,
      cost,
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE A SERVICE
/**
 * @swagger
 * /api/service/services/{serviceId}:
 *   put:
 *     description: Update an existing service
 *     parameters:
 *       - in: path
 *         name: serviceId
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
 *               category:
 *                 type: string
 *               cost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Invalid input or service not found
 */
router.put("/services/:serviceId", async (req, res) => {
  try {
    const { name, description, category, cost } = req.body;

    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.category = category || service.category;
    service.cost = cost !== undefined ? cost : service.cost;

    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE A SERVICE
/**
 * @swagger
 * /api/service/services/{serviceId}:
 *   delete:
 *     description: Delete a service by its ID
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
router.delete("/services/:serviceId", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENGAGE A SERVICE FOR THE AUTHENTICATED CLIENT
/**
 * @swagger
 * /api/service/services/engage/{serviceId}:
 *   post:
 *     description: Engage a service for a client
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service engaged successfully
 *       400:
 *         description: Insufficient credits
 *       404:
 *         description: Client or service not found
 */
router.post("/services/engage/:serviceId", verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.user.id);
    const service = await Service.findById(req.params.serviceId);

    if (!client || !service) {
      return res.status(404).json({ message: "Client or service not found" });
    }

    if (client.credits < service.cost) {
      return res
        .status(400)
        .json({ message: "Insufficient credits for this service" });
    }

    // Deduct credits from the client
    client.credits -= service.cost;
    // Add the service to the client's list of services
    client.services.push({ name: service.name });

    await client.save();

    res
      .status(200)
      .json({
        message: "Service engaged successfully",
        credits: client.credits,
        cost: service.cost,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
