import Adoption from "../models/adoption.model.js";

export const createAdoption = async (adoptionData) => {
  const adoption = new Adoption(adoptionData);
  await adoption.save();
  return adoption;
};

export const updateAdoption = async (adoptionId, adoptionData) => {
  try {
    return await Adoption.findByIdAndUpdate(adoptionId, adoptionData, {
      new: true,
      runValidators: true,
    }).populate("pet", "name dob gender image isAdopted");
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAdoptionById = async (adoptionId) => {
  return await Adoption.findById(adoptionId)
    .populate("pet", "name dob gender image isAdopted")
    .populate("user", "name email phone role");
};

export const deleteAdoption = async (adoptionId) => {
  return await Adoption.findByIdAndDelete(adoptionId);
};

export const getAllAdoptions = async () => {
  return await Adoption.find()
    .populate("pet", "name dob gender image isAdopted")
    .populate("user", "name email phone role");
};

export const getAdoptionsByUser = async (userId) => {
  return await Adoption.find({ user: userId }).populate(
    "pet",
    "name dob gender image isAdopted"
  );
};

export const getAdoptionsByPet = async (petId) => {
  return await Adoption.find({ pet: petId }).populate(
    "user",
    "name email phone role"
  );
};
