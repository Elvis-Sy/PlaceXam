import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getDashboardData,
  autoAssignStudents,
  autoAssignSupervisors
} from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();
dashboardRouter.use(authenticate);

dashboardRouter.get("/", authorizeRoles("admin"), getDashboardData);
dashboardRouter.post("/assign-students", authorizeRoles("admin"), autoAssignStudents);
dashboardRouter.post("/assign-supervisors", authorizeRoles("admin"), autoAssignSupervisors);

export default dashboardRouter;