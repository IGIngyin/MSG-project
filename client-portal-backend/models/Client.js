const mongoose = require("mongoose");
const Company = require("./Company");

const ClientSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 0 },
  company: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
});

module.exports = mongoose.model("Client", ClientSchema);
