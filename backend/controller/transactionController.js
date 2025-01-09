const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Get all transactions
const getAllTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

// Add a new transaction
const addATransaction = async (req, res) => {
    try {
        const newTransaction = new Transaction({
            ...req.body,
        });

        await newTransaction.save();
        res.status(201).json({ message: 'Successfully added a transaction', newTransaction });
    } catch (error) {
        res.status(400).json({ message: 'Error adding transaction', error: error.message });
    }
};

// Get a single transaction by ID
const editATransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a transaction by ID
const updateATransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id, // Use id directly, not an object
            { ...req.body, date: new Date() }, // Updated data
            { new: true } // Return the updated document
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction updated successfully', updatedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a transaction by ID
const deleteATransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const deletedTransaction = await Transaction.findByIdAndDelete(id);

        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully', deletedTransaction });
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
};
