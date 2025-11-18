// define the admin login routes
const express = require("express");

// from express define the router
const router = express.Router();

// import the login controller
const loginController = require("../controllers/loginController");
const adminController = require("../controllers/adminRegisterController");

const { auth, authorizeRoles } = require("../middleware/auth");

// Define the Register route
router.post("/register", loginController.register)

// define the login route
router.post("/login", loginController.login);

// route to get all users
router.get("/users", auth, authorizeRoles("admin"), adminController.getAllUsers)

// Admin approves a pending seller
router.put("/approveseller/:id", auth, authorizeRoles("admin"), adminController.approveSeller);

// Get all pending sellers
router.get("/pendingsellers", auth, authorizeRoles("admin"), adminController.getPendingSellers);


// export the route
module.exports = router;