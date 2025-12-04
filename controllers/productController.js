// controllers/productController.js
const { Product, User } = require("../models/MarketDb");

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      sellerId: bodySellerId, // sellerId from admin (optional)
      subCategory,
      location,
      condition,
      isFeatured
    } = req.body;

    // Determine seller: use bodySellerId if admin, otherwise logged-in user
    const sellerId = bodySellerId || req.user?._id;

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    // Validate required fields
    if (!title || !price || !category || !condition || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find seller
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Ensure seller is approved
    if (seller.role === "seller" && seller.isApprovedSeller === false) {
      return res.status(403).json({
        message:
          "This seller account is not yet approved. Please wait for admin approval.",
      });
    }

    // Upload photos to Cloudinary (or just use paths if already uploaded)
    const photos = (req.files || []).map(file => file.path);

    // Create product
    const product = new Product({
      title,
      description,
      price,
      category,
      subCategory,
      seller: sellerId,
      photos,
      location,
      condition,
      isFeatured: isFeatured || false
    });

    const saved = await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product: saved
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error adding product", error: err.message });
  }
};

// Get products with filters and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, seller, q, condition, subCategory } = req.query;

    const skip = (page - 1) * limit;

    const filter = { status: "active" };

    if (category) filter.category = category;
    if (seller) filter.seller = seller;
    if (condition) filter.condition = condition;
    if (subCategory) filter.subCategory = subCategory;
    if (q) filter.$or = [{ title: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];

    const products = await Product.find(filter).populate("seller", "name phone location").skip(Number(skip)).limit(Number(limit)).sort({ createdAt: -1 });
    const count = await Product.countDocuments(filter);
    res.json({ message: "Products fetched", count, page: Number(page), products });
  } 
  catch (err) {
    res.status(400).json({ message: "Error fetching products", error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id).populate("seller", "name phone location");
    if (!prod) return res.status(404).json({ message: "Product not found" });
    prod.views = (prod.views || 0) + 1;
    prod.save().catch(()=>{});
    res.json({ product: prod });
  }
   catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const update = req.body;
    if (req.files && req.files.length > 0) {
      update.photos = req.files.map(file => file.path);
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ message: "Product updated", product: updated });
  }
   catch (err) {
    res.status(400).json({ message: "Error updating", error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted", deletedProduct: product });
  } 
  catch (err) {
    res.status(400).json({ message: "Error deleting", error: err.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    const products = await Product.find({ seller: sellerId }).sort({ createdAt: -1 });

    res.json({
      message: "Seller products fetched",
      products
    });
  } 
  catch (err) {
    res.status(400).json({ message: "Error fetching seller products", error: err.message });
  }
};
