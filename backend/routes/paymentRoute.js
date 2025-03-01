const express = require("express");
const { getUpcomingPayments, addUpcomingPayment, markPaymentAsPaid, deleteUpcomingPayment } = require("../controller/upcomingPayment");
const authMiddleware = require("../middleware/authenticate");

const router = express.Router();

// 📌 Routes for Upcoming Payments
router.get("/", authMiddleware, getUpcomingPayments);
router.post("/", authMiddleware, addUpcomingPayment);
router.put("/:id/mark-paid", authMiddleware, markPaymentAsPaid);
router.delete("/:id", authMiddleware, deleteUpcomingPayment);

module.exports = router;