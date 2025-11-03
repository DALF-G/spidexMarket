const {Category}  = require("../models/MarketDb");
const multer = require("multer");
const fs = require("fs");
const path = require("path");


// Create separate folders for category and subcategory photos
const categoryDir = "uploads/categories";
const subcategoryDir = "uploads/subcategories";

// Ensure upload directories exist
if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });
if (!fs.existsSync(subcategoryDir)) fs.mkdirSync(subcategoryDir, { recursive: true });




// MULTER CONFIGURATION
// Category photo storage
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, categoryDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Subcategory photo storage
const subcategoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, subcategoryDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const uploadCategory = multer({ storage: categoryStorage });
const uploadSubcategory = multer({ storage: subcategoryStorage });

// Export upload middlewares
exports.uploadCategoryPhoto = uploadCategory.single("photo");
exports.uploadSubCategoryPhoto = uploadSubcategory.single("photo");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Handle category photo upload
    let categoryPhoto = null;
    if (req.file) {
      const newPath = path.join("uploads", req.file.filename);
      categoryPhoto = newPath.replace(/\\/g, "/");
    }

    // Create and save new category
    const newCategory = new Category({
      name,
      photo: categoryPhoto,
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: savedCategory,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error creating category",
      error: err.message,
    });
  }
};


// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      message: "Categories fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error fetching categories",
      error: err.message,
    });
  }
};


// GET CATEGORY BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category fetched successfully",
      category,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error fetching category",
      error: err.message,
    });
  }
};


// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    let updatedData = { name };

    // If photo is uploaded, replace the old one
    if (req.file) {
      const newPath = path.join("uploads", req.file.filename);
      updatedData.photo = newPath.replace(/\\/g, "/");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error updating category",
      error: err.message,
    });
  }
};


// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error deleting category",
      error: err.message,
    });
  }
};


// Add a subcategory to an existing category
exports.addSubCategory = async (req, res) => {
  try {
    const { id } = req.params; // Category ID
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Subcategory name is required" });
    }

    // Find the parent category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }


    // Handle subcategory photo
    let Photo = null;
    if (req.file) {
      const newPath = path.join("uploads", req.file.filename);
      Photo = newPath.replace(/\\/g, "/");
    }

    // add the subcategory
    category.subcategories.push({ name, photo: Photo});
    await category.save();

    res.status(201).json({
      message: "Subcategory added successfully",
      category,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error adding subcategory",
      error: err.message,
    });
  }
};

// UPDATE SUBCATEGORY
exports.updateSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const subcategory = category.subcategories.id(subId);
    if (!subcategory) return res.status(404).json({ message: "Subcategory not found" });

    if (name) subcategory.name = name;

    if (req.file) {
      const newPath = path.join("uploads", req.file.filename);
      subcategory.photo = newPath.replace(/\\/g, "/");
    }

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


// DELETE SUBCATEGORY
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.subcategories = category.subcategories.filter(
  (sub) => sub._id.toString() !== subId);

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
