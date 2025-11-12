const { User, Product, Category, Message, Review, Premium } = require("../models/MarketDb");

// Admin Dashboard Stats Controller
exports.getDashboardStats = async (req, res) => {
  try {
    // Run all count operations in parallel for performance
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalMessages,
      totalReviews,
      totalPremiumAds,
      activeUsers,
      featuredProducts,
      boostedProducts
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Message.countDocuments(),
      Review.countDocuments(),
      Premium.countDocuments(),
      User.countDocuments({ isActive: true }),
      Premium.countDocuments({ type: "featured" }),
      Premium.countDocuments({ type: "boosted" }),
    ]);

    // Breakdown by user role
    const [totalBuyers, totalSellers, totalAdmins] = await Promise.all([
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "admin" }),
    ]);

    // Count sellers awaiting approval
    const pendingSellers = await User.countDocuments({ role: "seller", isApprovedSeller: false });

    // Count sold and active products
    const [soldProducts, activeProducts] = await Promise.all([
      Product.countDocuments({ status: "sold" }),
      Product.countDocuments({ status: "active" }),
    ]);

    // Revenue from premium ads
    const totalPremiumRevenue = await Premium.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const premiumRevenue = totalPremiumRevenue.length > 0 ? totalPremiumRevenue[0].total : 0;

    // Recent 5 users
    const recentUsers = await User.find()
      .sort({ dateJoined: -1 })
      .limit(5)
      .select("name email role isActive dateJoined");

    // Recent 5 products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("seller", "name email");

    // Recent 5 premium ads
    const recentPremiums = await Premium.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("product", "title price");

    // Return all stats as one response
    res.json({
      totals: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalAdmins,
        pendingSellers,
        activeUsers,
        totalProducts,
        soldProducts,
        activeProducts,
        totalCategories,
        totalMessages,
        totalReviews,
        totalPremiumAds,
        featuredProducts,
        boostedProducts,
        premiumRevenue,
      },
      recent: {
        users: recentUsers,
        products: recentProducts,
        premiums: recentPremiums,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({
      message: "Error loading admin dashboard statistics",
      error: err.message,
    });
  }
};
