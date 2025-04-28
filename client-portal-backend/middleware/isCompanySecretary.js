const Secretary = require("../models/Secretary");
const Company = require("../models/Company");

const isCompanySecretary = async (req, res, next) => {
  try {
    // Find secretary by ID
    const secretary = await Secretary.findById(req.params.id);

    if (!secretary) {
      return res.status(404).json({ error: "Secretary not found" });
    }

    // Check if the secretary is associated with the company
    const selectedCompany = req.header("selectedCompany");
    const company = await Company.findById(selectedCompany);
    if (!company || !company.secretary.includes(secretary._id)) {
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

module.exports = isCompanySecretary;
