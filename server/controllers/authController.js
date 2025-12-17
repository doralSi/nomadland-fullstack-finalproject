import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import User from "../models/User.js";

// Joi validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*\d.*\d.*\d)(?=.*[!@#$%^&*\-_])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, four digits, and one special character (!@#$%^&*-_)',
      'any.required': 'Password is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const registerUser = async (req, res) => {
  try {
    // Joi validation
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = value;

    // בדיקה אם המשתמש כבר קיים
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // הצפנת סיסמה
    const passwordHash = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש
    const newUser = await User.create({ name, email, passwordHash });

    // יצירת טוקן JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// פונקציית התחברות
export const loginUser = async (req, res) => {
  try {
    // Joi validation
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // בדיקת אימייל
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // בדיקת סיסמה
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // יצירת JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // החזר token ללקוח
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// פונקציה לקבלת פרופיל משתמש (route מוגן)
export const getProfile = async (req, res) => {
  try {
    // req.user מגיע מה־authMiddleware
    const user = await User.findById(req.user.id).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Profile error:", error);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

