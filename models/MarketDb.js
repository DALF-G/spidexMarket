const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String },
  profileImage: { type: String },
  isActive: { type: Boolean, default: true },
  dateJoined: { type: Date, default: Date.now },
  role: { 
    type: String, 
    enum: ["buyer", "seller", "admin"], 
    required:true },
  isApprovedSeller: { type: Boolean, default: false },
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  lastLogin: { type: Date },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
});

// product schema
const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, maxlength: 2000 },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photos: [{ type: String }],
  condition: { type: String, enum: ["new", "used"], required: true },
  location: { type: String, required: true},
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "sold", "hidden"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Category schema
const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  photo: {type : String},
  subcategories: [{ type : String }],
  createdAt: { type: Date, default: Date.now },
});

// message chat schema
const messageSchema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  content: { type: String, required: true },
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// review schema
const reviewSchema = new Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

//  premium ads schema
const premiumSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  type: { type: String, enum: ["featured", "boosted"], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const BuyerVisitSchema = new Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure unique buyer-seller pair
BuyerVisitSchema.index({ seller: 1, buyer: 1 }, { unique: true });

const ProductViewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Category = mongoose.model("Category", categorySchema);
const Message = mongoose.model("Message", messageSchema);
const Review = mongoose.model("Review", reviewSchema);
const Premium = mongoose.model("Premium", premiumSchema);
const BuyerVisit = mongoose.model("BuyerVisit", BuyerVisitSchema);
const ProductView = mongoose.model("ProductView", ProductViewSchema);

module.exports = { User, Product, Category, Message, Review, Premium, BuyerVisit, ProductView };
