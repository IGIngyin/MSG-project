const mongoose = require('mongoose');

const SecretarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String },
  email: { type: String },
  contact: { type: String },
});

module.exports = mongoose.model('Secretary', SecretarySchema);
