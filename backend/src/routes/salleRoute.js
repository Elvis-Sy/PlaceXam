import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createSalle,
  getAllSalles,
  getSalleById,
  updateSalle,
  deleteSalle
} from "../controllers/salleController.js";

const salleRouter = express.Router();
salleRouter.use(authenticate); // Besoin d'être connecté

// Accès admin uniquement pour ces routes
salleRouter.post("/", authorizeRoles("admin"), createSalle);
salleRouter.get("/",authorizeRoles("admin"), getAllSalles);
salleRouter.patch("/:id", authorizeRoles("admin"), updateSalle);
salleRouter.delete("/:id",authorizeRoles("admin"), deleteSalle);

// Accès global
salleRouter.get("/:id", getSalleById);

export default salleRouter;
