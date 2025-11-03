const { Product, User } = require("../models/MarketDb");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure the image upload folder by use of multer
const upload = multer({ dest: "uploads/" });

// Export the upload middleware
exports.uploadProductPhoto = upload.single("photo");

// Create a product
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
      condition,
    } = req.body;

    // 1️⃣ Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 2️⃣ Handle photo upload properly
    let photos = [];
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFileName = Date.now() + ext;
      const newPath = path.join("uploads", newFileName);
      fs.renameSync(req.file.path, newPath);
      photos.push(newPath.replace(/\\/g, "/")); // add image path to array
    }

    // 3️⃣ Create the product document
    const newProduct = new Product({
      title,
      description,
      price,
      category,
      subCategory,
      seller: sellerId,
      photo: photos,
      location,
      condition,
    });

    const savedProduct = await newProduct.save();

    // 4️⃣ Return success response
    res.status(201).json({
      message: "Product added successfully",
      product: savedProduct,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error adding product",
      error: err.message,
    });
  }
};


//  GET ALL PRODUCTS
 
exports.getAllProducts = async (req, res) => {
  try {
    // Fetch all products and populate seller info
    const products = await Product.find().populate("seller", "name phone location email");

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error fetching products",
      error: err.message,
    });
  }
};

//  GET PRODUCT BY ID

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by ID and populate the seller
    const product = await Product.findById(id).populate("seller", "name phone email location");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error fetching product",
      error: err.message,
    });
  }
};

//  UPDATE A PRODUCT
 
// UPDATE a product (only seller who owns it or admin)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Only the owner or an admin can edit
        if (product.seller.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to update this product" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json({
            message: "Product updated successfully",
            updatedProduct,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error updating product",
            error: err.message,
        });
    }
};

// DELETE a product (only seller who owns it or admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Only the owner or admin can delete
        if (product.seller.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to delete this product" });
        }

        await product.deleteOne();

        res.json({
            message: "Product deleted successfully",
            deletedProduct: product,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error deleting product",
            error: err.message,
        });
    }
};