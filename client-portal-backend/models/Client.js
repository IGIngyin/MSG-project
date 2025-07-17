const mongoose = require("mongoose");
const Company = require("./Company");

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  credits: { type: Number, default: 0 },
  company: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
});

module.exports = mongoose.model("Client", ClientSchema);