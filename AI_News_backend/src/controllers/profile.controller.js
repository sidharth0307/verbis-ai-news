const User = require("../models/User");

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate({
        path: "savedArticles",
        select: "title bannerImage summary source publishedAt category categorySlug slug likesCount",
      })
      .populate({
        path: "likedArticles",
        select: "title bannerImage summary source publishedAt category categorySlug slug likesCount",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};