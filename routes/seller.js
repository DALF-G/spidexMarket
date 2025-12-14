const express = require("express");
const router = express.Router();
const { auth, authorizeRoles } = require("../middleware/auth");
const sellerController = require("../controllers/sellerController");


router.get("/:sellerId/profile", auth, sellerController.getSellerProfile);
router.get("/visitors/list", auth, authorizeRoles("seller"), sellerController.getSellerVisitors);


module.exports = router;