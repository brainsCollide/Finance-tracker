const mongoose = require("mongoose");

const UpcomingPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  category: { type: String, enum: ["rent", "subscription", "loan", "other"], default: "other" },
  status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
});

module.exports = mongoose.model("UpcomingPayment", UpcomingPaymentSchema);