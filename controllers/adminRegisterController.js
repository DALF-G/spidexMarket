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