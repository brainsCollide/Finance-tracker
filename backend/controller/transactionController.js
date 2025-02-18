const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const getTransactionStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        console.log("Fetching stats for user:", userId);

        // ✅ Aggregate transactions and ensure `_id.month` is extracted properly
        const monthlyStats = await Transaction.aggregate([
            { 
                $match: { 
                    userId: userId,
                    date: { 
                        $gte: new Date(new Date().getFullYear(), 0, 1), // Start of the year
                        $lte: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59) // End of the year
                    } 
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$date" } }, // ✅ Extract only month number (1-12)
                    totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
                }
            },
            { $sort: { "_id.month": 1 } } // ✅ Ensure correct month order
        ]);

        // ✅ Transform response format to match frontend expectation
        const formattedStats = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1, // ✅ Convert from `_id.month` to `month`
            totalIncome: 0,
            totalExpenses: 0,
        }));

        // ✅ Merge aggregated results into formattedStats
        monthlyStats.forEach((entry) => {
            const monthIndex = entry._id.month - 1; // Convert (1-12) to (0-11) index
            formattedStats[monthIndex] = {
                month: entry._id.month, // ✅ Now directly mapped as `month`
                totalIncome: entry.totalIncome || 0,
                totalExpenses: entry.totalExpenses || 0,
            };
        });

        console.log("✅ Final Monthly Stats:", formattedStats);

        res.json({
            income: monthlyStats.reduce((sum, m) => sum + (m.totalIncome || 0), 0),
            expenses: monthlyStats.reduce((sum, m) => sum + (m.totalExpenses || 0), 0),
            monthlyStats: formattedStats // ✅ Now formatted correctly
        });
    } catch (error) {
        console.error("❌ Error fetching transaction stats:", error.message);
        res.status(500).json({ message: "Error fetching transaction stats", error: error.message });
    }
};

// Get all transactions (Only for logged-in user)
const getAllTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

// Add a new transaction (Only for logged-in user)
const addATransaction = async (req, res, next) => {
    try {
        const { title, amount, type, category, date } = req.body;
        const userId = req.user.userId;

        // ✅ Ensure type is valid
        const validTypes = ["income", "expense"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid type. Choose 'income' or 'expense'." });
        }

        // ✅ Ensure category is valid
        const validCategories = ["work", "grocery", "entertainment", "transport", "health", "education", "other"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category. Choose from: " + validCategories.join(", ") });
        }

        const transactionDate = date ? new Date(date) : new Date();

        const newTransaction = new Transaction({
            userId: req.user.userId,
            title,
            amount,
            type,
            category,
            date: transactionDate, 
        });

        await User.findByIdAndUpdate(
            userId,
            { $push: { transactions: newTransaction._id } }, // ✅ Ensure transactions are stored
            { new: true }
        );

        await newTransaction.save();
        return res.status(201).json({ message: "Transaction added successfully", newTransaction });
    } catch (error) {
        console.error("Error adding transaction:", error.message);
        next(error);
    }
};

// Get a single transaction by ID (Only if it belongs to the logged-in user)
const editATransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const transaction = await Transaction.findOne({ _id: id, userId: req.user.userId });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a transaction by ID (Only if it belongs to the logged-in user)
const updateATransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: id, userId: req.user.userId }, // Ensure user owns the transaction
            { ...req.body, date: new Date() }, 
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        res.json({ message: 'Transaction updated successfully', updatedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a transaction by ID (Only if it belongs to the logged-in user)
const deleteATransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user.userId });

        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        res.json({ message: 'Transaction deleted successfully', deletedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get total income and expenses (Only for logged-in user)


module.exports = {
    getAllTransaction,
    addATransaction,
    editATransaction,
    updateATransaction,
    deleteATransaction,
    getTransactionStats,
};