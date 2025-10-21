import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js"
import { 
    autoAffecter,
    getAll,
    getByExam,
    getByEtudiant, 
    verifierSalle
 } from "../controllers/affectationController.js";


const affectationRouter = express.Router();
affectationRouter.use(authenticate);

// Acces administrateur
affectationRouter.post("/auto/:examId", authorizeRoles("admin"), autoAffecter);
affectationRouter.get("/", authorizeRoles("admin"), getAll);
affectationRouter.get("/exam/:examId", authorizeRoles("admin"), getByExam);
affectationRouter.get("/etudiant/:etudiantId", authorizeRoles("admin"), getByEtudiant);
affectationRouter.get("/disponibilite/:salleId", authorizeRoles("admin"), verifierSalle);

export default affectationRouter;
