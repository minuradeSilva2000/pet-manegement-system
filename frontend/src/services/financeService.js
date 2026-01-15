import axios from 'axios';

const BASE_URL = '/api/finance';

const financeService = {
  // Create a new finance record
  createFinanceRecord: async (recordData) => {
    try {
      const response = await axios.post(BASE_URL, recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating finance record:', error);
      throw error;
    }
  },

  // Get all finance records with optional filtering
  getAllFinanceRecords: async (params = {}) => {
    try {
      const response = await axios.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching finance records:', error);
      throw error;
    }
  },

  // Get a single finance record by ID
  getFinanceRecordById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching finance record:', error);
      throw error;
    }
  },

  // Update a finance record
  updateFinanceRecord: async (id, recordData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, recordData);
      return response.data;
    } catch (error) {
      console.error('Error updating finance record:', error);
      throw error;
    }
  },

  // Delete a finance record
  deleteFinanceRecord: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting finance record:', error);
      throw error;
    }
  },

  // Get finance summary
  getFinanceSummary: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching finance summary:', error);
      throw error;
    }
  }
};

export default financeService;