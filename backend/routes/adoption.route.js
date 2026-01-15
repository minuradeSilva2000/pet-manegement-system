import express from "express";
import * as adoptionController from "../controllers/adoption.controller.js";

const router = express.Router();

router.post("/", adoptionController.createAdoption);
router.put("/:id", adoptionController.updateAdoption);
router.get("/:id", adoptionController.getAdoptionById);
router.delete("/:id", adoptionController.deleteAdoption);
router.get("/", adoptionController.getAllAdoptions);
router.get('/user/:userId', adoptionController.getUserAdoptions);

export default router;
