import express from "express";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

// Create a new payment
router.post("/", paymentController.createPayment);

// Get all payments
router.get("/", paymentController.getAllPayments);

// Get a specific payment by ID
router.get("/:id", paymentController.getPaymentById);

// Update a payment
router.put("/:id", paymentController.updatePayment);

// Download payment receipt
router.get("/:id/receipt", paymentController.getPaymentReceipt);

// Resend payment email
router.post("/:id/resend-email", paymentController.resendPaymentEmail);

export default router;