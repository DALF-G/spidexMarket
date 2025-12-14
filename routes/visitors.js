const express = require("express");
const router = express.Router();
const { auth, authorizeRoles } = require("../middleware/auth");
const visitorController = require("../controllers/visitorController");

router.get(
  "/",
  auth,
  authorizeRoles("seller", "admin"),
  visitorController.getSellerVisitors
);

module.exports = router;
