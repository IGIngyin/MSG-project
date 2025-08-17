const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricing: {
    monthly: { type: Number, required: true },
    yearly: { type: Number } // optional
  }
});

module.exports = mongoose.model("Service", serviceSchema);
