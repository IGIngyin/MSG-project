const mongoose = require("mongoose");
const Company = require("./Company");

const ClientSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 0 },
  company: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],

  otp: {
    code: { type: String },
    expiresAt: { type: Date },
  },

  isVerified: { type: Boolean, default: false },

  // ✅ Add role field here
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client',  // All users are clients by default unless specified
  },
});

module.exports = mongoose.model("Client", ClientSchema);
