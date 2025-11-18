// define the admin login routes
const express = require("express");

// from express define the router
const router = express.Router();

// import the admin register controller / logic
const registerController = require("../controllers/adminRegisterController");

const { auth, authorizeRoles } = require("../middleware/auth");

// define the endpoint to access for you to register an admin
router.post("/register", registerController.reqisterAdmin)

// Define the endpoint to access admin seller approval
router.put("/approveseller/:id", auth, authorizeRoles("admin"),registerController.approveSeller)

// Define the route to get all pending sellers
router.get("/sellers", auth, authorizeRoles("admin"), registerController.getPendingSellers)

// Route to reject the seller
router.put("/rejectseller/:id", auth, authorizeRoles("admin"), registerController.rejectSeller)


// export the router
module.exports = router;