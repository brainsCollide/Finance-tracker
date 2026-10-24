
const Joi = require("joi");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

const isProduction = process.env.NODE_ENV === "production";

// Fail fast if required configuration is missing.
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL is not configured");
}

const SESSION_DURATION_MS = 60 * 60 * 1000;
const RESET_TOKEN_DURATION_MS = 15 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: SESSION_DURATION_MS,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", cookieOptions);
};

const handleServerError = (res, context, error) => {
  // Never log credentials, cookies, or JWT values.
  console.error(`[${context}]`, error.name || "Error");

  return res.status(500).json({
    message: "Internal server error",
  });
};

// ========================
// VALIDATION
// ========================

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .messages({
    "string.pattern.base":
      "Password must contain uppercase, lowercase, and number",
    "string.min": "Password must be at least 8 characters",
  });

const signUpSchema = Joi.object({
  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(10)
    .pattern(/^[a-z0-9_]+$/)
    .required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

  password: passwordSchema.required(),
}).unknown(false);

const signInSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
}).unknown(false);

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
}).unknown(false);

const resetPasswordSchema = Joi.object({
  password: passwordSchema.required(),
}).unknown(false);

const validateRequest = (schema, body) => {
  return schema.validate(body, {
    abortEarly: true,
    convert: true,
  });
};

// ========================
// SIGN UP
// ========================

const signUp = async (req, res) => {
  const { error, value } = validateRequest(signUpSchema, req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const { username, email, password } = value;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).select("_id email username");

    if (existingUser) {
      const field =
        existingUser.email === email ? "email" : "username";

      return res.status(409).json({
        message:
          field === "email"
            ? "Email is already registered"
            : "Username is already taken",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    return res.status(201).json({
      message: "User successfully created",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or username is already taken",
      });
    }

    return handleServerError(res, "SIGN_UP", error);
  }
};

// ========================
// SIGN IN
// ========================

const signIn = async (req, res) => {
  const { error, value } = validateRequest(signInSchema, req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const { email, password } = value;

  try {
    const user = await User.findOne({ email }).select("+password");

    // Use the same response for unknown email and wrong password.
    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Sign-in successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return handleServerError(res, "SIGN_IN", error);
  }
};

// ========================
// LOGOUT
// ========================

const logOut = (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    message: "Logout successful",
  });
};

// ========================
// GET CURRENT USER
// ========================

const getCurrentUser = async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      !decoded.userId ||
      !mongoose.Types.ObjectId.isValid(decoded.userId)
    ) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded.userId)
      .select("_id username email createdAt")
      .lean();

    if (!user) {
      clearAuthCookie(res);

      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      clearAuthCookie(res);

      return res.status(401).json({
        message:
          error.name === "TokenExpiredError"
            ? "Session expired. Please sign in again."
            : "Unauthorized",
      });
    }

    return handleServerError(res, "GET_CURRENT_USER", error);
  }
};

// ========================
// FORGOT PASSWORD
// ========================

const forgotPassword = async (req, res) => {
  const { error, value } = validateRequest(
    forgotPasswordSchema,
    req.body
  );

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const genericResponse = {
    message:
      "If the email is registered, a reset link has been sent.",
  };

  try {
    const user = await User.findOne({ email: value.email });

    // Do not disclose whether an email exists.
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordExpires =
      Date.now() + RESET_TOKEN_DURATION_MS;

    await user.save();

    const resetUrl =
      `${CLIENT_URL.replace(/\/$/, "")}` +
      `/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Password",
        html: `
          <p>Klik link berikut untuk reset password.
          Link berlaku selama 15 menit.</p>
          <a href="${resetUrl}">Reset password</a>
          <p>Abaikan email ini jika kamu tidak memintanya.</p>
        `,
      });
    } catch (mailError) {
      // Invalidate the token if email delivery fails.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error(
        "[FORGOT_PASSWORD_EMAIL]",
        mailError.name || "Error"
      );

      return res.status(500).json({
        message: "Unable to send reset email. Please try again.",
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    return handleServerError(res, "FORGOT_PASSWORD", error);
  }
};

// ========================
// RESET PASSWORD
// ========================

const resetPassword = async (req, res) => {
  const { error, value } = validateRequest(
    resetPasswordSchema,
    req.body
  );

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  try {
    const { token } = req.params;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    user.password = value.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    return handleServerError(res, "RESET_PASSWORD", error);
  }
};

module.exports = {
  signUp,
  signIn,
  logOut,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
