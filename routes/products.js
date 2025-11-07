const express = require("express");
const router = express.Router();
const { auth, authorizeRoles } = require("../middleware/auth");
const productController = require("../controllers/productController");


// Create/add product (Only sellers or admins)
router.post("/add", auth, authorizeRoles("seller", "admin"),productController.uploadProductPhoto, productController.createProduct);

// Fetch all products
router.get("/", productController.getAllProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Update product (Only sellers or admins)
router.put("/:id", auth, authorizeRoles("seller", "admin"), productController.uploadProductPhoto, productController.updateProduct);

// Delete product (Only sellers or admins)
router.delete("/:id", auth, authorizeRoles("seller", "admin"), productController.deleteProduct);

module.exports = router;
