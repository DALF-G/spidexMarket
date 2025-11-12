// define the admin login routes
const express = require("express");

// from express define the router
const router = express.Router();

const {auth,authorizeRoles} = require("../middleware/auth")

// import the seller dashboard controller
const sellerDashboardController = require("../controllers/sellerDashboardController")

// get all the admin statistics
router.get("/",auth,authorizeRoles("seller"),sellerDashboardController.getSellerDashboardStats)


// export the router
module.exports = router;
