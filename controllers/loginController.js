const {User} = require("../models/MarketDb");
const bycryptjs = require("bcryptjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// import jwt secret
const JWT_SECRET = process.env.JWT_SECRET;

// create register function below
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email Already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, role: role || "buyer" });
    await user.save();

    res.status(201).json({ message: "Registered Successfully", userId: user._id });
  } 
  catch (err) {
    res.status(400).json({ message: "Register failed", error: err.message });
  }
};


// create a function to handle the login operation
exports.login = async(req, res)=>{
    try{
        // destructure the details entered on postman
        const {email, password} = req.body;

        // chech whether you are able to receive the data
        // console.log("The entered details are:",email,password)

        // 1. find user based on given email
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"Sorry, Email does NOT Exist..."})
        }
        // 2. check wheather account is active or not
        if(!user.isActive){
            return res.status(403).json({message: "Your account is not Active.."})
        }
        // 3. compare the provided password with the hashed password in the MongoDB
        const isMatch = await bycryptjs.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message : "Invalid password please try Again."})
        }
        // 4. Generate JWT token used for session management purpose
        const token = jwt.sign(
            {userId : user._id, role :user.role},
            process.env.JWT_SECRET,
            {expiresIn : process.env.TOKEN_EXPIRES_IN || "70h"}
        );
        // console.log("The generate login token is:",token)

        user.lastLogin = Date.now();
        await user.save();

        // 5. send a success message when successfully logged in
        res.json({
            message : "Login successful",
            token,
            user :({
                id : user._id,
                name : user.name,
                email : user.email,
                role : user.role

            })
        })
    }
    catch(err){
        res.status(500).json({message: "Login failed",error: err.message});
        
    }
}