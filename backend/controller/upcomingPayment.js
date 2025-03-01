const UpcomingPayment = require("../models/UpcomingPayment");

// 📌 Get all upcoming payments for the logged-in user
exports.getUpcomingPayments = async (req, res) => {
  try {
    const payments = await UpcomingPayment.find({ userId: req.user.userId }).sort("dueDate");
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming payments", error: error.message });
  }
};

// 📌 Add a new upcoming payment
exports.addUpcomingPayment = async (req, res) => {
  try {
    const { title, amount, dueDate, category } = req.body;
    const newPayment = new UpcomingPayment({ userId: req.user.userId, title, amount, dueDate, category });
    await newPayment.save();
    res.status(201).json({ message: "Upcoming payment added", newPayment });
  } catch (error) {
    res.status(500).json({ message: "Error adding payment", error: error.message });
  }
};

// 📌 Mark an upcoming payment as "paid"
exports.markPaymentAsPaid = async (req, res) => {
    try {
      const payment = await UpcomingPayment.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });
  
      if (!payment) return res.status(404).json({ message: "Payment not found" });
  
      res.json({ message: "Payment marked as paid and deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting paid payment", error: error.message });
    }
  };

// 📌 Delete an upcoming payment
exports.deleteUpcomingPayment = async (req, res) => {
  try {
    const payment = await UpcomingPayment.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting payment", error: error.message });
  }
};