import Finance from '../models/financeModel.js';

// Create a new finance record
export const createFinanceRecord = async (req, res) => {
  try {
    const newFinanceRecord = new Finance(req.body);
    const savedRecord = await newFinanceRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all finance records
export const getAllFinanceRecords = async (req, res) => {
  try {
    const { type, startDate, endDate, category } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const financeRecords = await Finance.find(filter).sort({ date: -1 });
    res.status(200).json(financeRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a finance record by ID
export const getFinanceRecordById = async (req, res) => {
  try {
    const financeRecord = await Finance.findById(req.params.id);
    if (!financeRecord) {
      return res.status(404).json({ message: 'Finance record not found' });
    }
    res.status(200).json(financeRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a finance record
export const updateFinanceRecord = async (req, res) => {
  try {
    const updatedRecord = await Finance.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Finance record not found' });
    }
    
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a finance record
export const deleteFinanceRecord = async (req, res) => {
  try {
    const deletedRecord = await Finance.findByIdAndDelete(req.params.id);
    
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Finance record not found' });
    }
    
    res.status(200).json({ message: 'Finance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get finance summary
export const getFinanceSummary = async (req, res) => {
  try {
    const summary = await Finance.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};