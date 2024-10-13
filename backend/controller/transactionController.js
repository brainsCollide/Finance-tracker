const Transaction = require('../models/Transaction');



const getAllTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions); // Return all transactions
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

        await newTransaction.save(); // Save to MongoDB
        res.status(201).json({ message: 'Successfully added a transaction', newTransaction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Edit (view) a transaction by ID
const editATransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findOne({ id });

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
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { id },
            { ...req.body, date: new Date() }, // Update data
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a transaction by ID
const deleteATransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTransaction = await Transaction.findOneAndDelete({ id });

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
    deleteATransaction
};