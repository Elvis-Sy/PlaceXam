import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import { 
    createSupervision,
    assignerPlusieurs,
    getAllSupervisions,
    getByExam,
    getBySurveillant,
    updateSupervision,
    deleteSupervision
 } from "../controllers/supervisionController.js";

const supervisionRouter = express.Router();
supervisionRouter.use(authenticate);

// Acces administrateur
supervisionRouter.post("/", authorizeRoles("admin"), createSupervision);
supervisionRouter.post("/exam/:examId/assign-multiple", authorizeRoles("admin"), assignerPlusieurs);
supervisionRouter.get("/", authorizeRoles("admin"), getAllSupervisions);
supervisionRouter.get("/exam/:examId", authorizeRoles("admin"), getByExam);
supervisionRouter.get("/surveillant/:surveillantId", authorizeRoles("admin"), getBySurveillant);
supervisionRouter.patch("/:id", updateSupervision);
supervisionRouter.delete("/:id", authorizeRoles("admin"), deleteSupervision);

export default supervisionRouter;
