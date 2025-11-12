const { Category, SubCategory } = require("../models/MarketDb");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const dir = "uploads/categories";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } });

exports.uploadCategoryPhoto = upload.single("photo");

exports.createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Category exists" });

    const photo = req.file ? req.file.path.replace(/\\/g, "/") : undefined;
    const subs = subcategories ? subcategories.split(",").map(s => s.trim()).filter(Boolean) : [];

    const category = new Category({ name, photo, subcategories: subs });
    await category.save();
    res.status(201).json({ message: "Category created", category });
  }
   catch (err) {
    res.status(400).json({ message: "Error creating category", error: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const c = await Category.find().sort({ createdAt: -1 });
    res.json({ message: "Categories fetched", count: c.length, categories: c });
  } 
  catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category Not found" });
    res.json({ category });
  } 
  catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.subcategories) update.subcategories = req.body.subcategories.split(",").map(s => s.trim()).filter(Boolean);
    if (req.file) update.photo = req.file.path.replace(/\\/g, "/");

    const updated = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category updated", category: updated });
  } 
  catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Category deleted", category: deleted });
  }
  catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

// subcategory endpoints (subcategories are strings)
// add
exports.addSubCategory = async (req, res) => {
  try {
    const {name} = req.body;
    if (!name) {
      return res.status(400).json({ message: "Subcategory name required" })
    };

    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if subcategory already exists
    if (category.subcategories.includes(name)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    category.subcategories.push(name);
    await category.save();

   return res.status(201).json({ message: "Subcategory added", category });
  } 
  catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};


// update (by index)
exports.updateSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const name = req.body?.name;

    if (!id || subId === undefined) {
      return res.status(400).json({ message: "Category ID and subcategory index are required" });
    }
    if (!name) {
      return res.status(400).json({ message: "Subcategory name is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Ensure index is valid
    if (!category.subcategories[subId]) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // Update the subcategory name
    category.subcategories[subId] = name;
    await category.save();

    res.status(200).json({
      message: "Subcategory updated successfully",
      category,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error updating subcategory",
      error: err.message,
    });
  }
};


// delete (by index)
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;

    if (!id || subId === undefined) {
      return res.status(400).json({ message: "Category ID and subcategory index are required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Ensure index exists before deletion
    if (!category.subcategories[subId]) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // Remove the subcategory by index
    category.subcategories.splice(subId, 1);
    await category.save();

    res.status(200).json({
      message: "Subcategory deleted successfully",
      category,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error deleting subcategory",
      error: err.message,
    });
  }
};
