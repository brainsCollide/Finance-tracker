const express = require("express");
const router = express.Router();

const {
  getRecurringPayments,
  createRecurringPayment,
  deleteRecurringPayment,
  updateRecurringPayment,
} = require("../controller/recurringController");

const authMiddleware = require("../middleware/authenticate");

// all routes protected
router.get("/", authMiddleware, getRecurringPayments);
router.post("/", authMiddleware, createRecurringPayment);
router.delete("/:id", authMiddleware, deleteRecurringPayment);
router.put("/:id", authMiddleware, updateRecurringPayment);

module.exports = router;