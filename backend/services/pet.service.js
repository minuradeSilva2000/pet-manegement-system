import Pet from "../models/pet.model.js";

export const createPet = async (petData) => {
  const pet = new Pet(petData);
  await pet.save();
  return pet;
};

export const updatePet = async (petId, petData) => {
  console.log("called " + petData);
  try {
    return await Pet.findByIdAndUpdate(petId, petData, { new: true });
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getPetById = async (petId) => {
  return await Pet.findById(petId).populate("owner");
};

export const deletePet = async (petId) => {
  return await Pet.findByIdAndDelete(petId);
};

export const getAllPets = async () => {
  return await Pet.find().populate("owner");
};

export const getPetsByOwner = async (ownerId) => {
  return await Pet.find({ owner: ownerId }).populate("owner");
};
