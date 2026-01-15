import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  address: { type: String },
  role: { type: String, enum: ["customer", "admin", "doctor"], default: "customer" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deliveryDetails: {
    name: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    phone: { type: String },
  },
});

const User = mongoose.model("User", userSchema);
export default User;