import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js"
import {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam
} from "../controllers/examController.js";

const examRouter = express.Router();
examRouter.use(authenticate);

examRouter.post("/", authorizeRoles("admin"), createExam);
examRouter.get("/", authorizeRoles("admin"),getAllExams);
examRouter.get("/:id", authorizeRoles("admin"),getExamById);
examRouter.patch("/:id", authorizeRoles("admin"),updateExam);
examRouter.delete("/:id", authorizeRoles("admin"), deleteExam);

export default examRouter;
