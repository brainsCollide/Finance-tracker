const Joi = require("joi");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("transactions");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = {
  signUp,
  signIn,
  logOut,
  getCurrentUser,
};