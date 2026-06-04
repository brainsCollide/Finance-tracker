const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  targetAmount: {
    type: Number,
    required: true,
  },

  currentAmount: {
    type: Number,
    default: 0,
  },

  deadline: {
    type: Date,
  },

  icon: {
    type: String,
    default: "🎯",
  },

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Goal", goalSchema);