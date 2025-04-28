const mongoose = require('mongoose');

const ShareHolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String },
  email: { type: String },
  contact: { type: String },
  ordinaryShareNumber: { type: Number },
});

module.exports = mongoose.model('Shareholder', ShareHolderSchema);
