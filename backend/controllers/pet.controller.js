import * as petService from "../services/pet.service.js";

export const createPet = async (req, res) => {
  try {
    const petData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    };
    const pet = await petService.createPet(petData);
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPetById = async (req, res) => {
  try {
    const pet = await petService.getPetById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePet = async (req, res) => {
  try {
    let petData = {
      ...req.body,
    };
    if (req.file) {
      petData = {
        ...req.body,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      };
    }
    const pet = await petService.updatePet(req.params.id, petData);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.status(200).json(pet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await petService.deletePet(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPets = async (req, res) => {
  try {
    const pets = await petService.getAllPets();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPetsByOwner = async (req, res) => {
  try {
    const pets = await petService.getPetsByOwner(req.params.ownerId);
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
