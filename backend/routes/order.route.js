import express from "express";
import { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, getOrderDetails, cancelOrder, updateOrder, downloadInvoice, directBuy, getDirectBuyData, processDirectBuyOrder, getEnhancedOrderDetails } from "../controllers/order.controller.js";
import sessionAuth from "../middleware/auth.session.js";

const router = express.Router();

// Direct buy routes
router.post('/direct-buy', sessionAuth, directBuy);
router.get('/direct-buy-data', sessionAuth, getDirectBuyData);
router.post('/process-direct-buy', sessionAuth, processDirectBuyOrder);

// Customer Routes
router.post("/place-order", sessionAuth, placeOrder);
router.get("/my-orders", sessionAuth, getUserOrders);
router.get("/:orderId", getOrderDetails);
router.put("/:orderId/cancel", cancelOrder);
router.get('/:orderId/invoice', downloadInvoice);

// Admin Routes
router.get("/", getAllOrders);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.patch("/:orderId/status", updateOrderStatus);
router.patch("/:orderId/payment-status", updatePaymentStatus);
router.get('/:orderId/enhanced', getEnhancedOrderDetails);

export default router;
