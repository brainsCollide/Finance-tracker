
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const transactionRoute = require("./routes/transactionRoutes");
const upcomingPaymentRoute = require("./routes/paymentRoute");
const budgetRoute = require("./routes/budgetRoutes");
const recurringRoute = require("./routes/recurringRoutes");
const goalRoutes = require("./routes/goalRoutes");

const connectDB = require("./config/db");

const app = express();

// Trust the first proxy, e.g. Render's reverse proxy.
app.set("trust proxy", 1);

// Connect to MongoDB.
connectDB();

// Allowed frontend origins.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://finance-tracker-frontend-five-eta.vercel.app",
  "https://finance-tracker-frontend-git-main-brainscollides-projects.vercel.app",
  "https://finance-tracker-frontend-leokeco0r-brainscollides-projects.vercel.app",
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/transactions", transactionRoute);
app.use("/payments", upcomingPaymentRoute);
app.use("/budgets", budgetRoute);
app.use("/recurring", recurringRoute);
app.use("/goals", goalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status < 500
      ? err.status
      : 500;

  if (statusCode >= 500) {
    console.error("[Server Error]", {
      method: req.method,
      path: req.path,
      error: err.name || "Error",
    });
  }

  return res.status(statusCode).json({
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
});

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
