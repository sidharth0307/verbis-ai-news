const Subscriber = require("../models/Subscriber");
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

    const subscription = await Subscriber.findOne({ email: user.email });

    res.json({
      ...user.toObject(), 
      newsletterSubscribed: subscription ? subscription.isActive : false
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};