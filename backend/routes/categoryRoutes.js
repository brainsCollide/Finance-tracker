const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  getCategoryUsage,
  deleteCategory,
} = require('../controller/categoryController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.route('/').get(getCategories).post(createCategory);

// /:id/usage harus di atas /:id
router.get('/:id/usage', getCategoryUsage);

router.route('/:id').put(updateCategory).delete(deleteCategory);

module.exports = router;t