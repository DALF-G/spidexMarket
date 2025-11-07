const express = require("express")
const mongoose = require("mongoose")
require('dotenv').config();
const cors = require("cors")
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");


// create an express application
const app = express();

// allow the application to use json
app.use(express.json())
app.use(cors())

// Middleware
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per windowMs
});
app.use(limiter);

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// specify the adminRegister route
const adminRegisterRoute = require("./routes/adminRegister");
app.use("/api/admin", adminRegisterRoute)

// user register route
// const loginRoutes = require("./routes/userLogin")
// app.use("/api/user", loginRoutes)

// specify the login routes
const loginRoutes = require("./routes/userLogin")
app.use("/api/user",loginRoutes);

// specify the product route
const productRoutes = require("./routes/products");
app.use("/api/product", productRoutes);

// specify the category Routes
const categoryRoutes = require("./routes/category");
app.use("/api/category", categoryRoutes);

// specify the message Routes
const messageRoutes = require("./routes/message");
app.use("/api/message", messageRoutes);

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// connect the application to mongodb
mongoose.connect(process.env.MONGO_URI).then(()=>console.log("Mongo Database connected successfully")).catch(err=> console.error("Error connecting to Database"));
const PORT = 3000;
app.listen(PORT,()=>{
    console.log("The server is running on port 3000...")
})