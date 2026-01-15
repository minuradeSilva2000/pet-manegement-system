import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const registerUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/users`, userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${BASE_URL}/users/login`, credentials);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get(`${BASE_URL}/users/`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axios.put(`${BASE_URL}/users/${userId}`, userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${BASE_URL}/users/${userId}`);
  return response.data;
};
