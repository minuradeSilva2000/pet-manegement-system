import express from "express";
import * as petController from "../controllers/pet.controller.js";

import upload from "../utils/upload.js";
const router = express.Router();

router.post("/", upload.single("image"), petController.createPet);
router.put("/:id", upload.single("image"), petController.updatePet);
router.get("/:id", petController.getPetById);
router.delete("/:id", petController.deletePet);
router.get("/", petController.getAllPets);
router.get("/owner/:ownerId", petController.getPetsByOwner);

export default router;
