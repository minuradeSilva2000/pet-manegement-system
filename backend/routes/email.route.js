import express from "express";
import { sendEmailController } from "../controllers/email.controller.js";

const router = express.Router();

// Route for sending generic emails
router.post("/send", sendEmailController);
export default router;
