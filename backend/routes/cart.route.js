import express from "express";
import { getCart, addToCart, removeFromCart, updateCartItem, clearCart } from "../controllers/cart.controller.js";
import sessionAuth from "../middleware/auth.session.js";

const router = express.Router();

// Customer Routes
router.get("/", sessionAuth, getCart); 
router.post("/add", sessionAuth, addToCart); 
router.delete("/clear", sessionAuth, clearCart); 
router.delete("/remove/:itemId", sessionAuth, removeFromCart); 
router.put("/update/:itemId", sessionAuth, updateCartItem); 

export default router;