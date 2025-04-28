const mongoose = require('mongoose');
const Client = require('./Client');

const TransactionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  creditAfterTransaction: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
