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
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Indexing for performance
UserSchema.index({ savedArticles: 1 });
UserSchema.index({ likedArticles: 1 });

module.exports = mongoose.model("User", UserSchema);