import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import { getMySupervisions, getMySalles, getSalleOccupancy, getMyCalendriers } from "../controllers/surveillantSideController.js";

const surveillantSideRouter = express.Router();
surveillantSideRouter.use(authenticate);

// Surveillant connecté → ses supervisions
surveillantSideRouter.get("/supervisions", authorizeRoles("surveillant"), getMySupervisions);

// Liste des salles dont il est responsable
surveillantSideRouter.get("/salles", authorizeRoles("surveillant"), getMySalles);

// Occupation d'une salle (vérifie que le surveillant supervise la salle)
surveillantSideRouter.get("/salle/:salleId/occupancy", authorizeRoles("surveillant"), getSalleOccupancy);

surveillantSideRouter.get("/calendriers", authorizeRoles("surveillant"), getMyCalendriers);

export default surveillantSideRouter;