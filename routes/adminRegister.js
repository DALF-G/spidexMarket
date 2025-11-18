// define the admin login routes
const express = require("express");

// from express define the router
const router = express.Router();

// import the admin register controller / logic
const registerController = require("../controllers/adminRegisterController");

const { auth, authorizeRoles } = require("../middleware/auth");

// define the endpoint to access for you to register an admin
router.post("/register", registerController.reqisterAdmin)

// route to get all users
router.get("/users", auth, authorizeRoles("admin"), registerController.getAllUsers)

// Define the endpoint to access admin seller approval
router.put("/approveseller/:id", auth, authorizeRoles("admin"),registerController.approveSeller)

// Define the route to get all pending sellers
router.get("/sellers", auth, authorizeRoles("admin"), registerController.getPendingSellers)

// Route to reject the seller
router.put("/rejectseller/:id", auth, authorizeRoles("admin"), registerController.rejectSeller)

// route for toogle active users
router.put("/toggleactive/:id", auth,authorizeRoles("admin"),registerController.toggleActive)

// route to delete user
router.delete("/deleteuser/:id",auth,authorizeRoles("admin"),registerController.deleteUser)


// export the router
module.exports = router;