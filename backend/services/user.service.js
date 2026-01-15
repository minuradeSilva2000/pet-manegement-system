import User from "../models/user.model.js";

export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

export const getUserById = async (userId) => {
  return await User.findById(userId);
};

export const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const updateUser = async (userId, userData) => {
  return await User.findByIdAndUpdate(userId, userData, { new: true });
};

export const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

export const getAllUsers = async () => {
  return await User.find();
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (password !== user.password) {
    throw new Error("Invalid password");
  }

  return user;
};

