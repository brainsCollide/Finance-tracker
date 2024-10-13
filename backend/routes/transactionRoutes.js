const express = require('express');
const {
    getAllTransaction,
    addATransaction,
    editATransaction,
    updateATransaction,
    deleteATransaction,
} = require('../controller/transactionController');

const router = express.Router();


router.get('/', getAllTransaction);
router.post('/', addATransaction);
router.get('/:id', editATransaction);
router.put('/:id', updateATransaction);
router.delete('/:id', deleteATransaction);


module.exports = router;