import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: [true, "Pet reference is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, "Please fill a valid phone number"],
  },
  livingSituation: {
    type: String,
    required: [true, "Living situation is required"],
    enum: {
      values: ["Apartment", "House", "Condo", "Other"],
      message: "{VALUE} is not a valid living situation",
    },
  },
  previousPetExperience: {
    type: String,
    required: [true, "Previous pet experience information is required"],
    maxlength: [500, "Experience cannot exceed 500 characters"],
  },
  otherPets: {
    type: String,
    maxlength: [500, "Other pets info cannot exceed 500 characters"],
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Completed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Adoption = mongoose.model("Adoption", adoptionSchema);

export default Adoption;
