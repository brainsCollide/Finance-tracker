const RecurringPayment = require("../models/RecurringPayment");

// GET all recurring payments (per user)
exports.getRecurringPayments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const payments = await RecurringPayment.find({ userId }).sort({
      nextDue: 1,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE recurring payment
exports.createRecurringPayment = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { name, amount, frequency, nextDue, category } = req.body;

    const newPayment = await RecurringPayment.create({
      userId,
      name,
      amount,
      frequency,
      nextDue,
      category,
    });

    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
exports.deleteRecurringPayment = async (req, res) => {
  try {
   const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await RecurringPayment.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
exports.updateRecurringPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const updated = await RecurringPayment.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};