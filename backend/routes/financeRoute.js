import express from 'express';
import {
  createFinanceRecord,
  getAllFinanceRecords,
  getFinanceRecordById,
  updateFinanceRecord,
  deleteFinanceRecord,
  getFinanceSummary
} from '../controllers/financeController.js';

const router = express.Router();

router.post('/', createFinanceRecord);

router.get('/', getAllFinanceRecords);

router.get('/summary', getFinanceSummary);

router.get('/:id', getFinanceRecordById);

router.put('/:id', updateFinanceRecord);

router.delete('/:id', deleteFinanceRecord);

export default router;