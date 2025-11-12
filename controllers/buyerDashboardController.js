const { User, Message, Review, Product } = require("../models/MarketDb");

// GET buyer dashboard stats
exports.getBuyerDashboardStats = async (req, res) => {
  try {
    // Get the logged-in buyer from auth middleware
    const buyer = req.user;
    const buyerId = buyer._id;

    // Run queries in parallel
    const [
      totalMessages,
      totalFavourites,
      totalReviews,
      lastLogin,
    ] = await Promise.all([
      Message.countDocuments({ $or: [{ sender: buyerId }, { receiver: buyerId }] }),
      buyer.favourites.length,
      Review.countDocuments({ reviewer: buyerId }),
      buyer.lastLogin,
    ]);

    // Get recent favourites (latest 5)
    const recentFavourites = await Product.find({ _id: { $in: buyer.favourites } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title price photo location");

    // Get recent reviews written by this buyer
    const recentReviews = await Review.find({ reviewer: buyerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("reviewedUser", "name email")
      .select("rating comment createdAt");

    res.json({
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        location: buyer.location,
        lastLogin,
      },
      totals: {
        totalMessages,
        totalFavourites,
        totalReviews,
      },
      recent: {
        favourites: recentFavourites,
        reviews: recentReviews,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error loading buyer dashboard stats",
      error: err.message,
    });
  }
};
