// controllers/categoryController.js
const { Category, SubCategory } = require("../models/MarketDb");
const upload = require("../middleware/upload"); // Cloudinary multer
const { cloudinary } = require("../config/cloudinary");

// Upload middleware
exports.uploadCategoryPhoto = upload.single("photo");

// =========================
// CREATE CATEGORY
// =========================
exports.createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;

    if (!name) return res.status(400).json({ message: "Name required" });

    // Check if category exists
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Cloudinary sends file info in req.file.path
    let photoUrl = req.file ? req.file.path : undefined;

    // Format subcategories
    const subs = subcategories
      ? subcategories.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const category = new Category({
      name,
      photo: photoUrl,
      subcategories: subs,
    });

    await category.save();

    res.status(201).json({
      message: "Category created",
      category,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error creating category",
      error: err.message,
    });
  }
};

// =========================
// UPDATE CATEGORY
// =========================
exports.updateCategory = async (req, res) => {
  try {
    const update = {};

    if (req.body.name) update.name = req.body.name;

    if (req.body.subcategories) {
      update.subcategories = req.body.subcategories
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }

    // If new photo uploaded → replace Cloudinary URL
    if (req.file) {
      update.photo = req.file.path;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category updated",
      category: updated,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error updating category",
      error: err.message,
    });
  }
};

// =========================
// GET ALL CATEGORIES
// =========================
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

// =========================
// GET CATEGORY BY ID
// =========================
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

// =========================
// DELETE CATEGORY
// =========================
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

// =========================
// ADD SUBCATEGORY
// =========================
exports.addSubCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Subcategory name required" });

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    category.subcategories.push(name);
    await category.save();

    res.json({ message: "Subcategory added", category });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

// =========================
// UPDATE SUBCATEGORY
// =========================
exports.updateSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (!category.subcategories[subId])
      return res.status(404).json({ message: "Subcategory not found" });

    category.subcategories[subId] = name;
    await category.save();

    res.json({ message: "Subcategory updated", category });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

// =========================
// DELETE SUBCATEGORY
// =========================
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (!category.subcategories[subId])
      return res.status(404).json({ message: "Subcategory not found" });

    category.subcategories.splice(subId, 1);
    await category.save();

    res.json({ message: "Subcategory deleted", category });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
