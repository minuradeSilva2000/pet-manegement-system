import * as adoptionService from "../services/adoption.service.js";

// Create a new adoption request
export const createAdoption = async (req, res) => {
  try {
    const adoption = await adoptionService.createAdoption(req.body);
    res.status(201).json({
      success: true,
      data: adoption,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message, 
    });
  }
};

// Get all adoption requests (Admin use case)
export const getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await adoptionService.getAllAdoptions();
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get adoption requests by user ID
export const getUserAdoptions = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    
    const adoptions = await adoptionService.getAdoptionsByUser(userId);
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single adoption request by ID
export const getAdoptionById = async (req, res) => {
  try {
    const adoption = await adoptionService.getAdoptionById(req.params.id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found",
      });
    }
    res.status(200).json(adoption);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update an adoption request (only if status is 'Pending')
export const updateAdoption = async (req, res) => {
  try {
    const existingAdoption = await adoptionService.getAdoptionById(req.params.id);
    if (!existingAdoption) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found",
      });
    }

    if (existingAdoption.status.toLowerCase() !== "pending") {
      return res.status(403).json({
        success: false,
        message: "Only adoption requests with status 'Pending' can be updated",
      });
    }

    const updatedAdoption = await adoptionService.updateAdoption(req.params.id, req.body);
    res.status(200).json(updatedAdoption);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
   
// Delete an adoption request
export const deleteAdoption = async (req, res) => {
  try {
    const adoption = await adoptionService.deleteAdoption(req.params.id);
    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found",
      });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};