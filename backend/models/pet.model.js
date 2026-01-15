import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  image: { type: String },
  isAdopted: { type: Boolean, default: false },
  nextVaccinateDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Pet = mongoose.model("Pet", petSchema);
export default Pet;
