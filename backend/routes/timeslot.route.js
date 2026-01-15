import express from 'express';
import { getBookedSlots, bookTimeSlot } from '../controllers/timeslot.controller.js';


const router = express.Router();

router.get('/bookedSlots', getBookedSlots);

router.post('/bookSlot', bookTimeSlot);

export default router;
