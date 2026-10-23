const Joi = require("joi");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const isProduction =
  process.env.NODE_ENV === "production" &&
  process.env.HOST_ENV === "production";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables");
}

console.log("✅ JWT_SECRET Loaded");

// ========================
// SIGN UP VALIDATION
// ========================
const signUpSchema = Joi.object({
  username: Joi.string().min(3).max(10).required(),
  email: Joi.string().email().required(),

  // 🔥 strong password policy (SIGN UP ONLY)
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and number",
      "string.min": "Password must be at least 8 characters",
    })
    .required(),
});

// ========================
// SIGN IN VALIDATION
// ========================
const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(), // 🔥 only check required
});

// ========================
// SIGN UP CONTROLLER
// ========================
const signUp = async (req, res) => {
  const { error } = signUpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      message: "User successfully created",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// SIGN IN CONTROLLER
// ========================
const signIn = async (req, res) => {
  const { error } = signInSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
    return res.status(400).json({ message: "User not found" });
    }

    if (!user.password) {
    return res.status(500).json({ message: "Password missing in DB" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 3600000,
    });

    res.status(200).json({
      message: "Sign-in successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// LOGOUT
// ========================
const logOut = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logout successful" });
};

// ========================
// GET CURRENT USER
// ========================

const getCurrentUser = async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(decoded.userId)
      .select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("getCurrentUser error:", error.name, error.message);

    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Session expired. Please sign in again."
          : "Unauthorized: Invalid token",
    });
  }
};


// ========================
// FORGOT / RESET VALIDATION
// ========================
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and number",
      "string.min": "Password must be at least 8 characters",
    })
    .required(),
});

// ========================
// FORGOT PASSWORD
// ========================
const forgotPassword = async (req, res) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const genericMsg = {
    message: "If the email is registered, a reset link has been sent.",
  };

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(200).json(genericMsg);

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Password",
        html: `<p>Klik link berikut untuk reset password (berlaku 15 menit):</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>Abaikan email ini jika kamu tidak memintanya.</p>`,
      });
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.status(200).json(genericMsg);
  } catch (err) {
    console.error("Forgot password error:", err); // <-- dan ini
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// RESET PASSWORD
// ========================
const resetPassword = async (req, res) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    user.password = req.body.password; // di-hash oleh pre('save') di model
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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