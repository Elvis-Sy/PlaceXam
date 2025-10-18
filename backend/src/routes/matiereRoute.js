import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import { uploadFile } from "../middlewares/mutlerMiddleware.js";
import {
  createMatiere,
  getAllMatieres,
  getMatiereById,
  updateMatiere,
  deleteMatiere,
  importMatiere
} from "../controllers/matiereController.js";

const matiereRouter = express.Router();
matiereRouter.use(authenticate); // Necessite d'être connecté

// Seul un Admin peut créer, modifier ou supprimer une matière
matiereRouter.post("/", authorizeRoles("admin"), createMatiere);
matiereRouter.post("/import", uploadFile, authorizeRoles("admin"), importMatiere); // Creation via excel
matiereRouter.patch("/:id", authorizeRoles("admin"), updateMatiere);
matiereRouter.delete("/:id", authorizeRoles("admin"), deleteMatiere);

// Route globale
matiereRouter.get("/", getAllMatieres);
matiereRouter.get("/:id", getMatiereById);

export default matiereRouter;
