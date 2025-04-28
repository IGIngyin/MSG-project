const Company = require("../models/Company");
const Client = require("../models/Client");

const isClientCompany = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user.id);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Find company by ID
    const selectedCompany = req.header("selectedCompany");

    const company = await Company.findById(selectedCompany);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Check if the company is associated with the client
    if (!client.company.includes(company._id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access this company" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify authorization" });
  }
};

module.exports = isClientCompany;
