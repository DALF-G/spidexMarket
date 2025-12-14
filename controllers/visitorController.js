const { User, Product, ProductView, BuyerVisit } = require("../models/MarketDb");

// GET buyers & the products they viewed
exports.getSellerVisitors = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    // 1) Load all buyers who visited seller page
    const visits = await BuyerVisit.find({ seller: sellerId })
      .populate("buyer", "name email phone")
      .sort({ lastVisit: -1 });

    // 2) Load all product views for this seller
    const views = await ProductView.find({ seller: sellerId })
      .populate("buyer", "name email phone")
      .populate("product", "title photos price")
      .sort({ viewedAt: -1 });

    // Group product views by buyer
    const buyerProductViews = {};

    views.forEach((v) => {
      const buyerId = v.buyer?._id;
      if (!buyerId) return;

      if (!buyerProductViews[buyerId]) {
        buyerProductViews[buyerId] = [];
      }

      buyerProductViews[buyerId].push({
        productId: v.product?._id,
        title: v.product?.title,
        photo: v.product?.photos?.[0],
        price: v.product?.price,
        viewedAt: v.viewedAt,
      });
    });

    // Format response
    const buyers = visits.map((v) => ({
      _id: v.buyer?._id,
      name: v.buyer?.name,
      email: v.buyer?.email,
      phone: v.buyer?.phone,
      lastVisit: v.lastVisit,
      viewedProducts: buyerProductViews[v.buyer?._id] || [],
    }));

    return res.json({ buyers });
  } catch (err) {
    console.error("Visitors fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch visitors" });
  }
};
