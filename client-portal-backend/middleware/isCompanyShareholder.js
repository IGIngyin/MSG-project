const Shareholder = require("../models/Shareholder");
const Company = require("../models/Company");

const isCompanyShareholder = async (req, res, next) => {
  try {
    // Find shareholder by ID
    const shareholder = await Shareholder.findById(req.params.id);

    if (!shareholder) {
      return res.status(404).json({ error: "Shareholder not found" });
    }

    // Check if the shareholder is associated with the company
    const selectedCompany = req.header("selectedCompany");
    const company = await Company.findById(selectedCompany);
    if (!company || !company.shareholder.includes(shareholder._id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access this shareholder" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify authorization" });
  }
};

module.exports = isCompanyShareholder;
