const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      // Regex validation for email format
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address"
      ]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"] // Security baseline
    },
    role: {
      type: String,
      enum: ["user", "admin"], // STRICTLY restricts values
      default: "user"
    },
    savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    resetPasswordOTP: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isResetVerified: { type: Boolean, default: false } 
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre("save", async function () {
  // 1. Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return; 
  }

  try {
    // 2. Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    // 3. If something goes wrong during hashing, throw the error
    throw new Error(error);
  }
});

// Helper method to compare password (useful for login)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexing for performance
UserSchema.index({ savedArticles: 1 });
UserSchema.index({ likedArticles: 1 });

module.exports = mongoose.model("User", UserSchema);