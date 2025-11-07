const { Product, User } = require("../models/MarketDb");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// storage
const productDir = "uploads/products";
if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadProductPhoto = upload.array("photos", 5);

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
       title, 
       description, 
       price, 
       category, 
       sellerId, 
       subCategory, 
       location, 
       condition 
      } = req.body;
    if (!title || !price || !category || !sellerId || !condition || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const seller = await User.findById(sellerId);

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const photos = (req.files || []).map(f => f.path.replace(/\\/g, "/"));

    const product = new Product({
      title,
      description,
      price,
      category,
      subCategory,
      seller: sellerId,
      photo: photos,
      location,
      condition
    });

    const saved = await product.save();

    res.status(201).json({ message: "Product added successfully", product: saved });
  } 
  catch (err) {
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
    if (req.files && req.files.length) {
      update.photo = req.files.map(f => f.path.replace(/\\/g, "/"));
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