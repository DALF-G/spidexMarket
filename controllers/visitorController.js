const { User, Product, ProductView } = require("../models/MarketDb");

exports.getSellerVisitors = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const visits = await ProductView.find({ seller: sellerId })
      .populate("buyer", "name email phone")
      .populate("product", "title photos price")
      .sort({ viewedAt: -1 });

    res.json({
      message: "Visitors fetched",
      count: visits.length,
      visitors: visits
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch visitors" });
  }
};
