const { User, Product, Premium, Review, Message } = require("../models/MarketDb");

// GET seller dashboard stats
exports.getSellerDashboardStats = async (req, res) => {
  try {
    // Get the logged-in seller from auth middleware
    const seller = req.user;
    const sellerId = seller._id;

    if (!sellerId) {
      return res.status(400).json({ message: "Seller not found or not logged in" });
    }

    // Run all queries in parallel for performance
    const [
      totalProducts,
      soldProducts,
      activeProducts,
      hiddenProducts,
      totalPremiumAds,
      totalMessages,
      averageRating
    ] = await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, status: "sold" }),
      Product.countDocuments({ seller: sellerId, status: "active" }),
      Product.countDocuments({ seller: sellerId, status: "hidden" }),
      Premium.countDocuments({ user: sellerId }),
      Message.countDocuments({ $or: [{ sender: sellerId }, { receiver: sellerId }] }),
      Review.aggregate([
        { $match: { reviewedUser: seller._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]),
    ]);

    const avgRating = averageRating.length ? averageRating[0].avgRating.toFixed(1) : 0;

    // Get 5 most recent products
    const recentProducts = await Product.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title price status views createdAt");

    // Get 5 most recent premium ads
    const recentPremiums = await Premium.find({ user: sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product", "title price");

    res.json({
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        isApproved: seller.isApprovedSeller,
      },
      totals: {
        totalProducts,
        soldProducts,
        activeProducts,
        hiddenProducts,
        totalPremiumAds,
        totalMessages,
        avgRating,
      },
      recent: {
        products: recentProducts,
        premiumAds: recentPremiums,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error loading seller dashboard stats",
      error: err.message,
    });
  }
};
