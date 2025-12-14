const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// create an express application
const app = express();

// allow json & form data
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
app.use(limiter);

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
app.use("/api/admin", require("./routes/adminRegister"));
app.use("/api/user", require("./routes/userLogin"));
app.use("/api/product", require("./routes/products"));
app.use("/api/category", require("./routes/category"));
app.use("/api/message", require("./routes/message"));
app.use("/api/adminstats", require("./routes/adminDashboard"));
app.use("/api/sellerstats", require("./routes/sellerDashboard"));
app.use("/api/buyerstats", require("./routes/buyerDashboard"));

app.use("/api/visitors", require("./routes/visitors"));

app.use("/api/seller", require("./routes/seller"));



// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Database connected successfully"))
  .catch((err) => console.error("Error connecting to Database", err));

// Create HTTP Server for socket.io
const server = http.createServer(app);

const PORT = 3000;

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user's room
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  // Private message
  socket.on("send_message", (data) => {
    const receiver = data.receiverId || data.receiver;

    if (!receiver) return;

    io.to(receiver).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log("Server + Socket.IO running on port " + PORT);
});
