const { BuyerVisit, ProductView } = require("../models/MarketDb");

// Buyer viewing seller page
exports.getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const buyerId = req.user?.userId || null;

    const seller = await User.findById(sellerId).select("name email phone location");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Track buyer visit
    if (buyerId) {
      await BuyerVisit.findOneAndUpdate(
        { seller: sellerId, buyer: buyerId },
        { lastVisit: Date.now() },
        { new: true, upsert: true }
      );
    }

    // Fetch seller products
    const products = await Product.find({ seller: sellerId })
      .select("title price photos category createdAt");

    res.json({
      seller,
      products
    });

  } catch (error) {
    res.status(500).json({ message: "Error loading seller profile", error: error.message });
  }
};

exports.getSellerVisitors = async (req, res) => {
    try {
      const sellerId = req.user.userId;
  
      const visits = await BuyerVisit.find({ seller: sellerId })
        .populate("buyer", "name email phone")
        .sort({ lastVisit: -1 });
  
      const views = await ProductView.find({ seller: sellerId })
        .populate("buyer", "name email phone")
        .populate("product", "title photos price")
        .sort({ viewedAt: -1 });
  
      res.json({
        buyers: visits,
        productViews: views
      });
  
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch visitors",
        error: error.message,
      });
    }
  };
  