const mongoose = require("mongoose");
const Secretary = require("./Secretary");
const Shareholder = require("./Shareholder");
const Service = require("./Service");

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ssic: { type: String, required: true },
  address: { type: String, required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  secretary: [{ type: mongoose.Schema.Types.ObjectId, ref: "Secretary" }],
  shareholder: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shareholder" }],
  paidUpShareCapital: { type: Number },
  documents: [
    {
      filename: String,
      path: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  billing: [
    {
      description: String,
      amount: Number,
      paid: { type: Boolean, default: false },
    },
  ],
  deliverables: [
    { title: String, approved: { type: Boolean, default: false } },
  ],
});

module.exports = mongoose.model("Company", CompanySchema);
