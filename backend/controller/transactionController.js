const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Joi = require('joi');

// ✅ Define Joi validation schemas
const createTransactionSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required'
  }),
  
  amount: Joi.number().positive().required().messages({
    'number.base': 'Amount must be a valid number',
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required'
  }),
  
  type: Joi.string().valid('income', 'expense').required().messages({
    'string.empty': 'Transaction type is required',
    'any.only': 'Type must be either "income" or "expense"',
    'any.required': 'Transaction type is required'
  }),
  
  category: Joi.string()
    .valid('work', 'grocery', 'entertainment', 'transport', 'health', 'education', 'other')
    .required()
    .messages({
      'string.empty': 'Category is required',
      'any.only': 'Invalid category. Choose from: work, grocery, entertainment, transport, health, education, other',
      'any.required': 'Category is required'
    }),
  
  date: Joi.date().max('now').messages({
    'date.base': 'Invalid date format',
    'date.max': 'Date cannot be in the future'
  })
});

const updateTransactionSchema = Joi.object({
  title: Joi.string().messages({
    'string.empty': 'Title cannot be empty'
  }),
  
  amount: Joi.number().positive().messages({
    'number.base': 'Amount must be a valid number',
    'number.positive': 'Amount must be greater than 0'
  }),
  
  type: Joi.string().valid('income', 'expense').messages({
    'any.only': 'Type must be either "income" or "expense"'
  }),
  
  category: Joi.string()
    .valid('work', 'grocery', 'entertainment', 'transport', 'health', 'education', 'other')
    .messages({
      'any.only': 'Invalid category. Choose from: work, grocery, entertainment, transport, health, education, other'
    }),
  
  date: Joi.date().max('now').messages({
    'date.base': 'Invalid date format',
    'date.max': 'Date cannot be in the future'
  })
}).min(1).messages({
  'object.min': 'At least one field is required for update'
});


const getTransactionStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1–12

        // Ambil transaksi tahun berjalan, lalu kelompokkan per bulan.
        const monthlyStats = await Transaction.aggregate([
            {
                $match: {
                    userId,
                    date: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: "$date" } },
                    totalIncome: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "income"] },
                                "$amount",
                                0,
                            ],
                        },
                    },
                    totalExpenses: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "expense"] },
                                "$amount",
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]);

        // Pastikan grafik selalu mendapat 12 bulan.
        const formattedStats = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            totalIncome: 0,
            totalExpenses: 0,
        }));

        monthlyStats.forEach((entry) => {
            const index = entry._id.month - 1;

            formattedStats[index] = {
                month: entry._id.month,
                totalIncome: entry.totalIncome || 0,
                totalExpenses: entry.totalExpenses || 0,
            };
        });

        // Statistik bulan yang sedang berjalan.
        const currentMonthStats = formattedStats[currentMonth - 1];

        // Akumulasi dari Januari sampai bulan berjalan.
        const yearToDateStats = formattedStats
            .slice(0, currentMonth)
            .reduce(
                (totals, month) => ({
                    income: totals.income + month.totalIncome,
                    expenses: totals.expenses + month.totalExpenses,
                }),
                { income: 0, expenses: 0 }
            );

        return res.json({
            // Untuk kartu dashboard bulan berjalan.
            income: currentMonthStats.totalIncome,
            expenses: currentMonthStats.totalExpenses,

            // Untuk grafik tahunan.
            monthlyStats: formattedStats,

            // Untuk ringkasan kumulatif.
            yearToDate: {
                income: yearToDateStats.income,
                expenses: yearToDateStats.expenses,
                netCashflow:
                    yearToDateStats.income - yearToDateStats.expenses,
            },

            // Metadata periode agar frontend tahu cakupan datanya.
            period: {
                year: currentYear,
                month: currentMonth,
            },
        });
    } catch (error) {
        console.error(
            "Error fetching transaction stats:",
            error.message
        );

        return res.status(500).json({
            message: "Error fetching transaction stats",
            error: error.message,
        });
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
        // ✅ Validate request body
        const { error, value } = createTransactionSchema.validate(req.body, { 
            abortEarly: false // ✅ This is important to collect all errors
        });
        
        if (error) {
            // ✅ Format errors by field for easier frontend handling
            const errors = {};
            error.details.forEach((detail) => {
                errors[detail.path[0]] = detail.message;
            });
            
            return res.status(400).json({ 
                message: "Validation failed", 
                errors: errors 
            });
        }

        const { title, amount, type, category, date } = value; // Use validated data
        const userId = req.user.userId;

        // ✅ Create new transaction with validated data
        const newTransaction = new Transaction({
            userId,
            title,
            amount,
            type,
            category,
            date: date || new Date(),
        });

        // Update user document to reference this transaction
        await User.findByIdAndUpdate(
            userId,
            { $push: { transactions: newTransaction._id } },
            { new: true }
        );

        await newTransaction.save();
        
        return res.status(201).json({ 
            message: "Transaction added successfully", 
            transaction: newTransaction 
        });
    } catch (error) {
        console.error("Error adding transaction:", error.message);
        return res.status(500).json({ 
            message: "Server error while adding transaction",
            error: error.message
        });
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
        // ✅ Validate request body
        const { error, value } = updateTransactionSchema.validate(req.body, { 
            abortEarly: false 
        });
        
        if (error) {
            const errors = {};
            error.details.forEach((detail) => {
                errors[detail.path[0]] = detail.message;
            });
            
            return res.status(400).json({ 
                message: "Validation failed", 
                errors: errors 
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // ✅ Use validated data for update
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: id, userId: req.user.userId }, // Ensure user owns the transaction
            { ...value, date: value.date || new Date() }, 
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        res.json({ message: 'Transaction updated successfully', transaction: updatedTransaction });
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

        // ✅ Also remove reference from user document
        await User.findByIdAndUpdate(
            req.user.userId,
            { $pull: { transactions: id } }
        );

        res.json({ message: 'Transaction deleted successfully', transaction: deletedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllTransaction,
    addATransaction,
    editATransaction,
    updateATransaction,
    deleteATransaction,
    getTransactionStats,
};
