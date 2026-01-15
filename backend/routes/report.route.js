import express from 'express';
import * as reportController from '../controllers/report.controller.js';

const router = express.Router();

router.post('/generate', reportController.generateReport);

export default router;
