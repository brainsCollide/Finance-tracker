const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true }, // "Food", "Transportation", dll
  limit: { type: Number, required: true },
  period: { type: String, default: 'monthly' }, // monthly, weekly, dll
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;