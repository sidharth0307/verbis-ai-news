// controllers/user.controller.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Regex for Email Validation (Controller level double-check)
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Manual Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. Check Duplicate
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Create User 
    // SECURITY NOTE: We do NOT pass 'role' from req.body here. 
    // This prevents a hacker from sending { "role": "admin" } to gain access.
    const user = await User.create({
      name,
      email,
      password,
      role: "user" // Hardcoded default. Admin creation should be a separate, protected route.
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 2. Find User (explicitly select password if you set select: false in model later)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Check Password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Generate Token
    const payload = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.toggleSaveArticle = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const articleId = req.params.articleId;
    const isSaved = user.savedArticles.includes(articleId);

    if (isSaved) {
      user.savedArticles.pull(articleId);
    } else {
      user.savedArticles.push(articleId);
    }

    await user.save();

    res.json({
      saved: !isSaved,
      savedArticles: user.savedArticles
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.getUserInteractions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('likedArticles savedArticles');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      likedArticleIds: user.likedArticles || [], // Array of IDs
      savedArticleIds: user.savedArticles || []
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching interactions" });
  }
};

// --- ADMIN CONTROLLERS ---

exports.getAllUsers = async (req, res) => {
  try {
    // Exclude passwords
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Optional: Prevent deleting self
    if (req.user.id === userId) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    const deletedMap = await User.findByIdAndDelete(userId);
    if (!deletedMap) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully", id: userId });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === 'admin') return res.status(403).json({ message: "Cannot disable admin accounts" });

    // Toggle logic: If user schema has 'isActive' (default true), flip it
    // If your model doesn't have isActive, you might need to add it or use a different flag.
    // Assuming 'isActive' exists or we add it to the schema. 
    // If not, we can just save it and Mongoose strict mode might ignore it unless defined.
    // Let's assume we want to support 'isActive'.
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      user: { id: user._id, isActive: user.isActive }
    });

  } catch (err) {
    console.error("Toggle Status Error:", err);
    res.status(500).json({ message: "Failed to update user status" });
  }
};