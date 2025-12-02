const express = require("express");
const router = express.Router();
const { auth, authorizeRoles } = require("../middleware/auth");
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/upload"); // <-- your upload.js

router.post(
  "/add",
  auth,
  authorizeRoles("seller", "admin"),
  upload.single("photo"), // field must be "photo"
  categoryController.createCategory
);

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

router.put("/:id",auth,authorizeRoles("seller", "admin"), upload.single("photo"),categoryController.updateCategory
);

router.delete("/:id", auth, authorizeRoles("seller", "admin"), categoryController.deleteCategory);

router.post("/:id/subcategory/add", auth, authorizeRoles("seller", "admin"), categoryController.addSubCategory);

router.put("/:id/subcategory/:subId", auth, authorizeRoles("seller", "admin"), categoryController.updateSubCategory);

router.delete("/:id/subcategory/:subId", auth, authorizeRoles("seller", "admin"), categoryController.deleteSubCategory);

module.exports = router;
