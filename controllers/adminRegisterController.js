const {User} = require("../models/MarketDb");
const bycryptjs = require("bcryptjs");
const bcrypt = require("bcrypt");



exports.reqisterAdmin = async (req, res)=>{
    // destructure the details passed on the postman
    const {name, email, password,phone, secretkey} = req.body;

    // console.log("The details entered on postman are:",name,email,password,secretkey)
    // verify the admin secret key
    if(secretkey !== process.env.ADMIN_SECRET_KEY){
        return res.status(403).json({message: "Unauthorised Account Creation"});
    }

    // 2. check wheather there is an account with the enterd email
    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({message: "Sorry, User with this email already exists"});

    }
    // 3.  create an admin User
    // hash the admin password
    const hashedPassword = await bycryptjs.hash(password,10);

    // console.log ("The hashed Admin password is:",hashedPassword)

    const newUser = new User({
        name,
        email,
        phone,
        role: "admin",
        password:hashedPassword,
        isActive:true
        
    });

    const savedUser = await newUser.save();

    res.status(201).json({message : "Admin account Created Successfully",savedUser})
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ message: "Users fetched successfully", users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Approve a seller
exports.approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.role !== "seller") {
      return res.status(400).json({ message: "User is not a seller" });
    }

    seller.isApprovedSeller = true;
    await seller.save();

    res.status(200).json({
      message: "Seller approved successfully",
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        role: seller.role,
        isApprovedSeller: seller.isApprovedSeller,
      },
    });
  } catch (err) {
    res.status(400).json({ message: "Error approving seller", error: err.message });
  }
};

// Get all pending sellers
exports.getPendingSellers = async (req, res) => {
  try {
    const pending = await User.find({ role: "seller", isApprovedSeller: false });
    res.status(200).json({
      message: "Pending sellers fetched successfully",
      count: pending.length,
      sellers: pending,
    });
  } catch (err) {
    res.status(400).json({ message: "Error fetching pending sellers", error: err.message });
  }
};

// Reject seller (delete seller)
exports.rejectSeller = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Seller rejected and removed" });
  } catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

// Toggle Active / Inactive user
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedUser) 
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: `User has been ${isActive ? "activated" : "deactivated"}`,
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) 
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User deleted successfully",
      user: deleted,
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// Get all the buyers
exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: "buyer" }).sort({ createdAt: -1 });

    res.json({
      message: "Buyers fetched successfully",
      buyers,
    });
  }
   catch (err) {
    res.status(500).json({ message: "Error fetching buyers", error: err.message });
  }
};

// Get all the messages
exports.getAllMessages = async (req, res) => {
  try {
    const msgs = await Message.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json({ message: "Messages fetched", msgs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};
