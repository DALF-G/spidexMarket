// routes/products.js
const express = require("express");
const router = express.Router();
const { auth, authorizeRoles } = require("../middleware/auth");
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");

// Upload up to 5 images: field name must be "photos"
router.post(
  "/add",
  auth,
  authorizeRoles("seller", "admin"),
  upload.array("photos", 5),
  productController.createProduct
);

router.get(
  "/my-products",
  auth,
  authorizeRoles("seller", "admin"),
  productController.getMyProducts);

// Fetch all products
router.get("/", productController.getAllProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Update product (Only sellers or admins)
// router.put("/:id", auth, authorizeRoles("seller", "admin"), productController.uploadProductPhoto, productController.updateProduct);
router.put(
    "/:id",
    auth,
    authorizeRoles("seller", "admin"),
    upload.array("photos", 5),   // Cloudinary upload
    productController.updateProduct
  );


// Delete product (Only sellers or admins)
router.delete("/:id", auth, authorizeRoles("seller", "admin"), 
productController.deleteProduct);


module.exports = router;
