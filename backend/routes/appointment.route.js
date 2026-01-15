import express from 'express';
import { addAppointment , addNewAppointment, getAppointments, updateAppointment, getPetsByUser, filterAppointments, updateAppointmentStatus, getUserAppointments, getPetById, getPetNameForAppointment, cancelAppointment, deleteTimeSlot, getAppointmentsByServiceType, completeAppointment } from '../controllers/appointment.controller.js';

const router = express.Router();

router.post('/add', addAppointment);

router.post('/addnw', addNewAppointment);

router.get("/", getAppointments);

router.route("/update/:id").put(updateAppointment);//

router.get("/pets/:userId", getPetsByUser);

router.get("/pet/:id", getPetById);

router.get("/filter", filterAppointments);

router.put("/:id", updateAppointmentStatus);

router.get("/user/:userId", getUserAppointments);

router.get('/petname/:id', getPetNameForAppointment);

router.put("/cancel/:id", cancelAppointment);

router.post("/timeslots/delete", deleteTimeSlot);

router.get("/:serviceType", getAppointmentsByServiceType);

router.put("/complete/:id", completeAppointment);




export default router;
