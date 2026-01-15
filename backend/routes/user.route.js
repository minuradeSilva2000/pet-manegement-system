import express from "express";
import * as userController from "../controllers/user.controller.js";
import upload from "../utils/upload.js";
const router = express.Router();

// Static routes should come first
router.post("/login", userController.loginUser);
router.get("/session", userController.getSessionUser);
router.post("/logout", userController.logoutUser);

// Then routes that need an id parameter
router.post("/", upload.single("image"), userController.createUser);
router.get("/", userController.getAllUsers);
router.put("/:id", upload.single("image"), userController.updateUser);
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUser);

export default router;
