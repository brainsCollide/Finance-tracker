const mongoose = require("mongoose");

const recurringPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },

    nextDue: {
      type: Date,
      required: true,
    },

    category: {
      type: String,
      enum: ["subscription", "rent", "utility", "loan", "other"],
      default: "subscription",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

recurringPaymentSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model("RecurringPayment", recurringPaymentSchema);