
const mongoose = require("mongoose");
const RecurringPayment = require("../models/RecurringPayment");

const VALID_FREQUENCIES = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

const VALID_CATEGORIES = [
  "subscription",
  "rent",
  "utility",
  "loan",
  "other",
];

const ALLOWED_FIELDS = [
  "name",
  "amount",
  "frequency",
  "nextDue",
  "category",
];

// Validate authenticated user ID.
const getAuthenticatedUserId = (req) => {
  const userId = req.user?.userId;

  if (
    !userId ||
    !mongoose.Types.ObjectId.isValid(String(userId))
  ) {
    return null;
  }

  return new mongoose.Types.ObjectId(String(userId));
};

// Validate recurring payment ID.
const isValidPaymentId = (id) =>
  typeof id === "string" &&
  mongoose.Types.ObjectId.isValid(id);

// Validate and normalize input fields.
const validatePaymentFields = (body, { partial = false } = {}) => {
  const updates = {};
  const errors = [];

  for (const field of ALLOWED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      continue;
    }

    const value = body[field];

    switch (field) {
      case "name": {
        if (typeof value !== "string" || !value.trim()) {
          errors.push("Name must be a non-empty string.");
        } else if (value.trim().length > 100) {
          errors.push("Name must not exceed 100 characters.");
        } else {
          updates.name = value.trim();
        }
        break;
      }

      case "amount": {
        if (
          value === "" ||
          value === null ||
          typeof value === "boolean" ||
          !Number.isFinite(Number(value)) ||
          Number(value) < 0
        ) {
          errors.push("Amount must be a valid non-negative number.");
        } else {
          updates.amount = Number(value);
        }
        break;
      }

      case "frequency": {
        if (!VALID_FREQUENCIES.includes(value)) {
          errors.push(
            `Frequency must be one of: ${VALID_FREQUENCIES.join(", ")}.`
          );
        } else {
          updates.frequency = value;
        }
        break;
      }

      case "nextDue": {
        if (
          typeof value !== "string" &&
          !(value instanceof Date)
        ) {
          errors.push("Next due date must be a valid date.");
        } else {
          const date = new Date(value);

          if (Number.isNaN(date.getTime())) {
            errors.push("Next due date must be a valid date.");
          } else {
            updates.nextDue = date;
          }
        }
        break;
      }

      case "category": {
        if (!VALID_CATEGORIES.includes(value)) {
          errors.push(
            `Category must be one of: ${VALID_CATEGORIES.join(", ")}.`
          );
        } else {
          updates.category = value;
        }
        break;
      }

      default:
        break;
    }
  }

  if (!partial) {
    for (const field of ["name", "amount", "nextDue"]) {
      if (!Object.prototype.hasOwnProperty.call(updates, field)) {
        errors.push(`${field} is required.`);
      }
    }
  }

  return { updates, errors };
};

const sendServerError = (res, context, error) => {
  console.error(`[${context}]`, error.name || "Error");

  return res.status(500).json({
    message: "Internal server error",
  });
};

// GET: all recurring payments belonging to the authenticated user.
exports.getRecurringPayments = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const payments = await RecurringPayment.find({ userId })
      .sort({ nextDue: 1 })
      .lean();

    return res.status(200).json(payments);
  } catch (error) {
    return sendServerError(res, "getRecurringPayments", error);
  }
};

// CREATE: create a recurring payment for the authenticated user.
exports.createRecurringPayment = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      message: "Invalid request body",
    });
  }

  try {
    const { updates, errors } = validatePaymentFields(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid recurring payment data",
        errors,
      });
    }

    const payment = await RecurringPayment.create({
      ...updates,
      frequency: updates.frequency || "monthly",
      category: updates.category || "subscription",
      userId,
    });

    return res.status(201).json(payment);
  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid recurring payment data",
      });
    }

    return sendServerError(res, "createRecurringPayment", error);
  }
};

// DELETE: delete only a payment belonging to the authenticated user.
exports.deleteRecurringPayment = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (!isValidPaymentId(id)) {
    return res.status(400).json({
      message: "Invalid recurring payment ID",
    });
  }

  try {
    const deleted = await RecurringPayment.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Recurring payment not found",
      });
    }

    return res.status(200).json({
      message: "Recurring payment deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, "deleteRecurringPayment", error);
  }
};

// UPDATE: update only explicitly allowed fields.
exports.updateRecurringPayment = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (!isValidPaymentId(id)) {
    return res.status(400).json({
      message: "Invalid recurring payment ID",
    });
  }

  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      message: "Invalid request body",
    });
  }

  try {
    const { updates, errors } = validatePaymentFields(
      req.body,
      { partial: true }
    );

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid recurring payment data",
        errors,
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    const updated = await RecurringPayment.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Recurring payment not found",
      });
    }

    return res.status(200).json(updated);
  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid recurring payment data",
      });
    }

    return sendServerError(res, "updateRecurringPayment", error);
  }
};
