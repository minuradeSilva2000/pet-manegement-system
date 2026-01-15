import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const createPet = async (petData) => {
  const response = await axios.post(`${BASE_URL}/pets`, petData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getAllPets = async () => {
  const response = await axios.get(`${BASE_URL}/pets`);
  return response.data;
};

export const getPetsByOwner = async (ownerId) => {
  const response = await axios.get(`${BASE_URL}/pets/owner/${ownerId}`);
  return response.data;
};

export const getPetById = async (petId) => {
  const response = await axios.get(`${BASE_URL}/pets/${petId}`);
  return response.data;
};

export const updatePet = async (petId, petData) => {
  const response = await axios.put(`${BASE_URL}/pets/${petId}`, petData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deletePet = async (petId) => {
  const response = await axios.delete(`${BASE_URL}/pets/${petId}`);
  return response.data;
};
