// controllers/user.controller.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
const crypto = require("crypto");
const { sendOTPEmail } = require("../utils/nodemailer");
const Subscriber = require("../models/Subscriber");

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
    if (exists.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      // If user exists but isn't verified, delete the old unverified record 
      // so the new one can be created fresh.
      await User.deleteOne({ _id: exists._id });
    }
  }

    // 3. Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // 4. Save OTP to DB (separate collection)
    await OTP.create({ email, otp: otpCode });

    // 5. Create Unverified User
    const user = await User.create({
      name,
      email,
      password, 
      role: "user",
      isVerified: false 
    });

    // 6. Send Email
    await sendOTPEmail(email, otpCode);

    res.status(201).json({
      message: "Registration successful. Please verify your email with the OTP sent.",
      email: user.email 
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 2. Mark user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // 3. Delete OTP record (optional but recommended)
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
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
     // Check if user exists and is verified
    if (user && !user.isVerified) {
      return res.status(401).json({ message: "Please verify your email first." });
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

exports.subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase();

    const userExists = await User.findOne({ email: lowerEmail });

    //check if user exists in the user collection
    if (!userExists) {
      return res.status(403).json({ 
        message: "Account not found. Please register to join the daily briefing network.",
        needsRegistration: true 
      });
    }
    
    // Use upsert so if they are already a subscriber, it just ensures isActive is true
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: true },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Welcome to the Verbis AI Daily Edition!" });
  } catch (err) {
    res.status(500).json({ message: "Subscription failed. Please try again later." });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.query; 

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email parameter is required." 
      });
    }

    // Find the subscriber and deactivate
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { isActive: false, unsubscribedAt: new Date() } },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: "Subscriber not found." 
      });
    }

    res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from Verbis AI briefings."
    });
    
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error during unsubscription." 
    });
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

    // 1. Prevent deleting self
    if (req.user.id === userId) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    // 2. Find the user first to get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = user.email;

    // 3. Perform deletions
    // We use Promise.all to handle both deletions concurrently for speed
    await Promise.all([
      User.findByIdAndDelete(userId),
      Subscriber.findOneAndDelete({ email: userEmail })
    ]);

    res.json({ 
      message: "User and associated newsletter subscription removed successfully", 
      id: userId 
    });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "Failed to delete user and subscription" });
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