const express = require('express');
const {
    getAllTransaction,
    addATransaction,
    editATransaction,
    updateATransaction,
    deleteATransaction,
    getTransactionStats
} = require('../controller/transactionController');
const authenticate = require('../middleware/authenticate'); // Import your middleware

const router = express.Router();

// Protect all routes with the authenticate middleware

router.get('/stats',authenticate, getTransactionStats); // Get transaction statistics

router.get('/', authenticate,    getAllTransaction); // Get all transactions for the authenticated user
router.post('/',authenticate, addATransaction); // Add a transaction for the authenticated user
router.get('/:id', authenticate, editATransaction); // Get a specific transaction for the authenticated user
router.put('/:id', authenticate, updateATransaction); // Update a specific transaction
router.delete('/:id', authenticate, deleteATransaction); // Delete a specific transaction


module.exports = router;
