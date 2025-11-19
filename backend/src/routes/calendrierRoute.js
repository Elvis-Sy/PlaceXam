import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createCalendrier,
  getAllCalendriers,
  getCalendrierById,
  updateCalendrier,
  deleteCalendrier,
  getCalendrierByNiveau,
} from "../controllers/calendrierController.js";

const calendrierRouter = express.Router();
calendrierRouter.use(authenticate);

// Accès pour touts les utilisateurs authentifiés
calendrierRouter.get("/", getAllCalendriers);

//Accès pour tous les étudiants authentifiés
calendrierRouter.get("/:niveau", authorizeRoles("etudiant"), getCalendrierByNiveau);


// Les accès administrateur
calendrierRouter.post("/", authorizeRoles("admin"), createCalendrier);
calendrierRouter.get("/:id", authorizeRoles("admin"), getCalendrierById);
calendrierRouter.patch("/:id", authorizeRoles("admin"), updateCalendrier);
calendrierRouter.delete("/:id", authorizeRoles("admin"), deleteCalendrier);

export default calendrierRouter;
