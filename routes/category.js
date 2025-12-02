const express = require("express");
const router = express.Router();
const { auth, authorizeRoles } = require("../middleware/auth");
const categoryController = require("../controllers/categoryController");

// Create/add category (Only admins and seller)
router.post("/add", auth, authorizeRoles("seller","admin"),categoryController.uploadCategoryPhoto,categoryController.createCategory);

// Fetch all categories
router.get("/", categoryController.getAllCategories);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Update category (Only admins and Seller)
router.put("/:id", auth, authorizeRoles("seller","admin"),categoryController.uploadCategoryPhoto, categoryController.updateCategory);

// Delete category (Only admins and Seller)
router.delete("/:id", auth, authorizeRoles("seller","admin"), categoryController.deleteCategory);

// Add subcategory (Only admins or sellers)
router.post("/:id/subcategory/add",auth,authorizeRoles("seller", "admin"),categoryController.addSubCategory);


// Update subcategory (only admins/sellers)
router.put("/:id/subcategory/:subId", auth, authorizeRoles("seller","admin"),categoryController.updateSubCategory);

// Delete subcategory
router.delete("/:id/subcategory/:subId", auth, authorizeRoles("seller","admin"), categoryController.deleteSubCategory);


module.exports = router;